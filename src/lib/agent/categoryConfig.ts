import { ConcernCategory, RequiredField } from "@/src/types/advice";
import { interviewRequiredFields } from "./requiredField";


type CategoryConfig = {
  label: string;
  requiredFields: RequiredField[];
};

export const categoryConfig = {
  interview: {
    label: "面接対策",
    requiredFields: interviewRequiredFields,
  },

  self_analysis: {
    label: "自己分析",
    requiredFields: [],
  },

  application_documents: {
    label: "ES・応募書類",
    requiredFields: [],
  },

  company_research: {
    label: "企業研究",
    requiredFields: [],
  },

  internship_selection: {
    label: "インターン・選考対策",
    requiredFields: [],
  },

  schedule_priority: {
    label: "スケジュール・優先順位",
    requiredFields: [],
  },

  career_choice: {
    label: "キャリア選択",
    requiredFields: [],
  },

  other: {
    label: "その他",
    requiredFields: [],
  },
} satisfies Record<ConcernCategory, CategoryConfig>;