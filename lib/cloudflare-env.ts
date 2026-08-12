import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getCloudflareEnv(): Env {
  return getCloudflareContext().env as Env;
}
