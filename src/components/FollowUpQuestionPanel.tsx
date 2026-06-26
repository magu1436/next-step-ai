"use client";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

import { useQuestions } from "../hooks/context";
import QuestionCard from "./QuestionCard";

type FollowUpQuestionPanelProps = {
  onSubmit?: (additionalInfo: string) => void | Promise<void>;
  isSubmitting?: boolean;
};

export default function FollowUpQuestionPanel({
  onSubmit,
  isSubmitting = false,
}: FollowUpQuestionPanelProps) {
  const { questions = [] } = useQuestions();
  const formRef = useRef<HTMLFormElement>(null);
  const [additionalInfo, setAdditionalInfo] = useState("");

  const handleSubmit = useCallback(
    async (event: SubmitEvent) => {
      event.preventDefault();

      if (isSubmitting) {
        return;
      }

      await onSubmit?.(additionalInfo.trim());
    },
    [additionalInfo, isSubmitting, onSubmit],
  );

  useEffect(() => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    form.addEventListener("submit", handleSubmit);

    return () => {
      form.removeEventListener("submit", handleSubmit);
    };
  }, [handleSubmit]);

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
      <Box component="form" noValidate ref={formRef}>
        <Stack spacing={3} sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack spacing={1}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, lineHeight: 1.35 }}
            >
              追加で確認したいこと
            </Typography>
            <Typography color="text.secondary" variant="body2">
              分かる範囲で回答してください。未入力でも仮定を置いて続行できます。
            </Typography>
          </Stack>

          {questions.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              追加質問はありません。
            </Typography>
          ) : (
            <Stack component="ol" spacing={2} sx={{ m: 0, p: 0 }}>
              {questions.map((question, index) => (
                <QuestionCard
                  index={index}
                  key={question.fieldKey}
                  question={question}
                />
              ))}
            </Stack>
          )}

          <TextField
            fullWidth
            label="追加情報"
            minRows={5}
            multiline
            onChange={(event) => setAdditionalInfo(event.target.value)}
            placeholder="例：一次面接で、人事面接です。自己紹介とガクチカの深掘りが特に不安です。"
            slotProps={{
              input: {
                sx: {
                  alignItems: "flex-start",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                },
              },
            }}
            value={additionalInfo}
          />

          <Button
            loading={isSubmitting}
            startIcon={<SendRoundedIcon />}
            sx={{
              alignSelf: { xs: "stretch", sm: "flex-start" },
              borderRadius: 1.5,
              fontWeight: 700,
              minHeight: 48,
              minWidth: { sm: 220 },
              px: 3,
            }}
            type="submit"
            variant="contained"
          >
            回答して続きを生成する
          </Button>
        </Stack>
      </Box>
    </Card>
  );
}
