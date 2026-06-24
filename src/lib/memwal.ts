import { MemWal } from "@mysten-incubation/memwal";

export function getMemWalClient(userId?: string): MemWal {
  const key = process.env.MEMWAL_DELEGATE_KEY;
  const accountId = process.env.MEMWAL_ACCOUNT_ID;
  const serverUrl = process.env.MEMWAL_SERVER_URL;

  if (!key || !accountId || !serverUrl) {
    console.warn("MemWal environment variables are not fully set. Walrus Memory features will not work correctly.");
  }

  const baseNamespace = "world-cup-2026-pundit";
  // Sanitise userId to ensure it only has safe characters if needed, but UUIDs/alphanumeric are fine
  const namespace = userId ? `${baseNamespace}-${userId}` : baseNamespace;

  return MemWal.create({
    key: key || "0x0000000000000000000000000000000000000000000000000000000000000000",
    accountId: accountId || "0x0000000000000000000000000000000000000000000000000000000000000000",
    serverUrl: "https://relayer.memory.walrus.xyz",
    namespace,
  });
}
