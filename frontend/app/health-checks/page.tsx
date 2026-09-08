"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { RotateCw, ChevronDown, ChevronRight, ExternalLink, X } from "lucide-react";

type HealthCheck = {
    id: string;
    name: string;
    type: string;
    fqdn: string;
    port: number;
    path: string;
    status: "Healthy" | "Unhealthy" | "Unknown";
    requestInterval: number;
    failureThreshold: number;
};

const MOCK_CHECKS: HealthCheck[] = [];

export default function HealthChecksPage() {
    const [selected, setSelected] = useState<HealthCheck | null>(null);
    const [search, setSearch] = useState("");
    const [showToast, setShowToast] = useState(false);

    const toast = () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const filtered = MOCK_CHECKS.filter(h =>
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.fqdn.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout breadcrumbs={[{ label: "Route 53", href: "/dashboard" }, { label: "Health checks" }]}>
            <style>{`
                /* ── Health Checks page ── */
                .hc-page { display: flex; height: 100%; gap: 0; }
                .hc-main { flex: 1; min-width: 0; }

                /* Top action bar */
                .hc-bar {
                    display: flex; align-items: center; gap: 8px;
                    margin-bottom: 0; padding-bottom: 12px;
                    flex-wrap: wrap;
                }
                .hc-title-row { display: flex; align-items: baseline; gap: 8px; margin-bottom: 12px; }
                .hc-title { font-size: 20px; font-weight: 700; color: #0f1111; }
                .hc-count { font-size: 14px; color: #555; }

                /* Search/filter */
                .hc-search-wrap {
                    display: flex; align-items: center; gap: 0;
                    border: 1px solid #aab7b8; border-radius: 2px;
                    background: #fff; flex: 1; max-width: 560px;
                }
                .hc-search-icon {
                    padding: 6px 10px; color: #555; display: flex; align-items: center;
                    border-right: 1px solid #eaeded;
                }
                .hc-search-input {
                    border: none; outline: none; font-size: 13px; padding: 6px 10px;
                    width: 100%; background: transparent; color: #0f1111;
                }
                .hc-filter-btn {
                    display: flex; align-items: center; gap: 4px;
                    padding: 6px 12px; border: none; background: none; cursor: pointer;
                    font-size: 13px; color: #0f1111; border-left: 1px solid #eaeded;
                    white-space: nowrap;
                }

                /* Buttons */
                .hc-btn-primary {
                    background: #ff9900; border: 1px solid #e47911;
                    border-radius: 2px; padding: 6px 16px;
                    font-size: 13px; font-weight: 700; color: #0f1111;
                    cursor: pointer; white-space: nowrap;
                }
                .hc-btn-primary:hover { background: #ec8800; }
                .hc-btn-secondary {
                    background: #fff; border: 1px solid #aab7b8;
                    border-radius: 2px; padding: 6px 14px;
                    font-size: 13px; color: #0f1111; cursor: pointer; white-space: nowrap;
                }
                .hc-btn-secondary:hover { background: #f2f3f3; }
                .hc-btn-secondary:disabled { opacity: 0.5; cursor: default; }
                .hc-btn-icon {
                    background: none; border: 1px solid #aab7b8; border-radius: 2px;
                    padding: 5px 8px; cursor: pointer; color: #0f1111;
                    display: flex; align-items: center;
                }
                .hc-btn-icon:hover { background: #f2f3f3; }

                /* Table panel */
                .hc-panel { border: 1px solid #d5d9d9; background: #fff; }
                .hc-panel-header {
                    display: flex; align-items: center; padding: 10px 16px;
                    border-bottom: 1px solid #eaeded; gap: 8px;
                }
                .hc-panel-title { font-size: 16px; font-weight: 700; flex: 1; }

                /* Table */
                .hc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .hc-table th {
                    text-align: left; padding: 8px 16px;
                    border-bottom: 2px solid #eaeded; font-weight: 700;
                    color: #0f1111; background: #fafafa; white-space: nowrap;
                }
                .hc-table th .sort { display: inline-flex; align-items: center; gap: 3px; cursor: pointer; }
                .hc-table td {
                    padding: 10px 16px; border-bottom: 1px solid #eaeded;
                    vertical-align: middle; color: #0f1111;
                }
                .hc-table tr:hover td { background: #f9f9f9; }
                .hc-table tr.selected td { background: #f2f8fd; }
                .hc-table tr.selected td:first-child { border-left: 3px solid #0073bb; }

                .hc-radio { accent-color: #0073bb; cursor: pointer; }

                .hc-status-healthy {
                    display: inline-flex; align-items: center; gap: 5px;
                    color: #1d8102; font-size: 13px;
                }
                .hc-status-unhealthy {
                    display: inline-flex; align-items: center; gap: 5px;
                    color: #d13212; font-size: 13px;
                }
                .hc-status-dot-green { width: 8px; height: 8px; border-radius: 50%; background: #1d8102; }
                .hc-status-dot-red { width: 8px; height: 8px; border-radius: 50%; background: #d13212; }

                /* Empty state */
                .hc-empty {
                    padding: 60px 24px; text-align: center;
                }
                .hc-empty-title { font-size: 16px; font-weight: 700; color: #0f1111; margin-bottom: 8px; }
                .hc-empty-desc { font-size: 13px; color: #555; margin-bottom: 20px; max-width: 440px; margin-left: auto; margin-right: auto; line-height: 1.5; }

                /* Detail sidebar */
                .hc-sidebar {
                    width: 340px; flex-shrink: 0;
                    border-left: 1px solid #eaeded;
                    background: #fff;
                    display: flex; flex-direction: column;
                    margin-left: 0;
                }
                .hc-sidebar-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 16px; border-bottom: 1px solid #eaeded;
                }
                .hc-sidebar-title { font-size: 15px; font-weight: 700; }
                .hc-close-btn {
                    background: none; border: none; cursor: pointer; color: #555;
                    display: flex; align-items: center; padding: 2px;
                    border-radius: 2px;
                }
                .hc-close-btn:hover { background: #f2f3f3; }
                .hc-sidebar-body { padding: 16px; flex: 1; overflow-y: auto; }
                .hc-sidebar-field { margin-bottom: 14px; }
                .hc-sidebar-label { font-size: 11px; font-weight: 700; color: #555; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
                .hc-sidebar-value { font-size: 13px; color: #0f1111; }
                .hc-sidebar-link { font-size: 13px; color: #0073bb; text-decoration: none; cursor: pointer; }
                .hc-sidebar-link:hover { text-decoration: underline; }
                .hc-sidebar-actions { padding: 12px 16px; border-top: 1px solid #eaeded; display: flex; gap: 8px; }

                /* Toast */
                .hc-toast {
                    position: fixed; bottom: 60px; right: 24px;
                    background: #0f1111; color: #fff; padding: 10px 18px;
                    border-radius: 4px; font-size: 13px; z-index: 1000;
                    display: flex; align-items: center; gap: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    animation: fadeIn 0.2s ease;
                }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

                /* Info boxes */
                .hc-info-box {
                    border: 1px solid #d5d9d9; border-radius: 0;
                    background: #fff; margin-bottom: 20px; overflow: hidden;
                }
                .hc-info-box-header {
                    background: #fafafa; padding: 10px 16px;
                    display: flex; align-items: center; gap: 8px;
                    border-bottom: 1px solid #eaeded; cursor: pointer;
                }
                .hc-info-box-title { font-size: 14px; font-weight: 700; }
                .hc-info-box-body { padding: 14px 16px; font-size: 13px; color: #555; line-height: 1.6; }
                .hc-info-box-body a { color: #0073bb; }
                .hc-info-box-body a:hover { text-decoration: underline; }
            `}</style>

            {showToast && (
                <div className="hc-toast">
                    ℹ This feature is not available in the Route 53 clone.
                </div>
            )}

            <div className="hc-title-row">
                <span className="hc-title">Health checks</span>
                <span className="hc-count">({MOCK_CHECKS.length})</span>
            </div>

            {/* Action bar */}
            <div className="hc-bar">
                {/* Search */}
                <div className="hc-search-wrap">
                    <span className="hc-search-icon">
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="#555">
                            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                        </svg>
                    </span>
                    <input
                        className="hc-search-input"
                        placeholder="Search health checks by name"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <button className="hc-filter-btn" onClick={toast}>
                        All <ChevronDown size={12} />
                    </button>
                </div>

                {/* Right-side buttons */}
                <button className="hc-btn-icon" title="Refresh">
                    <RotateCw size={14} />
                </button>
                <button
                    className="hc-btn-secondary"
                    disabled={!selected}
                    onClick={toast}
                >
                    Monitor status
                </button>
                <button
                    className="hc-btn-secondary"
                    disabled={!selected}
                    onClick={toast}
                >
                    Edit
                </button>
                <button
                    className="hc-btn-secondary"
                    disabled={!selected}
                    onClick={toast}
                >
                    Delete
                </button>
                <button className="hc-btn-primary" onClick={toast}>
                    Create health check
                </button>
            </div>

            {/* Main layout: table + sidebar */}
            <div className="hc-page">
                <div className="hc-main">
                    {/* Info panel */}
                    <div className="hc-info-box" style={{ marginBottom: 16 }}>
                        <div className="hc-info-box-header">
                            <ChevronRight size={14} style={{ color: "#555" }} />
                            <span className="hc-info-box-title">Health checks</span>
                        </div>
                        <div className="hc-info-box-body">
                            Amazon Route 53 health checks monitor the health and performance of your web applications, web servers, and other resources.{" "}
                            <a href="#" onClick={(e) => e.preventDefault()}>Learn more <ExternalLink size={11} style={{ display: "inline", verticalAlign: "middle" }} /></a>
                        </div>
                    </div>

                    {/* How it works panel */}
                    <div className="hc-info-box" style={{ marginBottom: 16 }}>
                        <div className="hc-info-box-header">
                            <ChevronRight size={14} style={{ color: "#555" }} />
                            <span className="hc-info-box-title">How it works</span>
                        </div>
                        <div style={{ padding: "16px 20px" }}>
                            <img
                                src="/Howitwork.png"
                                alt="How Amazon Route 53 works"
                                style={{
                                    width: "100%",
                                    maxWidth: "560px",
                                    borderRadius: "6px",
                                    display: "block",
                                    cursor: "pointer",
                                    border: "1px solid #d5d9d9"
                                }}
                            />
                            <p style={{ fontSize: "12px", color: "#555", marginTop: "8px" }}>
                                Amazon Route 53 — How DNS routing and health checking work together.
                            </p>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="hc-panel">
                        <div className="hc-panel-header">
                            <span className="hc-panel-title">Health checks ({filtered.length})</span>
                            <button className="hc-btn-icon" title="Refresh" style={{ marginLeft: "auto" }}>
                                <RotateCw size={13} />
                            </button>
                        </div>

                        {filtered.length === 0 ? (
                            <div className="hc-empty">
                                <div className="hc-empty-title">No health checks</div>
                                <div className="hc-empty-desc">
                                    You don't have any health checks in this AWS Region. Create a health check to monitor the health of your resources and improve availability.
                                </div>
                                <button className="hc-btn-primary" onClick={toast}>
                                    Create health check
                                </button>
                            </div>
                        ) : (
                            <table className="hc-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: 36 }}></th>
                                        <th><span className="sort">Name <ChevronDown size={12} /></span></th>
                                        <th><span className="sort">ID <ChevronDown size={12} /></span></th>
                                        <th><span className="sort">Health check type <ChevronDown size={12} /></span></th>
                                        <th><span className="sort">FQDN/IP address <ChevronDown size={12} /></span></th>
                                        <th><span className="sort">Status <ChevronDown size={12} /></span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map(hc => (
                                        <tr
                                            key={hc.id}
                                            className={selected?.id === hc.id ? "selected" : ""}
                                            onClick={() => setSelected(hc)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <td>
                                                <input
                                                    type="radio"
                                                    className="hc-radio"
                                                    checked={selected?.id === hc.id}
                                                    onChange={() => setSelected(hc)}
                                                />
                                            </td>
                                            <td style={{ color: "#0073bb" }}>{hc.name || "—"}</td>
                                            <td style={{ color: "#0073bb" }}>{hc.id}</td>
                                            <td>{hc.type}</td>
                                            <td>{hc.fqdn}</td>
                                            <td>
                                                {hc.status === "Healthy" ? (
                                                    <span className="hc-status-healthy">
                                                        <span className="hc-status-dot-green" /> Healthy
                                                    </span>
                                                ) : (
                                                    <span className="hc-status-unhealthy">
                                                        <span className="hc-status-dot-red" /> Unhealthy
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Detail Sidebar */}
                {selected && (
                    <div className="hc-sidebar">
                        <div className="hc-sidebar-header">
                            <span className="hc-sidebar-title">Health check details</span>
                            <button className="hc-close-btn" onClick={() => setSelected(null)}>
                                <X size={16} />
                            </button>
                        </div>
                        <div className="hc-sidebar-body">
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Name</div>
                                <div className="hc-sidebar-value">{selected.name || "—"}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">ID</div>
                                <div className="hc-sidebar-value" style={{ wordBreak: "break-all" }}>{selected.id}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Status</div>
                                <div className="hc-sidebar-value">
                                    {selected.status === "Healthy" ? (
                                        <span className="hc-status-healthy"><span className="hc-status-dot-green" /> Healthy</span>
                                    ) : (
                                        <span className="hc-status-unhealthy"><span className="hc-status-dot-red" /> Unhealthy</span>
                                    )}
                                </div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Health check type</div>
                                <div className="hc-sidebar-value">{selected.type}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">FQDN</div>
                                <div className="hc-sidebar-value">{selected.fqdn}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Port</div>
                                <div className="hc-sidebar-value">{selected.port}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Path</div>
                                <div className="hc-sidebar-value">{selected.path}</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Request interval</div>
                                <div className="hc-sidebar-value">{selected.requestInterval} seconds</div>
                            </div>
                            <div className="hc-sidebar-field">
                                <div className="hc-sidebar-label">Failure threshold</div>
                                <div className="hc-sidebar-value">{selected.failureThreshold}</div>
                            </div>
                        </div>
                        <div className="hc-sidebar-actions">
                            <button className="hc-btn-secondary" style={{ flex: 1 }} onClick={toast}>Edit</button>
                            <button className="hc-btn-secondary" style={{ flex: 1 }} onClick={toast}>Delete</button>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
