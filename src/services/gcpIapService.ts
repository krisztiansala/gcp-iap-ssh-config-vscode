import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import { exec } from "child_process";
import { promisify } from "util";
import { Logger } from "../logger";

const execPromise = promisify(exec);

interface SSHOptions {
  [key: string]: string;
}

export class GCPIapService {
  private readonly sshConfigPath: string;
  private readonly logger: Logger;

  constructor() {
    // Check VS Code settings in order of precedence:
    // 1. GCP IAP SSH custom config path
    // 2. Remote SSH config path
    // 3. Default ~/.ssh/config
    const gcpConfig = vscode.workspace.getConfiguration('gcpIapSsh');
    const remoteSSHConfig = vscode.workspace.getConfiguration('remote.SSH');
    
    this.sshConfigPath = 
        gcpConfig.get<string>('sshConfigPath') ||
        remoteSSHConfig.get<string>('configFile') ||
        path.join(os.homedir(), ".ssh", "config");
    
    this.logger = Logger.getInstance();
  }

  async configureIapSsh(
    projectId: string, 
    instanceName: string, 
    zone: string, 
    force: boolean = false,
    dryRun: boolean = false
  ): Promise<string | void> {
    try {
      const [sshCmd, sshOptions] = await this.getSSHCommand(projectId, instanceName, zone);

      if (!sshOptions) {
        throw new Error("Failed to get SSH options from gcloud output");
      }

      // Ensure .ssh directory exists
      const sshDir = path.dirname(this.sshConfigPath);
      await fs.promises.mkdir(sshDir, { recursive: true });

      // Update SSH config or get preview
      return this.updateSSHConfig(sshOptions, instanceName, force, dryRun);

    } catch (error) {
      throw error;
    }
  }

  private async getSSHCommand(projectId: string, instanceName: string, zone: string): Promise<[string, SSHOptions]> {
    try {
      const { stdout, stderr } = await execPromise(
        `gcloud compute ssh ${instanceName} --tunnel-through-iap --dry-run --zone ${zone} --project ${projectId}`
      );

      if (stderr) {
        this.logger.log(`Warning from gcloud command: ${stderr}`);
      }

      const sshCmd = stdout.trim();
      const options: SSHOptions = {};

      // Check if this is a PuTTY command (Windows)
      if (sshCmd.includes('putty.exe')) {
        // Handle PuTTY-style command
        // Extract IdentityFile from -i option
        const iPattern = /-i\s+([^\s]+\.ppk)/;
        const iMatch = iPattern.exec(sshCmd);
        if (iMatch && iMatch.length > 1) {
          options["IdentityFile"] = iMatch[1].replace(/"/g, "");
        }

        // Extract ProxyCommand
        const proxyPattern = /-proxycmd\s+"([^"]+)"/i;
        const proxyMatch = proxyPattern.exec(sshCmd);
        if (proxyMatch && proxyMatch.length > 1) {
          options["ProxyCommand"] = proxyMatch[1].replace(/\\/g, "\\\\");
        }

        // Extract username and hostname from the end of the command
        const userHostPattern = /\s+([\w.-]+)@([\w.-]+)$/;
        const userHostMatch = userHostPattern.exec(sshCmd);
        if (userHostMatch && userHostMatch.length > 2) {
          options["User"] = userHostMatch[1];
        }
      } else {
        // Original Unix-style SSH command parsing
        // Extract IdentityFile from -i option
        const iPattern = /-i\s+([^\s]+)/;
        const iMatch = iPattern.exec(sshCmd);
        if (iMatch && iMatch.length > 1) {
          options["IdentityFile"] = iMatch[1].replace(/"/g, "");
        }

        // Parse -o options with improved splitting
        const parts = sshCmd.split(" -o ");
        for (let i = 1; i < parts.length; i++) {
          let part = parts[i];
          if (i === parts.length - 1) {
            const spaceIndex = part.indexOf(" ");
            if (spaceIndex !== -1) {
              part = part.slice(0, spaceIndex);
            }
          }
          const keyVal = part.split(/=(.+)/);
          if (keyVal.length >= 2) {
            const key = keyVal[0].trim();
            const value = keyVal[1].trim().replace(/['"]/g, "");
            options[key] = value;
          }
        }
      }

      return [sshCmd, options];
    } catch (error) {
      throw new Error(`Failed to get SSH configuration from gcloud: ${error}`);
    }
  }

  private async updateSSHConfig(
    sshOptions: SSHOptions, 
    instanceName: string, 
    force: boolean,
    dryRun: boolean = false
  ): Promise<string | void> {
    if (!sshOptions) {
      throw new Error("Failed to parse SSH command options");
    }

    const hostAlias = `compute.${instanceName}`;

    // Build config lines
    let configLines = [`Host ${hostAlias}`];
    configLines.push(`  HostName ${hostAlias}`);

    // Add all options from the SSH command
    for (const [key, value] of Object.entries(sshOptions)) {
      configLines.push(`  ${key.replace(/"/g, "")} ${value}`);
    }

    // Add user if not present in options
    if (!("User" in sshOptions)) {
      configLines.push(`  User ${os.userInfo().username}`);
    }

    const configContent = configLines.join("\n");

    // If dry run, return the preview instead of making changes
    if (dryRun) {
      return configContent;
    }

    // Read existing config with improved error handling
    let existingConfig = "";
    try {
      try {
        existingConfig = await fs.promises.readFile(this.sshConfigPath, "utf8");
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          if (!force) {
            throw new Error(`SSH config file does not exist at ${this.sshConfigPath}. Use force option to create it.`);
          }
          // Create empty config if force is true
          existingConfig = "";
          this.logger.log(`Creating new SSH config file at ${this.sshConfigPath}`);
        } else {
          throw new Error(`Error reading SSH config file: ${err}`);
        }
      }
    } catch (error) {
      throw error;
    }

    // Split into sections and filter out empty ones
    const sections = existingConfig.split("\n\n").filter((section) => section.trim() !== "");

    // Check if entry exists with improved line trimming
    let entryExists = false;
    const hostLine = `Host ${hostAlias}`;

    for (const section of sections) {
      const lines = section.split("\n").map((line) => line.trim());
      for (const line of lines) {
        if (line === hostLine) {
          entryExists = true;
          break;
        }
      }
    }

    if (entryExists && !force) {
      throw new Error(`SSH config entry already exists for ${hostAlias}. Use force option to update.`);
    }

    let newSections: string[] = [];
    if (force) {
      // Remove existing config for this instance if found
      for (const section of sections) {
        const lines = section.split('\n').map(line => line.trim());
        if (!lines.some(line => line.startsWith(`Host ${hostAlias}`))) {
          if (section.trim() !== "") {
            newSections.push(section);
          }
        }
      }
    } else {
      // Keep all existing sections
      newSections = sections;
    }

    // Add the new config
    newSections.push(configContent);

    // Write the updated config back to file
    const finalConfig = newSections.join("\n\n") + "\n";
    await fs.promises.writeFile(this.sshConfigPath, finalConfig, { mode: 0o644 });

    this.logger.log(`SSH config ${entryExists ? "updated" : "added"} successfully for instance: ${hostAlias}`);
  }

  public getConfigPath(): string {
    return this.sshConfigPath;
  }
}
