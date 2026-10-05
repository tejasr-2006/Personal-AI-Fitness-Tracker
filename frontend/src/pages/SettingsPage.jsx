import { Button, Card, PageIntro } from "../components/ui";
import { aiCache } from "../lib/cache";
import { useToast } from "../components/ui";

export default function SettingsPage({ onLogout }) {
    const toast = useToast();
    return <>
        <PageIntro title="Settings" text="Account and app preferences." />
        <Card>
            <h3>Account & security</h3>
            <p className="muted">You're signed in with a token stored in this browser. Logging out removes it from this device.</p>
            <Button variant="danger" onClick={onLogout}>Log out</Button>
        </Card>
        <Card>
            <h3>AI results</h3>
            <p className="muted">AI briefings, advice and reports are kept for this browser session so they aren't regenerated every time you switch pages.</p>
            <Button variant="secondary" onClick={() => { aiCache.clear(); toast("Cleared saved AI results"); }}>Clear saved AI results</Button>
        </Card>
        <Card>
            <h3>Appearance</h3>
            <p className="muted">The interface follows your device's light or dark setting automatically.</p>
        </Card>
    </>;
}
