const API_URL = (import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000" : "")).replace(/\/$/, "");

export class ApiError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

// FastAPI returns `detail` as a string, or (for 422) a list of {loc, msg} objects.
function errorMessage(status, data) {
    let detail = data?.detail ?? data?.message ?? (typeof data === "string" ? data : null);
    if (Array.isArray(detail)) {
        detail = detail
            .map((d) => `${(d.loc || []).filter((x) => x !== "body").join(".")}: ${d.msg}`)
            .join("; ");
    }
    if (detail) return detail;
    if (status === 403) return "You do not have permission to perform this action.";
    if (status === 404) return "The requested resource was not found.";
    if (status === 422) return "Please check the submitted values.";
    if (status >= 500) return "The server ran into a problem. Please try again.";
    return `Request failed (${status}).`;
}

function token() {
    return localStorage.getItem("token");
}

async function request(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const accessToken = token();
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);

    let response;
    try {
        response = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch {
        throw new ApiError("Unable to reach the server. Check the backend URL and your connection.", 0);
    }

    if (response.status === 401 && accessToken) {
        // Only treat 401 as "session expired" when we actually sent a token;
        // a failed login also returns 401 and must show its own message.
        localStorage.removeItem("token");
        window.dispatchEvent(new Event("auth-expired"));
        throw new ApiError("Your session has expired. Please log in again.", 401);
    }

    const text = await response.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = text; }

    if (!response.ok) {
        throw new ApiError(errorMessage(response.status, data), response.status);
    }
    return data;
}

export const api = {
    auth: {
        login: (data) => request("/auth/login", { method: "POST", body: JSON.stringify(data) }),
        register: (data) => request("/auth/register", { method: "POST", body: JSON.stringify(data) }),
    },
    user: { me: () => request("/users/me") },
    profile: {
        get: () => request("/profile"),
        create: (data) => request("/profile", { method: "POST", body: JSON.stringify(data) }),
        save: (data) => request("/profile", { method: "PUT", body: JSON.stringify(data) }),
    },
    goals: {
        get: () => request("/goals"),
        calculate: () => request("/goals/calculate", { method: "POST" }),
    },
    dashboard: (date) => request(`/dashboard?date=${encodeURIComponent(date)}`),
    nutrition: {
        daily: (date) => request(`/nutrition/daily?nutrition_date=${encodeURIComponent(date)}`),
    },
    meals: {
        list: (date) => request(`/meals?meal_date=${encodeURIComponent(date)}`),
        add: (data) => request("/meals", { method: "POST", body: JSON.stringify(data) }),
        remove: (id) => request(`/meals/${id}`, { method: "DELETE" }),
    },
    water: {
        daily: (date) => request(`/water/daily?water_date=${encodeURIComponent(date)}`),
        history: () => request("/water"),
        add: (data) => request("/water", { method: "POST", body: JSON.stringify(data) }),
    },
    workouts: {
        list: () => request("/workouts"),
        create: (data) => request("/workouts", { method: "POST", body: JSON.stringify(data) }),
        exercises: () => request("/workouts/exercises"),
        createExercise: (data) => request("/workouts/exercises", { method: "POST", body: JSON.stringify(data) }),
        logs: (workoutId) => request(`/workouts/${workoutId}/exercises`),
        addExercise: (workoutId, data) => request(`/workouts/${workoutId}/exercises`, { method: "POST", body: JSON.stringify(data) }),
    },
    activities: {
        list: (date) => request(`/activities?activity_date=${encodeURIComponent(date)}`),
        daily: (date) => request(`/activities/daily?activity_date=${encodeURIComponent(date)}`),
        add: (data) => request("/activities", { method: "POST", body: JSON.stringify(data) }),
    },
    sleep: {
        list: (date) => request(`/sleep?sleep_date=${encodeURIComponent(date)}`),
        daily: (date) => request(`/sleep/daily?sleep_date=${encodeURIComponent(date)}`),
        add: (data) => request("/sleep", { method: "POST", body: JSON.stringify(data) }),
    },
    weight: {
        list: () => request("/weight"),
        add: (data) => request("/weight", { method: "POST", body: JSON.stringify(data) }),
    },
    measurements: {
        list: () => request("/measurements"),
        add: (data) => request("/measurements", { method: "POST", body: JSON.stringify(data) }),
    },
    photos: {
        list: () => request("/progress-photos"),
        add: (data) => request("/progress-photos", { method: "POST", body: JSON.stringify(data) }),
        remove: (id) => request(`/progress-photos/${id}`, { method: "DELETE" }),
    },
    ai: {
        foodLog: (text, meal_type, date) => request("/ai/food-log", { method: "POST", body: JSON.stringify({ text, meal_type, date }) }),
        dietAdvice: (date) => request(`/ai/diet-advice?date=${encodeURIComponent(date)}`),
        trainerAdvice: () => request("/ai/trainer-advice"),
        coach: (message) => request("/ai/coach", { method: "POST", body: JSON.stringify({ message }) }),
        briefing: (date) => request(`/ai/daily-briefing?date=${encodeURIComponent(date)}`),
    },
    analytics: (days = 7) => request(`/analytics/progress?days=${days}`),
    reports: {
        weekly: () => request("/reports/weekly"),
        monthly: () => request("/reports/monthly"),
    },
    recommendations: {
        list: () => request("/recommendations"),
        generate: () => request("/recommendations/generate", { method: "POST" }),
    },
    notifications: {
        list: () => request("/notifications"),
        generate: () => request("/notifications/generate", { method: "POST" }),
        read: (id) => request(`/notifications/${id}/read`, { method: "PATCH" }),
    },
};

export { API_URL };
