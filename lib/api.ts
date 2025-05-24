// export const baseURL = window.location.href.startsWith("https://api.animepoll") ? "https://api.animepoll.net" : "http://localhost:8080";

export const baseURL = (): string => {
    return window.location.href.startsWith("https://animepoll") ? "https://api.animepoll.net" : "http://localhost:8080";
}

export const wsURL = (): string => {
    return window.location.href.startsWith("https://animepoll") ? "api.animepoll.net" : "localhost:8080";
}

export function getCSRFToken(): string {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === 'csrf_token') {
            return value;
        }
    }
    return '';
}

export async function authFetch(endpoint: string, options: RequestInit = {}) {
    const csrfToken = getCSRFToken();

    // console.log('csrfToken', csrfToken)

    const headers = new Headers(options.headers || {});

    // Add CSRF token for non-GET requests
    if (options.method && ['POST', 'PUT', 'GET', 'DELETE', 'PATCH'].includes(options.method)) {
        headers.set('X-CSRF-Token', csrfToken);
    }

    const newOptions = { ...options, headers, credentials: 'include', };

    const res = await fetch(baseURL()+endpoint, {
        ...options,
        headers,
        credentials: "include",
    });
    if (res.status === 401) {
        window.location.href = "/login";
        return Promise.reject("Unauthorized");
    }
    return res;
}
