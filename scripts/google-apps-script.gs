/**
 * HH GOA — Task #1 form → leaderboard webhook.
 *
 * Setup:
 *   1. Open the form's linked response Sheet.
 *   2. Extensions → Apps Script.
 *   3. Delete whatever's in Code.gs, paste this whole file in.
 *   4. Fill in ENDPOINT_URL and WEBHOOK_SECRET below.
 *   5. Run once manually (select `onFormSubmit`, click ▶ Run) — Google will
 *      ask you to authorize the script (it needs permission to make an
 *      outbound web request). Click Allow. (The run itself will fail/no-op
 *      since there's no real form-submit event `e` yet — that's expected,
 *      you're just triggering the auth prompt.)
 *   6. Left sidebar → Triggers (clock icon) → + Add Trigger →
 *      function: onFormSubmit, event source: From spreadsheet, event type:
 *      On form submit → Save.
 *
 * That's it — every new form response now POSTs here automatically.
 *
 * Catching up on responses that arrived before this was wired up correctly
 * (wrong ENDPOINT_URL, trigger not set yet, etc.): select `backfillAllResponses`
 * in the function dropdown and click ▶ Run. It reads every row already in
 * the sheet directly (doesn't need a live event) and sends each one through
 * the same pipeline. See its own comment below before re-running it.
 *
 * NOTE: this runs on Google's servers, not your machine — it can only reach
 * a real public URL, never http://localhost. Point ENDPOINT_URL at the
 * deployed site (or a tunnel, e.g. ngrok/cloudflared, if you want to test
 * before deploying).
 */

var ENDPOINT_URL = "https://hhgoa.com/api/form-submission";
// Fill in with the real value of FORM_WEBHOOK_SECRET from the server (Cloudflare
// Worker secret) — not committed here since this repo is public.
var WEBHOOK_SECRET = "REPLACE_WITH_FORM_WEBHOOK_SECRET";

// Exact-title lookup — fine for short, simple titles that won't drift.
function getField(responses, title) {
  var v = responses[title];
  return v && v.length ? v[0].toString().trim() : "";
}

// Substring lookup (case-insensitive) — use this for any title that's long,
// hand-typed, or has odd punctuation, since an exact-match lookup breaks on
// the smallest wording/character difference. Finds the first question
// title that *contains* the given text.
function getFieldContaining(responses, substring) {
  var needle = substring.toLowerCase();
  for (var title in responses) {
    if (title.toLowerCase().indexOf(needle) !== -1) {
      var v = responses[title];
      return v && v.length ? v[0].toString().trim() : "";
    }
  }
  return "";
}

// A real X/Twitter post URL always has "/status/<id>" in it. Respondents
// have been inconsistent about which form field they put the actual post
// link in (some put it under "Live Link" instead of "Post Link") — so
// rather than trust one field's label, check whichever candidate value
// actually looks like a post URL.
function looksLikePostUrl(value) {
  return /\/status\/\d+/.test(value || "");
}

function resolvePostLink(responses) {
  var postLinkField = getFieldContaining(responses, "post link");
  if (looksLikePostUrl(postLinkField)) return postLinkField;

  var liveLinkField = getFieldContaining(responses, "live link");
  if (looksLikePostUrl(liveLinkField)) return liveLinkField;

  // Neither looked like a real post URL — fall back to whichever is
  // non-empty so the server's own error message ("doesn't look like an X
  // post URL") still ends up somewhere meaningful instead of a blank field.
  return postLinkField || liveLinkField;
}

function buildPayload(responses) {
  var members = [
    { xHandle: getField(responses, "Team Member 1 X ID"), email: getField(responses, "Team Member 1 Email ID") },
    { xHandle: getField(responses, "Team Member 2 X ID"), email: getField(responses, "Team Member 2 Email ID") },
    { xHandle: getField(responses, "Team Member 3 X ID"), email: getField(responses, "Team Member 3 Email ID") },
  ].filter(function (m) {
    return m.xHandle || m.email;
  });

  return {
    submitterName: getField(responses, "Your Name"),
    teamName: getField(responses, "Team Name"),
    teamId: getFieldContaining(responses, "team id"),
    postLink: resolvePostLink(responses),
    members: members,
  };
}

function sendPayload(payload) {
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    headers: { "x-webhook-secret": WEBHOOK_SECRET },
    muteHttpExceptions: true, // so a bad response doesn't throw and lose the submission
  };
  var response = UrlFetchApp.fetch(ENDPOINT_URL, options);
  return response.getResponseCode() + ": " + response.getContentText();
}

function onFormSubmit(e) {
  var responses = e && e.namedValues ? e.namedValues : {};

  // DEBUG: log the raw field titles + values Google actually sent. Check
  // this in Executions if anything still looks wrong — it's ground truth.
  // NOTE: this is always {} when you click ▶ Run manually in the editor —
  // manual runs don't carry a real form-submit event. That's expected, not
  // a bug; it only reflects reality when triggered by an actual submission.
  Logger.log("RAW namedValues: " + JSON.stringify(responses));

  var payload = buildPayload(responses);
  Logger.log("Payload being sent: " + JSON.stringify(payload));
  Logger.log(sendPayload(payload));
}

/**
 * One-time (or as-needed) catch-up: reads every row already sitting in the
 * response sheet directly — no live form-submit event needed — and POSTs
 * each one through the same pipeline as onFormSubmit. Use this for
 * responses that came in before the trigger/ENDPOINT_URL was set up
 * correctly, so they aren't lost. Safe to select this function and click
 * ▶ Run directly in the Apps Script editor.
 *
 * Re-running this will re-submit every row again (there's no "already sent"
 * tracking) — each POST creates a new pending-review entry on the site, so
 * only run it when you actually mean to (re-)send everything currently in
 * the sheet. Duplicates land in the Pending Submissions queue where you can
 * just reject the extras.
 */
function backfillAllResponses() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) {
    Logger.log("No response rows found.");
    return;
  }

  var headers = data[0];
  var sent = 0;

  for (var r = 1; r < data.length; r++) {
    var row = data[r];
    var responses = {};
    for (var c = 0; c < headers.length; c++) {
      var title = headers[c];
      if (!title) continue;
      var raw = row[c];
      responses[title] = [raw === null || raw === undefined ? "" : raw.toString()];
    }

    var payload = buildPayload(responses);
    if (!payload.postLink) {
      Logger.log("Row " + (r + 1) + ": skipped, no post link found in any field.");
      continue;
    }

    Logger.log("Row " + (r + 1) + " (" + (payload.teamName || payload.submitterName) + "): " + sendPayload(payload));
    sent++;
  }

  Logger.log("Backfill complete — " + sent + " row(s) sent.");
}
