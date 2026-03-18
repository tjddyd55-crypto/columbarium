/**
 * 관리자 로그인용 API.
 * - 아이디(사용자 입력) → API body의 login_id로 전송. 백엔드는 이를 DB loginId로 조회합니다.
 * - 응답: { token, user: { id, login_id, name, role } }
 */
const ADMIN_TOKEN_KEY = "admin_token";

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminAuth(): void {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

function resolveBaseUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";
  return base.endsWith("/") ? base.slice(0, -1) : base;
}

export type AdminLoginResponse = {
  token: string;
  user: { id: string; login_id?: string; name?: string; email?: string; role: string };
};

type Envelope<T> = { success: boolean; data: T | null; error?: { message?: string } | null; message?: string };

function isEnvelope(value: unknown): value is Envelope<unknown> {
  return !!value && typeof value === "object" && "success" in value;
}

function unwrapSuccess<T>(value: unknown): T {
  let current: unknown = value;
  for (let i = 0; i < 3; i += 1) {
    if (!isEnvelope(current)) break;
    if (current.success === false) {
      throw new Error(current.error?.message ?? current.message ?? "로그인에 실패했습니다.");
    }
    current = current.data;
  }
  return current as T;
}

export async function adminLogin(loginId: string, password: string): Promise<AdminLoginResponse> {
  const url = `${resolveBaseUrl()}/api/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login_id: loginId.trim(), password }),
  });
  const raw = await res.text();
  let body: unknown = null;
  try {
    body = JSON.parse(raw) as typeof body;
  } catch {
    if (raw.trimStart().startsWith("<!") || raw.includes("<!DOCTYPE") || raw.includes("<html")) {
      throw new Error("API 주소가 올바르지 않습니다. 백엔드 URL(VITE_API_BASE_URL)을 설정해 주세요.");
    }
    throw new Error("로그인 응답을 읽을 수 없습니다.");
  }
  if (!res.ok) {
    const rawMessage = body && typeof body === "object" && "message" in body ? (body as { message?: unknown }).message : (body as { error?: string })?.error ?? res.statusText;
    const message = typeof rawMessage === "string" ? rawMessage : res.status === 401 ? "아이디 또는 비밀번호를 확인해 주세요." : "로그인에 실패했습니다.";
    throw new Error(message);
  }
  const data = unwrapSuccess<{ accessToken?: string; token?: string; user?: AdminLoginResponse["user"] }>(body);
  const token = data?.accessToken ?? data?.token;
  const user = data?.user;
  if (!token || !user) {
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }
  return { token, user };
}

export async function adminRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  if (!token) throw new Error("로그인이 필요합니다.");
  const baseUrl = resolveBaseUrl();
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;
  const headers = new Headers(init.headers ?? {});
  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...init, headers });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message ?? data?.message ?? res.statusText ?? "요청에 실패했습니다.";
    throw new Error(message);
  }
  return data as T;
}
