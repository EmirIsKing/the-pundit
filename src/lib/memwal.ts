import { MemWal } from "@mysten-incubation/memwal";

let memwalClient: MemWal | null = null;

export function getMemWalClient(): MemWal {
  if (!memwalClient) {
    const key = process.env.MEMWAL_DELEGATE_KEY;
    const accountId = process.env.MEMWAL_ACCOUNT_ID;
    const serverUrl = process.env.MEMWAL_SERVER_URL;

    if (!key || !accountId || !serverUrl) {
      console.warn("MemWal environment variables are not fully set. Walrus Memory features will not work correctly.");
    }

    memwalClient = MemWal.create({
      key: key || "0x0000000000000000000000000000000000000000000000000000000000000000",
      accountId: accountId || "0x0000000000000000000000000000000000000000000000000000000000000000",
      serverUrl: "https://relayer.memory.walrus.xyz",
      namespace: "world-cup-2026-pundit",
    });
  }

  return memwalClient;
}
