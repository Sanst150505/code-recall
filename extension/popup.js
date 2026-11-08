// CodeRecall Chrome Extension - Clean Popup Controller

const LEETCODE_API = "https://leetcode.com/graphql";
const DEFAULT_BACKEND = "http://localhost:3000";

// DOM Elements
const toggleEnable = document.getElementById("toggle-enable");
const toggleLabel = document.getElementById("toggle-label");
const sessionBadge = document.getElementById("session-badge");
const usernameDisplay = document.getElementById("username-display");
const loginPrompt = document.getElementById("login-prompt");
const btnLogout = document.getElementById("btn-logout");
const btnSync = document.getElementById("btn-sync");
const btnSyncText = document.getElementById("btn-sync-text");
const progressCard = document.getElementById("progress-card");
const progressBarFill = document.getElementById("progress-bar-fill");
const progressStatusMsg = document.getElementById("progress-status-msg");
const statProcessed = document.getElementById("stat-processed");
const statSaved = document.getElementById("stat-saved");
const statSkipped = document.getElementById("stat-skipped");
const postSyncActions = document.getElementById("post-sync-actions");
const btnOpenDashboard = document.getElementById("btn-open-dashboard");
const errorCard = document.getElementById("error-card");
const errorMessage = document.getElementById("error-message");
const btnRetry = document.getElementById("btn-retry");

// Application State
let backendUrl = DEFAULT_BACKEND;
let currentUser = null;
let isSyncing = false;
let isEnabled = true;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

document.addEventListener("DOMContentLoaded", async () => {
  await loadState();
  setupEventListeners();
  if (isEnabled) {
    await checkLeetCodeSession();
  } else {
    updateToggleUI(false);
  }
});

async function loadState() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["backendUrl", "extensionEnabled"], (result) => {
      backendUrl = result.backendUrl || DEFAULT_BACKEND;
      isEnabled = result.extensionEnabled !== undefined ? result.extensionEnabled : true;
      toggleEnable.checked = isEnabled;
      resolve();
    });
  });
}

function setupEventListeners() {
  // Enable / Disable Toggle
  toggleEnable.addEventListener("change", () => {
    isEnabled = toggleEnable.checked;
    chrome.storage.local.set({ extensionEnabled: isEnabled });
    updateToggleUI(isEnabled);
    if (isEnabled) {
      checkLeetCodeSession();
    } else {
      btnSync.disabled = true;
      btnSyncText.textContent = "Extension Disabled";
    }
  });

  // Logout / Switch Account
  btnLogout.addEventListener("click", () => {
    const confirmLogout = confirm(
      "Log out of current LeetCode account to switch to a different user?\n\nThis will open the LeetCode logout page."
    );
    if (confirmLogout) {
      chrome.tabs.create({ url: "https://leetcode.com/accounts/logout/" });
      currentUser = null;
      updateConnectionStatusUI(false);
    }
  });

  // Sync Button
  btnSync.addEventListener("click", () => {
    if (!isSyncing && currentUser?.isSignedIn && isEnabled) {
      startHistoricalSync();
    }
  });

  btnRetry.addEventListener("click", () => {
    errorCard.classList.add("hidden");
    if (currentUser?.isSignedIn) {
      startHistoricalSync();
    } else {
      checkLeetCodeSession();
    }
  });

  btnOpenDashboard.addEventListener("click", () => {
    chrome.tabs.create({ url: `${backendUrl}/dashboard` });
  });
}

function updateToggleUI(enabled) {
  if (enabled) {
    toggleLabel.textContent = "Active";
    toggleLabel.classList.add("active");
  } else {
    toggleLabel.textContent = "Disabled";
    toggleLabel.classList.remove("active");
  }
}

// Check LeetCode Active Session
async function checkLeetCodeSession() {
  sessionBadge.className = "badge neutral";
  sessionBadge.textContent = "Checking";
  usernameDisplay.textContent = "Detecting...";
  btnSync.disabled = true;
  errorCard.classList.add("hidden");

  try {
    const response = await fetch(LEETCODE_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          query checkAuth {
            userStatus {
              isSignedIn
              username
              userId
            }
          }
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode HTTP ${response.status}`);
    }

    const data = await response.json();
    const userStatus = data?.data?.userStatus;

    if (userStatus && userStatus.isSignedIn) {
      currentUser = userStatus;
      updateConnectionStatusUI(true, userStatus.username);
    } else {
      currentUser = null;
      updateConnectionStatusUI(false);
    }
  } catch (err) {
    currentUser = null;
    updateConnectionStatusUI(false, null, err.message);
  }
}

function updateConnectionStatusUI(isSignedIn, username = "", errorMsg = "") {
  if (!isEnabled) {
    btnSync.disabled = true;
    btnSyncText.textContent = "Extension Disabled";
    return;
  }

  if (isSignedIn) {
    sessionBadge.className = "badge success";
    sessionBadge.textContent = "Signed In";
    usernameDisplay.textContent = username;
    loginPrompt.classList.add("hidden");
    btnLogout.classList.remove("hidden");
    btnSync.disabled = false;
    btnSyncText.textContent = "Sync Submissions";
  } else {
    sessionBadge.className = "badge warning";
    sessionBadge.textContent = "Not Signed In";
    usernameDisplay.textContent = "No Account";
    loginPrompt.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    btnSync.disabled = true;
    btnSyncText.textContent = "Sign In First";
  }
}

// Sync Pipeline
async function startHistoricalSync() {
  if (!currentUser?.username || !isEnabled) return;

  isSyncing = true;
  btnSync.disabled = true;
  btnSyncText.textContent = "Syncing...";
  errorCard.classList.add("hidden");
  postSyncActions.classList.add("hidden");
  progressCard.classList.remove("hidden");

  let offset = 0;
  const limit = 20;
  let hasNext = true;
  let pageIndex = 0;
  let totalProcessed = 0;
  let totalSaved = 0;
  let totalSkipped = 0;

  statProcessed.textContent = "0";
  statSaved.textContent = "0";
  statSkipped.textContent = "0";
  progressBarFill.style.width = "5%";
  progressStatusMsg.textContent = "Starting sync...";

  try {
    const submissionQuery = `
      query getSubmissions($offset: Int!, $limit: Int!) {
        submissionList(offset: $offset, limit: $limit) {
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

    while (hasNext && isEnabled) {
      pageIndex++;
      progressStatusMsg.textContent = `Page ${pageIndex}...`;

      // 1. Fetch batch from LeetCode
      const lcResponse = await fetch(LEETCODE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: submissionQuery,
          variables: { offset, limit },
        }),
      });

      if (!lcResponse.ok) {
        throw new Error(`LeetCode API error (HTTP ${lcResponse.status})`);
      }

      const lcResult = await lcResponse.json();
      if (lcResult.errors && lcResult.errors.length > 0) {
        throw new Error(lcResult.errors[0].message || "LeetCode GraphQL error");
      }

      const pageData = lcResult?.data?.submissionList;
      if (!pageData || !Array.isArray(pageData.submissions)) {
        throw new Error("Unexpected submission list format from LeetCode");
      }

      const submissions = pageData.submissions;
      hasNext = Boolean(pageData.hasNext);

      if (submissions.length === 0) {
        break;
      }

      // 2. Stream to CodeRecall backend
      let importResponse;
      try {
        importResponse = await fetch(`${backendUrl}/api/submissions/import`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leetcodeUsername: currentUser.username,
            submissions: submissions,
            pageOffset: offset,
            hasNext: hasNext,
          }),
        });
      } catch (networkErr) {
        throw new Error("Cannot reach CodeRecall backend at localhost:3000. Please start your web app (`npm run dev`).");
      }

      const importResult = await importResponse.json().catch(() => null);

      if (!importResponse.ok) {
        const errorDetail = importResult?.details || importResult?.error || `HTTP ${importResponse.status}`;
        throw new Error(`Import failed: ${errorDetail}`);
      }

      totalProcessed += submissions.length;
      totalSaved += importResult?.savedCount || 0;
      totalSkipped += importResult?.duplicatesSkipped || 0;

      statProcessed.textContent = totalProcessed;
      statSaved.textContent = totalSaved;
      statSkipped.textContent = totalSkipped;

      const progressRatio = Math.min(95, Math.round(5 + pageIndex * 4));
      progressBarFill.style.width = `${progressRatio}%`;

      offset += limit;
      await sleep(350);
    }

    // Complete
    progressBarFill.style.width = "100%";
    progressStatusMsg.textContent = `Completed (${totalProcessed} submissions checked)`;
    postSyncActions.classList.remove("hidden");
    btnSyncText.textContent = "Sync Again";
    btnSync.disabled = false;
  } catch (err) {
    console.error("Sync error:", err);
    errorCard.classList.remove("hidden");
    errorMessage.textContent = err.message || "Sync interrupted";
    btnSyncText.textContent = "Resume Sync";
    btnSync.disabled = false;
  } finally {
    isSyncing = false;
  }
}
