import * as vscode from 'vscode';

export async function configureInstanceWithForm() {
    // Get project ID (use default if configured)
    const defaultProject = vscode.workspace.getConfiguration('gcpIapSsh').get('defaultProject');
    const projectId = await vscode.window.showInputBox({
        prompt: 'Enter GCP Project ID',
        value: defaultProject as string || '',
        validateInput: (value) => {
            return value ? null : 'Project ID is required';
        }
    });

    if (!projectId) {return;} // User cancelled

    // Get instance name
    const instanceName = await vscode.window.showInputBox({
        prompt: 'Enter Instance Name',
        validateInput: (value) => {
            return value ? null : 'Instance name is required';
        }
    });

    if (!instanceName) {return;} // User cancelled

    // Get zone
    const zone = await vscode.window.showInputBox({
        prompt: 'Enter Zone (e.g., us-central1-a)',
        validateInput: (value) => {
            return value ? null : 'Zone is required';
        }
    });

    if (!zone) {return;} // User cancelled

    // Optional: Get additional flags
    const additionalFlags = await vscode.window.showInputBox({
        prompt: 'Enter additional flags (optional)',
        placeHolder: 'e.g., --dry-run --verbose'
    });

    // Build the configuration command
    try {
        // Here you would call your actual configuration logic
        // For example:
        // await configureIapSsh(projectId, instanceName, zone, additionalFlags);
        
        vscode.window.showInformationMessage(
            `Configuring IAP SSH for instance ${instanceName} in project ${projectId} (zone: ${zone})`
        );
    } catch (error) {
        vscode.window.showErrorMessage(
            `Failed to configure IAP SSH: ${error instanceof Error ? error.message : String(error)}`
        );
    }
} 