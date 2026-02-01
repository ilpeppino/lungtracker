import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CreateEventInput } from "../models/event";
import { createEvent, getLatestEvent, listEvents } from "../services/events.service";

const keys = {
  all: ["events"] as const,
  list: (limit: number) => ["events", "list", limit] as const,
  latest: ["events", "latest"] as const,
};

export function useEventsList(limit = 50) {
  return useQuery({
    queryKey: keys.list(limit),
    queryFn: () => listEvents(limit),
  });
}

export function useLatestEvent() {
  return useQuery({
    queryKey: keys.latest,
    queryFn: () => getLatestEvent(),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createEvent(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: keys.all });
    },
  });
}