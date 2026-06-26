import { analyzeMissingInfo } from "@/src/lib/nodes/analyzeMissingInfo";
import { classifyConcern } from "@/src/lib/nodes/classfyConcern";
import { generateActions } from "@/src/lib/nodes/generateActions";
import { generateStrategy } from "@/src/lib/nodes/generateStrategy";
import { mergeAdditionalInfo } from "@/src/lib/nodes/mergeAdditionalInfo";
import { refineContext } from "@/src/lib/nodes/refineContext";
import type { JobHuntAdviceState } from "@/src/types/agent";
import type { AgentStreamEvent } from "@/src/types/stream";

interface AdviceStreamInitialConcernRequest {
  initialConcern: string;
}

interface AdviceStreamFollowUpRequest {
  state: JobHuntAdviceState;
  additionalInfo?: string;
}

export async function POST(request: Request): Promise<Response> {
  const body = await request.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: AgentStreamEvent) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      try {
        let state = {} as JobHuntAdviceState;

        if ("initialConcern" in body) {
          const { initialConcern } = body as AdviceStreamInitialConcernRequest;
          send({
            type: "step_started",
            stepId: "receive_concern",
            label: "悩みを受信",
          });

          send({
            type: "step_completed",
            stepId: "receive_concern",
            summary: "相談内容を受け取りました。",
          });

          send({
            type: "step_started",
            stepId: "classify_concern",
            label: "悩みを分類",
          });

          const classification = await classifyConcern({ initialConcern });

          state = {
            initialConcern,
            category: classification.category,
            subCategory: classification.subCategory,
            classificationReason: classification.reason,
            confidence: classification.confidence,
          };

          send({
            type: "step_completed",
            stepId: "classify_concern",
            summary: `${classification.category} に分類しました。`,
            data: classification,
          });

          const missingInfoResult = await analyzeMissingInfo({
            initialConcern,
            category: classification.category,
          });

          state = {
            ...state,
            extractedInfo: missingInfoResult.extractedInfo,
            missingInfo: missingInfoResult.missingInfo,
          };

          const questions = missingInfoResult.missingInfo
            .filter((info) => info.handling === "ask_user")
            .slice(0, 3)
            .map((info) => ({
              fieldKey: info.key,
              question: info.question,
              reason: `${info.label}が分かると、より具体的な提案ができます。`,
              importance: info.importance,
            }));

          if (questions.length > 0) {
            send({
              type: "step_started",
              stepId: "generate_follow_up_questions",
              label: "追加質問を生成しています",
            });
            send({
              type: "step_completed",
              stepId: "generate_follow_up_questions",
              summary: `${questions.length}件の追加質問を生成しました`,
              data: questions,
            });
            send({
              type: "needs_user_input",
              questions,
              state: {
                ...state,
                followUpQuestions: questions,
              },
            });

            controller.close();
            return;
          }
        } else {
          const { state, additionalInfo } = body as AdviceStreamFollowUpRequest;
          send({
            type: "step_started",
            stepId: "merge_additional_info",
            label: "追加情報を統合",
          });

          let nextState = mergeAdditionalInfo({ state, additionalInfo });

          send({
            type: "step_completed",
            stepId: "merge_additional_info",
            summary: "追加情報を統合しました。",
          });

          send({
            type: "step_started",
            stepId: "refine_context",
            label: "状況を再整理",
          });

          const refinedContext = await refineContext({ state: nextState });

          nextState = {
            ...nextState,
            refinedContext,
          };

          send({
            type: "step_completed",
            stepId: "refine_context",
            summary: "状況を再整理しました。",
            data: refinedContext,
          });

          send({
            type: "partial_result",
            field: "refinedContext",
            data: refinedContext,
          });

          send({
            type: "step_started",
            stepId: "generate_strategy",
            label: "解決方針を生成",
          });

          const strategy = await generateStrategy({ state: nextState });

          nextState = {
            ...nextState,
            strategy,
          };

          send({
            type: "step_completed",
            stepId: "generate_strategy",
            summary: "解決方針を生成しました。",
            data: strategy,
          });

          send({
            type: "partial_result",
            field: "strategy",
            data: strategy,
          });

          send({
            type: "step_started",
            stepId: "generate_actions",
            label: "実行アクションを生成",
          });

          const actions = await generateActions({ state: nextState });

          nextState = {
            ...nextState,
            actions,
          };

          send({
            type: "step_completed",
            stepId: "generate_actions",
            summary: "実行アクションを生成しました。",
            data: actions,
          });

          send({
            type: "partial_result",
            field: "actions",
            data: actions,
          });
        }

        send({
          type: "completed",
          state,
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
