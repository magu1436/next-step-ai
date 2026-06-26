import { JobHuntAdviceState } from "@/src/types/agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { createLLM } from "../llm/client";

type GenerateStrategyInput = {
  state: JobHuntAdviceState;
};

const getSystemPrompt = (category: JobHuntAdviceState["category"]) => {
  switch (category) {
    case "interview":
      return "あなたはエンジニア就活の面接対策アドバイザーです。面接で見られそうな観点、準備方針、深掘りされそうな点を提案してください。";
    case "application_documents":
      return "あなたはエントリーシート添削アドバイザーです。設問意図、主張、構成、改善観点を提案してください。";
    case "schedule_priority":
      return "あなたは就活タスク管理アドバイザーです。締切、重要度、所要時間をもとに優先順位を整理してください。";
    default:
      return "あなたは就活支援アドバイザーです。現実的に実行できる解決方針を提案してください。";
  }
};

export const generateStrategy = async ({
  state,
}: GenerateStrategyInput): Promise<string> => {
  const llm = createLLM();

  const result = await llm.invoke([
    new SystemMessage(
      `
${getSystemPrompt(state.category)}

出力ルール:
- 日本語で書く
- 抽象論だけにしない
- ユーザーが次に何を考えればよいか分かるようにする
- 400字以内
`.trim(),
    ),
    new HumanMessage(
      `
状況整理:
${state.refinedContext ?? "なし"}

初期相談:
${state.initialConcern}

追加回答:
${state.additionalInfo ?? "なし"}
`.trim(),
    ),
  ]);

  return result.content.toString();
};