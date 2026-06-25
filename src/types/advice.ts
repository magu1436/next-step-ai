export type ConcernCategory =
  | "self_analysis"
  | "application_documents"
  | "interview"
  | "company_research"
  | "internship_selection"
  | "schedule_priority"
  | "career_choice"
  | "other";

export type MissingInfoHandling =
  | "ask_user"
  | "assume_and_continue"
  | "ignore";

export interface RequiredField {
  key: string;
  label: string;
  question: string;
  importance: "high" | "medium" | "low";
}