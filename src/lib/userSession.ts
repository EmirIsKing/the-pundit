export function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "";
  
  let userId = window.localStorage.getItem("pundit_user_id");
  if (!userId) {
    // Generate a simple unique user ID
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      userId = crypto.randomUUID();
    } else {
      userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
    window.localStorage.setItem("pundit_user_id", userId);
  }
  
  return userId;
}
