export interface RequestLog {
  id: string;
  method: string;
  path: string;
  status: number;
  ip: string;
  userAgent: string;
  duration: number;
  timestamp: number;
}

const MAX_LOGS = 500;
const logs: RequestLog[] = [];
let idCounter = 0;

export function addRequestLog(log: Omit<RequestLog, "id">) {
  idCounter++;
  logs.unshift({ ...log, id: String(idCounter) });
  if (logs.length > MAX_LOGS) logs.length = MAX_LOGS;
}

export function getRequestLogs(limit = 200) {
  return logs.slice(0, limit);
}

export function getRequestStats() {
  const now = Date.now();
  const last5m = logs.filter(l => now - l.timestamp < 5 * 60 * 1000);
  const last1h = logs.filter(l => now - l.timestamp < 60 * 60 * 1000);

  const methods: Record<string, number> = {};
  const statusCodes: Record<string, number> = {};
  const paths: Record<string, number> = {};

  for (const l of last1h) {
    methods[l.method] = (methods[l.method] || 0) + 1;
    const code = String(l.status).charAt(0) + "xx";
    statusCodes[code] = (statusCodes[code] || 0) + 1;
    const basePath = l.path.split("/").slice(0, 4).join("/");
    paths[basePath] = (paths[basePath] || 0) + 1;
  }

  const avgDuration = last1h.length > 0
    ? Math.round(last1h.reduce((sum, l) => sum + l.duration, 0) / last1h.length)
    : 0;

  return {
    total: logs.length,
    last5m: last5m.length,
    last1h: last1h.length,
    avgDuration,
    methods,
    statusCodes,
    topPaths: Object.entries(paths).sort((a, b) => b[1] - a[1]).slice(0, 10),
  };
}

export function clearRequestLogs() {
  logs.length = 0;
}
