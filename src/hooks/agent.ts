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
    setErrorMessage,
  } = useNextStepAIContext();

  const handleAgentEvent = (event: AgentStreamEvent) => {
    switch (event.type) {
      case "step_started":
        setSteps((steps) =>
          updateStepStatus(steps, event.stepId, "running"),
        );
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
        break;

      case "needs_user_input":
        setAppPhase("waiting_for_user");
        setQuestions(event.questions);
        setCurrentState(event.state);

        setSteps((steps) =>
          updateStepStatus(steps, "wait_user_input", "paused"),
        );
        break;

      case "partial_result":
        setResult((result) => ({
          ...result,
          [event.field]: event.data,
        }));
        break;

      case "completed":
        setAppPhase("completed");
        setCurrentState(event.state);
        break;

      case "error":
        setAppPhase("error");
        setErrorMessage(event.message);
        break;
    }
  };

  const submitInitialConcern = async (initialConcern: string) => {
    setInitialConcern(initialConcern);
    setAppPhase("running_initial_analysis");
    setErrorMessage(null);

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