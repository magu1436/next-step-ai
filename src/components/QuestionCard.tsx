import { Card, Chip, Stack, Typography } from "@mui/material";

import type { FollowUpQuestion } from "../types/agent";

type QuestionCardProps = {
  question: FollowUpQuestion;
  index?: number;
};

const importanceLabelMap: Record<FollowUpQuestion["importance"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const importanceColorMap: Record<
  FollowUpQuestion["importance"],
  "error" | "warning" | "default"
> = {
  high: "error",
  medium: "warning",
  low: "default",
};

const QuestionCard = ({ question, index }: QuestionCardProps) => {
  const questionLabel =
    typeof index === "number" ? `${index + 1}. ${question.question}` : question.question;

  return (
    <Card
      component="li"
      sx={{
        bgcolor: "primary.50",
        border: "1px solid",
        borderColor: "primary.100",
        borderRadius: 2,
        boxShadow: "none",
        listStyle: "none",
        p: 2,
      }}
      variant="outlined"
    >
      <Stack spacing={1.25}>
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "flex-start",
            justifyContent: "space-between",
          }}
        >
          <Typography
            color="text.primary"
            sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
            variant="body1"
          >
            {questionLabel}
          </Typography>
          <Chip
            color={importanceColorMap[question.importance]}
            label={`重要度: ${importanceLabelMap[question.importance]}`}
            size="small"
            sx={{ flexShrink: 0 }}
            variant={question.importance === "low" ? "outlined" : "filled"}
          />
        </Stack>

        <Typography
          color="text.secondary"
          sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
          variant="body2"
        >
          理由: {question.reason}
        </Typography>
      </Stack>
    </Card>
  );
};

export default QuestionCard;
