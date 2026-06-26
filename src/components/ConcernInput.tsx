"use client";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Box, Button, Card, Stack, TextField, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAgentProperties, useInitialConcern } from "../hooks/context";
import { useAdviceStream } from "../hooks/agent";

const MIN_CONCERN_LENGTH = 10;

const ConcernInput = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const { initialConcern, setInitialConcern } = useInitialConcern();
  const { setAppPhase } = useAgentProperties();
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { submitInitialConcern } = useAdviceStream();

  const trimmedConcern = useMemo(
    () => (initialConcern ? initialConcern.trim() : ""),
    [initialConcern],
  );
  const isEmpty = trimmedConcern?.length === 0;
  const isTooShort =
    trimmedConcern.length > 0 && trimmedConcern.length < MIN_CONCERN_LENGTH;
  const errorMessage =
    hasSubmitted && isTooShort
      ? "もう少し具体的に入力してください。10文字以上が目安です。"
      : "";

  const handleSubmit = useCallback(
    async (event: SubmitEvent) => {
      event.preventDefault();
      setHasSubmitted(true);

      if (isEmpty || isTooShort) {
        return;
      }
      
      await submitInitialConcern(trimmedConcern);

      setHasSubmitted(false);
    },
    [isEmpty, isTooShort, setAppPhase, submitInitialConcern, trimmedConcern],
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
        maxWidth: 720,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
      }}
    >
      <Box component="form" noValidate ref={formRef}>
        <Stack spacing={3} sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={1}>
            <Typography
              component="h1"
              variant="h4"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                lineHeight: 1.25,
              }}
            >
              就活の悩みを入力してください
            </Typography>
            <Typography color="text.secondary" variant="body1">
              面接、ES、企業研究、スケジュール整理など、今困っていることをそのまま書いてください。
            </Typography>
          </Stack>

          <TextField
            error={Boolean(errorMessage)}
            fullWidth
            helperText={
              errorMessage ||
              `${trimmedConcern.length}/${MIN_CONCERN_LENGTH}文字以上`
            }
            label="相談内容"
            minRows={7}
            multiline
            onBlur={() => setHasSubmitted(true)}
            onChange={(event) => setInitialConcern(event.target.value)}
            placeholder="例：明後日○○社の面接があるんだけど、何を準備すればいいかわからない"
            slotProps={{
              input: {
                sx: {
                  alignItems: "flex-start",
                  bgcolor: "grey.50",
                  borderRadius: 2,
                },
              },
            }}
            value={initialConcern}
          />

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ alignItems: { xs: "stretch", sm: "center" } }}
          >
            <Button
              disabled={isEmpty}
              startIcon={<SendRoundedIcon />}
              sx={{
                minHeight: 48,
                minWidth: { sm: 180 },
                px: 3,
                borderRadius: 1.5,
                fontWeight: 700,
              }}
              type="submit"
              variant="contained"
            >
              相談する
            </Button>
            <Typography color="text.secondary" variant="body2">
              入力後、エージェントが悩みの分類と不足情報の整理を始めます。
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Card>
  );
};

export default ConcernInput;
