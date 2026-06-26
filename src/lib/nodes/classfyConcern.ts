import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import type { ClassificationResult } from "@/src/types/agent";
import { classificationResultSchema } from "../schemas/advice";
import { createLLM } from "../llm/client";

type ClassifyConcernInput = {
  initialConcern: string;
};

const CLASSIFY_CONCERN_SYSTEM_PROMPT = `
あなたは就活相談アプリの分類エージェントです。

ユーザーの悩みを、以下のいずれか1つのカテゴリに分類してください。

カテゴリ一覧:
- self_analysis: 自己分析。強み、弱み、ガクチカ、自己PRの元ネタ整理など
- application_documents: ES・応募書類。志望動機、自己PR、ガクチカ、設問回答、文章改善など
- interview: 面接対策。面接準備、想定質問、受け答え、深掘り対策など
- company_research: 企業研究。企業理解、比較、調査観点、志望理由化など
- internship_selection: インターン・選考対策。ハッカソン、グループワーク、選考準備、立ち回りなど
- schedule_priority: スケジュール・優先順位。締切、複数タスク、今日やること、優先順位整理など
- career_choice: キャリア選択。職種選び、企業選び、進路、価値観整理など
- other: 上記に明確に当てはまらない相談

分類方針:
- ユーザーが最終的に欲しがっている支援内容を重視する
- 単語だけでなく、相談の目的を見て分類する
- 複数カテゴリに見える場合は、次に行うべき支援が最も明確なカテゴリを選ぶ
- 判断が難しい場合でも、必ず1つに分類する
- confidenceは0から1で返す
- reasonは日本語で簡潔に書く

subCategory は必ず返してください。
細かい分類が不要または判断できない場合は null を返してください。
`.trim();

const createFallbackClassification = (
  initialConcern: string,
): ClassificationResult => {
  return {
    category: "other",
    subCategory: null,
    confidence: 0.2,
    reason: `分類処理に失敗したため、汎用カテゴリとして扱います。相談内容: ${initialConcern.slice(
      0,
      40,
    )}`,
  };
};

export const classifyConcern = async ({
  initialConcern,
}: ClassifyConcernInput): Promise<ClassificationResult> => {
  const trimmedConcern = initialConcern.trim();

  if (trimmedConcern.length === 0) {
    throw new Error("initialConcern is empty.");
  }

  try {
    const llm = createLLM();

    const structuredLLM = llm.withStructuredOutput(classificationResultSchema, {
      name: "classification_result",
    });

    const rawResult = await structuredLLM.invoke([
      new SystemMessage(CLASSIFY_CONCERN_SYSTEM_PROMPT),
      new HumanMessage(
        `
ユーザーの相談内容:
${trimmedConcern}
`.trim(),
      ),
    ]);

    return classificationResultSchema.parse(rawResult);
  } catch (error) {
    console.error("Failed to classify concern:", error);
    return createFallbackClassification(trimmedConcern);
  }
};
