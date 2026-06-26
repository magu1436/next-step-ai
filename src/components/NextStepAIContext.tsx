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
  errorEessage: string | null;
  setErrorEessage: StateSetter<string | null>;
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
}

export const NextStepAIContext = createContext<NextStepAIContextValues | null>(
  null,
);

export const NextStepAIContextProvider = ({
  children,
}: {
  children?: React.ReactNode[] | React.ReactNode;
}) => {
  const [initialConcern, setInitialConcern] = useState<string | undefined>(
    undefined,
  );
  const [steps, setSteps] = useState<AgentProgressStep[]>([]);
  const [classificationResult, setClassificationResult] = useState<
    ClassificationResult | undefined
  >(undefined);
  const [errorEessage, setErrorEessage] = useState<string | null>(null);
  const [processingOutput, setProcessingOutput] = useState<{
    label?: string;
    summary?: string;
  }>({});
  const [questions, setQuestions] = useState<FollowUpQuestion[] | undefined>(
    undefined,
  );
  const [result, setResult] = useState<
    | Pick<JobHuntAdviceState, "refinedContext" | "strategy" | "actions">
    | undefined
  >(undefined);
  const [appPhase, setAppPhase] = useState<AppPhase>("idle");
  const contextValue: NextStepAIContextValues = {
    initialConcern,
    setInitialConcern,
    steps,
    setSteps,
    classificationResult,
    setClassificationResult,
    errorEessage,
    setErrorEessage,
    processingOutput,
    setProcessingOutput,
    questions,
    setQuestions,
    result,
    setResult,
    appPhase,
    setAppPhase,
  };

  return (
    <NextStepAIContext value={contextValue}>
      {children}
    </NextStepAIContext>
  );
};
