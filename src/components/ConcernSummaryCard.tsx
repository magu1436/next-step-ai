"use client";

import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { Button, Card, Stack, Typography } from "@mui/material";

type ConcernSummaryCardProps = {
  initialConcern: string;
  onReset?: () => void;
  isResetDisabled?: boolean;
};

const ConcernSummaryCard = ({
  initialConcern,
  onReset,
  isResetDisabled = false,
}: ConcernSummaryCardProps) => {
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
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{
          alignItems: { xs: "stretch", sm: "flex-start" },
          justifyContent: "space-between",
          p: { xs: 2.5, sm: 3 },
        }}
      >
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            component="h2"
            variant="h6"
            sx={{ fontWeight: 700, lineHeight: 1.35 }}
          >
            相談内容
          </Typography>
          <Typography
            color="text.primary"
            sx={{
              overflowWrap: "anywhere",
              whiteSpace: "pre-wrap",
            }}
            variant="body1"
          >
            {initialConcern}
          </Typography>
        </Stack>

        <Button
          disabled={isResetDisabled}
          onClick={onReset}
          startIcon={<RestartAltRoundedIcon />}
          sx={{
            borderRadius: 1.5,
            flexShrink: 0,
            minHeight: 40,
            px: 2,
          }}
          type="button"
          variant="outlined"
        >
          別の相談をする
        </Button>
      </Stack>
    </Card>
  );
};

export default ConcernSummaryCard;
