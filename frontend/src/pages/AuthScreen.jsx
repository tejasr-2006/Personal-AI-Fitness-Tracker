import { useState } from "react";
import { api } from "../api";
import { Button, Field } from "../components/ui";

export default function AuthScreen({ onSuccess }) {
    const [register, setRegister] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function submit(e) {
        e.preventDefault();
        setError(""); setLoading(true);
        try {
            const data = register
                ? await api.auth.register({ ...form, name: form.name.trim(), email: form.email.trim() })
                : await api.auth.login({ email: form.email.trim(), password: form.password });
            localStorage.setItem("token", data.access_token);
            onSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    return (
        <div className="auth-shell">
            <div className="auth-panel">
                <div className="brand-mark">AI</div>
                <p className="eyebrow" style={{ marginTop: 18 }}>Personal AI Fitness Assistant</p>
                <h1>{register ? "Build your fitness system." : "Welcome back."}</h1>
                <p className="muted">Track nutrition, training, recovery and progress in one place.</p>
                <form onSubmit={submit} className="form-stack">
                    {register && <Field label="Name" value={form.name} onChange={set("name")} autoComplete="name" required />}
                    <Field label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required />
                    <label className="field">
                        <span>Password</span>
                        <div className="password-wrap">
                            <input type={show ? "text" : "password"} minLength={8} value={form.password} onChange={set("password")}
                                autoComplete={register ? "new-password" : "current-password"} required />
                            <button type="button" onClick={() => setShow(!show)}>{show ? "Hide" : "Show"}</button>
                        </div>
                        {register && <span className="field-hint">At least 8 characters.</span>}
                    </label>
                    {error && <div className="alert error" role="alert">{error}</div>}
                    <Button loading={loading}>{register ? "Create account" : "Sign in"}</Button>
                </form>
                <button className="link-button" onClick={() => { setRegister(!register); setError(""); }}>
                    {register ? "Already have an account? Sign in" : "New here? Create an account"}
                </button>
            </div>
        </div>
    );
}
