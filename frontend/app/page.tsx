"use client";

import {
    Menu,
    Search,
    Grid3X3,
    Terminal,
    Bell,
    CircleHelp,
    Settings,
    ChevronDown,
    ExternalLink,
    Monitor,
    MessageSquare,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, removeToken } from "@/lib/auth";

function getUserName(): string | null {
    const token = getToken();
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return payload.name || payload.email?.split("@")[0] || payload.sub || "User";
    } catch {
        return null;
    }
}

export default function HomePage() {
    const router = useRouter();
    const [userName, setUserName] = useState<string | null>(null);

    useEffect(() => {
        setUserName(getUserName());
    }, []);

    const handleGetStarted = () => {
        if (getToken()) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    };

    const handleSignOut = () => {
        removeToken();
        setUserName(null);
    };

    return (
        <>
            <style>{`
                /* ── WRAPPER ── */
                .hp-page { min-height: 100vh; background: #f2f3f3; padding-bottom: 45px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }

                /* ── TOP NAV ── */
                .hp-nav {
                    height: 48px; background: #161e2d;
                    display: flex; align-items: center;
                    padding: 0 12px; gap: 10px; color: #e6e9ee;
                    position: sticky; top: 0; z-index: 100;
                }
                .hp-logo {
                    font-size: 22px; font-weight: 700; color: #ff9900;
                    letter-spacing: -1px; line-height: 1; cursor: pointer;
                }
                .hp-vdiv { width: 1px; height: 28px; background: #3a4555; flex-shrink: 0; }
                .hp-r53icon {
                    width: 28px; height: 28px; border-radius: 6px;
                    background: linear-gradient(135deg,#4f46e5,#7c3aed);
                    display: flex; align-items: center; justify-content: center;
                    font-size: 14px; color: #fff;
                }
                .hp-search {
                    display: flex; align-items: center; gap: 8px;
                    border: 1px solid #3a4555; border-radius: 6px;
                    padding: 4px 10px; color: #c8cdd5; font-size: 13px;
                    width: 320px; cursor: text;
                }
                .hp-search-shortcut { margin-left: auto; font-size: 11px; color: #6b7280; }
                .hp-ask-q {
                    display: flex; align-items: center; gap: 5px;
                    padding-left: 10px; border-left: 1px solid #3a4555;
                    font-size: 13px; font-weight: 600; color: #e6e9ee;
                    white-space: nowrap;
                }
                .hp-ask-q svg { color: #a78bfa; }
                .hp-nav-right {
                    margin-left: auto; display: flex; align-items: center;
                    gap: 6px; height: 100%;
                }
                .hp-nav-btn {
                    background: none; border: none; color: #c8cdd5;
                    cursor: pointer; padding: 6px; display: flex; align-items: center;
                }
                .hp-nav-btn:hover { color: #fff; }
                .hp-global {
                    display: flex; align-items: center; gap: 3px;
                    font-size: 13px; color: #c8cdd5; padding: 0 6px;
                }
                .hp-account-box {
                    display: flex; align-items: center; gap: 10px; height: 100%;
                }
                .hp-account {
                    height: 100%; display: flex; flex-direction: column;
                    align-items: flex-end; justify-content: center;
                    padding: 0 4px;
                }
                .hp-account-top {
                    background: #d8dce2; color: #253043;
                    padding: 2px 6px; font-size: 12px; font-weight: 600;
                    display: flex; align-items: center; gap: 3px; border-radius: 2px;
                }
                .hp-account-name { font-size: 12px; color: #c8cdd5; margin-top: 2px; }
                
                .hp-signin-btn {
                    background: #ff9900; color: #161e2d;
                    border: none; border-radius: 4px;
                    padding: 6px 14px; font-size: 12px; font-weight: 700;
                    cursor: pointer; transition: background 0.15s;
                }
                .hp-signin-btn:hover { background: #ec8800; }

                .hp-signout-btn {
                    background: transparent; color: #c8cdd5;
                    border: 1px solid #3a4555; border-radius: 4px;
                    padding: 4px 8px; font-size: 11px; font-weight: 500;
                    cursor: pointer; transition: all 0.15s;
                }
                .hp-signout-btn:hover { background: #253043; color: #fff; border-color: #4a5568; }

                /* ── SECONDARY BAR ── */
                .hp-secondary {
                    height: 36px; background: #f5f5f5;
                    display: flex; align-items: center; padding-left: 16px;
                    border-bottom: 1px solid #d5d9d9; color: #384250;
                }

                /* ── HERO ── */
                .hp-hero {
                    background: #151c26; color: #fff;
                    display: flex; padding: 32px 8% 0; gap: 40px;
                    position: relative; min-height: 420px;
                }
                .hp-hero-left { flex: 1; padding-top: 10px; max-width: 600px; }
                .hp-breadcrumb { color: #8b95a3; font-size: 13px; margin-bottom: 20px; }
                .hp-hero-left h1 {
                    font-size: 38px; font-weight: 700; line-height: 1.1;
                    margin: 0 0 8px; letter-spacing: -0.5px;
                }
                .hp-hero-left h2 {
                    font-size: 26px; font-weight: 300; line-height: 1.3;
                    color: #c8d0da; margin: 0 0 20px;
                }
                .hp-hero-desc { color: #8b95a3; font-size: 13px; line-height: 1.6; max-width: 480px; }
                .hp-hero-desc a { color: #58a6ff; text-decoration: none; }

                /* ── RIGHT CARDS ── */
                .hp-cards {
                    width: 320px; flex-shrink: 0;
                    display: flex; flex-direction: column; gap: 16px;
                    padding-bottom: 32px; padding-top: 10px;
                }
                .hp-card {
                    background: #fff; color: #202b3a;
                    border-radius: 12px; border: 1px solid #d1d5db;
                    box-shadow: 0 1px 3px rgba(0,0,0,.08);
                    padding: 20px 22px;
                }
                .hp-card h3 { font-size: 16px; font-weight: 700; margin: 0 0 10px; }
                .hp-card p { font-size: 13px; color: #444; line-height: 1.5; margin-bottom: 16px; }
                .hp-card a { color: #0073bb; font-size: 13px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
                .hp-card a:hover { text-decoration: underline; }
                .hp-btn-gs {
                    background: #ff9900; color: #161e2d;
                    border: none; border-radius: 20px;
                    padding: 9px 22px; font-size: 14px; font-weight: 700;
                    cursor: pointer; box-shadow: inset 0 -1px 0 rgba(0,0,0,.2);
                    transition: background 0.15s;
                }
                .hp-btn-gs:hover { background: #ec8800; }

                /* ── LOWER SECTION ── */
                .hp-lower { background: #f3f3f3; padding: 40px 8% 60px; }
                .hp-lower h2 { font-size: 22px; font-weight: 700; color: #202b3a; margin: 0 0 20px; }
                .hp-lower-grid { display: flex; gap: 20px; align-items: flex-start; }

                /* video thumbnail */
                .hp-video {
                    flex: 1; border-radius: 12px; overflow: hidden;
                    border: 1px solid #c8cdd5;
                }
                .hp-video-top {
                    background: #161e2d; color: #fff;
                    display: flex; align-items: center; gap: 12px;
                    padding: 12px 18px;
                }
                .hp-video-logo {
                    width: 36px; height: 36px; background: #fff; color: #161e2d;
                    border-radius: 50%; display: flex; align-items: center;
                    justify-content: center; font-size: 10px; font-weight: 700;
                }
                .hp-video-top strong { font-size: 14px; display: block; }
                .hp-video-top span { font-size: 11px; color: #9ca3af; }
                .hp-video-body {
                    background: #202938; height: 160px;
                    display: flex; align-items: center; justify-content: center;
                    gap: 40px; color: #fff; font-size: 48px;
                }
                .hp-dashed { width: 80px; border-top: 2px dashed #ff9900; }

                /* resources */
                .hp-resources {
                    width: 280px; flex-shrink: 0;
                    background: #fff; border-radius: 12px;
                    border: 1px solid #d1d5db; overflow: hidden;
                }
                .hp-resources-title {
                    display: flex; align-items: center; gap: 6px;
                    font-size: 16px; font-weight: 700;
                    padding: 16px 18px 12px; color: #202b3a;
                }
                .hp-res-link {
                    display: block; width: 100%;
                    text-align: left; background: none; border: none;
                    border-top: 1px solid #e5e7eb;
                    padding: 11px 18px; color: #0073bb;
                    font-size: 13px; cursor: pointer;
                }
                .hp-res-link:hover { background: #f0f4ff; }

                /* ── FOOTER ── */
                .hp-footer {
                    position: fixed; bottom: 0; left: 0; width: 100%;
                    height: 40px; background: #161e2d; color: #c8cdd5;
                    display: flex; align-items: center; padding: 0 16px;
                    font-size: 12px; gap: 0; z-index: 100;
                }
                .hp-footer-left { display: flex; align-items: center; gap: 20px; }
                .hp-footer-left span { display: flex; align-items: center; gap: 4px; cursor: pointer; }
                .hp-footer-left span:hover { color: #fff; }
                .hp-footer-center { margin-left: auto; margin-right: 24px; font-size: 11px; }
                .hp-footer-right { display: flex; gap: 16px; }
                .hp-footer-right span { cursor: pointer; }
                .hp-footer-right span:hover { color: #fff; text-decoration: underline; }
            `}</style>

            <div className="hp-page">
                {/* ── TOP NAVBAR ── */}
                <header className="hp-nav">
                    {/* AWS Logo */}
                    <div className="hp-logo" onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", background: "#232f3e", borderRadius: "4px", padding: "3px 7px" }}>
                        <img src="/aws-logo.png" alt="AWS" style={{ height: "22px", width: "auto", objectFit: "contain" }} />
                    </div>

                    <div className="hp-vdiv" />

                    {/* Route 53 service icon */}
                    <div className="hp-r53icon">⬡</div>

                    <div className="hp-vdiv" />

                    {/* Services grid */}
                    <button className="hp-nav-btn"><Grid3X3 size={20} /></button>

                    {/* Search */}
                    <div className="hp-search">
                        <Search size={16} />
                        <span style={{ color: "#6b7280" }}>Search</span>
                        <span className="hp-search-shortcut">[Alt+S]</span>
                        <div className="hp-ask-q">
                            <CircleHelp size={14} />
                            Ask Amazon Q
                        </div>
                    </div>

                    {/* Right icons */}
                    <div className="hp-nav-right">
                        <button className="hp-nav-btn"><Terminal size={18} /></button>
                        <div className="hp-vdiv" />
                        <button className="hp-nav-btn"><Bell size={18} /></button>
                        <div className="hp-vdiv" />
                        <button className="hp-nav-btn"><CircleHelp size={18} /></button>
                        <div className="hp-vdiv" />
                        <button className="hp-nav-btn"><Settings size={18} /></button>
                        <div className="hp-vdiv" />

                        <div className="hp-global">
                            Global <ChevronDown size={14} />
                        </div>

                        <div className="hp-vdiv" />

                        {userName ? (
                            <div className="hp-account-box">
                                <div className="hp-account">
                                    <div className="hp-account-top">
                                        {userName} (987119353115) <ChevronDown size={12} />
                                    </div>
                                    <div className="hp-account-name">{userName}</div>
                                </div>
                                <button className="hp-signout-btn" onClick={handleSignOut}>
                                    Sign out
                                </button>
                            </div>
                        ) : (
                            <button className="hp-signin-btn" onClick={() => router.push("/login")}>
                                Sign in
                            </button>
                        )}
                    </div>
                </header>

                {/* ── SECONDARY BAR ── */}
                <div className="hp-secondary">
                    <button className="hp-nav-btn"><Menu size={20} /></button>
                </div>

                {/* ── HERO SECTION ── */}
                <section className="hp-hero">
                    {/* Left */}
                    <div className="hp-hero-left">
                        <p className="hp-breadcrumb">Network &amp; Content Delivery</p>
                        <h1>Amazon Route 53</h1>
                        <h2>A reliable way to route users to<br />internet applications</h2>
                        <p className="hp-hero-desc">
                            Amazon <a href="#">Route 53</a> is a highly available and scalable cloud
                            Domain Name System (DNS) web service.
                        </p>
                    </div>

                    {/* Right cards */}
                    <div className="hp-cards">
                        {/* Get started */}
                        <div className="hp-card">
                            <h3>Get started with Route 53</h3>
                            <p>
                                Get started by registering a domain, configuring DNS, or using another{" "}
                                <a href="#">Route 53 feature</a>.
                            </p>
                            <button className="hp-btn-gs" onClick={handleGetStarted}>
                                Get started
                            </button>
                        </div>

                        {/* Pricing */}
                        <div className="hp-card">
                            <h3>Pricing (US)</h3>
                            <a href="#">View pricing <ExternalLink size={12} /></a>
                        </div>
                    </div>
                </section>

                {/* ── LOWER SECTION ── */}
                <section className="hp-lower">
                    <h2>How it works</h2>
                    <div className="hp-lower-grid">
                        {/* Video card */}
                        <div className="hp-video">
                            <img
                                src="/Howitwork.png"
                                alt="How Amazon Route 53 works"
                                style={{
                                    width: "100%",
                                    borderRadius: "8px",
                                    display: "block",
                                    cursor: "pointer"
                                }}
                            />
                        </div>

                        {/* More resources */}
                        <div className="hp-resources">
                            <div className="hp-resources-title">
                                More resources <ExternalLink size={16} />
                            </div>
                            <button className="hp-res-link">Documentation</button>
                            <button className="hp-res-link">API reference</button>
                            <button className="hp-res-link">FAQs</button>
                            <button className="hp-res-link">Forum – DNS and health checks</button>
                        </div>
                    </div>
                </section>

                {/* ── FIXED FOOTER ── */}
                <footer className="hp-footer">
                    <div className="hp-footer-left">
                        <span><Terminal size={14} /> CloudShell</span>
                        <span><Monitor size={14} /> Agent Toolkit for AWS</span>
                        <span>Feedback</span>
                        <span><MessageSquare size={14} /> Console Mobile App</span>
                    </div>
                    <div className="hp-footer-center">
                        © 2026, Amazon Web Services, Inc. or its affiliates.
                    </div>
                    <div className="hp-footer-right">
                        <span>Privacy</span>
                        <span>Terms</span>
                        <span>Cookie preferences</span>
                    </div>
                </footer>
            </div>
        </>
    );
}