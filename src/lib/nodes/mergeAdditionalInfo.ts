import { JobHuntAdviceState } from "@/src/types/agent";

type MergeAdditionalInfoInput = {
  state: JobHuntAdviceState;
  additionalInfo?: string;
};

export const mergeAdditionalInfo = ({
  state,
  additionalInfo,
}: MergeAdditionalInfoInput): JobHuntAdviceState => {
  return {
    ...state,
    additionalInfo: additionalInfo?.trim() || undefined,
  };
};