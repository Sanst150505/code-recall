const LEETCODE_API = "https://leetcode.com/graphql";

export interface RecentAcSubmission {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
}

export interface ProblemDetails {
  title: string;
  difficulty: string;
  topicTags: Array<{ name: string }>;
}

export interface AuthenticatedSubmissionItem {
  id: string;
  lang: string;
  time: string;
  timestamp: string;
  statusDisplay: string;
  runtime: string;
  url: string;
  isPending: string;
  title: string;
  memory: string;
  titleSlug: string;
}

export interface AuthenticatedSubmissionsPage {
  hasNext: boolean;
  submissions: AuthenticatedSubmissionItem[];
}

export interface UserAuthStatus {
  isSignedIn: boolean;
  username: string;
  userId: string;
}

// In-memory cache for problem details during sync runs to avoid redundant external network calls
const problemDetailsCache = new Map<string, ProblemDetails>();

export async function getLeetCodeProfile(username: string) {
  const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        username
        profile {
          ranking
        }
        submitStats {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }
  `;

  const response = await fetch(LEETCODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LeetCode API error: ${response.status}`);
  }

  const result = await response.json();

  if (!result.data?.matchedUser) {
    throw new Error("LeetCode username not found");
  }

  return result.data.matchedUser;
}

export async function getRecentSubmissions(username: string): Promise<RecentAcSubmission[]> {
  const query = `
    query recentAcSubmissions($username: String!) {
      recentAcSubmissionList(username: $username, limit: 20) {
        id
        title
        titleSlug
        timestamp
      }
    }
  `;

  const response = await fetch(LEETCODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query,
      variables: { username },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch submissions");
  }

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  return result.data?.recentAcSubmissionList ?? [];
}

export async function getProblemDetails(titleSlug: string): Promise<ProblemDetails> {
  const cached = problemDetailsCache.get(titleSlug);
  if (cached) {
    return cached;
  }

  const query = `
    query questionData($titleSlug: String!) {
      question(titleSlug: $titleSlug) {
        title
        difficulty
        topicTags {
          name
        }
      }
    }
  `;

  const response = await fetch(LEETCODE_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: "https://leetcode.com",
    },
    body: JSON.stringify({
      query,
      variables: { titleSlug },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch problem details for "${titleSlug}": HTTP ${response.status}`);
  }

  const result = await response.json();

  if (result.errors || !result.data?.question) {
    throw new Error(`Problem details unavailable for "${titleSlug}"`);
  }

  const details: ProblemDetails = result.data.question;
  problemDetailsCache.set(titleSlug, details);
  return details;
}

export async function verifyLeetCodeAuth(session: string, csrf?: string): Promise<UserAuthStatus> {
  const query = `
    query checkAuth {
      userStatus {
        isSignedIn
        username
        userId
      }
    }
  `;

  const cookieHeader = [
    `LEETCODE_SESSION=${session}`,
    csrf ? `csrftoken=${csrf}` : "",
  ].filter(Boolean).join("; ");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com",
    Cookie: cookieHeader,
  };

  if (csrf) {
    headers["x-csrftoken"] = csrf;
  }

  const response = await fetch(LEETCODE_API, {
    method: "POST",
    headers,
    body: JSON.stringify({ query }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`LeetCode auth verification failed: HTTP ${response.status}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`LeetCode GraphQL auth error: ${result.errors[0].message}`);
  }

  const userStatus = result.data?.userStatus;
  if (!userStatus || !userStatus.isSignedIn) {
    return {
      isSignedIn: false,
      username: "",
      userId: "",
    };
  }

  return {
    isSignedIn: true,
    username: userStatus.username,
    userId: userStatus.userId,
  };
}

export async function getAuthenticatedSubmissions(
  session: string,
  csrf: string | undefined,
  offset: number,
  limit: number = 20
): Promise<AuthenticatedSubmissionsPage> {
  const query = `
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

  const cookieHeader = [
    `LEETCODE_SESSION=${session}`,
    csrf ? `csrftoken=${csrf}` : "",
  ].filter(Boolean).join("; ");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Referer: "https://leetcode.com",
    Cookie: cookieHeader,
  };

  if (csrf) {
    headers["x-csrftoken"] = csrf;
  }

  const response = await fetch(LEETCODE_API, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query,
      variables: { offset, limit },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status} fetching submissionList at offset ${offset}`);
  }

  const result = await response.json();

  if (result.errors && result.errors.length > 0) {
    throw new Error(`GraphQL error at offset ${offset}: ${result.errors[0].message}`);
  }

  const submissionList = result.data?.submissionList;
  if (!submissionList) {
    return {
      hasNext: false,
      submissions: [],
    };
  }

  return {
    hasNext: Boolean(submissionList.hasNext),
    submissions: submissionList.submissions ?? [],
  };
}
