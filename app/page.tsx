import AgentPanel from "@/src/components/AgentPanel";
import { NextStepAIContextProvider } from "@/src/components/NextStepAIContext";
import { Stack, Typography } from "@mui/material";

export default function Home() {
  return (
    <main>
      <Stack>
        <Typography variant="h1">ネクストステップAI</Typography>
        <NextStepAIContextProvider>
          <AgentPanel />
        </NextStepAIContextProvider>
      </Stack>
    </main>
  );
}
