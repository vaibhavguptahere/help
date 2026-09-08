"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import { RotateCw, ExternalLink, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

export default function DashboardPage() {
    const [searchNotif, setSearchNotif] = useState("");

    return (
        <Layout breadcrumbs={[{ label: "Route 53", href: "/dashboard" }, { label: "Dashboard" }]}>
            <style>{`
                /* Dashboard Styles */
                .dash-panel {
                    background: #fff;
                    border: 1px solid #d5d9d9;
                    margin-bottom: 24px;
                }
                .dash-panel-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 12px 20px;
                    border-bottom: 1px solid #eaeded;
                }
                .dash-panel-title {
                    font-size: 18px; font-weight: 700; color: #0f1111; margin: 0;
                    display: flex; align-items: center; gap: 6px;
                }

                /* Notifications search */
                .dash-notif-search {
                    display: flex; align-items: center; gap: 8px;
                    border: 1px solid #aab7b8; border-radius: 2px;
                    padding: 5px 10px; background: #fff; margin: 12px 20px;
                    font-size: 13px; color: #555;
                }
                .dash-notif-search input {
                    border: none; outline: none; font-size: 13px; color: #0f1111; width: 100%;
                    background: transparent;
                }

                .dash-table-header {
                    display: grid; grid-template-columns: 2fr 1fr 2fr 32px;
                    padding: 8px 20px;
                    border-bottom: 1px solid #eaeded;
                    font-size: 13px; font-weight: 700; color: #0f1111;
                }
                .dash-table-col { display: flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; }
                .dash-table-col:hover { color: #0073bb; }
                .dash-table-empty {
                    padding: 32px 20px; text-align: center;
                    font-size: 13px; color: #555; border-bottom: 1px solid #eaeded;
                }
                .dash-pagination {
                    display: flex; align-items: center; justify-content: flex-end;
                    gap: 4px; padding: 6px 20px;
                    font-size: 13px; color: #0f1111;
                }
                .dash-page-btn {
                    background: none; border: none; cursor: pointer;
                    color: #545b64; display: flex; align-items: center;
                    padding: 3px; border-radius: 2px;
                }
                .dash-page-btn:hover { background: #f2f3f3; }
                .dash-page-btn:disabled { opacity: 0.35; cursor: default; }
                .dash-page-num { font-size: 13px; min-width: 20px; text-align: center; }

                .dash-refresh-btn {
                    background: none; border: 1px solid #aab7b8; border-radius: 50%;
                    width: 30px; height: 30px; display: flex; align-items: center;
                    justify-content: center; cursor: pointer; color: #0073bb;
                }
                .dash-refresh-btn:hover { background: #f2f8fd; }

                /* More Resources */
                .dash-resource-link {
                    display: flex; align-items: center;
                    padding: 10px 20px; font-size: 13px; color: #0073bb;
                    text-decoration: none; border-bottom: 1px solid #eaeded;
                    cursor: pointer;
                }
                .dash-resource-link:last-child { border-bottom: none; }
                .dash-resource-link:hover { text-decoration: underline; }
            `}</style>

            {/* Notifications Panel */}
            <div className="dash-panel">
                <div className="dash-panel-header">
                    <h2 className="dash-panel-title">Notifications</h2>
                    <button className="dash-refresh-btn" title="Refresh">
                        <RotateCw size={14} />
                    </button>
                </div>

                {/* Search */}
                <div className="dash-notif-search">
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="#555">
                        <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
                    </svg>
                    <input
                        type="text"
                        placeholder="Find notifications"
                        value={searchNotif}
                        onChange={e => setSearchNotif(e.target.value)}
                    />
                </div>

                {/* Column Headers */}
                <div className="dash-table-header">
                    <span className="dash-table-col">Resource <ChevronDown size={12} /></span>
                    <span className="dash-table-col">Status <ChevronDown size={12} /></span>
                    <span className="dash-table-col">Last update <ChevronDown size={12} /></span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                        <ChevronDown size={14} style={{ color: "#545b64" }} />
                    </span>
                </div>

                {/* Empty State */}
                <div className="dash-table-empty">No notifications to display</div>

                {/* Pagination */}
                <div className="dash-pagination">
                    <button className="dash-page-btn" disabled><ChevronLeft size={14} /></button>
                    <span className="dash-page-num">1</span>
                    <button className="dash-page-btn" disabled><ChevronRight size={14} /></button>
                </div>
            </div>

            {/* More Resources Panel */}
            <div className="dash-panel">
                <div className="dash-panel-header">
                    <h2 className="dash-panel-title">
                        More resources <ExternalLink size={14} style={{ color: "#0073bb" }} />
                    </h2>
                </div>

                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">Documentation</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">API reference</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">FAQs</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">Forum – DNS and health checks</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">Forum – Domain name registration</a>
                <a href="#" onClick={(e) => e.preventDefault()} className="dash-resource-link">Request a limit increase</a>
            </div>
        </Layout>
    );
}