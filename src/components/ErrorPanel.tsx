"use client";

import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { Box, Button, Card, Stack, Typography } from "@mui/material";

import { useErrorMessage } from "../hooks/context";

type ErrorPanelProps = {
  onRetry: () => void | Promise<void>;
  isRetrying?: boolean;
};

const ErrorPanel = ({ onRetry, isRetrying = false }: ErrorPanelProps) => {
  const { errorMessage: message } = useErrorMessage();

  if (!message) {
    return null;
  }

  return (
    <Card
      component="section"
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "error.light",
        borderRadius: 2,
        boxShadow: "0 10px 30px rgba(127, 29, 29, 0.08)",
      }}
    >
      <Stack spacing={2.5} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
          <Box
            aria-hidden="true"
            sx={{
              alignItems: "center",
              bgcolor: "error.main",
              borderRadius: "50%",
              color: "error.contrastText",
              display: "flex",
              flexShrink: 0,
              height: 32,
              justifyContent: "center",
              width: 32,
            }}
          >
            <ErrorRoundedIcon fontSize="small" />
          </Box>

          <Stack spacing={1} sx={{ minWidth: 0 }}>
            <Typography
              component="h2"
              variant="h6"
              sx={{ fontWeight: 700, lineHeight: 1.35 }}
            >
              エラーが発生しました
            </Typography>
            <Typography
              color="text.secondary"
              sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
              variant="body2"
            >
              {message}
            </Typography>
          </Stack>
        </Stack>

        <Button
          loading={isRetrying}
          onClick={onRetry}
          startIcon={<RefreshRoundedIcon />}
          sx={{
            alignSelf: { xs: "stretch", sm: "flex-start" },
            borderRadius: 1.5,
            fontWeight: 700,
            minHeight: 44,
            px: 2.5,
          }}
          type="button"
          variant="contained"
        >
          再試行する
        </Button>
      </Stack>
    </Card>
  );
};

export default ErrorPanel;
