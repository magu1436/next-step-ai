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
  subCategory: string | null;
  confidence: number;
  reason: string;
}

export type AgentProgressStepId =
  | "receive_concern"
  | "classify_concern"
  | "analyze_missing_info"
  | "generate_follow_up_questions"
  | "wait_user_input"
  | "merge_additional_info"
  | "refine_context"
  | "generate_strategy"
  | "generate_actions";

export interface AgentProgressStep {
  id: AgentProgressStepId;
  label: string;
  status: AgentStepStatus;
  summary?: string;
}

export const AGENT_PROGRESS_STEPS: readonly AgentProgressStep[] = [
  {
    id: "receive_concern",
    label: "悩みを受け取る",
    status: "waiting",
  },
  {
    id: "classify_concern",
    label: "悩みを分類",
    status: "waiting",
  },
  {
    id: "analyze_missing_info",
    label: "不足情報を整理",
    status: "waiting",
  },
  {
    id: "generate_follow_up_questions",
    label: "追加質問を生成",
    status: "waiting",
  },
  {
    id: "wait_user_input",
    label: "ユーザー回答待ち",
    status: "waiting",
  },
  {
    id: "merge_additional_info",
    label: "追加情報を統合",
    status: "waiting",
  },
  {
    id: "refine_context",
    label: "状況を再整理",
    status: "waiting",
  },
  {
    id: "generate_strategy",
    label: "解決方針を生成",
    status: "waiting",
  },
  {
    id: "generate_actions",
    label: "実行アクションを生成",
    status: "waiting",
  },
];

export interface Action {
  title: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedMinutes: number | null;
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
  subCategory?: string | null;
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
