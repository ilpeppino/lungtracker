import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateVitalsEntryInput } from "../models/vitals";
import { createVitalsEntry, getLatestVitalsEntry, listVitalsEntries } from "../services/vitals.service";

const keys = {
  all: ["vitals"] as const,
  list: (limit: number) => ["vitals", "list", limit] as const,
  latest: ["vitals", "latest"] as const,
};

export function useVitalsList(limit = 50) {
  return useQuery({
    queryKey: keys.list(limit),
    queryFn: () => listVitalsEntries(limit),
  });
}

export function useLatestVitals() {
  return useQuery({
    queryKey: keys.latest,
    queryFn: () => getLatestVitalsEntry(),
  });
}

export function useCreateVitals() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateVitalsEntryInput) => createVitalsEntry(input),
    onSuccess: async () => {
      // Refresh the “latest” and list queries
      await qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}