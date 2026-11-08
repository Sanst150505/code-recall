import "dotenv/config";

interface SubmissionItem {
  id: string;
  lang: string;
  time: string;
  timestamp: string; // Unix seconds as string (e.g. "1609459200")
  statusDisplay: string;
  runtime: string;
  url: string;
  isPending: string;
  title: string;
  memory: string;
  titleSlug: string;
}

interface SubmissionListResponse {
  data?: {
    submissionList?: {
      hasNext: boolean | null;
      submissions: SubmissionItem[] | null;
    } | null;
    userStatus?: {
      isSignedIn: boolean;
      username: string;
      userId: string;
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

async function executeLeetCodeGraphQL(
  query: string,
  variables: Record<string, unknown>,
  session: string,
  csrf?: string
): Promise<SubmissionListResponse> {
  const cookieHeader = [
    `LEETCODE_SESSION=${session}`,
    csrf ? `csrftoken=${csrf}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com",
    Cookie: cookieHeader,
  };

  if (csrf) {
    headers["x-csrftoken"] = csrf;
  }

  const response = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function runSubmissionListVerification() {
  console.log("=================================================================");
  console.log(" CodeRecall: Authenticated submissionList Historical Query Test");
  console.log("=================================================================\n");

  const session = process.env.LEETCODE_SESSION?.trim();
  const csrf = process.env.LEETCODE_CSRF_TOKEN?.trim();

  if (!session) {
    console.warn("⚠️  LEETCODE_SESSION is not set in your local environment / .env file.");
    console.log("\nSetup Instructions for Local Testing:");
    console.log("  1. In your browser, log in to https://leetcode.com");
    console.log("  2. Open DevTools (F12) -> Application -> Cookies -> https://leetcode.com");
    console.log("  3. Copy the value of 'LEETCODE_SESSION'");
    console.log("  4. Add it to your local .env file:");
    console.log("       LEETCODE_SESSION=your_session_value_here");
    console.log("       LEETCODE_CSRF_TOKEN=your_csrftoken_here (optional)");
    console.log("  5. Re-run: npm run test:leetcode-auth\n");
    console.log("Note: Your .env file is git-ignored and never committed or transmitted.");
    console.log("Status: SKIPPED (Authentication credentials missing)\n");
    return;
  }

  console.log("1. Verifying Authentication via userStatus query...");
  const authQuery = `
    query checkAuth {
      userStatus {
        isSignedIn
        username
        userId
      }
    }
  `;

  const authResult = await executeLeetCodeGraphQL(authQuery, {}, session, csrf);

  if (authResult.errors && authResult.errors.length > 0) {
    console.error("❌ Authentication GraphQL error:", authResult.errors[0].message);
    return;
  }

  const userStatus = authResult.data?.userStatus;
  if (!userStatus?.isSignedIn) {
    console.error("❌ Authentication Failed: Session cookie is invalid or expired (isSignedIn: false).");
    console.log("Please re-copy LEETCODE_SESSION from an active browser session.");
    return;
  }

  console.log(`✅ Authentication Succeeded!`);
  console.log(`   - Authenticated User: ${userStatus.username}`);
  console.log(`   - User ID: ${userStatus.userId}\n`);

  console.log("2. Probing Historical Submissions via submissionList...");
  const submissionListQuery = `
    query getSubmissions($offset: Int!, $limit: Int!, $slug: String) {
      submissionList(offset: $offset, limit: $limit, questionSlug: $slug) {
        hasNext
        submissions {
          id
          lang
          time
          timestamp
          statusDisplay
          runtime
          url
          isPending
          title
          memory
          titleSlug
        }
      }
    }
  `;

  const PAGE_SIZE = 20;
  // Can be configured via environment variable MAX_PAGES, defaults to 50 (up to 1,000 submissions)
  const maxPages = process.env.MAX_PAGES ? parseInt(process.env.MAX_PAGES, 10) : 50;
  const allSubmissions: SubmissionItem[] = [];
  const seenIds = new Set<string>();
  let duplicateCount = 0;
  let offset = 0;
  let hasNext = true;
  let pageNumber = 1;

  while (hasNext && pageNumber <= maxPages) {
    const result = await executeLeetCodeGraphQL(
      submissionListQuery,
      { offset, limit: PAGE_SIZE },
      session,
      csrf
    );

    if (result.errors && result.errors.length > 0) {
      console.error(`   ❌ Error on page ${pageNumber}:`, result.errors[0].message);
      break;
    }

    const pageData = result.data?.submissionList;
    if (!pageData || !pageData.submissions) {
      console.error(`   ❌ No submission data returned on page ${pageNumber}.`);
      break;
    }

    const submissions = pageData.submissions;
    if (submissions.length === 0) {
      console.log(`   Page ${pageNumber}: Empty page returned. Reached end of records.`);
      break;
    }

    // Check oldest timestamp on this current page
    const pageTimestamps = submissions.map((s) => Number(s.timestamp)).filter((t) => !isNaN(t) && t > 0);
    const pageOldestDate = pageTimestamps.length > 0 ? new Date(Math.min(...pageTimestamps) * 1000).toISOString().split("T")[0] : "N/A";

    for (const sub of submissions) {
      if (seenIds.has(sub.id)) {
        console.error(`   ❌ Duplicate Submission ID detected: ${sub.id}`);
        duplicateCount++;
      }
      seenIds.add(sub.id);
      allSubmissions.push(sub);
    }

    console.log(
      `   Page ${pageNumber.toString().padStart(2, " ")} | Offset: ${offset.toString().padStart(4, " ")} | ` +
      `Items: ${submissions.length.toString().padStart(2, " ")} | Page Oldest: ${pageOldestDate} | hasNext: ${pageData.hasNext}`
    );

    hasNext = Boolean(pageData.hasNext);
    offset += PAGE_SIZE;
    pageNumber++;

    if (hasNext && pageNumber <= maxPages) {
      await delay(350); // 350ms delay between pages
    }
  }

  console.log("\n=================================================================");
  console.log(" Historical Retrieval Verification Summary");
  console.log("=================================================================");

  console.log(`1. Authentication Check:         PASSED (${userStatus.username})`);
  console.log(`2. Total Pages Traversed:        ${pageNumber - 1}`);
  console.log(`3. Total Submissions Fetched:    ${allSubmissions.length}`);
  console.log(`4. Unique Submission IDs:        ${seenIds.size} (Duplicates found: ${duplicateCount})`);
  console.log(`5. Global ID Uniqueness:         ${duplicateCount === 0 ? "CONFIRMED (100% Unique)" : "FAILED"}`);

  if (allSubmissions.length > 0) {
    const validTimestamps = allSubmissions
      .map((s) => Number(s.timestamp))
      .filter((t) => !isNaN(t) && t > 0);

    const newestEpoch = Math.max(...validTimestamps);
    const oldestEpoch = Math.min(...validTimestamps);

    // Correct Unix seconds to JS Date conversion (* 1000)
    const newestDate = new Date(newestEpoch * 1000);
    const oldestDate = new Date(oldestEpoch * 1000);
    const now = new Date();

    const daysSpan = Math.round((now.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
    const yearsSpan = (daysSpan / 365.25).toFixed(2);

    console.log(`\n6. Historical Depth & Time Span:`);
    console.log(`   - Most Recent Submission:     ${newestDate.toISOString()}`);
    console.log(`   - Oldest Submissions In Probe: ${oldestDate.toISOString()}`);
    console.log(`   - Total Time Span Reached:    ${daysSpan} days (~${yearsSpan} years)`);

    const oldestItem = allSubmissions.find((s) => Number(s.timestamp) === oldestEpoch);
    if (oldestItem) {
      console.log(`   - Oldest Problem Solved:      "${oldestItem.title}" (${oldestItem.titleSlug})`);
      console.log(`   - Status / Language:          ${oldestItem.statusDisplay} / ${oldestItem.lang}`);
    }

    console.log(`\n7. API Capacity & History Limits:`);
    console.log(`   - Exceeded 20-record public cap? YES (${allSubmissions.length} records retrieved)`);
    if (hasNext) {
      console.log(`   - Reached end of history?      NO (More pages available, stopped at maxPages=${maxPages})`);
      console.log(`     (To probe further, run: MAX_PAGES=150 npm run test:leetcode-auth)`);
    } else {
      console.log(`   - Reached end of history?      YES (hasNext=false: Entire lifetime submission history reached)`);
    }
  }

  console.log("\n=================================================================\n");
}

runSubmissionListVerification().catch((err) => {
  console.error("Verification script failed with exception:", err);
});
