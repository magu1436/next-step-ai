import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { analyzeMissingInfo } from "@/src/lib/nodes/analyzeMissingInfo";
import { classifyConcern } from "@/src/lib/nodes/classfyConcern";
import { generateActions } from "@/src/lib/nodes/generateActions";
import { generateStrategy } from "@/src/lib/nodes/generateStrategy";
import { mergeAdditionalInfo } from "@/src/lib/nodes/mergeAdditionalInfo";
import { refineContext } from "@/src/lib/nodes/refineContext";
import type {
  Action,
  AgentProgressStepId,
  FollowUpQuestion,
  JobHuntAdviceState,
  MissingInfo,
} from "@/src/types/agent";
import type { ConcernCategory } from "@/src/types/advice";

type AdviceGraphNodeId = AgentProgressStepId;

type AdviceGraphUpdate = Partial<JobHuntAdviceState>;

type AdviceGraphCallbacks = {
  onNodeStart?: (nodeId: AdviceGraphNodeId) => void | Promise<void>;
  onNodeComplete?: (
    nodeId: AdviceGraphNodeId,
    update: AdviceGraphUpdate,
  ) => void | Promise<void>;
  onNodeSkipped?: (
    nodeId: AdviceGraphNodeId,
    summary?: string,
  ) => void | Promise<void>;
};

type AdviceGraphConfig = {
  configurable?: {
    callbacks?: AdviceGraphCallbacks;
  };
};

const AdviceState = Annotation.Root({
  initialConcern: Annotation<string>(),
  category: Annotation<ConcernCategory | undefined>(),
  subCategory: Annotation<string | null | undefined>(),
  classificationReason: Annotation<string | undefined>(),
  confidence: Annotation<number | undefined>(),
  extractedInfo: Annotation<Record<string, string | null> | undefined>(),
  missingInfo: Annotation<MissingInfo[] | undefined>(),
  followUpQuestions: Annotation<FollowUpQuestion[] | undefined>(),
  additionalInfo: Annotation<string | undefined>(),
  refinedContext: Annotation<string | undefined>(),
  strategy: Annotation<string | undefined>(),
  actions: Annotation<Action[] | undefined>(),
});

type AdviceStateType = typeof AdviceState.State;

const getCallbacks = (config: AdviceGraphConfig): AdviceGraphCallbacks => {
  return config.configurable?.callbacks ?? {};
};

const notifyNodeStart = async (
  nodeId: AdviceGraphNodeId,
  config: AdviceGraphConfig,
) => {
  await getCallbacks(config).onNodeStart?.(nodeId);
};

const notifyNodeComplete = async (
  nodeId: AdviceGraphNodeId,
  update: AdviceGraphUpdate,
  config: AdviceGraphConfig,
) => {
  await getCallbacks(config).onNodeComplete?.(nodeId, update);
};

const notifyNodeSkipped = async (
  nodeId: AdviceGraphNodeId,
  summary: string,
  config: AdviceGraphConfig,
) => {
  await getCallbacks(config).onNodeSkipped?.(nodeId, summary);
};

const createFollowUpQuestions = (
  missingInfo: MissingInfo[] | undefined,
): FollowUpQuestion[] => {
  return (missingInfo ?? [])
    .filter((info) => info.handling === "ask_user")
    .slice(0, 3)
    .map((info) => ({
      fieldKey: info.key,
      question: info.question,
      reason: `${info.label}が分かると、より具体的な提案ができます。`,
      importance: info.importance,
    }));
};

const receiveConcernNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("receive_concern", config);

  const update = {
    initialConcern: state.initialConcern,
  };

  await notifyNodeComplete("receive_concern", update, config);
  return update;
};

const classifyConcernNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("classify_concern", config);

  const classification = await classifyConcern({
    initialConcern: state.initialConcern,
  });

  const update = {
    category: classification.category,
    subCategory: classification.subCategory,
    classificationReason: classification.reason,
    confidence: classification.confidence,
  };

  await notifyNodeComplete("classify_concern", update, config);
  return update;
};

const analyzeMissingInfoNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  if (state.category == null) {
    throw new Error("category is required before analyzing missing info.");
  }

  await notifyNodeStart("analyze_missing_info", config);

  const missingInfoResult = await analyzeMissingInfo({
    initialConcern: state.initialConcern,
    category: state.category,
  });

  const update = {
    extractedInfo: missingInfoResult.extractedInfo,
    missingInfo: missingInfoResult.missingInfo,
  };

  await notifyNodeComplete("analyze_missing_info", update, config);

  if (createFollowUpQuestions(missingInfoResult.missingInfo).length === 0) {
    await notifyNodeSkipped(
      "generate_follow_up_questions",
      "追加質問は不要と判断しました。",
      config,
    );
    await notifyNodeSkipped(
      "wait_user_input",
      "追加回答なしで提案生成へ進みます。",
      config,
    );
    await notifyNodeSkipped(
      "merge_additional_info",
      "追加情報なしで提案生成へ進みます。",
      config,
    );
  }

  return update;
};

const generateFollowUpQuestionsNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("generate_follow_up_questions", config);

  const followUpQuestions = createFollowUpQuestions(state.missingInfo);
  const update = {
    followUpQuestions,
  };

  await notifyNodeComplete("generate_follow_up_questions", update, config);
  return update;
};

const mergeAdditionalInfoNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("merge_additional_info", config);

  const update = mergeAdditionalInfo({
    state: state as JobHuntAdviceState,
    additionalInfo: state.additionalInfo,
  });

  await notifyNodeComplete("merge_additional_info", update, config);
  return update;
};

const refineContextNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("refine_context", config);

  const refinedContext = await refineContext({
    state: state as JobHuntAdviceState,
  });
  const update = {
    refinedContext,
  };

  await notifyNodeComplete("refine_context", update, config);
  return update;
};

const generateStrategyNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("generate_strategy", config);

  const strategy = await generateStrategy({
    state: state as JobHuntAdviceState,
  });
  const update = {
    strategy,
  };

  await notifyNodeComplete("generate_strategy", update, config);
  return update;
};

const generateActionsNode = async (
  state: AdviceStateType,
  config: AdviceGraphConfig,
): Promise<AdviceGraphUpdate> => {
  await notifyNodeStart("generate_actions", config);

  const actions = await generateActions({
    state: state as JobHuntAdviceState,
  });
  const update = {
    actions,
  };

  await notifyNodeComplete("generate_actions", update, config);
  return update;
};

const routeAfterMissingInfo = (state: AdviceStateType) => {
  return createFollowUpQuestions(state.missingInfo).length > 0
    ? "generate_follow_up_questions"
    : "refine_context";
};

export const initialAdviceGraph = new StateGraph(AdviceState)
  .addNode("receive_concern", receiveConcernNode)
  .addNode("classify_concern", classifyConcernNode)
  .addNode("analyze_missing_info", analyzeMissingInfoNode)
  .addNode("generate_follow_up_questions", generateFollowUpQuestionsNode)
  .addNode("refine_context", refineContextNode)
  .addNode("generate_strategy", generateStrategyNode)
  .addNode("generate_actions", generateActionsNode)
  .addEdge(START, "receive_concern")
  .addEdge("receive_concern", "classify_concern")
  .addEdge("classify_concern", "analyze_missing_info")
  .addConditionalEdges("analyze_missing_info", routeAfterMissingInfo)
  .addEdge("generate_follow_up_questions", END)
  .addEdge("refine_context", "generate_strategy")
  .addEdge("generate_strategy", "generate_actions")
  .addEdge("generate_actions", END)
  .compile();

export const followUpAdviceGraph = new StateGraph(AdviceState)
  .addNode("merge_additional_info", mergeAdditionalInfoNode)
  .addNode("refine_context", refineContextNode)
  .addNode("generate_strategy", generateStrategyNode)
  .addNode("generate_actions", generateActionsNode)
  .addEdge(START, "merge_additional_info")
  .addEdge("merge_additional_info", "refine_context")
  .addEdge("refine_context", "generate_strategy")
  .addEdge("generate_strategy", "generate_actions")
  .addEdge("generate_actions", END)
  .compile();
