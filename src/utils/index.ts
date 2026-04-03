import * as vscode from "vscode";

// ─── Logging ───────────────────────────────────────────────────────

let outputChannel: vscode.OutputChannel | undefined;

export function getOutputChannel(): vscode.OutputChannel {
  if (!outputChannel) {
    outputChannel = vscode.window.createOutputChannel("Toxic Senpai");
  }
  return outputChannel;
}

export function log(message: string, level: "debug" | "info" | "warn" | "error" = "info"): void {
  const timestamp = new Date().toISOString();
  const line = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  getOutputChannel().appendLine(line);

  if (level === "error") {
    console.error(line);
  }
}

// ─── Configuration ─────────────────────────────────────────────────

export function getConfig<T>(key: string, defaultValue: T): T {
  return vscode.workspace.getConfiguration("toxicSenpai").get<T>(key, defaultValue);
}

export function onConfigChange(callback: (e: vscode.ConfigurationChangeEvent) => void): vscode.Disposable {
  return vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("toxicSenpai")) {
      callback(e);
    }
  });
}

// ─── Nonce for Webview CSP ─────────────────────────────────────────

export function getNonce(): string {
  let text = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// ─── URI Helpers ───────────────────────────────────────────────────

export function getUri(webview: vscode.Webview, extensionUri: vscode.Uri, pathSegments: string[]): vscode.Uri {
  return webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, ...pathSegments));
}

// ─── Disposable Collection ─────────────────────────────────────────

export class DisposableStore implements vscode.Disposable {
  private disposables: vscode.Disposable[] = [];

  add<T extends vscode.Disposable>(disposable: T): T {
    this.disposables.push(disposable);
    return disposable;
  }

  dispose(): void {
    for (const d of this.disposables) {
      d.dispose();
    }
    this.disposables = [];
  }
}
