const API_URL = "http://localhost:8000";

export async function apiRequest(
    endpoint: string,
    options: RequestInit = {}
) {
    const token = localStorage.getItem("access_token");

    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Something went wrong");
    }

    return response.json();
}

export async function checkBackendHealth() {
    return apiRequest("/health");
}