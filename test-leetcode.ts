
import "dotenv/config";
import { LeetCode, Credential } from "leetcode-query";

async function main() {
  const session = process.env.LEETCODE_SESSION;

  if (!session) {
    throw new Error("LEETCODE_SESSION not found");
  }

  const credential = new Credential();

  await credential.init(session);

  const leetcode = new LeetCode(credential);

  // Verify authenticated account
  const user = await leetcode.whoami();

  console.log("Authenticated account:", user);
}

main().catch((error) => {
  console.error("Authentication test failed:", error.message);
});
