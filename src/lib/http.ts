type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";
export interface HttpOptions extends Omit<RequestInit, "method" | "body"> {
  body?: any;
  params?: Record<string, string | number | boolean | undefined | null | (string | number | boolean)[]>;
  timeout?: number;
  retry?: number;
  responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";
}
export class HttpError extends Error {
  status: number;
  data: any;
  response: Response;
  config: HttpOptions & { url: string; method: HttpMethod };

  constructor(status: number, data: any, response: Response, config: HttpOptions & { url: string; method: HttpMethod }) {
    super(`HTTP Error: ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.data = data;
    this.response = response;
    this.config = config;
  }
}
export type Interceptors = {
  request?: (options: RequestInit & { url: string }) => (RequestInit & { url: string }) | Promise<RequestInit & { url: string }>;
  response?: <T>(data: T, response: Response) => T | Promise<T>;
  error?: (error: HttpError | Error | any) => any;
};

export interface CreateHttpOptions {
  baseURL?: string;
  defaultOptions?: HttpOptions;
  interceptors?: Interceptors;
}

function normalizeUrl(baseURL: string, path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
    }
  const base = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
}

export function createHttpInstance(config: CreateHttpOptions = {}) {
  const { baseURL = "", defaultOptions = {}, interceptors = {} } = config;

  async function request<T>(
    method: HttpMethod,
    path: string,
    options: HttpOptions = {}
  ): Promise<T> {
    const {
      params,
      body,
      timeout = 8000,
      retry = 0,
      headers: customHeaders,
      signal: externalSignal,
      ...restOptions
    } = { ...defaultOptions, ...options };
    let url = baseURL ? normalizeUrl(baseURL, path) : path;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(val => searchParams.append(key, String(val)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      const query = searchParams.toString();
      if (query) {
        url += (url.includes("?") ? "&" : "?") + query;
      }
    }
    const headers = new Headers(defaultOptions.headers || {});
    if (customHeaders) {
      const extraHeaders = new Headers(customHeaders as any);
      extraHeaders.forEach((value, key) => headers.set(key, value));
    }
    let fetchBody: BodyInit | null | undefined = undefined;
    if (method !== "GET" && method !== "HEAD") {
      if (body instanceof FormData) {
        fetchBody = body;
        headers.delete("Content-Type");
      } else if (body instanceof URLSearchParams) {
        fetchBody = body;
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/x-www-form-urlencoded");
        }
      } else if (body !== undefined && body !== null) {
        fetchBody = JSON.stringify(body);
        if (!headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
      }
    }
    const controller = new AbortController();
    let id: ReturnType<typeof setTimeout> | undefined;
    if (timeout > 0) {
      id = setTimeout(() => controller.abort(), timeout);
    }
    const abortHandler = () => controller.abort();
    if (externalSignal) {
      if (externalSignal.aborted) {
        controller.abort();
      } else {
        externalSignal.addEventListener("abort", abortHandler);
      }
    }
    let fetchOptions: RequestInit & { url: string } = {
      ...restOptions,
      method,
      headers,
      body: fetchBody,
      signal: controller.signal,
      url 
    };
    if (interceptors.request) {
      fetchOptions = await interceptors.request(fetchOptions);
    }

    const targetUrl = fetchOptions.url;
    delete (fetchOptions as any).url;

    const doFetch = async (): Promise<T> => {
      let res: Response;
      try {
        res = await fetch(targetUrl, fetchOptions);
      } catch (err: any) {
        if (err.name === "AbortError" && externalSignal?.aborted) {
          throw new Error("Request cancelled by user"); 
        }
        if (err.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw err;
      } finally {
        if (id) clearTimeout(id);
        if (externalSignal) {
          externalSignal.removeEventListener("abort", abortHandler);
        }
      }
      const contentType = res.headers.get("content-type");
      let data: any = null;
      if (res.status !== 204 && res.status !== 205) {
        if (options.responseType === "arraybuffer") {
          data = await res.arrayBuffer();
        } else if (options.responseType === "blob") {
          data = await res.blob();
        } else if (options.responseType === "text") {
          data = await res.text();
        } else if (options.responseType === "json") {
          data = await res.json();
        } else if (options.responseType === "stream") {
          data = res.body; 
        } else {
          if (contentType?.includes("application/json")) {
            const textChunks = await res.text();
            try {
              data = textChunks ? JSON.parse(textChunks) : null;
            } catch (e) {
              data = textChunks;
            }
          } else if (contentType?.includes("multipart/") || contentType?.includes("application/pdf") || contentType?.includes("image/")) {
            data = await res.blob();
          } else {
            data = await res.text(); 
          }
        }
      }
      if (!res.ok) {
        const errConfig: any = { ...options, url: targetUrl, method };
        delete errConfig.params; 
        throw new HttpError(res.status, data, res, errConfig);
      }
      if (interceptors.response) {
        return interceptors.response(data, res);
      }

      return data as T;
    };
    try {
      return await doFetch();
    } catch (err: any) {
      const isCancelError = err.message === "Request cancelled by user";
      if (retry > 0 && !isCancelError) {
        return request<T>(method, path, { ...options, retry: retry - 1 });
      }
      if (interceptors.error) {
        return await interceptors.error(err);
      }
      throw err;
    }
  }
  return {
    request,
    get<T = any>(url: string, options?: HttpOptions) {
      return request<T>("GET", url, options);
    },
    post<T = any>(url: string, body?: any, options?: HttpOptions) {
      return request<T>("POST", url, { ...options, body });
    },
    put<T = any>(url: string, body?: any, options?: HttpOptions) {
      return request<T>("PUT", url, { ...options, body });
    },
    patch<T = any>(url: string, body?: any, options?: HttpOptions) {
      return request<T>("PATCH", url, { ...options, body });
    },
    delete<T = any>(url: string, options?: HttpOptions) {
      return request<T>("DELETE", url, options);
    },
    create: createHttpInstance
  };
}

export const http = createHttpInstance();