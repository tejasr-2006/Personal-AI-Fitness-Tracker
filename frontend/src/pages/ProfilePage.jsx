import { useEffect, useState } from "react";
import { api } from "../api";
import { round } from "../lib/format";
import { Card, ErrorBanner, Loading, PageIntro, Stat, useToast } from "../components/ui";
import ProfileForm from "../components/ProfileForm";

export default function ProfilePage({ onSaved }) {
    const toast = useToast();
    const [profile, setProfile] = useState(null);
    const [goal, setGoal] = useState(null);
    const [error, setError] = useState("");
    const [version, setVersion] = useState(0);

    useEffect(() => {
        Promise.all([api.profile.get(), api.goals.get()]).then(([p, g]) => { setProfile(p); setGoal(g); }).catch((e) => setError(e.message));
    }, [version]);

    if (error) return <ErrorBanner message={error} />;
    if (!profile) return <Loading text="Loading your profile…" />;

    return <>
        <PageIntro title="Profile" text="Update your details — targets are recalculated automatically when you save." />
        {goal && <div className="stats-grid">
            <Stat label="Daily calories" value={goal.target_calories} unit=" kcal" />
            <Stat label="Protein" value={goal.protein} unit=" g" />
            <Stat label="Carbs / Fat" value={`${round(goal.carbs)} / ${round(goal.fat)}`} unit=" g" />
            <Stat label="Water" value={goal.water} unit=" ml" />
        </div>}
        <Card style={{ marginTop: 18 }}>
            <h3>Your details</h3>
            <ProfileForm key={version} initial={profile} submitLabel="Save changes" onSaved={() => { toast("Profile saved and targets updated"); setVersion((v) => v + 1); onSaved?.(); }} />
        </Card>
    </>;
}
