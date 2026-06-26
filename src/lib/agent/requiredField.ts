import { RequiredField } from "@/src/types/advice";


export const interviewRequiredFields: RequiredField[] = [
  {
    key: "companyName",
    label: "企業名",
    question: "どの企業の面接ですか？",
    importance: "high",
  },
  {
    key: "interviewStage",
    label: "面接段階",
    question: "一次面接、二次面接、最終面接など、どの段階ですか？",
    importance: "high",
  },
  {
    key: "interviewerType",
    label: "面接官の属性",
    question: "面接官は人事、現場エンジニア、役員など、分かっていますか？",
    importance: "medium",
  },
  {
    key: "interviewDate",
    label: "面接日",
    question: "面接日はいつですか？",
    importance: "high",
  },
  {
    key: "mainConcern",
    label: "主な不安",
    question: "特に不安な質問や場面はありますか？",
    importance: "high",
  },
  {
    key: "preparedSoFar",
    label: "準備状況",
    question: "現時点でどこまで準備していますか？",
    importance: "medium",
  },
];