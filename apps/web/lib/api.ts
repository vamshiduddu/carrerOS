const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getToken() {
	if (typeof window === 'undefined') return null;
	return window.localStorage.getItem('careeros_access_token');
}

export function setToken(token: string) {
	if (typeof window === 'undefined') return;
	window.localStorage.setItem('careeros_access_token', token);
}

export function clearToken() {
	if (typeof window === 'undefined') return;
	window.localStorage.removeItem('careeros_access_token');
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const token = getToken();
	const hasBody = init?.body != null;

	const response = await fetch(`${API_BASE}${path}`, {
		...init,
		headers: {
			// Only set Content-Type when there's a body — DELETE/GET must not send it
			...(hasBody ? { 'Content-Type': 'application/json' } : {}),
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(init?.headers ?? {})
		}
	});

	const data = await response.json().catch(() => ({}));
	if (!response.ok) {
		throw new Error((data as any).error ?? 'Request failed');
	}
	return data as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
	patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
	put: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
	delete: <T>(path: string) => request<T>(path, { method: 'DELETE' })
};
