import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateActivityInput } from "../models/activity";
import { createActivity, getLatestActivity, listActivities } from "../services/activities.service";

const keys = {
  all: ["activities"] as const,
  list: (limit: number) => ["activities", "list", limit] as const,
  latest: (type?: string) => ["activities", "latest", type ?? "all"] as const,
};

export function useActivitiesList(limit = 50) {
  return useQuery({
    queryKey: keys.list(limit),
    queryFn: () => listActivities(limit),
  });
}

export function useLatestActivity(type?: string) {
  return useQuery({
    queryKey: keys.latest(type),
    queryFn: () => getLatestActivity(type),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateActivityInput) => createActivity(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}