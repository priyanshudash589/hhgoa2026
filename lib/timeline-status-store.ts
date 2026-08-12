import { getCloudflareEnv } from "@/lib/cloudflare-env";
import {
  isTimelinePhaseId,
  isTimelineStatus,
  type TimelineStatus,
  type TimelineStatusMap,
} from "@/lib/timeline-phases";

const KV_KEY = "timeline-status";

export async function readTimelineStatusMap(): Promise<TimelineStatusMap> {
  const { HHGOA_KV } = getCloudflareEnv();
  const raw = await HHGOA_KV.get(KV_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: TimelineStatusMap = {};
    for (const [id, status] of Object.entries(parsed)) {
      if (isTimelinePhaseId(id) && isTimelineStatus(status)) {
        out[id] = status;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export async function setTimelinePhaseStatus(
  phaseId: string,
  status: TimelineStatus | null,
): Promise<TimelineStatusMap> {
  const { HHGOA_KV } = getCloudflareEnv();
  const current = await readTimelineStatusMap();
  if (status === null) {
    delete current[phaseId];
  } else {
    current[phaseId] = status;
  }
  await HHGOA_KV.put(KV_KEY, JSON.stringify(current));
  return current;
}
