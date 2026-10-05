import { useState } from "react";
import { api } from "../api";
import { Button, Card, ErrorBanner } from "../components/ui";
import ProfileForm from "../components/ProfileForm";

export function ProfileSetup({ onComplete }) {
    return (
        <div className="setup-shell">
            <Card>
                <p className="eyebrow">Welcome</p>
                <h1>Set up your profile</h1>
                <p className="muted">These values power your personalised calorie targets and AI guidance. You can change them any time.</p>
                <ProfileForm submitLabel="Save profile & calculate targets" onSaved={onComplete} />
            </Card>
        </div>
    );
}

export function GoalSetup({ onComplete }) {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    async function calculate() {
        setLoading(true); setError("");
        try { await api.goals.calculate(); onComplete(); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    }
    return (
        <div className="setup-shell">
            <Card>
                <p className="eyebrow">Final step</p>
                <h1>Calculate your targets</h1>
                <p className="muted">Your profile is saved. Next we'll calculate your calorie, macro and water targets.</p>
                <ErrorBanner message={error} />
                <Button onClick={calculate} loading={loading}>Calculate my targets</Button>
            </Card>
        </div>
    );
}
