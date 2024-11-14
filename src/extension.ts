import * as vscode from 'vscode';
import { GCPConfigProvider } from './gcpConfigProvider';

export async function activate(context: vscode.ExtensionContext) {
    // Create provider first
    const provider = new GCPConfigProvider(context.extensionUri, context);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('gcp-instance-config', provider)
    );
}

export function deactivate() {} 