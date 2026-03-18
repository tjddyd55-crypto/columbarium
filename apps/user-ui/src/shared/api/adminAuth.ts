/**
 * 관리자 로그인용 API.
 * - 아이디(사용자 입력) → API body의 login_id로 전송. 백엔드는 이를 DB username으로 조회합니다.
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
  user: { id: string; login_id: string; name: string; role: string };
};

export async function adminLogin(loginId: string, password: string): Promise<AdminLoginResponse> {
  const url = `${resolveBaseUrl()}/api/auth/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login_id: loginId.trim(), password }),
  });
  const body = (await res.json().catch(() => null)) as AdminLoginResponse | { error?: string; message?: string } | null;
  if (!res.ok) {
    const message = body && typeof body === "object" && "message" in body ? (body as { message?: string }).message : (body as { error?: string })?.error ?? res.statusText;
    throw new Error(message ?? "로그인에 실패했습니다.");
  }
  if (!body || typeof body !== "object" || !("token" in body) || !body.token) {
    throw new Error("로그인 응답 형식이 올바르지 않습니다.");
  }
  return body as AdminLoginResponse;
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
