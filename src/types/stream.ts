import type { AgentProgressStep, FollowUpQuestion, JobHuntAdviceState } from "./agent";

export interface AdviceStreamInitialRequest {
  initialConcern: string;
}

export interface AdviceStreamFollowUpRequest {
  state: JobHuntAdviceState;
  additionalInfo?: string;
}

export type AgentStreamEvent =
  | {
      type: "step_started";
      stepId: AgentProgressStep["id"];
      label: string;
    }
  | {
      type: "step_completed";
      stepId: AgentProgressStep["id"];
      summary?: string;
      data?: unknown;
    }
  | {
      type: "needs_user_input";
      questions: FollowUpQuestion[];
      state: JobHuntAdviceState;
    }
  | {
      type: "partial_result";
      field: "refinedContext" | "strategy" | "actions";
      data: unknown;
    }
  | {
      type: "completed";
      state: JobHuntAdviceState;
    }
  | {
      type: "error";
      message: string;
      stepId?: AgentProgressStep["id"];
    };
