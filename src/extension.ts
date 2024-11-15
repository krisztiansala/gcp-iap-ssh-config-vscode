import * as vscode from "vscode";
import { GCPConfigProvider } from "./gcpConfigProvider";

export async function activate(context: vscode.ExtensionContext) {
  // Create provider
  const provider = new GCPConfigProvider(context.extensionUri, context);

  // Register the webview provider
  context.subscriptions.push(vscode.window.registerWebviewViewProvider("gcp-instance-config", provider));

  // Register the command that shows the config view
  context.subscriptions.push(
    vscode.commands.registerCommand("gcpIapSsh.configureInstance", () => {
      vscode.commands.executeCommand("gcp-instance-config.focus");
    })
  );
}

export function deactivate() {}
