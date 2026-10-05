import { useCallback, useEffect, useState } from "react";
import { api } from "./api";
import { aiCache } from "./lib/cache";
import { Loading, ToastProvider, ErrorBanner, Button, Card } from "./components/ui";
import AuthScreen from "./pages/AuthScreen";
import { ProfileSetup, GoalSetup } from "./pages/Setup";
import Shell from "./pages/Shell";
import DashboardPage from "./pages/DashboardPage";
import NutritionPage from "./pages/NutritionPage";
import WorkoutsPage from "./pages/WorkoutsPage";
import ActivityPage from "./pages/ActivityPage";
import RecoveryPage from "./pages/RecoveryPage";
import ProgressPage from "./pages/ProgressPage";
import AIPage from "./pages/AIPage";
import ReportsPage from "./pages/ReportsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";

function App() {
    const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
    // checking | profile | goals | ready | error
    const [setup, setSetup] = useState("checking");
    const [setupError, setSetupError] = useState("");
    const [profile, setProfile] = useState(null);
    const [account, setAccount] = useState(null);
    const [page, setPage] = useState("dashboard");
    const [unread, setUnread] = useState(0);

    const refreshUnread = useCallback(() => {
        api.notifications.list().then((n) => setUnread((n || []).filter((x) => !x.is_read).length)).catch(() => {});
    }, []);

    const checkSetup = useCallback(async () => {
        if (!localStorage.getItem("token")) { setAuthed(false); return; }
        setSetup("checking"); setSetupError("");
        try {
            const u = await api.user.me();
            setAccount(u);
            let p;
            try { p = await api.profile.get(); }
            catch (e) {
                if (e.status === 404) { setSetup("profile"); return; }
                throw e;
            }
            setProfile(p);
            try { await api.goals.get(); }
            catch (e) {
                if (e.status === 404) { setSetup("goals"); return; }
                throw e;
            }
            setSetup("ready");
            refreshUnread();
        } catch (e) {
            // 401 is handled by the "auth-expired" listener; anything else (server down, 500)
            // must NOT drop the user into profile setup, which is what used to happen.
            if (e.status === 401 || !localStorage.getItem("token")) { setAuthed(false); return; }
            setSetupError(e.message); setSetup("error");
        }
    }, [refreshUnread]);

    useEffect(() => {
        checkSetup();
        const expire = () => { aiCache.clear(); setAuthed(false); setSetup("checking"); };
        window.addEventListener("auth-expired", expire);
        return () => window.removeEventListener("auth-expired", expire);
    }, [checkSetup]);

    const refreshProfile = useCallback(() => {
        api.profile.get().then(setProfile).catch(() => {});
    }, []);

    function logout() {
        localStorage.removeItem("token");
        aiCache.clear();
        setAuthed(false); setSetup("checking"); setProfile(null); setAccount(null); setPage("dashboard"); setUnread(0);
    }

    let body;
    if (!authed) {
        body = <AuthScreen onSuccess={() => { setAuthed(true); checkSetup(); }} />;
    } else if (setup === "checking") {
        body = <Loading text="Checking your account…" />;
    } else if (setup === "error") {
        body = (
            <div className="setup-shell"><Card>
                <h1>Can't reach your account</h1>
                <ErrorBanner message={setupError} />
                <div className="page-actions"><Button onClick={checkSetup}>Try again</Button><Button variant="secondary" onClick={logout}>Log out</Button></div>
            </Card></div>
        );
    } else if (setup === "profile") {
        body = <ProfileSetup onComplete={checkSetup} />;
    } else if (setup === "goals") {
        body = <GoalSetup onComplete={checkSetup} />;
    } else {
        const pages = {
            dashboard: <DashboardPage setPage={setPage} />,
            nutrition: <NutritionPage />,
            workouts: <WorkoutsPage />,
            activity: <ActivityPage />,
            recovery: <RecoveryPage />,
            progress: <ProgressPage />,
            ai: <AIPage />,
            reports: <ReportsPage />,
            notifications: <NotificationsPage onChange={refreshUnread} />,
            profile: <ProfilePage onSaved={refreshProfile} />,
            settings: <SettingsPage onLogout={logout} />,
        };
        body = (
            <Shell user={{ profile: profile || {}, account }} page={page} setPage={setPage} onLogout={logout} unread={unread}>
                {/* key remounts the page on navigation so data is always fresh */}
                <div key={page}>{pages[page] || pages.dashboard}</div>
            </Shell>
        );
    }
    return <ToastProvider>{body}</ToastProvider>;
}

export default App;
