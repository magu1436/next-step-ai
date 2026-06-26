import { AgentProgressStep, ClassificationResult } from "../types/agent";
import { AgentStreamEvent } from "../types/stream";
import { useNextStepAIContext } from "./context";

export const useAdviceStream = () => {
  const {
    setClassificationResult,
    setAppPhase,
    setInitialConcern,
    currentState,
    setCurrentState,
    setQuestions,
    setSteps,
    setResult,
    setProcessingOutput,
    setErrorMessage,
  } = useNextStepAIContext();

  const handleAgentEvent = (event: AgentStreamEvent) => {
    switch (event.type) {
      case "step_started":
        setSteps((steps) =>
          updateStepStatus(steps, event.stepId, "running"),
        );
        setProcessingOutput({
          label: event.label,
        });
        break;

      case "step_completed":
        setSteps((steps) =>
          updateStepStatus(
            steps,
            event.stepId,
            "completed",
            event.summary,
          ),
        );
        if (event.stepId === "classify_concern") {
          setClassificationResult(event.data as ClassificationResult);
        }
        setProcessingOutput((output) => ({
          label: output.label,
          summary: event.summary,
        }));
        break;

      case "needs_user_input":
        setAppPhase("waiting_for_user");
        setQuestions(event.questions);
        setCurrentState(event.state);
        setProcessingOutput({
          label: "追加質問が必要です",
          summary: event.questions.map((question) => question.question).join("\n"),
        });

        setSteps((steps) =>
          updateStepStatus(steps, "wait_user_input", "paused"),
        );
        break;

      case "partial_result":
        setResult((result) => ({
          ...result,
          [event.field]: event.data,
        }));
        setProcessingOutput({
          label: partialResultLabelMap[event.field],
          summary: formatPartialResult(event.data),
        });
        break;

      case "completed":
        setAppPhase("completed");
        setCurrentState(event.state);
        setProcessingOutput({
          label: "提案が完了しました",
          summary: "整理した状況、解決方針、実行アクションを生成しました。",
        });
        break;

      case "error":
        setAppPhase("error");
        setErrorMessage(event.message);
        setProcessingOutput({
          label: "エラーが発生しました",
          summary: event.message,
        });
        break;
    }
  };

  const submitInitialConcern = async (initialConcern: string) => {
    setInitialConcern(initialConcern);
    setAppPhase("running_initial_analysis");
    setErrorMessage(null);
    setProcessingOutput({});

    const response = await fetch("/api/advice/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ initialConcern }),
    });

    await readAgentStream(response, handleAgentEvent);
  };

  const submitFollowUpAnswer = async (additionalInfo: string) => {
    if (!currentState) {
      setAppPhase("error");
      setErrorMessage("追加回答に必要な状態が見つかりません。");
      return;
    }

    setAppPhase("running_final_generation");
    setProcessingOutput({});

    setSteps((steps) =>
      updateStepStatus(steps, "wait_user_input", "completed"),
    );

    const response = await fetch("/api/advice/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        state: currentState,
        additionalInfo,
      }),
    });

    await readAgentStream(response, handleAgentEvent);
  };

  return {
    submitInitialConcern,
    submitFollowUpAnswer,
  };
};

const partialResultLabelMap = {
  refinedContext: "状況を再整理しました",
  strategy: "解決方針を生成しました",
  actions: "実行アクションを生成しました",
} satisfies Record<
  Extract<AgentStreamEvent, { type: "partial_result" }>["field"],
  string
>;

const formatPartialResult = (data: unknown): string => {
  if (typeof data === "string") {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .map((item, index) => {
        if (isActionLike(item)) {
          return `${index + 1}. ${item.title}\n${item.reason}`;
        }
        return `${index + 1}. ${JSON.stringify(item)}`;
      })
      .join("\n\n");
  }

  if (data && typeof data === "object") {
    return JSON.stringify(data, null, 2);
  }

  return "";
};

const isActionLike = (
  value: unknown,
): value is { title: string; reason: string } => {
  return (
    !!value &&
    typeof value === "object" &&
    "title" in value &&
    "reason" in value &&
    typeof value.title === "string" &&
    typeof value.reason === "string"
  );
};

const updateStepStatus = (
    steps: AgentProgressStep[],
    stepId: AgentProgressStep["id"],
    status: AgentProgressStep["status"],
    summary?: string,
) => {
    return [
        ...steps,
        {
            id: stepId,
            label: "",
            status,
            summary,
        },
    ]
}

const readAgentStream = async (
    response: Response,
    handleAgentEvent: (event: AgentStreamEvent) => void,
) => {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    if (!reader) {
        return;
    }

    while (true) {
        const { done, value } = await reader.read();
        if (done) {
            break;
        }
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        
        for (const line of lines) {
            try {
                const event = JSON.parse(line) as AgentStreamEvent;
                handleAgentEvent(event);
            } catch (e) {
                console.error(e);
            }
        }
    }
 
}
