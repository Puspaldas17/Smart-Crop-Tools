const KEY = "lastTool";

export type ToolId = "advisory" | "chat" | "market" | "pest" | "weather" | "overview" | "features";

export function getLastTool(): ToolId | null {
  try {
    return (localStorage.getItem(KEY) as ToolId | null) || null;
  } catch {
    return null;
  }
}

export function setLastTool(id: ToolId) {
  try {
    localStorage.setItem(KEY, id);
    window.dispatchEvent(new CustomEvent("tools:last", { detail: id }));
  } catch {}
}
