# GCP IAP SSH Config for VS Code

This VS Code extension simplifies connecting to Google Cloud Platform (GCP) instances through Identity-Aware Proxy (IAP) tunneling. It integrates with VS Code's Remote SSH functionality to make connecting to your GCP instances seamless.

## Requirements

- Visual Studio Code 1.60.0 or higher
- Google Cloud SDK (`gcloud`) installed and authenticated (`gcloud auth login`)
- Appropriate IAP permissions configured in your GCP project

## Usage

1. Install the extension from the VS Code marketplace
2. Open the command palette (Ctrl/Cmd + Shift + P)
3. Search for "GCP IAP: Configure Instance"
4. Follow the prompts to select your:
   - GCP Project
   - Instance
   - Zone
5. Submit. The extension will add the host config to your SSH config file.

## Configuration

The extension supports the following settings:

- `gcpIapSsh.sshConfigPath`: Custom path to SSH config file. If not set, the extension will:
  1. Use VS Code's `remote.SSH.configFile` setting if available
  2. Fall back to the default `~/.ssh/config`
- `gcpIapSsh.defaultProject`: Default GCP project ID to use

You can modify these settings in VS Code's settings.json:

```json
{
  "gcpIapSsh.sshConfigPath": "/path/to/your/ssh/config",
  "gcpIapSsh.defaultProject": "your-default-project-id",
}
```

## Troubleshooting

1. Ensure you're logged in to gcloud:
   ```bash
   gcloud auth login
   ```

2. Verify that you have appropriate permissions: compute.viewer and iap tunnel user at least

3. Check the extension logs in VS Code's "Output" panel (select "GCP IAP SSH" from the dropdown)

## Contributing

Found a bug or have a feature request? Please open an issue on our [GitHub repository](https://github.com/krisztiansala/vscode-gcp-iap-ssh-config).

## License

MIT

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
4. Compile the extension:
   ```bash
   npm run compile
   ```

5. Press F5 to start debugging. This will:
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

## TODO
- Add dry run option