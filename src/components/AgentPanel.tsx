"use client";

import { Stack } from "@mui/material";
import ConcernSummaryCard from "./ConcernSummaryCard";
import AgentProgressTimeline from "./AgentProgressTimeline";
import ClassificationResultCard from "./ClassificationResultCard";
import ProcessingOutputCard from "./ProcessingOutputCard";
import { useAgentProperties } from "../hooks/context";
import FollowUpQuestionPanel from "./FollowUpQuestionPanel";
import ErrorPanel from "./ErrorPanel";
import ConcernInput from "./ConcernInput";

const Analizing = () => {
  return (
    <Stack>
      <ClassificationResultCard />
      <ProcessingOutputCard />
    </Stack>
  );
};

const WaitingForUser = () => {
  return <FollowUpQuestionPanel />;
};

const Completed = () => {
  return <ProcessingOutputCard />;
};

const HappeningError = () => {
  return (
    <ErrorPanel
      onRetry={() => {
        console.log("retry");
      }}
    />
  );
};

const AgentPanel = () => {
  const { appPhase } = useAgentProperties();

  if (appPhase === "idle") {
    return <ConcernInput />;
  }

  return (
    <Stack>
      <ConcernSummaryCard />
      <Stack direction="row">
        <AgentProgressTimeline />
        {(appPhase === "running_initial_analysis" ||
          appPhase === "running_final_generation") && <Analizing />}
        {appPhase === "waiting_for_user" && <WaitingForUser />}
        {appPhase === "completed" && <Completed />}
        {appPhase === "error" && <HappeningError />}
      </Stack>
    </Stack>
  );
};

export default AgentPanel;