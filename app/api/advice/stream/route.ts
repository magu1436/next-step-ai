import {
  followUpAdviceGraph,
  initialAdviceGraph,
} from "@/src/lib/agent/graph";
import {
  AGENT_PROGRESS_STEPS,
  type AgentProgressStepId,
  type FollowUpQuestion,
  type JobHuntAdviceState,
} from "@/src/types/agent";
import type { AgentStreamEvent } from "@/src/types/stream";

interface AdviceStreamInitialConcernRequest {
  initialConcern: string;
}

interface AdviceStreamFollowUpRequest {
  state: JobHuntAdviceState;
  additionalInfo?: string;
}

const stepLabelById = Object.fromEntries(
  AGENT_PROGRESS_STEPS.map((step) => [step.id, step.label]),
) as Record<AgentProgressStepId, string>;

const createCompletedEvent = (
  stepId: AgentProgressStepId,
  update: Partial<JobHuntAdviceState>,
): AgentStreamEvent => {
  switch (stepId) {
    case "receive_concern":
      return {
        type: "step_completed",
        stepId,
        summary: "相談内容を受け取りました。",
      };
    case "classify_concern":
      return {
        type: "step_completed",
        stepId,
        summary: `${update.category} に分類しました。`,
        data: {
          category: update.category,
          subCategory: update.subCategory,
          reason: update.classificationReason,
          confidence: update.confidence,
        },
      };
    case "analyze_missing_info":
      return {
        type: "step_completed",
        stepId,
        summary: "不足情報を整理しました。",
      };
    case "generate_follow_up_questions":
      return {
        type: "step_completed",
        stepId,
        summary: `${update.followUpQuestions?.length ?? 0}件の追加質問を生成しました`,
        data: update.followUpQuestions,
      };
    case "merge_additional_info":
      return {
        type: "step_completed",
        stepId,
        summary: "追加情報を統合しました。",
      };
    case "refine_context":
      return {
        type: "step_completed",
        stepId,
        summary: "状況を再整理しました。",
        data: update.refinedContext,
      };
    case "generate_strategy":
      return {
        type: "step_completed",
        stepId,
        summary: "解決方針を生成しました。",
        data: update.strategy,
      };
    case "generate_actions":
      return {
        type: "step_completed",
        stepId,
        summary: "実行アクションを生成しました。",
        data: update.actions,
      };
    case "wait_user_input":
      return {
        type: "step_completed",
        stepId,
      };
  }
};

const createPartialResultEvent = (
  stepId: AgentProgressStepId,
  update: Partial<JobHuntAdviceState>,
): AgentStreamEvent | null => {
  switch (stepId) {
    case "refine_context":
      return {
        type: "partial_result",
        field: "refinedContext",
        data: update.refinedContext,
      };
    case "generate_strategy":
      return {
        type: "partial_result",
        field: "strategy",
        data: update.strategy,
      };
    case "generate_actions":
      return {
        type: "partial_result",
        field: "actions",
        data: update.actions,
      };
    default:
      return null;
  }
};

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        const callbacks = {
          onNodeStart: (stepId: AgentProgressStepId) => {
            send({
              type: "step_started",
              stepId,
              label: stepLabelById[stepId],
            });
          },
          onNodeComplete: (
            stepId: AgentProgressStepId,
            update: Partial<JobHuntAdviceState>,
          ) => {
            send(createCompletedEvent(stepId, update));

            const partialResultEvent = createPartialResultEvent(stepId, update);
            if (partialResultEvent != null) {
              send(partialResultEvent);
            }
          },
          onNodeSkipped: (stepId: AgentProgressStepId, summary?: string) => {
            send({
              type: "step_skipped",
              stepId,
              summary,
            });
          },
        };

        const graphConfig = {
          configurable: {
            callbacks,
          },
        };

        const finalState = (
          "initialConcern" in body
            ? await initialAdviceGraph.invoke(
                {
                  initialConcern: (body as AdviceStreamInitialConcernRequest)
                    .initialConcern,
                },
                graphConfig,
              )
            : await followUpAdviceGraph.invoke(
                {
                  ...(body as AdviceStreamFollowUpRequest).state,
                  additionalInfo: (body as AdviceStreamFollowUpRequest)
                    .additionalInfo,
                },
                graphConfig,
              )
        ) as JobHuntAdviceState;

        const questions = finalState.followUpQuestions ?? [];
        if (questions.length > 0 && finalState.actions == null) {
          send({
            type: "needs_user_input",
            questions: questions as FollowUpQuestion[],
            state: finalState,
          });

          controller.close();
          return;
        }

        send({
          type: "completed",
          state: finalState,
        });

        controller.close();
      } catch (error) {
        send({
          type: "error",
          message:
            error instanceof Error
              ? error.message
              : "分類処理中に不明なエラーが発生しました。",
          stepId: "classify_concern",
        });

        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
