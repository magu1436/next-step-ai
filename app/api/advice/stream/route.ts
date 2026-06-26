import type { JobHuntAdviceState } from "@/src/types/agent";
import type { AgentStreamEvent } from "@/src/types/stream";

export async function POST(request: Request): Promise<Response> {
  await request.json();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };

      for (const event of mockInitialEvents) {
        send(event);
        await sleep(1000);
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}

const mockCompletedState: JobHuntAdviceState = {
  initialConcern:
    "面接で自分の強みをうまく伝えられず、選考が進まないことに悩んでいる。",
  category: "interview",
  subCategory: "自己PR",
  classificationReason:
    "面接での自己表現と選考通過に関する悩みのため、面接カテゴリとして扱います。",
  confidence: 0.92,
  extractedInfo: {
    situation: "面接で強みを伝える場面",
    goal: "自己PRを改善して選考通過率を上げる",
    blocker: "強みと具体例の結び付けが弱い",
  },
  missingInfo: [
    {
      key: "target_company",
      label: "志望企業",
      question: "どの企業・職種の面接を想定していますか？",
      importance: "medium",
      handling: "assume_and_continue",
      assumption: "一般的な新卒採用の一次面接を想定します。",
    },
  ],
  followUpQuestions: [],
  refinedContext:
    "面接で強みを伝える際に、抽象的な長所だけを話してしまい、経験・成果・応募先での活かし方まで一貫して説明できていない状態です。追加質問は行わず、一般的な新卒採用の一次面接を前提に整理します。",
  strategy:
    "強みを一つに絞り、具体的な経験、取った行動、結果、学び、入社後の再現性の順で組み立てます。面接官が評価しやすいように、最初の一文で結論を伝え、その後に30秒程度の具体例を添える構成にします。",
  actions: [
    {
      title: "強みを1つ選び、結論文を作る",
      reason:
        "話す軸を絞ることで、面接官に印象が残りやすくなります。まずは「私の強みは〇〇です」と言い切れる形にします。",
      priority: "high",
      estimatedMinutes: 15,
    },
    {
      title: "STAR形式で経験を1つ整理する",
      reason:
        "状況、課題、行動、結果の順に整理すると、強みの根拠が伝わりやすくなります。",
      priority: "high",
      estimatedMinutes: 30,
    },
    {
      title: "応募先での活かし方を一文で足す",
      reason:
        "自己PRを入社後の貢献につなげると、企業側が採用後の姿を想像しやすくなります。",
      priority: "medium",
      estimatedMinutes: 20,
    },
  ],
};

const mockInitialEvents: AgentStreamEvent[] = [
  {
    type: "step_started",
    stepId: "receive_concern",
    label: "悩みを受信",
  },
  {
    type: "step_completed",
    stepId: "receive_concern",
    summary: "面接で強みを伝えられない悩みとして受け取りました。",
  },
  {
    type: "step_started",
    stepId: "classify_concern",
    label: "悩みを分類",
  },
  {
    type: "step_completed",
    stepId: "classify_concern",
    summary: "面接対策、特に自己PRの改善に関する悩みとして分類しました。",
    data: {
      category: mockCompletedState.category,
      subCategory: mockCompletedState.subCategory,
      confidence: mockCompletedState.confidence,
      reason: mockCompletedState.classificationReason,
    },
  },
  {
    type: "step_started",
    stepId: "analyze_missing_info",
    label: "不足情報を分析",
  },
  {
    type: "step_completed",
    stepId: "analyze_missing_info",
    summary:
      "志望企業や職種は未確定ですが、一般的な新卒採用の一次面接として仮定して進めます。",
    data: {
      extractedInfo: mockCompletedState.extractedInfo,
      missingInfo: mockCompletedState.missingInfo,
    },
  },
  {
    type: "step_started",
    stepId: "generate_follow_up_questions",
    label: "追加質問を生成",
  },
  {
    type: "step_completed",
    stepId: "generate_follow_up_questions",
    summary: "追加質問は不要と判断し、仮定を置いて最終提案まで進めます。",
    data: [],
  },
  {
    type: "step_started",
    stepId: "wait_user_input",
    label: "ユーザー回答待ち",
  },
  {
    type: "step_completed",
    stepId: "wait_user_input",
    summary: "追加質問がないため、ユーザー回答待ちは発生しませんでした。",
  },
  {
    type: "step_started",
    stepId: "merge_additional_info",
    label: "追加情報を統合",
  },
  {
    type: "step_completed",
    stepId: "merge_additional_info",
    summary: "追加情報なしで、初回相談内容と仮定を使って進めます。",
  },
  {
    type: "step_started",
    stepId: "refine_context",
    label: "状況を再整理",
  },
  {
    type: "partial_result",
    field: "refinedContext",
    data: mockCompletedState.refinedContext,
  },
  {
    type: "step_completed",
    stepId: "refine_context",
    summary: "悩みの背景と改善すべきポイントを整理しました。",
  },
  {
    type: "step_started",
    stepId: "generate_strategy",
    label: "解決方針を生成",
  },
  {
    type: "partial_result",
    field: "strategy",
    data: mockCompletedState.strategy,
  },
  {
    type: "step_completed",
    stepId: "generate_strategy",
    summary: "自己PRを結論、具体例、再現性の順で話す方針を作成しました。",
  },
  {
    type: "step_started",
    stepId: "generate_actions",
    label: "実行アクションを生成",
  },
  {
    type: "partial_result",
    field: "actions",
    data: mockCompletedState.actions,
  },
  {
    type: "step_completed",
    stepId: "generate_actions",
    summary: "面接前に取り組む3つのアクションを作成しました。",
  },
  {
    type: "completed",
    state: mockCompletedState,
  },
];

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));
