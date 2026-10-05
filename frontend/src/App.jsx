import { useEffect, useState } from "react";
import Login from "./components/Login";
import ProfileSetup from "./components/ProfileSetup";
import GoalSetup from "./components/GoalSetup";
import MainDashboard from "./components/MainDashboard";
import DailyTracking from "./components/DailyTracking";
import { getProfile, getGoals } from "./api";
import WorkoutTracker from "./components/WorkoutTracker";
import ActivityTracker from "./components/ActivityTracker";
import ProgressTracker from "./components/ProgressTracker";
import ProgressPhotos from "./components/ProgressPhotos";
import AIFoodLogger from "./components/AIFoodLogger";
import AICoach from "./components/AICoach";
import AIBriefing from "./components/AIBriefing";
import AIAdvice from "./components/AIAdvice";
import Analytics from "./components/Analytics";
import Reports from "./components/Reports";
import Notifications from "./components/Notifications";

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [profileExists, setProfileExists] = useState(false);
    const [goalsExist, setGoalsExist] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function checkSetup() {
            if (!isLoggedIn) {
                setChecking(false);
                return;
            }

            try {
                const token = localStorage.getItem("token");

                const profile = await getProfile(token);
                setProfileExists(!!profile);

                if (profile) {
                    try {
                        const goals = await getGoals();
                        setGoalsExist(!!goals);
                    } catch {
                        setGoalsExist(false);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setChecking(false);
            }
        }

        checkSetup();
    }, [isLoggedIn]);

    function handleLogin() {
        setIsLoggedIn(true);
        setChecking(true);
    }

    function handleLogout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        setProfileExists(false);
        setGoalsExist(false);
    }

    function handleProfileComplete() {
        setProfileExists(true);
    }

    function handleGoalsComplete() {
        setGoalsExist(true);
    }

    if (!isLoggedIn) {
        return <Login onLogin={handleLogin} />;
    }

    if (checking) {
        return <p>Loading...</p>;
    }

    if (!profileExists) {
        return <ProfileSetup onComplete={handleProfileComplete} />;
    }

    if (!goalsExist) {
        return <GoalSetup onComplete={handleGoalsComplete} />;
    }

    return (
        <div>
            <button onClick={handleLogout}>
                Logout
            </button>

            <Dashboard />

            <hr />

            <DailyTracking />

            <hr />

            <WorkoutTracker />

            <hr />

            <ActivityTracker />
        </div>
    );
}



export default App;

