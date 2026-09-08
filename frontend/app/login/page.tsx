"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";

const API_URL = "http://localhost:8000";


export default function LoginPage() {
    const router = useRouter();

    const [accountId, setAccountId] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [rememberAccount, setRememberAccount] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: username, password }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || "Login failed");
            saveToken(data.access_token);
            router.push("/dashboard");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <style>{`
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #f5f0eb; }

                .lp-page {
                    min-height: 100vh;
                    background: #f5f0eb;
                    font-family: "Amazon Ember", Arial, sans-serif;
                    display: flex;
                    flex-direction: column;
                }

                /* top bar */
                .lp-topbar {
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                    padding: 10px 24px;
                    gap: 20px;
                    font-size: 13px;
                }
                .lp-topbar a { color: #0073bb; text-decoration: none; }
                .lp-topbar a:hover { text-decoration: underline; }
                .lp-topbar-select {
                    display: flex; align-items: center; gap: 4px;
                    color: #0073bb; cursor: pointer; font-size: 13px;
                    background: none; border: none;
                }
                .lp-topbar-select svg { width: 10px; height: 10px; }

                /* logo */
                .lp-logo-wrap {
                    display: flex;
                    justify-content: center;
                    padding: 16px 0 24px;
                }
                .lp-logo {
                    font-size: 36px;
                    font-weight: 900;
                    color: #232f3e;
                    letter-spacing: -2px;
                    line-height: 1;
                    position: relative;
                    display: inline-block;
                }
                .lp-logo::after {
                    content: "";
                    display: block;
                    width: 80%;
                    height: 4px;
                    background: linear-gradient(90deg, #ff9900 60%, transparent 100%);
                    border-radius: 2px;
                    margin: 2px auto 0;
                    clip-path: polygon(0 0, 85% 0, 100% 100%, 0 100%);
                }

                /* card area */
                .lp-center {
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                    gap: 0;
                    padding: 0 24px 40px;
                    flex: 1;
                }

                /* form card */
                .lp-card {
                    background: #fff;
                    border: 1px solid #d5d9d9;
                    border-radius: 4px;
                    padding: 26px 28px 22px;
                    width: 360px;
                    flex-shrink: 0;
                }
                .lp-card-title {
                    font-size: 18px;
                    font-weight: 500;
                    color: #0f1111;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    margin-bottom: 16px;
                }
                .lp-card-title .info-icon {
                    width: 16px; height: 16px;
                    border-radius: 50%;
                    border: 1px solid #0073bb;
                    color: #0073bb;
                    font-size: 10px;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; flex-shrink: 0;
                }

                .lp-label {
                    font-size: 13px;
                    color: #0f1111;
                    font-weight: 500;
                    margin-bottom: 4px;
                    display: block;
                }
                .lp-label-link { color: #0073bb; font-weight: 400; text-decoration: none; font-size: 13px; }
                .lp-label-link:hover { text-decoration: underline; color: #e47911; }

                .lp-input {
                    width: 100%;
                    padding: 5px 8px;
                    border: 1px solid #adb1b8;
                    border-radius: 3px;
                    font-size: 13px;
                    color: #0f1111;
                    outline: none;
                    background: #fff;
                    height: 31px;
                    transition: border-color 0.15s, box-shadow 0.15s;
                }
                .lp-input:focus {
                    border-color: #e47911;
                    box-shadow: 0 0 0 3px rgba(228,121,17,0.25);
                }

                .lp-field { margin-bottom: 14px; }

                .lp-remember {
                    display: flex; align-items: center; gap: 7px;
                    font-size: 13px; color: #0f1111;
                    margin-bottom: 14px; cursor: pointer;
                }
                .lp-remember input[type="checkbox"] {
                    width: 14px; height: 14px;
                    accent-color: #ff9900;
                    cursor: pointer;
                }

                .lp-show-pw {
                    display: flex; align-items: center; justify-content: space-between;
                    margin-top: 4px; margin-bottom: 18px;
                }
                .lp-show-pw label {
                    display: flex; align-items: center; gap: 7px;
                    font-size: 13px; color: #0f1111; cursor: pointer;
                }
                .lp-show-pw input[type="checkbox"] {
                    width: 14px; height: 14px;
                    accent-color: #ff9900; cursor: pointer;
                }
                .lp-trouble { color: #0073bb; font-size: 13px; text-decoration: none; }
                .lp-trouble:hover { text-decoration: underline; color: #e47911; }

                .lp-btn-primary {
                    width: 100%;
                    padding: 8px 0;
                    background: #ff9900;
                    border: 1px solid #e47911;
                    border-radius: 3px;
                    font-size: 14px;
                    font-weight: 500;
                    color: #0f1111;
                    cursor: pointer;
                    transition: background 0.15s;
                    margin-bottom: 10px;
                }
                .lp-btn-primary:hover { background: #f08804; }
                .lp-btn-primary:disabled { opacity: 0.7; cursor: not-allowed; }

                .lp-btn-secondary {
                    width: 100%;
                    padding: 7px 0;
                    background: #fff;
                    border: 1px solid #adb1b8;
                    border-radius: 3px;
                    font-size: 13px;
                    color: #0073bb;
                    cursor: pointer;
                    transition: background 0.15s, border-color 0.15s;
                    margin-bottom: 14px;
                }
                .lp-btn-secondary:hover { background: #f7f7f7; border-color: #0073bb; }

                .lp-create {
                    text-align: center;
                    font-size: 13px;
                    color: #0073bb;
                    cursor: pointer;
                    text-decoration: none;
                    display: block;
                    margin-bottom: 16px;
                }
                .lp-create:hover { text-decoration: underline; color: #e47911; }

                .lp-divider {
                    border: none;
                    border-top: 1px solid #e7e7e7;
                    margin: 14px 0;
                }

                .lp-terms {
                    font-size: 11px;
                    color: #555;
                    line-height: 1.5;
                    text-align: center;
                }
                .lp-terms a { color: #0073bb; text-decoration: none; }
                .lp-terms a:hover { text-decoration: underline; }

                .lp-error {
                    background: #fdf0ef;
                    border: 1px solid #d13212;
                    border-radius: 3px;
                    padding: 8px 10px;
                    font-size: 13px;
                    color: #d13212;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: flex-start;
                    gap: 6px;
                }

                /* right panel */
                .lp-panel {
                    width: 390px;
                    flex-shrink: 0;
                    background: #1a1a2e;
                    border-radius: 0 4px 4px 0;
                    overflow: hidden;
                    position: relative;
                    min-height: 400px;
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-end;
                }
                .lp-panel img {
                    position: absolute;
                    top: 0; left: 0;
                    width: 100%; height: 100%;
                    object-fit: cover;
                }
                .lp-panel-placeholder {
                    position: absolute;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: linear-gradient(135deg, #1a0a00 0%, #3d1f00 30%, #ff6600 70%, #ffcc00 100%);
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                .lp-panel-overlay {
                    position: relative;
                    z-index: 2;
                    padding: 28px 28px 22px;
                    background: linear-gradient(0deg, rgba(0,0,0,0.7) 0%, transparent 100%);
                    color: #fff;
                }
                .lp-panel-overlay h2 { font-size: 22px; font-weight: 700; margin-bottom: 8px; }
                .lp-panel-overlay p { font-size: 14px; color: #ddd; line-height: 1.5; margin-bottom: 16px; }
                .lp-panel-overlay button {
                    background: transparent;
                    border: 2px solid #fff;
                    color: #fff;
                    padding: 8px 18px;
                    border-radius: 2px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.15s;
                }
                .lp-panel-overlay button:hover { background: rgba(255,255,255,0.15); }

                /* demo hint */
                .lp-demo-hint {
                    background: #f0f7ff;
                    border: 1px solid #beddf8;
                    border-radius: 3px;
                    padding: 8px 10px;
                    font-size: 11.5px;
                    color: #002b50;
                    margin-bottom: 12px;
                    line-height: 1.6;
                }
                .lp-demo-hint strong { display: block; margin-bottom: 2px; color: #0073bb; }
            `}</style>

            <div className="lp-page">
                {/* Top bar */}
                <div className="lp-topbar">
                    <a href="#">Provide feedback</a>
                    <button className="lp-topbar-select">
                        Multi-session disabled
                        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 1l4 4 4-4" />
                        </svg>
                    </button>
                    <button className="lp-topbar-select">
                        English
                        <svg viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 1l4 4 4-4" />
                        </svg>
                    </button>
                </div>

                {/* AWS Logo */}
                <div className="lp-logo-wrap">
                    <img src="/aws-logo.png" alt="AWS" style={{ height: "36px", width: "auto" }} />
                </div>

                {/* Card + Panel */}
                <div className="lp-center">
                    {/* Form card */}
                    <div className="lp-card">
                        <div className="lp-card-title">
                            IAM user sign in
                            <span className="info-icon">i</span>
                        </div>

                        <form onSubmit={handleLogin}>
                            {/* IAM Username (email) */}
                            <div className="lp-field">
                                <label className="lp-label">IAM username</label>
                                <input
                                    id="iam-username"
                                    className="lp-input"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>

                            {/* Password */}
                            <div className="lp-field">
                                <label className="lp-label">Password</label>
                                <input
                                    id="password"
                                    className="lp-input"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                />
                            </div>

                            {/* Show password + Having trouble */}
                            <div className="lp-show-pw">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={showPassword}
                                        onChange={(e) => setShowPassword(e.target.checked)}
                                    />
                                    Show Password
                                </label>
                                <a className="lp-trouble" href="#">Having trouble?</a>
                            </div>

                            {/* Demo hint */}
                            <div className="lp-demo-hint">
                                <strong>Demo credentials</strong>
                                IAM username: <b>demo@example.com</b><br />
                                Password: <b>demo_password</b>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="lp-error">
                                    <span>⚠</span> {error}
                                </div>
                            )}

                            {/* Sign in button */}
                            <button
                                id="sign-in-btn"
                                type="submit"
                                className="lp-btn-primary"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        {/* Secondary buttons */}
                        <button className="lp-btn-secondary" onClick={() => router.push("/login")}>
                            Sign in using root user email
                        </button>
                        <a className="lp-create" href="#">Create a new AWS account</a>

                        <hr className="lp-divider" />

                        <p className="lp-terms">
                            By continuing, you agree to{" "}
                            <a href="#">AWS Customer Agreement</a> or other agreement for AWS
                            services, and the <a href="#">Privacy Notice</a>.
                        </p>
                    </div>

                    {/* Right image panel — user will drop their image here */}
                    <div className="lp-panel">
                        {/* Replace this placeholder with: <img src="/lightsail-banner.jpg" alt="Amazon Lightsail" /> */}
                        <div className="lp-panel-placeholder" />
                        <div className="lp-panel-overlay">
                            <h2>Amazon Lightsail</h2>
                            <p>Lightsail is the easiest way<br />to get started on AWS</p>
                            <button>Learn more »</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}