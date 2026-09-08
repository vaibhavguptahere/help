"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/api";
import { Search, Settings, RefreshCw, ChevronRight, X } from "lucide-react";

export default function HostedZonesPage() {
    const router = useRouter();
    const [hostedZones, setHostedZones] = useState<any[]>([]);
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Toast message for coming soon
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showComingSoon = (feature: string) => {
        setToastMessage(`${feature} — Coming soon`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        loadHostedZones();
    }, []);

    async function loadHostedZones(searchQuery = "") {
        try {
            setLoading(true);
            const data = await apiRequest(`/hosted-zones${searchQuery ? `?search=${searchQuery}` : ''}`);
            setHostedZones(data);
            if (data && data.length > 0) {
                if (selectedZone) {
                    const refreshed = data.find((z: any) => z.id === selectedZone.id);
                    setSelectedZone(refreshed || data[0]);
                } else {
                    setSelectedZone(data[0]);
                }
            } else {
                setSelectedZone(null);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadHostedZones(search);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError("");
        try {
            const newZ = await apiRequest("/hosted-zones", {
                method: "POST",
                body: JSON.stringify({ name: newName, description: newDesc, zone_type: "PUBLIC" })
            });
            setShowCreateModal(false);
            setNewName("");
            setNewDesc("");
            await loadHostedZones();
            if (newZ) {
                setSelectedZone(newZ);
                setSidebarOpen(true);
            }
        } catch (err: any) {
            setCreateError(err.message || "Failed to create hosted zone");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedZone) return;
        try {
            await apiRequest(`/hosted-zones/${selectedZone.id}`, { method: "DELETE" });
            setShowDeleteModal(false);
            setDeleteConfirmInput("");
            setSelectedZone(null);
            loadHostedZones();
        } catch (err: any) {
            alert(err.message || "Failed to delete hosted zone");
        }
    };

    const handleRowClick = (zone: any) => {
        setSelectedZone(zone);
        setSidebarOpen(true);
    };

    const formattedZoneId = (zone: any) => {
        if (!zone) return "";
        return zone.id === 1 ? "Z0146076UB8J42ZR4U65" : `Z0${String(zone.id * 146076).padStart(7, '0')}UB8J42ZR`;
    };

    const defaultNameServers = [
        "ns-948.awsdns-54.net",
        "ns-1213.awsdns-23.org",
        "ns-1794.awsdns-32.co.uk",
        "ns-186.awsdns-23.com"
    ];

    return (
        <Layout
            breadcrumbs={[
                { label: "Route 53", href: "/dashboard" },
                { label: "Hosted zones" }
            ]}
            isSplitViewOpen={sidebarOpen && !!selectedZone}
            onToggleSplitView={() => setSidebarOpen(!sidebarOpen)}
        >
            <style>{`
                /* Full page background and layout */
                .hz-page-wrapper {
                    margin: -24px -32px -60px -32px;
                    background: #ffffff;
                    min-height: calc(100vh - 76px);
                    display: flex;
                    color: #0f1111;
                    font-size: 13px;
                }

                .hz-main-section {
                    flex: 1;
                    min-width: 0;
                    padding: 24px 32px 48px 32px;
                }

                .hz-header-container { margin-bottom: 24px; }
                .hz-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
                .hz-title-area { display: flex; align-items: baseline; gap: 8px; }
                .hz-title { font-size: 24px; font-weight: 700; margin: 0; color: #0f1111; }
                .hz-count { font-size: 20px; color: #545b64; font-weight: 300; }
                
                .hz-header-actions { display: flex; align-items: center; gap: 8px; }
                
                .hz-icon-btn { 
                    background: #fff; border: 1px solid #0073bb; border-radius: 50%; width: 32px; height: 32px; 
                    display: flex; align-items: center; justify-content: center; color: #0073bb; cursor: pointer; 
                }
                .hz-icon-btn:hover { background: #f2f8fd; }
                
                .hz-btn-primary {
                    background: #ff9900; border: 1px solid #e47911; border-radius: 20px;
                    padding: 4px 20px; font-size: 13px; font-weight: 700; color: #0f1111; cursor: pointer; height: 32px;
                    display: inline-flex; align-items: center; justify-content: center;
                }
                .hz-btn-primary:hover { background: #ec8800; }

                .hz-btn-secondary {
                    background: #fff; border: 1px solid #0073bb; border-radius: 20px;
                    padding: 4px 16px; font-size: 13px; font-weight: 700; color: #0073bb; cursor: pointer; height: 32px;
                    display: inline-flex; align-items: center; justify-content: center;
                }
                .hz-btn-secondary:hover { background: #f2f8fd; }
                
                .hz-btn-disabled {
                    background: #fff; border: 1px solid #d5d9d9; border-radius: 20px;
                    padding: 4px 16px; font-size: 13px; font-weight: 700; color: #879596; cursor: not-allowed; height: 32px;
                    display: inline-flex; align-items: center; justify-content: center;
                }
                
                .hz-info-text { font-size: 13px; color: #545b64; margin-bottom: 16px; }
                .hz-info-link { color: #0073bb; text-decoration: underline; cursor: pointer; }
                .hz-info-link:hover { color: #005a9e; }
                
                .hz-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                
                .hz-search-wrapper { position: relative; flex: 1; max-width: 600px; }
                .hz-search-icon { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #545b64; }
                .hz-search-input { 
                    width: 100%; border: 1px solid #aab7b8; border-radius: 4px; padding: 6px 10px 6px 32px; font-size: 13px; color: #0f1111; background: #fff; 
                }
                .hz-search-input::placeholder { color: #545b64; }
                .hz-search-input:focus { border-color: #0073bb; outline: none; box-shadow: 0 0 0 1px #0073bb; }
                
                .hz-pagination { display: flex; align-items: center; gap: 12px; color: #545b64; font-size: 13px; }
                .hz-page-controls { display: flex; align-items: center; gap: 8px; }
                .hz-page-btn { background: none; border: none; color: #545b64; cursor: pointer; font-size: 14px; font-weight: bold; }
                .hz-page-number { font-weight: 700; color: #0f1111; }
                .hz-settings-icon { color: #545b64; cursor: pointer; }
                
                .hz-table-container {
                    border: 1px solid #d5d9d9; border-radius: 4px; background: #fff; overflow-x: auto;
                }
                .hz-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .hz-table th { text-align: left; padding: 8px 10px; border-bottom: 1px solid #d5d9d9; font-weight: 700; color: #0f1111; position: relative; background: #fafafa; }
                .hz-table th::after { content: "▼"; font-size: 8px; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); color: #545b64; }
                .hz-table th:first-child::after { display: none; }
                .hz-table td { padding: 10px; border-bottom: 1px solid #eaeded; color: #0f1111; }
                .hz-table tr:hover td { background: #f2f8fd; }
                
                /* Selection state matching AWS screenshot */
                .hz-table tr.selected td { background: #f2f8fd; }
                .hz-table tr.selected td:first-child { border-left: 3px solid #0073bb; }
                .hz-table tr.selected td { border-top: 1px solid #0073bb; border-bottom: 1px solid #0073bb; }
                
                .hz-table-link { color: #0073bb; text-decoration: underline; font-weight: 400; cursor: pointer; }
                .hz-table-link:hover { color: #005a9e; }
                
                .hz-empty-state { text-align: center; padding: 40px 20px; }
                .hz-empty-title { font-size: 16px; font-weight: 700; color: #0f1111; margin-bottom: 8px; }
                .hz-empty-desc { font-size: 13px; color: #545b64; margin-bottom: 24px; }

                /* Floating Toast */
                .aws-toast {
                    position: fixed; bottom: 50px; right: 24px; background: #161e2d; color: #fff;
                    padding: 10px 18px; border-radius: 6px; font-size: 13px; z-index: 2000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 8px;
                }

                /* Right Sidebar Section matching AWS Screenshot */
                .hz-sidebar-section {
                    width: 320px;
                    flex-shrink: 0;
                    border-left: 1px solid #eaeded;
                    padding: 24px 24px;
                    background: #ffffff;
                }
                .hz-side-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 20px;
                }
                .hz-side-title {
                    font-size: 16px; font-weight: 700; color: #0f1111; margin: 0;
                }
                .hz-side-actions {
                    display: flex; align-items: center; gap: 10px; color: #545b64;
                }
                .hz-side-item {
                    margin-bottom: 20px;
                }
                .hz-side-label {
                    font-size: 13px; font-weight: 700; color: #0f1111; margin-bottom: 4px;
                }
                .hz-side-val {
                    font-size: 13px; font-weight: 400; color: #0f1111; word-break: break-all;
                }
                .hz-side-bullet-list {
                    margin: 0; padding-left: 16px; list-style-type: disc; color: #0f1111; font-size: 13px; line-height: 1.7;
                }

                /* Modal Styles */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
                }
                .modal-content {
                    background: #fff; width: 500px; border-radius: 8px; padding: 24px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .modal-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; border-bottom: 1px solid #d5d9d9; padding-bottom: 12px; }
                .modal-field { margin-bottom: 16px; }
                .modal-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 6px; }
                .modal-footer { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; border-top: 1px solid #d5d9d9; padding-top: 16px; }
                .modal-error { color: #d13212; font-size: 13px; margin-bottom: 12px; }
                .modal-btn-secondary { background: #fff; border: 1px solid #545b64; border-radius: 20px; padding: 6px 16px; font-size: 13px; font-weight: 700; color: #0f1111; cursor: pointer; }
                .modal-btn-secondary:hover { background: #f2f3f3; }
            `}</style>

            <div className="hz-page-wrapper">
                {/* Main Table Area */}
                <div className="hz-main-section">
                    {/* Toast Notification */}
                    {toastMessage && (
                        <div className="aws-toast">
                            <span>{toastMessage}</span>
                        </div>
                    )}

                    <div className="hz-header-container">
                        <div className="hz-header">
                            <div className="hz-title-area">
                                <h1 className="hz-title">Hosted zones</h1>
                                <span className="hz-count">({selectedZone ? 1 : 0}/{hostedZones.length})</span>
                            </div>
                            <div className="hz-header-actions">
                                <button className="hz-icon-btn" onClick={() => loadHostedZones(search)} title="Refresh">
                                    <RefreshCw size={14} />
                                </button>
                                {selectedZone ? (
                                    <button className="hz-btn-secondary" onClick={() => router.push(`/hosted-zones/${selectedZone.id}`)}>
                                        View details
                                    </button>
                                ) : (
                                    <button className="hz-btn-disabled">View details</button>
                                )}
                                {selectedZone ? (
                                    <button className="hz-btn-secondary" onClick={() => showComingSoon("Edit hosted zone")}>
                                        Edit
                                    </button>
                                ) : (
                                    <button className="hz-btn-disabled">Edit</button>
                                )}
                                {selectedZone ? (
                                    <button className="hz-btn-secondary" onClick={() => setShowDeleteModal(true)}>
                                        Delete
                                    </button>
                                ) : (
                                    <button className="hz-btn-disabled">Delete</button>
                                )}
                                <button className="hz-btn-primary" onClick={() => setShowCreateModal(true)}>
                                    Create hosted zone
                                </button>
                            </div>
                        </div>
                        <div className="hz-info-text">
                            Automatic mode is the current search behavior optimized for best filter results. <span className="hz-info-link" onClick={() => showComingSoon("Settings")}>To change modes go to settings.</span>
                        </div>
                    </div>

                    <div className="hz-controls">
                        <form className="hz-search-wrapper" onSubmit={handleSearch}>
                            <Search className="hz-search-icon" size={14} />
                            <input 
                                type="text" 
                                className="hz-search-input" 
                                placeholder="Filter records by property or value" 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </form>
                        <div className="hz-pagination">
                            <div className="hz-page-controls">
                                <button className="hz-page-btn">&lt;</button>
                                <span className="hz-page-number">1</span>
                                <button className="hz-page-btn">&gt;</button>
                            </div>
                            <Settings className="hz-settings-icon" size={16} onClick={() => showComingSoon("Settings")} />
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ padding: "40px", textAlign: "center", color: "#545b64" }}>Loading...</div>
                    ) : (
                        <div className="hz-table-container">
                            <table className="hz-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '40px' }}></th>
                                        <th>Hosted zone name</th>
                                        <th>Type</th>
                                        <th>Created by</th>
                                        <th>Record count</th>
                                        <th>Description</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {hostedZones.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: 0 }}>
                                                <div className="hz-empty-state">
                                                    <div className="hz-empty-title">No hosted zones</div>
                                                    <div className="hz-empty-desc">There are no hosted zones created for this account.</div>
                                                    <button className="hz-btn-primary" onClick={() => setShowCreateModal(true)}>Create hosted zone</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        hostedZones.map((zone) => {
                                            const isSelected = selectedZone?.id === zone.id;
                                            return (
                                                <tr 
                                                    key={zone.id} 
                                                    className={isSelected ? "selected" : ""}
                                                    onClick={() => handleRowClick(zone)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                                                        <input 
                                                            type="radio" 
                                                            name="selected_zone" 
                                                            checked={isSelected}
                                                            onChange={() => handleRowClick(zone)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className="hz-table-link"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                router.push(`/hosted-zones/${zone.id}`);
                                                            }}
                                                        >
                                                            {zone.name}
                                                        </span>
                                                    </td>
                                                    <td>{zone.zone_type === "PUBLIC" ? "Public" : zone.zone_type}</td>
                                                    <td>Route 53</td>
                                                    <td>{zone.record_count ?? 2}</td>
                                                    <td>{zone.description || "-"}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right Sidebar: Hosted Zone Details matching screenshot */}
                {sidebarOpen && selectedZone && (
                    <aside className="hz-sidebar-section">
                        <div className="hz-side-header">
                            <h3 className="hz-side-title">Hosted zone details</h3>
                            <div className="hz-side-actions">
                                <Settings size={16} style={{ cursor: 'pointer' }} onClick={() => showComingSoon("Preferences")} />
                                <button 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#545b64', display: 'flex', alignItems: 'center', padding: 0 }}
                                    onClick={() => setSidebarOpen(false)}
                                    title="Close hosted zone details"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Hosted zone name</div>
                            <div className="hz-side-val">{selectedZone.name}</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Hosted zone ID</div>
                            <div className="hz-side-val">{formattedZoneId(selectedZone)}</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Description</div>
                            <div className="hz-side-val">{selectedZone.description || "-"}</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Query log</div>
                            <div className="hz-side-val">-</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Type</div>
                            <div className="hz-side-val">Public hosted zone</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Record count</div>
                            <div className="hz-side-val">{selectedZone.record_count ?? 2}</div>
                        </div>

                        <div className="hz-side-item">
                            <div className="hz-side-label">Name servers</div>
                            <ul className="hz-side-bullet-list">
                                {defaultNameServers.map((ns, idx) => (
                                    <li key={idx}>{ns}</li>
                                ))}
                            </ul>
                        </div>
                    </aside>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-title">Create hosted zone</div>
                        <form onSubmit={handleCreate}>
                            {createError && <div className="modal-error">{createError}</div>}
                            
                            <div className="modal-field">
                                <label className="modal-label">Domain name</label>
                                <input 
                                    type="text" 
                                    className="hz-search-input" 
                                    style={{ width: "100%", paddingLeft: "10px" }}
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="example.com"
                                    required
                                />
                                <div style={{ fontSize: '11px', color: '#545b64', marginTop: '4px' }}>
                                    Enter the domain name. Example: example.com
                                </div>
                            </div>
                            
                            <div className="modal-field">
                                <label className="modal-label">Description - optional</label>
                                <textarea 
                                    className="hz-search-input" 
                                    style={{ width: "100%", height: "80px", resize: "vertical", paddingLeft: "10px" }}
                                    value={newDesc}
                                    onChange={(e) => setNewDesc(e.target.value)}
                                    placeholder="Hosted zone for example.com"
                                />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="modal-btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="hz-btn-primary" disabled={creating}>
                                    {creating ? "Creating..." : "Create hosted zone"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Hosted Zone Modal matching screenshot */}
            {showDeleteModal && selectedZone && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ width: "540px", borderRadius: "12px", padding: "24px 28px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0f1111" }}>
                                Delete hosted zone {selectedZone.name}?
                            </h2>
                            <button 
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#545b64", padding: 0, fontSize: "20px", fontWeight: 300 }} 
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmInput("");
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p style={{ fontSize: "13px", color: "#0f1111", lineHeight: 1.5, marginBottom: "24px" }}>
                            Delete the hosted zone permanently? This action cannot be undone. Your domain might become unavailable on the internet.
                        </p>

                        <div style={{ marginBottom: "28px" }}>
                            <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "#0f1111", marginBottom: "8px" }}>
                                To confirm that you want to delete the hosted zone, enter <em>delete</em> in the field.
                            </label>
                            <input 
                                type="text"
                                value={deleteConfirmInput}
                                onChange={(e) => setDeleteConfirmInput(e.target.value)}
                                placeholder="delete"
                                style={{
                                    width: "100%",
                                    border: "1px solid #aab7b8",
                                    borderRadius: "4px",
                                    padding: "8px 12px",
                                    fontSize: "13px",
                                    color: "#0f1111",
                                    boxSizing: "border-box"
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
                            <button 
                                type="button" 
                                style={{
                                    background: "none",
                                    border: "none",
                                    color: "#0073bb",
                                    fontWeight: 700,
                                    fontSize: "13px",
                                    cursor: "pointer",
                                    padding: "6px 16px"
                                }}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmInput("");
                                }}
                            >
                                Cancel
                            </button>
                            <button 
                                type="button" 
                                disabled={deleteConfirmInput.trim().toLowerCase() !== "delete"}
                                style={{
                                    background: deleteConfirmInput.trim().toLowerCase() === "delete" ? "#d13212" : "#eaeded",
                                    color: deleteConfirmInput.trim().toLowerCase() === "delete" ? "#ffffff" : "#879596",
                                    border: "1px solid " + (deleteConfirmInput.trim().toLowerCase() === "delete" ? "#d13212" : "#d5d9d9"),
                                    borderRadius: "20px",
                                    padding: "6px 22px",
                                    fontSize: "13px",
                                    fontWeight: 700,
                                    cursor: deleteConfirmInput.trim().toLowerCase() === "delete" ? "pointer" : "not-allowed"
                                }}
                                onClick={handleDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
}