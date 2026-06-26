"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import PauseCircleFilledRoundedIcon from "@mui/icons-material/PauseCircleFilledRounded";
import PlayCircleFilledWhiteRoundedIcon from "@mui/icons-material/PlayCircleFilledWhiteRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import { Box, Card, Chip, Stack, Typography } from "@mui/material";

import { useAgentProperties } from "../hooks/context";
import {
  AGENT_PROGRESS_STEPS,
  type AgentProgressStep,
  type AgentStepStatus,
} from "../types/agent";

type StatusView = {
  label: string;
  color: "success" | "primary" | "warning" | "error" | "default";
  icon: React.ReactElement;
};

const statusViewMap: Record<AgentStepStatus, StatusView> = {
  waiting: {
    label: "待機中",
    color: "default",
    icon: <RadioButtonUncheckedRoundedIcon fontSize="small" />,
  },
  running: {
    label: "実行中",
    color: "primary",
    icon: <PlayCircleFilledWhiteRoundedIcon fontSize="small" />,
  },
  completed: {
    label: "完了",
    color: "success",
    icon: <CheckCircleRoundedIcon fontSize="small" />,
  },
  paused: {
    label: "一時停止中",
    color: "warning",
    icon: <PauseCircleFilledRoundedIcon fontSize="small" />,
  },
  skipped: {
    label: "スキップ",
    color: "default",
    icon: <RemoveCircleOutlineRoundedIcon fontSize="small" />,
  },
  error: {
    label: "エラー",
    color: "error",
    icon: <ErrorRoundedIcon fontSize="small" />,
  },
};

const mergeProgressSteps = (
  steps: AgentProgressStep[],
): AgentProgressStep[] => {
  const progressById = new Map(steps.map((step) => [step.id, step]));

  return AGENT_PROGRESS_STEPS.map((baseStep) => {
    const progress = progressById.get(baseStep.id);

    return {
      ...baseStep,
      status: progress?.status ?? baseStep.status,
      summary: progress?.summary,
    };
  });
};

const AgentProgressTimeline = () => {
  const { steps } = useAgentProperties();
  const visibleSteps = mergeProgressSteps(steps);

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
          エージェント実行状況
        </Typography>

        <Stack component="ol" sx={{ m: 0, p: 0 }}>
          {visibleSteps.map((step, index) => {
            const statusView = statusViewMap[step.status];
            const isLast = index === visibleSteps.length - 1;

            return (
              <Box
                component="li"
                key={step.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "32px minmax(0, 1fr)",
                  listStyle: "none",
                  minHeight: isLast ? 32 : 64,
                }}
              >
                <Box
                  sx={{
                    alignItems: "center",
                    color: `${statusView.color}.main`,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    aria-hidden="true"
                    sx={{
                      display: "flex",
                      height: 24,
                      justifyContent: "center",
                      width: 24,
                    }}
                  >
                    {statusView.icon}
                  </Box>
                  {!isLast && (
                    <Box
                      sx={{
                        bgcolor:
                          step.status === "completed"
                            ? "success.light"
                            : "divider",
                        flex: 1,
                        mt: 0.5,
                        width: 2,
                      }}
                    />
                  )}
                </Box>

                <Stack
                  spacing={0.75}
                  sx={{ minWidth: 0, pb: isLast ? 0 : 2 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      alignItems: "center",
                      flexWrap: "wrap",
                      rowGap: 0.75,
                    }}
                  >
                    <Typography
                      color={
                        step.status === "waiting"
                          ? "text.secondary"
                          : "text.primary"
                      }
                      sx={{
                        fontWeight: step.status === "running" ? 700 : 600,
                        overflowWrap: "anywhere",
                      }}
                      variant="body1"
                    >
                      {step.label}
                    </Typography>
                    <Chip
                      color={statusView.color}
                      label={statusView.label}
                      size="small"
                      variant={
                        step.status === "waiting" || step.status === "skipped"
                          ? "outlined"
                          : "filled"
                      }
                    />
                  </Stack>

                  {step.summary && (
                    <Typography
                      color="text.secondary"
                      sx={{
                        overflowWrap: "anywhere",
                        whiteSpace: "pre-wrap",
                      }}
                      variant="body2"
                    >
                      {step.summary}
                    </Typography>
                  )}
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Card>
  );
};

export default AgentProgressTimeline;
