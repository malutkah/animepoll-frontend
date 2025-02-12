export async function authFetch(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expires_at");

    if (!token || !expiresAt || Number(expiresAt) * 1000 < Date.now()) {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        window.location.href = "/login";
        return Promise.reject("Token expired");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", token);

    const newOptions = { ...options, headers };

    const res = await fetch(url, newOptions);
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        window.location.href = "/login";
        return Promise.reject("Unauthorized");
    }
    return res;
}
