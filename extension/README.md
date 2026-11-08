# CodeRecall — LeetCode Historical Sync Extension

The **CodeRecall Chrome Extension** enables 1-click synchronization of historical LeetCode submissions into the CodeRecall DSA skill assessment and revision recommendation platform.

---

## 🔒 Security Architecture (Zero Credential Transmission)

- **No Cookie Storage or Logging**: The extension **never** reads, exports, or transmits your `LEETCODE_SESSION` or `csrftoken` cookies to the CodeRecall backend or any third-party server.
- **Ambient Browser Credentials**: By leveraging Chrome Extension Manifest V3 host permissions (`https://leetcode.com/*`), the extension executes standard GraphQL requests using the browser's native network credential container (`credentials: "include"`).
- **Client-Side Deduplication & Normalization**: The extension retrieves submission records directly from LeetCode's official GraphQL API, normalizes the payload, and sends the submissions to your local or deployed CodeRecall instance (`POST /api/submissions/import`).

---

## 🚀 Installation Guide (Developer Mode)

### Step 1: Open Chrome Extensions
1. Open Google Chrome (or any Chromium-based browser such as Brave, Edge, or Arc).
2. Navigate to:
   ```text
   chrome://extensions
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.

---

### Step 2: Load the Extension
1. Click the **Load unpacked** button in the top-left toolbar.
2. In the file picker, select the `extension` folder located inside the `code-recall` project:
   ```text
   <your-project-path>/code-recall/extension
   ```
3. The **CodeRecall — LeetCode Sync** card will appear with version `1.0.0`.

---

### Step 3: Run 1-Click Synchronization
1. Make sure you are logged in to your account at [leetcode.com](https://leetcode.com).
2. Ensure your CodeRecall Next.js server is running (`npm run dev` at `http://localhost:3000`).
3. Click the CodeRecall icon in your Chrome toolbar or extensions pin menu.
4. The extension popup will automatically detect your logged-in LeetCode username and display a green **Signed In** status badge.
5. Click **Start Historical Sync**.
6. Watch real-time streaming progress as pages are retrieved, enriched, and saved into your PostgreSQL database.
7. Once completed, click **Open Dashboard** to view your comprehensive skill metrics, historical depth, and personalized revision queue.

---

## ⚙️ Configuration (Custom Backend URL)

By default, the extension targets `http://localhost:3000`. If your CodeRecall app runs on a different port or deployed domain:
1. Click the **Settings** gear icon in the extension popup.
2. Enter your custom backend URL (e.g., `http://localhost:3001` or `https://your-domain.vercel.app`).
3. Click **Save**.

---

## 📁 File Structure

```text
extension/
├── manifest.json       # Manifest V3 specification and permissions
├── popup.html          # Extension UI markup
├── popup.css           # Modern dark SaaS styling matching CodeRecall
├── popup.js            # GraphQL fetcher, batch streamer, and progress state
├── background.js       # Background service worker for lifecycle events
├── icons/              # Extension brand assets (16x16, 48x48, 128x128)
└── README.md           # Documentation and installation guide
```
