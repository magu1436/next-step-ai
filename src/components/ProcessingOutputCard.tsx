import HourglassTopRoundedIcon from "@mui/icons-material/HourglassTopRounded";
import { Box, Card, Stack, Typography } from "@mui/material";

type ProcessingOutputCardProps = {
  label?: string;
  summary?: string;
};

const ProcessingOutputCard = ({ label, summary }: ProcessingOutputCardProps) => {
  if (!label && !summary) {
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
      <Stack spacing={2} sx={{ p: { xs: 2.5, sm: 3 } }}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
          <Box
            aria-hidden="true"
            sx={{
              alignItems: "center",
              bgcolor: "primary.main",
              borderRadius: "50%",
              color: "primary.contrastText",
              display: "flex",
              flexShrink: 0,
              height: 32,
              justifyContent: "center",
              width: 32,
            }}
          >
            <HourglassTopRoundedIcon fontSize="small" />
          </Box>
          <Typography
            component="h2"
            variant="h6"
            sx={{ fontWeight: 700, lineHeight: 1.35 }}
          >
            処理中の出力
          </Typography>
        </Stack>

        <Stack spacing={1.25}>
          {label && (
            <Box
              sx={{
                bgcolor: "grey.50",
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                color="text.primary"
                sx={{ fontWeight: 700, overflowWrap: "anywhere" }}
                variant="body2"
              >
                {label}
              </Typography>
            </Box>
          )}

          {summary && (
            <Box
              sx={{
                bgcolor: "grey.50",
                borderRadius: 1.5,
                px: 2,
                py: 1.5,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{ overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                variant="body2"
              >
                {summary}
              </Typography>
            </Box>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

export default ProcessingOutputCard;
