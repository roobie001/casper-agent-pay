// src/lib/csprclick.ts
export function getClickInstance(): any {
  // Check if the SDK is actually injected into the window
  if (typeof window !== "undefined" && (window as any).csprclick) {
    return (window as any).csprclick;
  }

  // Return a safe placeholder that warns instead of crashing
  console.warn("CSPR.click SDK is not yet initialized.");
  return null;
}
