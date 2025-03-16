// export const baseURL = window.location.href.startsWith("https://api.animepoll") ? "https://api.animepoll.net" : "http://localhost:8080";

export const baseURL = (): string => {
    return window.location.href.startsWith("https://animepoll") ? "https://api.animepoll.net" : "http://localhost:8080";
}

export const wsURL = (): string => {
    return window.location.href.startsWith("https://animepoll") ? "api.animepoll.net" : "localhost:8080";
}

export async function authFetch(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const expiresAt = localStorage.getItem("expires_at");

    if (!token || !expiresAt) {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        window.location.href = "/login";
        return Promise.reject("Token expired");
    }

    const headers = new Headers(options.headers || {});
    headers.set("Authorization", token);

    const newOptions = { ...options, headers };

    const res = await fetch(baseURL()+endpoint, newOptions);
    if (res.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        window.location.href = "/login";
        return Promise.reject("Unauthorized");
    }
    if (!res.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        window.location.href = "/login";
        return Promise.reject("Unauthorized");
    }
    return res;
}
