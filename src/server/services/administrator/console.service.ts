import os from "os";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const DANGEROUS_COMMAND_BLACKLIST = [
  /\brm\s+-[a-zA-Z]*[rf][a-zA-Z]*\s+(\/|\*|~\/|\b(etc|var|usr|boot|root|home|bin|sbin|lib|dev|sys|proc|opt)\b)/i,
  /:\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:/,
  /\bdd\b.*\bof\s*=\s*\/dev\//i,
  /\b(mkfs|fdisk|parted|shred)\b/i,
  /\b(shutdown|reboot|poweroff|halt|init\s+[06])\b/i,
  /\bkillall\b/i,
  /\bpkill\b/i,
  /\bkill\s+-[0-9]+\s+-1\b/i,
  /\b(chmod|chown)\b.*\b-R\b.*\s+(\/|\b(etc|var|usr|boot|root|home|bin|sbin|lib|dev|sys|proc|opt)\b)/i,
  /\b(curl|wget)\b.*\b\|\s*(bash|sh|zsh|ksh)\b/i,
];

export class ConsoleService {
  async getSystemInfo() {
    const uptime = os.uptime();
    const processUptime = process.uptime();
    let gitInfo = { branch: "unknown", commit: "unknown" };
    try {
      const { stdout: branch } = await execAsync("git rev-parse --abbrev-ref HEAD");
      const { stdout: commit } = await execAsync("git rev-parse --short HEAD");
      gitInfo = {
        branch: branch.trim(),
        commit: commit.trim(),
      };
    } catch {
    }

    return {
      resultCode: 0,
      message: "Success",
      data: {
        system: {
          platform: os.platform(),
          release: os.release(),
          arch: os.arch(),
          cpus: os.cpus().length,
          cpuModel: os.cpus()[0]?.model || "Unknown",
          totalMem: os.totalmem(),
          freeMem: os.freemem(),
          uptime,
          loadAvg: os.loadavg(),
        },
        process: {
          uptime: processUptime,
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
        },
        git: gitInfo,
      },
    };
  }

  async runCommand(command: string) {
    const trimmed = command.trim();

    for (const pattern of DANGEROUS_COMMAND_BLACKLIST) {
      if (pattern.test(trimmed)) {
        throw new Error("Lệnh bị từ chối vì lý do bảo mật hệ thống (Dangerous command detected)");
      }
    }

    try {
      const { stdout, stderr } = await execAsync(trimmed, { timeout: 15000 });
      return {
        resultCode: 0,
        message: "Success",
        data: {
          stdout,
          stderr,
        },
      };
    } catch (err: any) {
      return {
        resultCode: 1,
        message: err.message || "Command execution failed",
        data: {
          stdout: err.stdout || "",
          stderr: err.stderr || err.message || "",
        },
      };
    }
  }
}

export const consoleService = new ConsoleService();
