import { JobHuntAdviceState, Action } from "@/src/types/agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { createLLM } from "../llm/client";

const actionsResultSchema = z.object({
  actions: z.array(
    z.object({
      title: z.string(),
      reason: z.string(),
      priority: z.enum(["high", "medium", "low"]),
      estimatedMinutes: z.number().nullable(),
    }),
  ),
});

type GenerateActionsInput = {
  state: JobHuntAdviceState;
};

export const generateActions = async ({
  state,
}: GenerateActionsInput): Promise<Action[]> => {
  const llm = createLLM();

  const structuredLLM = llm.withStructuredOutput(actionsResultSchema, {
    name: "actions_result",
  });

  const result = await structuredLLM.invoke([
    new SystemMessage(
      `
あなたは就活相談に対して、ユーザーが次に実行すべき行動を設計するアシスタントです。

出力ルール:
- actions は3件から5件
- 今日または直近で実行できる具体的な行動にする
- title は短くする
- reason はなぜ必要かを説明する
- priority は high / medium / low のいずれか
- estimatedMinutes は想定所要時間を分単位で返す。判断できない場合は null
`.trim(),
    ),
    new HumanMessage(
      `
状況整理:
${state.refinedContext ?? "なし"}

解決方針:
${state.strategy ?? "なし"}

初期相談:
${state.initialConcern}

追加回答:
${state.additionalInfo ?? "なし"}
`.trim(),
    ),
  ]);

  return result.actions;
};