import { ConcernCategory, RequiredField } from "@/src/types/advice";
import { MissingInfo } from "@/src/types/agent";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { z } from "zod";
import { createLLM } from "../llm/client";
import { categoryConfig } from "../agent/categoryConfig";

type AnalyzeMissingInfoInput = {
  initialConcern: string;
  category: ConcernCategory;
};

type AnalyzeMissingInfoResult = {
  extractedInfo: Record<string, string | null>;
  missingInfo: MissingInfo[];
};

const createExtractedInfoSchema = (requiredFields: RequiredField[]) => {
  const extractedInfoShape = Object.fromEntries(
    requiredFields.map((field) => [
      field.key,
      z.string().nullable().describe(`${field.label}: ${field.question}`),
    ]),
  ) as Record<string, z.ZodNullable<z.ZodString>>;

  return z.object({
    extractedInfo: z
      .object(extractedInfoShape)
      .describe("各field keyに対応する、ユーザー入力から抽出できた情報"),
  });
};

const createSystemPrompt = (requiredFields: RequiredField[]) => {
  const fieldsText = requiredFields
    .map(
      (field) =>
        `- key: ${field.key}, label: ${field.label}, question: ${field.question}, importance: ${field.importance}`,
    )
    .join("\n");

  return `
あなたは就活相談アプリの情報抽出エージェントです。

ユーザーの相談内容から、必要情報が既に含まれているかを判定してください。

必要情報一覧:
${fieldsText}

出力ルール:
- requiredFields の key ごとに値を返してください
- 相談文に明確に含まれている情報だけを抽出してください
- 推測で補わないでください
- 情報が見つからない場合は null にしてください
- 値は短く要約してください
`.trim();
};

export const analyzeMissingInfo = async ({
  initialConcern,
  category,
}: AnalyzeMissingInfoInput): Promise<AnalyzeMissingInfoResult> => {
  const requiredFields = categoryConfig[category].requiredFields;

  if (requiredFields.length === 0) {
    return {
      extractedInfo: {},
      missingInfo: [],
    };
  }

  const llm = createLLM();
  const extractedInfoSchema = createExtractedInfoSchema(requiredFields);

  const structuredLLM = llm.withStructuredOutput(extractedInfoSchema, {
    name: "extracted_info_result",
  });

  const result = await structuredLLM.invoke([
    new SystemMessage(createSystemPrompt(requiredFields)),
    new HumanMessage(
      `
ユーザーの相談内容:
${initialConcern}
`.trim(),
    ),
  ]);

  const extractedInfo = result.extractedInfo;

  const missingInfo: MissingInfo[] = requiredFields
    .filter((field) => {
      const value = extractedInfo[field.key];
      return value == null || value.trim().length === 0;
    })
    .map((field) => ({
      key: field.key,
      label: field.label,
      question: field.question,
      importance: field.importance,
      handling:
        field.importance === "high" ? "ask_user" : "assume_and_continue",
      assumption:
        field.importance === "high"
          ? undefined
          : `${field.label}は未確認のため、一般的な就活相談として進めます。`,
    }));

  return {
    extractedInfo,
    missingInfo,
  };
};
