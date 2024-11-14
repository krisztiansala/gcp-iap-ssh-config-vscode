import * as vscode from 'vscode';
import { GCPConfig } from './types';
import { Logger } from './logger';
import { GCPIapService } from './services/gcpIapService';

export class GCPConfigProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _context: vscode.ExtensionContext
    ) {
        Logger.getInstance().log('Initializing GCP Config Provider');
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView
    ): void {
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this._getHtmlForWebview();

        webviewView.webview.onDidReceiveMessage(async (data) => {
            if (data.type === 'submit') {
                await this.handleSubmit(data.config);
            }
        });
    }

    private async handleSubmit(config: GCPConfig) {
        try {
            const iapService = new GCPIapService();
            await iapService.configureIapSsh(
                config.projectId,
                config.instanceName,
                config.zone,
                config.force
            );
            
            vscode.window.showInformationMessage('Operation completed successfully');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            Logger.getInstance().log(`ERROR: ${errorMessage}`);
            vscode.window.showErrorMessage(`Error: ${errorMessage}`);
        }
    }

    private _getHtmlForWebview(): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        padding: 0;
                        background: var(--vscode-sideBar-background);
                        color: var(--vscode-foreground);
                    }
                    .form-container {
                        padding: 10px;
                    }
                    .input-group {
                        margin-bottom: 10px;
                    }
                    .input-group label {
                        display: block;
                        margin-bottom: 4px;
                        font-size: 11px;
                        text-transform: uppercase;
                        color: var(--vscode-foreground);
                        opacity: 0.8;
                    }
                    .input-group input[type="text"] {
                        width: 100%;
                        padding: 4px 8px;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 2px;
                    }
                    .checkbox-group {
                        margin: 15px 0;
                    }
                    .checkbox-group label {
                        display: flex;
                        align-items: center;
                        gap: 6px;
                        cursor: pointer;
                    }
                    button {
                        width: 100%;
                        padding: 8px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 2px;
                        cursor: pointer;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .status-bar {
                        padding: 8px;
                        margin-bottom: 10px;
                        font-size: 12px;
                        border-radius: 3px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .status-error {
                        background: var(--vscode-inputValidation-errorBackground);
                        border: 1px solid var(--vscode-inputValidation-errorBorder);
                    }
                    .status-success {
                        background: var(--vscode-inputValidation-infoBackground);
                        border: 1px solid var(--vscode-inputValidation-infoBorder);
                    }
                    .form-disabled {
                        opacity: 0.6;
                        pointer-events: none;
                    }
                    .icon-button {
                        background: none;
                        border: none;
                        padding: 4px;
                        cursor: pointer;
                        color: var(--vscode-foreground);
                        width: auto;
                    }
                    .icon-button:hover {
                        background: var(--vscode-toolbar-hoverBackground);
                    }
                    .codicon {
                        font-family: codicon;
                        font-size: 16px;
                        font-weight: 400;
                        font-style: normal;
                    }
                    .codicon-refresh:before {
                        content: "\eb37";
                    }
                </style>
            </head>
            <body>
                <div class="form-container">
                    <form id="gcpForm">
                        <div class="input-group">
                            <label for="projectId">Project ID</label>
                            <input type="text" id="projectId" required>
                        </div>
                        <div class="input-group">
                            <label for="instanceName">Instance Name</label>
                            <input type="text" id="instanceName" required>
                        </div>
                        <div class="input-group">
                            <label for="zone">Zone</label>
                            <input type="text" id="zone" value="us-west1-a" required>
                        </div>
                        <div class="checkbox-group">
                            <label>
                                <input type="checkbox" id="force">
                                Force Update
                            </label>
                        </div>
                        <button type="submit">Configure Instance</button>
                    </form>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const form = document.getElementById('gcpForm');

                    form.onsubmit = (e) => {
                        e.preventDefault();
                        const config = {
                            projectId: document.getElementById('projectId').value,
                            instanceName: document.getElementById('instanceName').value,
                            zone: document.getElementById('zone').value,
                            force: document.getElementById('force').checked
                        };
                        vscode.postMessage({ type: 'submit', config });
                    };
                </script>
            </body>
            </html>
        `;
    }
} 