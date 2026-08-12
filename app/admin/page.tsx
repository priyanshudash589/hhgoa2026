import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSessionToken } from "@/lib/admin-auth";
import { readTimelineStatusMap } from "@/lib/timeline-status-store";
import { readNotices } from "@/lib/notice-board-store";
import { readParticipation } from "@/lib/task-participation-store";
import { readLeaderboard } from "@/lib/leaderboard-store";
import { readPendingSubmissions } from "@/lib/form-submission-store";
import { readRejectedSubmissions } from "@/lib/rejected-submission-store";
import { AdminLoginForm } from "@/app/admin/login-form";
import { AdminDashboard } from "@/app/admin/dashboard";

export const metadata: Metadata = {
  title: "Timeline Dashboard | HH GOA",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const authenticated = isValidSessionToken(sessionToken);

  if (!authenticated) {
    return <AdminLoginForm />;
  }

  const [statusMap, notices, participation, leaderboard, pending, rejected] = await Promise.all([
    readTimelineStatusMap(),
    readNotices(),
    readParticipation(),
    readLeaderboard(),
    readPendingSubmissions(),
    readRejectedSubmissions(),
  ]);
  return (
    <AdminDashboard
      initialStatus={statusMap}
      initialNotices={notices}
      initialParticipation={participation}
      initialLeaderboard={leaderboard}
      initialPending={pending}
      initialRejected={rejected}
    />
  );
}
