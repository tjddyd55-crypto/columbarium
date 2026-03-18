import { getAccessToken } from "../auth/session";

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: {
    code?: string;
    message?: string;
  } | null;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function resolveBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
  requiresAuth = false,
): Promise<T> {
  const token = getAccessToken();
  if (requiresAuth && !token) {
    throw new ApiError("로그인이 필요합니다.", 401, "AUTH_REQUIRED");
  }

  const baseUrl = resolveBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (requiresAuth && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | Record<string, unknown> | null;

  if (!response.ok) {
    const errPayload = payload as ApiEnvelope<unknown> | null;
    const message = errPayload?.error?.message ?? "요청 처리에 실패했습니다.";
    throw new ApiError(message, response.status, errPayload?.error?.code);
  }

  if (!payload || typeof payload !== "object") {
    throw new ApiError("응답을 읽을 수 없습니다.", response.status, "INVALID_RESPONSE");
  }

  const isEnvelope = "success" in payload && typeof (payload as ApiEnvelope<T>).success === "boolean";
  if (!isEnvelope) {
    return payload as T;
  }

  const envelope = payload as ApiEnvelope<T>;
  if (envelope.success === false) {
    throw new ApiError(
      envelope.error?.message ?? "요청 처리에 실패했습니다.",
      response.status,
      envelope.error?.code,
    );
  }

  if (envelope.data === null || envelope.data === undefined) {
    throw new ApiError("응답 데이터가 없습니다.", response.status, "EMPTY_RESPONSE");
  }

  return envelope.data;
}
