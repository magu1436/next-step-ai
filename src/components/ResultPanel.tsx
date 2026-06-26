"use client";

import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import FlagRoundedIcon from "@mui/icons-material/FlagRounded";
import LightbulbRoundedIcon from "@mui/icons-material/LightbulbRounded";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";

import { useResult } from "../hooks/context";
import type { Action } from "../types/agent";

const priorityLabelMap: Record<Action["priority"], string> = {
  high: "高",
  medium: "中",
  low: "低",
};

const priorityColorMap: Record<
  Action["priority"],
  "error" | "warning" | "default"
> = {
  high: "error",
  medium: "warning",
  low: "default",
};

const SectionCard = ({
  title,
  body,
  icon,
  highlighted = false,
}: {
  title: string;
  body: string;
  icon: React.ReactElement;
  highlighted?: boolean;
}) => {
  return (
    <Card
      sx={{
        bgcolor: highlighted ? "primary.50" : "background.paper",
        border: "1px solid",
        borderColor: highlighted ? "primary.100" : "divider",
        borderRadius: 2,
        boxShadow: "none",
        p: { xs: 2, sm: 2.5 },
      }}
      variant="outlined"
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start" }}>
        <Box
          aria-hidden="true"
          sx={{
            alignItems: "center",
            bgcolor: highlighted ? "primary.main" : "grey.100",
            borderRadius: "50%",
            color: highlighted ? "primary.contrastText" : "text.secondary",
            display: "flex",
            flexShrink: 0,
            height: 32,
            justifyContent: "center",
            width: 32,
          }}
        >
          {icon}
        </Box>
        <Stack spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 700, lineHeight: 1.35 }}
          >
            {title}
          </Typography>
          <Typography
            color="text.primary"
            sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
            variant="body2"
          >
            {body}
          </Typography>
        </Stack>
      </Stack>
    </Card>
  );
};

const ActionCard = ({ action, index }: { action: Action; index: number }) => {
  return (
    <Card
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: "none",
        height: "100%",
        p: 2,
      }}
      variant="outlined"
    >
      <Stack spacing={1.5} sx={{ height: "100%" }}>
        <Stack spacing={0.75}>
          <Typography color="text.secondary" variant="caption">
            Action {index + 1}
          </Typography>
          <Typography
            component="h3"
            variant="subtitle1"
            sx={{ fontWeight: 700, lineHeight: 1.35, overflowWrap: "anywhere" }}
          >
            {action.title}
          </Typography>
        </Stack>

        <Typography
          color="text.secondary"
          sx={{ flex: 1, overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
          variant="body2"
        >
          {action.reason}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
          <Chip
            color={priorityColorMap[action.priority]}
            label={`優先度: ${priorityLabelMap[action.priority]}`}
            size="small"
            variant={action.priority === "low" ? "outlined" : "filled"}
          />
          {typeof action.estimatedMinutes === "number" && (
            <Chip
              label={`${action.estimatedMinutes}分`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

const ResultPanel = () => {
  const { result } = useResult();

  if (!result) {
    return null;
  }

  const hasActions = Boolean(result.actions?.length);
  const hasResult = Boolean(
    result.refinedContext || result.strategy || hasActions,
  );

  if (!hasResult) {
    return null;
  }

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
      <Stack spacing={3} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Typography
          component="h2"
          variant="h6"
          sx={{ fontWeight: 700, lineHeight: 1.35 }}
        >
          結果
        </Typography>

        {result.refinedContext && (
          <SectionCard
            body={result.refinedContext}
            highlighted
            icon={<AssignmentTurnedInRoundedIcon fontSize="small" />}
            title="状況整理"
          />
        )}

        {result.strategy && (
          <SectionCard
            body={result.strategy}
            icon={<LightbulbRoundedIcon fontSize="small" />}
            title="解決方針"
          />
        )}

        {hasActions && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <FlagRoundedIcon color="primary" fontSize="small" />
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 700, lineHeight: 1.35 }}
              >
                実行アクション
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gap: 2,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {result.actions?.map((action, index) => (
                <ActionCard
                  action={action}
                  index={index}
                  key={`${action.title}-${index}`}
                />
              ))}
            </Box>
          </Stack>
        )}
      </Stack>
    </Card>
  );
};

export default ResultPanel;
