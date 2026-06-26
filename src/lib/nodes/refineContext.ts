// src/lib/agent/nodes/refineContext.ts
import { JobHuntAdviceState } from "@/src/types/agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createLLM } from "../llm/client";

type RefineContextInput = {
  state: JobHuntAdviceState;
};

export const refineContext = async ({
  state,
}: RefineContextInput): Promise<string> => {
  const llm = createLLM();

  const result = await llm.invoke([
    new SystemMessage(
      `
あなたは就活相談の状況整理を行うアシスタントです。
ユーザーの相談内容と追加情報をもとに、現在の状況を簡潔に整理してください。

出力ルール:
- 日本語で書く
- 断定しすぎない
- 相談内容、分かっている情報、不足しているが仮定する情報を整理する
- 300字以内
`.trim(),
    ),
    new HumanMessage(
      `
初期相談:
${state.initialConcern}

分類:
${state.category ?? "未分類"}

分類理由:
${state.classificationReason ?? "なし"}

抽出済み情報:
${JSON.stringify(state.extractedInfo ?? {}, null, 2)}

不足情報:
${JSON.stringify(state.missingInfo ?? [], null, 2)}

追加回答:
${state.additionalInfo ?? "なし"}
`.trim(),
    ),
  ]);

  return result.content.toString();
};