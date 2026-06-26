"use client";

import CategoryRoundedIcon from "@mui/icons-material/CategoryRounded";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";

import { useClassificationResult } from "../hooks/context";
import type { ConcernCategory } from "../types/advice";

const categoryLabelMap: Record<ConcernCategory, string> = {
  self_analysis: "自己分析",
  application_documents: "ES・応募書類",
  interview: "面接対策",
  company_research: "企業研究",
  internship_selection: "インターン・選考対策",
  schedule_priority: "スケジュール・優先順位",
  career_choice: "キャリア選択",
  other: "その他",
};

const formatConfidence = (confidence: number) => {
  return confidence.toFixed(2);
};

const ClassificationResultCard = () => {
  const { classificationResult: result } = useClassificationResult();

  if (!result) {
    return null;
  }

  const categoryLabel = categoryLabelMap[result.category];

  return (
    <Card
      component="section"
      sx={{
        width: "100%",
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Stack spacing={2.5} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Box
              aria-hidden="true"
              sx={{
                alignItems: "center",
                bgcolor: "primary.light",
                borderRadius: "50%",
                color: "primary.contrastText",
                display: "flex",
                height: 32,
                justifyContent: "center",
                width: 32,
              }}
            >
              <CategoryRoundedIcon fontSize="small" />
            </Box>
            <Typography
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, lineHeight: 1.35 }}
            >
              分類結果
            </Typography>
          </Stack>
          <Chip color="primary" label={categoryLabel} size="small" />
        </Stack>

        <Stack spacing={1.5}>
          <Stack spacing={0.5}>
            <Typography color="text.secondary" variant="body2">
              カテゴリ
            </Typography>
            <Typography
              color="text.primary"
              sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
              variant="body1"
            >
              {categoryLabel}
              {result.subCategory ? ` / ${result.subCategory}` : ""}
            </Typography>
          </Stack>

          <Stack spacing={0.5}>
            <Typography color="text.secondary" variant="body2">
              理由
            </Typography>
            <Typography
              color="text.primary"
              sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
              variant="body1"
            >
              {result.reason}
            </Typography>
          </Stack>

          <Stack spacing={0.5}>
            <Typography color="text.secondary" variant="body2">
              信頼度
            </Typography>
            <Typography color="text.primary" variant="body1">
              {formatConfidence(result.confidence)}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
};

export default ClassificationResultCard;
