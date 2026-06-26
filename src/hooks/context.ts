import { useContext } from "react";
import {
  NextStepAIContext,
  NextStepAIContextValues,
} from "../components/NextStepAIContext";

const assertContextActive = (
  value: NextStepAIContextValues | null,
): NextStepAIContextValues => {
  if (value === null) {
    throw new Error("NextStepAIContext is not active");
  }
  return value;
};

export const useInitialConcern = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    initialConcern: context.initialConcern,
    setInitialConcern: context.setInitialConcern,
  };
};

export const useAgentProperties = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    steps: context.steps,
    setSteps: context.setSteps,
    appPhase: context.appPhase,
    setAppPhase: context.setAppPhase,
  };
};

export const useClassificationResult = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    classificationResult: context.classificationResult,
    setClassificationResult: context.setClassificationResult,
  };
};

export const useErrorMessage = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    errorMessage: context.errorMessage,
    setErrorMessage: context.setErrorMessage,
  };
};

export const useProcessingOutput = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    processingOutput: context.processingOutput,
    setProcessingOutput: context.setProcessingOutput,
  };
};

export const useQuestions = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    questions: context.questions,
    setQuestions: context.setQuestions,
  };
};

export const useResult = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return {
    result: context.result,
    setResult: context.setResult,
  };
};

export const useNextStepAIContext = () => {
  const context = assertContextActive(useContext(NextStepAIContext));
  return context;
};
