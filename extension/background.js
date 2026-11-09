// CodeRecall Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  console.log("CodeRecall Extension installed.");
  // Initialize default configuration
  chrome.storage.local.get(["backendUrl"], (result) => {
    if (!result.backendUrl) {
      chrome.storage.local.set({ backendUrl: "const DEFAULT_BACKEND = "https://your-project.vercel.app";" });
    }
  });
});
