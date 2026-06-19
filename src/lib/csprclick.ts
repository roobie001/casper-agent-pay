export function getClickInstance() {
  if (typeof window === "undefined" || !(window as any).csprclick) {
    throw new Error("CSPR.click runtime not loaded yet");
  }
  return (window as any).csprclick;
}
