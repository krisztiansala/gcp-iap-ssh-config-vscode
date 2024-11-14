# GCP IAP SSH Config for VS Code

This VS Code extension simplifies connecting to Google Cloud Platform (GCP) instances through Identity-Aware Proxy (IAP) tunneling. It integrates with VS Code's Remote SSH functionality to make connecting to your GCP instances seamless.

## Features

- Automatically downloads and manages the gcp-iap-ssh-config binary for your operating system
- Adds SSH configurations for GCP instances with a simple command palette interface
- Integrates with VS Code Remote SSH for easy connection management
- Supports multiple GCP projects and instances
- Provides a user-friendly interface for managing IAP SSH configurations

<!-- ![Configure GCP Instance](images/configure-instance.gif) -->

## Requirements

- Visual Studio Code 1.60.0 or higher
- Google Cloud SDK (`gcloud`) installed and configured
- Appropriate IAP permissions configured in your GCP project
- Remote SSH extension installed

## Extension Settings

This extension contributes the following settings:

* `gcpIapSsh.binaryPath`: Custom path to the gcp-iap-ssh-config binary (optional)
* `gcpIapSsh.sshConfigPath`: Custom path to SSH config file (defaults to ~/.ssh/config)
* `gcpIapSsh.defaultProject`: Default GCP project ID to use
* `gcpIapSsh.autoUpdate`: Automatically check for binary updates (default: true)

## Usage

1. Install the extension from the VS Code marketplace
2. Open the command palette (Ctrl/Cmd + Shift + P)
3. Search for "GCP IAP: Configure Instance"
4. Follow the prompts to select your:
   - GCP Project
   - Instance
   - Zone
5. The extension will automatically:
   - Download the appropriate binary (if needed)
   - Configure your SSH settings
   - Make the instance available in the Remote SSH extension

## Commands

- `GCP IAP: Configure Instance` - Add a new GCP instance to SSH config
- `GCP IAP: Update Binary` - Manually update the gcp-iap-ssh-config binary
- `GCP IAP: Remove Instance` - Remove an instance from SSH config
- `GCP IAP: List Configured Instances` - Show all configured GCP instances

## Troubleshooting

1. Ensure you're logged in to gcloud:
   ```bash
   gcloud auth login
   ```

2. Verify IAP is enabled for your project in the GCP Console

3. Check the extension logs in VS Code's "Output" panel (select "GCP IAP SSH" from the dropdown)

4. Common issues:
   - "Binary not found": Try running "GCP IAP: Update Binary" command
   - "Permission denied": Check your IAP and instance permissions
   - "Connection failed": Verify your instance is running and IAP is configured

## Security

This extension manages SSH configurations and downloads binaries. The binary is verified against official releases from the [gcp-iap-ssh-config repository](https://github.com/krisztiansala/gcp-iap-ssh-config).

## Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/yourusername/vscode-gcp-iap-ssh-config).

## License

MIT

## Credits

This extension integrates with [gcp-iap-ssh-config](https://github.com/krisztiansala/gcp-iap-ssh-config) by Krisztian Sala.

## Development

### Prerequisites
- Node.js and npm installed
- VS Code Extension Manager (`vsce`) installed: `npm install -g @vscode/vsce`

### Testing Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/vscode-gcp-iap-ssh-config
   cd vscode-gcp-iap-ssh-config
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Open the project in VS Code:
   ```bash
   code .
   ```

4. Press F5 to start debugging. This will:
   - Launch a new VS Code Extension Development Host
   - Load your extension in development mode
   - Enable you to set breakpoints and debug the extension

### Package and Install
To test the extension as if it were installed from the marketplace:

1. Package the extension:
   ```bash
   vsce package
   ```

2. Install the generated .vsix file:
   - In VS Code, open the Command Palette
   - Select "Extensions: Install from VSIX..."
   - Choose the generated .vsix file

### Running Tests
```bash
npm run test
```
