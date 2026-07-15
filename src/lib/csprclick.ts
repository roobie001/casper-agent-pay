export function getClickInstance() {
  return (window as any).CasperWalletProvider?.();
}
