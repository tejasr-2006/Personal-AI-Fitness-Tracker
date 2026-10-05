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

export async function getProfile(token) {
    const response = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (response.status === 404) {
        return null;
    }

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to load profile");
    }

    return response.json();
}


export async function createProfile(profileData) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/profile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create profile");
    }

    return response.json();
}

export async function calculateGoals() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/goals/calculate`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to calculate goals");
    }

    return response.json();
}


export async function getGoals() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/goals`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to load goals");
    }

    return response.json();
}

export async function getMeals() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/meals`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load meals");
    }

    return response.json();
}

export async function addMeal(meal) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/meals`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(meal),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add meal");
    }

    return response.json();
}

export async function getDailyNutrition(date) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/nutrition/daily?nutrition_date=${date}`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load nutrition");
    }

    return response.json();
}

export async function addWater(amount) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/water`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            amount: amount,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add water");
    }

    return response.json();
}

export async function getDailyWater() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/water/daily`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load water");
    }

    return response.json();
}

export async function getExercises() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/exercises`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load exercises");
    }

    return response.json();
}

export async function getWorkouts() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/workouts`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load workouts");
    }

    return response.json();
}

export async function createWorkout(workout) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/workouts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(workout),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to create workout");
    }

    return response.json();
}

export async function addExerciseToWorkout(workoutId, exercise) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/workouts/${workoutId}/exercises`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(exercise),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add exercise");
    }

    return response.json();
}

export async function getActivities() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/activities`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load activities");
    }

    return response.json();
}

export async function addActivity(activity) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/activities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(activity),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(error || "Failed to add activity");
    }

    return response.json();
}

export async function getDailyActivities() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/activities/daily`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load daily activity");
    }

    return response.json();
}
export async function addSleep(data) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/sleep`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getSleep() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/sleep`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load sleep");
    }

    return response.json();
}

export async function addWeight(weight) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/weight`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
            weight: Number(weight),
        }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getWeight() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/weight`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load weight");
    }

    return response.json();
}

export async function addMeasurements(data) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/measurements`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getMeasurements() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/measurements`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load measurements");
    }

    return response.json();
}

export async function addProgressPhoto(data) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/progress-photos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getProgressPhotos() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/progress-photos`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to load progress photos");
    }

    return response.json();
}

export async function aiFoodLog(text) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/ai/food-log`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getDietAdvice() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/ai/diet-advice`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get diet advice");
    }

    return response.json();
}

export async function getTrainerAdvice() {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/ai/trainer-advice`, {
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to get trainer advice");
    }

    return response.json();
}

export async function sendCoachMessage(message) {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/ai/coach`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function getDailyBriefing() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/ai/daily-briefing`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to get daily briefing");
    }

    return response.json();
}

export async function generateRecommendations() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/recommendations/generate`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            await response.text()
        );
    }

    return response.json();
}

export async function getRecommendations() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/recommendations`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load recommendations"
        );
    }

    return response.json();
}

export async function getProgressAnalytics() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/analytics/progress`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load analytics");
    }

    return response.json();
}

export async function getWeeklyReport() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/reports/weekly`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load weekly report");
    }

    return response.json();
}

export async function getMonthlyReport() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/reports/monthly`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to load monthly report");
    }

    return response.json();
}

export async function generateNotifications() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/notifications/generate`,
        {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            await response.text()
        );
    }

    return response.json();
}

export async function getNotifications() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/notifications`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load notifications"
        );
    }

    return response.json();
}

export async function markNotificationRead(id) {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to update notification"
        );
    }

    return response.json();
}
export async function getDashboardData() {
    const token = localStorage.getItem("token");

    const response = await fetch(
        `${API_URL}/dashboard`,
        {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(
            "Failed to load dashboard"
        );
    }

    return response.json();
}