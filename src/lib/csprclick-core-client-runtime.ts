import type {
  AccountType,
  CsprClickInitOptions,
  SendResult,
} from "@make-software/csprclick-core-types";

type ClickRuntime = {
  init?: (options: CsprClickInitOptions) => void;
  connect: (withProvider: string, options?: unknown) => Promise<AccountType | undefined>;
  send: (
    deployJson: string | object,
    signingPublicKey: string,
    waitProcessing?: boolean | ((status: unknown, data: unknown) => void),
    timeout?: number,
  ) => Promise<SendResult | undefined>;
};

export default class CSPRClickSDK {
  private initOptions: CsprClickInitOptions | null = null;

  init(options: CsprClickInitOptions): void {
    this.initOptions = options;
    const runtime = this.getRuntimeIfAvailable();
    runtime?.init?.(options);
  }

  async connect(
    withProvider: string,
    options?: unknown,
  ): Promise<AccountType | undefined> {
    return this.getRuntime().connect(withProvider, options);
  }

  async send(
    deployJson: string | object,
    signingPublicKey: string,
    waitProcessing?: boolean | ((status: unknown, data: unknown) => void),
    timeout?: number,
  ): Promise<SendResult | undefined> {
    return this.getRuntime().send(
      deployJson,
      signingPublicKey,
      waitProcessing,
      timeout,
    );
  }

  private getRuntimeIfAvailable(): ClickRuntime | undefined {
    if (typeof window === "undefined") {
      return undefined;
    }
    return (window as unknown as { csprclick?: ClickRuntime }).csprclick;
  }

  private getRuntime(): ClickRuntime {
    const runtime = this.getRuntimeIfAvailable();
    if (runtime) {
      return runtime;
    }

    const appName = this.initOptions?.appName ?? "this app";
    throw new Error(
      `CSPR.click runtime is not available for ${appName}. ` +
        "The installed @make-software/csprclick-core-client package publishes only TypeScript declarations, so a browser CSPR.click runtime must provide window.csprclick.",
    );
  }
}
