const API_URL = "http://127.0.0.1:8000";

export async function getDashboard(token) {
    const response = await fetch(`${API_URL}/dashboard`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to load dashboard");
    }

    return response.json();
}