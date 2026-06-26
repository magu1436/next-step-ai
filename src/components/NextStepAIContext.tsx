"use client";

import { createContext, useState } from "react";
import {
  AgentProgressStep,
  AppPhase,
  ClassificationResult,
  FollowUpQuestion,
  JobHuntAdviceState,
} from "../types/agent";

type StateSetter<T> = React.Dispatch<React.SetStateAction<T>>;

export interface NextStepAIContextValues {
  initialConcern?: string;
  setInitialConcern: StateSetter<string | undefined>;
  steps: AgentProgressStep[];
  setSteps: StateSetter<AgentProgressStep[]>;
  classificationResult?: ClassificationResult;
  setClassificationResult: StateSetter<ClassificationResult | undefined>;
  errorMessage: string | null;
  setErrorMessage: StateSetter<string | null>;
  processingOutput: {
    label?: string;
    summary?: string;
  };
  setProcessingOutput: StateSetter<{
    label?: string;
    summary?: string;
  }>;
  questions?: FollowUpQuestion[];
  setQuestions: StateSetter<FollowUpQuestion[] | undefined>;
  result?: Pick<JobHuntAdviceState, "refinedContext" | "strategy" | "actions">;
  setResult: StateSetter<
    | Pick<JobHuntAdviceState, "refinedContext" | "strategy" | "actions">
    | undefined
  >;
  appPhase: AppPhase;
  setAppPhase: StateSetter<AppPhase>;
  currentState?: JobHuntAdviceState;
  setCurrentState: StateSetter<JobHuntAdviceState | undefined>;
}

export const NextStepAIContext = createContext<NextStepAIContextValues | null>(
  null,
);

export const NextStepAIContextProvider = ({
  children,
}: {
  children?: React.ReactNode[] | React.ReactNode;
}) => {
  const [initialConcern, setInitialConcern] = useState<string>();
  const [steps, setSteps] = useState<AgentProgressStep[]>([]);
  const [classificationResult, setClassificationResult] =
    useState<ClassificationResult>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingOutput, setProcessingOutput] = useState<{
    label?: string;
    summary?: string;
  }>({});
  const [questions, setQuestions] = useState<FollowUpQuestion[]>();
  const [result, setResult] =
    useState<
      Pick<JobHuntAdviceState, "refinedContext" | "strategy" | "actions">
    >();
  const [appPhase, setAppPhase] = useState<AppPhase>("idle");
  const [currentState, setCurrentState] = useState<JobHuntAdviceState>();
  const contextValue: NextStepAIContextValues = {
    initialConcern,
    setInitialConcern,
    steps,
    setSteps,
    classificationResult,
    setClassificationResult,
    errorMessage,
    setErrorMessage,
    processingOutput,
    setProcessingOutput,
    questions,
    setQuestions,
    result,
    setResult,
    appPhase,
    setAppPhase,
    currentState,
    setCurrentState,
  };

  return <NextStepAIContext value={contextValue}>{children}</NextStepAIContext>;
};
