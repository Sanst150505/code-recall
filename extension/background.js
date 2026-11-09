// CodeRecall Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("CodeRecall Extension installed.");
  // Initialize default configuration
  chrome.storage.local.get(["backendUrl"], (result) => {
    if (!result.backendUrl || result.backendUrl === "http://localhost:3000") {
      chrome.storage.local.set({ backendUrl: "https://code-recall-pryt.vercel.app" });
    }
  });
});
