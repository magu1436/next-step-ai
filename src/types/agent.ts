import type { ConcernCategory, MissingInfoHandling } from "./advice";

export type AppPhase =
  | "idle"
  | "running_initial_analysis"
  | "waiting_for_user"
  | "running_final_generation"
  | "completed"
  | "error";

export type AgentStepStatus =
  | "waiting"
  | "running"
  | "completed"
  | "paused"
  | "skipped"
  | "error";

export interface ClassificationResult {
  category: ConcernCategory;
  subCategory?: string;
  confidence: number;
  reason: string;
}

export interface AgentProgressStep {
  id:
    | "receive_concern"
    | "classify_concern"
    | "analyze_missing_info"
    | "generate_follow_up_questions"
    | "wait_user_input"
    | "merge_additional_info"
    | "refine_context"
    | "generate_strategy"
    | "generate_actions";
  label: string;
  status: AgentStepStatus;
  summary?: string;
}

export interface Action {
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes?: number;
}

export interface MissingInfo {
  key: string;
  label: string;
  question: string;
  importance: "high" | "medium" | "low";
  handling: MissingInfoHandling;
  assumption?: string;
}

export interface FollowUpQuestion {
  fieldKey: string;
  question: string;
  reason: string;
  importance: "high" | "medium" | "low";
}

export interface JobHuntAdviceState {
  initialConcern: string;
  category?: ConcernCategory;
  subCategory?: string;
  classificationReason?: string;
  confidence?: number;

  extractedInfo?: Record<string, string | null>;
  missingInfo?: MissingInfo[];
  followUpQuestions?: FollowUpQuestion[];
  additionalInfo?: string;

  refinedContext?: string;
  strategy?: string;
  actions?: Action[];
}
