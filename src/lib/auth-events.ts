export const AUTH_CHANGED_EVENT = "finedge-auth-changed";

export function dispatchAuthChanged() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}
