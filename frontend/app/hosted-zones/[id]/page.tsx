"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import { apiRequest } from "@/lib/api";
import { 
    Search, 
    RefreshCw, 
    Settings, 
    Copy, 
    Check, 
    AlertCircle, 
    X,
    ChevronRight
} from "lucide-react";

export default function DNSRecordsPage() {
    const router = useRouter();
    const params = useParams();
    const zoneId = params.id as string;

    const [zone, setZone] = useState<any>(null);
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedTypeFilter, setSelectedTypeFilter] = useState("ALL");
    const [selectedRecords, setSelectedRecords] = useState<number[]>([]);

    // Side panel state (opens when a record is clicked)
    const [activeRecord, setActiveRecord] = useState<any>(null);
    const [sidePanelOpen, setSidePanelOpen] = useState(true);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // Details accordion (open by default as in screenshot)
    const [detailsOpen, setDetailsOpen] = useState(true);

    // Tabs
    const [activeTab, setActiveTab] = useState<"records" | "recovery" | "dnssec" | "tags">("records");

    // Modals
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showEditRecordModal, setShowEditRecordModal] = useState(false);
    const [showDeleteZoneModal, setShowDeleteZoneModal] = useState(false);
    const [deleteConfirmInput, setDeleteConfirmInput] = useState("");

    // Notice banner / alert message
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    // Create record form state
    const [newName, setNewName] = useState("");
    const [newType, setNewType] = useState("A");
    const [newValue, setNewValue] = useState("");
    const [newTtl, setNewTtl] = useState(300);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Edit zone form state
    const [editDesc, setEditDesc] = useState("");
    const [savingEdit, setSavingEdit] = useState(false);

    // Edit record form state
    const [editRecordValue, setEditRecordValue] = useState("");
    const [editRecordTtl, setEditRecordTtl] = useState(300);
    const [savingRecordEdit, setSavingRecordEdit] = useState(false);
    const [editRecordError, setEditRecordError] = useState("");

    const showComingSoon = (feature: string) => {
        setToastMessage(`${feature} — Coming soon`);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        if (zoneId) {
            loadZoneAndRecords();
        }
    }, [zoneId]);

    async function loadZoneAndRecords(searchQuery = "") {
        try {
            setLoading(true);
            const [zoneData, recordsData] = await Promise.all([
                apiRequest(`/hosted-zones/${zoneId}`),
                apiRequest(`/hosted-zones/${zoneId}/records${searchQuery ? `?search=${searchQuery}` : ''}`)
            ]);
            setZone(zoneData);
            setEditDesc(zoneData.description || "");
            setRecords(recordsData);

            if (recordsData && recordsData.length > 0) {
                if (activeRecord) {
                    const refreshed = recordsData.find((r: any) => r.id === activeRecord.id);
                    setActiveRecord(refreshed || recordsData[0]);
                } else {
                    setActiveRecord(recordsData[0]);
                    setSelectedRecords([recordsData[0].id]);
                }
            }
        } catch (error) {
            console.error("Failed to load zone or records", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadZoneAndRecords(search);
    };

    const handleCreateRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setCreateError("");
        try {
            const rawSubdomain = newName.trim();
            const recordName = rawSubdomain === "" 
                ? zone.name 
                : rawSubdomain.endsWith(zone.name) 
                    ? rawSubdomain 
                    : `${rawSubdomain}.${zone.name}`;

            const newRec = await apiRequest(`/hosted-zones/${zoneId}/records`, {
                method: "POST",
                body: JSON.stringify({ 
                    name: recordName, 
                    record_type: newType, 
                    value: newValue,
                    ttl: newTtl
                })
            });
            setShowCreateModal(false);
            setNewName("");
            setNewType("A");
            setNewValue("");
            setNewTtl(300);
            await loadZoneAndRecords();
            if (newRec) {
                setActiveRecord(newRec);
                setSelectedRecords([newRec.id]);
                setSidePanelOpen(true);
            }
        } catch (err: any) {
            setCreateError(err.message || "Failed to create DNS record");
        } finally {
            setCreating(false);
        }
    };

    const handleSaveZoneEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await apiRequest(`/hosted-zones/${zoneId}`, {
                method: "PUT",
                body: JSON.stringify({ description: editDesc })
            });
            setShowEditModal(false);
            loadZoneAndRecords();
        } catch (err: any) {
            alert(err.message || "Failed to update hosted zone");
        } finally {
            setSavingEdit(false);
        }
    };

    const handleSaveRecordEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRecord) return;
        setSavingRecordEdit(true);
        setEditRecordError("");
        try {
            const updated = await apiRequest(`/records/${activeRecord.id}`, {
                method: "PUT",
                body: JSON.stringify({ 
                    value: editRecordValue,
                    ttl: editRecordTtl
                })
            });
            setShowEditRecordModal(false);
            setActiveRecord(updated);
            loadZoneAndRecords();
        } catch (err: any) {
            setEditRecordError(err.message || "Failed to update DNS record");
        } finally {
            setSavingRecordEdit(false);
        }
    };

    const handleDeleteZone = async () => {
        try {
            await apiRequest(`/hosted-zones/${zoneId}`, { method: "DELETE" });
            router.push("/hosted-zones");
        } catch (err: any) {
            alert(err.message || "Failed to delete hosted zone");
        }
    };

    const handleDeleteSelectedRecords = async () => {
        if (selectedRecords.length === 0) return;

        // Check if any selected record is NS or SOA for apex
        const forbiddenRecords = records.filter(
            r => selectedRecords.includes(r.id) && 
                 (r.record_type === "NS" || r.record_type === "SOA") &&
                 (r.name === zone?.name || r.name === `${zone?.name}.`)
        );

        if (forbiddenRecords.length > 0) {
            setAlertMessage(`You can't delete the SOA record or the NS record named ${zone?.name}.`);
            return;
        }

        if (!confirm(`Are you sure you want to delete ${selectedRecords.length} record(s)?`)) {
            return;
        }

        try {
            for (const id of selectedRecords) {
                await apiRequest(`/records/${id}`, { method: "DELETE" });
            }
            setSelectedRecords([]);
            loadZoneAndRecords();
        } catch (err: any) {
            setAlertMessage(err.message || "Failed to delete record(s)");
        }
    };

    const handleRowClick = (record: any) => {
        setActiveRecord(record);
        setSelectedRecords([record.id]);
        setSidePanelOpen(true);
    };

    const toggleSelectRecord = (record: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setActiveRecord(record);
        setSidePanelOpen(true);
        if (selectedRecords.includes(record.id)) {
            setSelectedRecords(selectedRecords.filter(item => item !== record.id));
        } else {
            setSelectedRecords([...selectedRecords, record.id]);
        }
    };

    const toggleSelectAll = () => {
        if (selectedRecords.length === filteredRecords.length) {
            setSelectedRecords([]);
        } else {
            setSelectedRecords(filteredRecords.map(r => r.id));
            if (filteredRecords.length > 0) {
                setActiveRecord(filteredRecords[0]);
                setSidePanelOpen(true);
            }
        }
    };

    const copyField = (text: string, key: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(key);
        setTimeout(() => setCopiedField(null), 2000);
    };

    // Formatted name servers
    const defaultNameServers = [
        "ns-948.awsdns-54.net",
        "ns-1213.awsdns-23.org",
        "ns-1794.awsdns-32.co.uk",
        "ns-186.awsdns-23.com"
    ];

    const nsRecord = records.find(r => r.record_type === "NS" && (r.name === zone?.name || r.name === `${zone?.name}.`));
    const nameServers = nsRecord 
        ? nsRecord.value.split("\n").map((s: string) => s.trim()) 
        : defaultNameServers;

    // Filtered records
    const filteredRecords = useMemo(() => {
        return records.filter(r => {
            const matchesSearch = !search || 
                r.name.toLowerCase().includes(search.toLowerCase()) || 
                r.value.toLowerCase().includes(search.toLowerCase()) ||
                r.record_type.toLowerCase().includes(search.toLowerCase());
            const matchesType = selectedTypeFilter === "ALL" || r.record_type === selectedTypeFilter;
            return matchesSearch && matchesType;
        });
    }, [records, search, selectedTypeFilter]);

    // Format TTL with locale commas (e.g. 1,72,800)
    const formatTTL = (ttl: number) => {
        return Number(ttl).toLocaleString();
    };

    // Realistic Route 53 ID e.g. Z0146076UB8J42ZR4U65
    const formattedZoneId = zone 
        ? (zone.id === 1 ? "Z0146076UB8J42ZR4U65" : `Z0${String(zone.id * 146076).padStart(7, '0')}UB8J42ZR`)
        : "";

    const RECORD_TYPES = ["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"];

    if (!zone && !loading) {
        return (
            <Layout breadcrumbs={[{ label: "Route 53", href: "/dashboard" }, { label: "Hosted zones", href: "/hosted-zones" }, { label: "Not found" }]}>
                <div style={{ padding: "40px", color: "#545b64" }}>Hosted zone not found.</div>
            </Layout>
        );
    }

    return (
        <Layout 
            breadcrumbs={[
                { label: "Route 53", href: "/dashboard" },
                { label: "Hosted zones", href: "/hosted-zones" },
                { label: zone?.name || "..." }
            ]}
            isSplitViewOpen={sidePanelOpen}
            onToggleSplitView={() => setSidePanelOpen(!sidePanelOpen)}
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

                /* Top Zone Header */
                .zone-top-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
                }
                .zone-title-area { display: flex; align-items: center; gap: 10px; }
                
                .zone-public-badge {
                    background: #0073bb; color: #fff; font-size: 12px; font-weight: 700;
                    padding: 2px 8px; border-radius: 4px; letter-spacing: 0.3px;
                }
                .zone-heading {
                    font-size: 26px; font-weight: 700; color: #0f1111; margin: 0; line-height: 1.2;
                }
                .zone-info-link {
                    color: #0073bb; font-size: 13px; cursor: pointer; text-decoration: none;
                }
                .zone-info-link:hover { text-decoration: underline; }

                .zone-top-actions { display: flex; align-items: center; gap: 10px; }
                .aws-btn-secondary {
                    background: #fff; border: 1px solid #0073bb; border-radius: 20px;
                    padding: 4px 18px; font-size: 13px; font-weight: 700; color: #0073bb; cursor: pointer;
                    display: inline-flex; align-items: center; justify-content: center; height: 32px;
                }
                .aws-btn-secondary:hover { background: #f2f8fd; }
                .aws-btn-secondary:disabled { border-color: #d5d9d9; color: #879596; cursor: not-allowed; background: #fff; }

                .aws-btn-plain {
                    background: #fff; border: 1px solid #545b64; border-radius: 20px;
                    padding: 4px 18px; font-size: 13px; font-weight: 700; color: #0f1111; cursor: pointer;
                    display: inline-flex; align-items: center; justify-content: center; height: 32px;
                }
                .aws-btn-plain:hover { background: #f2f3f3; }

                .aws-btn-primary {
                    background: #ff9900; border: 1px solid #e47911; border-radius: 20px;
                    padding: 4px 20px; font-size: 13px; font-weight: 700; color: #0f1111; cursor: pointer;
                    display: inline-flex; align-items: center; justify-content: center; height: 32px;
                }
                .aws-btn-primary:hover { background: #ec8800; }

                .aws-icon-btn {
                    background: #fff; border: 1px solid #0073bb; border-radius: 50%; width: 32px; height: 32px;
                    display: flex; align-items: center; justify-content: center; color: #0073bb; cursor: pointer;
                }
                .aws-icon-btn:hover { background: #f2f8fd; }

                /* Hosted Zone Details as in Screenshot */
                .hz-details-container {
                    margin-bottom: 28px;
                }
                .hz-details-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px;
                }
                .hz-details-toggle {
                    background: none; border: none; font-size: 18px; font-weight: 700; color: #0f1111;
                    display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 0;
                }
                .hz-details-toggle:hover { color: #0073bb; }

                .hz-details-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1.4fr;
                    column-gap: 32px;
                    row-gap: 20px;
                    padding-bottom: 8px;
                }
                .hz-detail-item {
                    margin-bottom: 18px;
                }
                .hz-detail-label {
                    font-size: 13px; font-weight: 700; color: #0f1111; margin-bottom: 4px;
                }
                .hz-detail-val {
                    font-size: 13px; color: #0f1111; font-weight: 400; word-break: break-word;
                }

                /* Tabs Bar */
                .zone-tabs-container {
                    border-bottom: 1px solid #d5d9d9; display: flex; gap: 28px; margin-bottom: 20px;
                }
                .zone-tab {
                    background: none; border: none; padding: 10px 0 12px 0; font-size: 14px;
                    color: #545b64; cursor: pointer; font-weight: 500; position: relative;
                }
                .zone-tab:hover { color: #0073bb; }
                .zone-tab.active {
                    color: #0073bb; font-weight: 700;
                }
                .zone-tab.active::after {
                    content: ""; position: absolute; bottom: -1px; left: 0; right: 0;
                    height: 3px; background: #0073bb;
                }

                /* Tab Content */
                .records-tab-header {
                    display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;
                }
                .records-tab-title {
                    font-size: 18px; font-weight: 700; color: #0f1111; display: flex; align-items: center; gap: 8px;
                }
                .records-tab-actions { display: flex; align-items: center; gap: 8px; }

                .records-subtext {
                    font-size: 13px; color: #545b64; margin-bottom: 16px; line-height: 1.4;
                }

                /* Filter Toolbar */
                .records-filter-toolbar {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px; gap: 12px; flex-wrap: wrap;
                }
                .records-filter-left { display: flex; align-items: center; gap: 10px; flex: 1; max-width: 800px; }
                .records-search-box {
                    position: relative; flex: 1; max-width: 440px;
                }
                .records-search-icon {
                    position: absolute; left: 10px; top: 50%; transform: translateY(-50%); color: #545b64;
                }
                .records-search-input {
                    width: 100%; border: 1px solid #aab7b8; border-radius: 2px;
                    padding: 6px 10px 6px 32px; font-size: 13px; color: #0f1111; background: #fff;
                }
                .records-search-input:focus {
                    outline: none; border-color: #0073bb; box-shadow: 0 0 0 1px #0073bb;
                }
                .filter-pill-select {
                    border: 1px solid #aab7b8; border-radius: 20px; padding: 5px 14px;
                    font-size: 13px; font-weight: 700; color: #0f1111; background: #fff; cursor: pointer;
                }

                .records-filter-right { display: flex; align-items: center; gap: 12px; font-size: 13px; color: #545b64; }
                .records-page-controls { display: flex; align-items: center; gap: 6px; }

                /* Alert Notice */
                .aws-alert-banner {
                    background: #fdf3d8; border: 1px solid #d48800; border-radius: 4px;
                    padding: 12px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
                    font-size: 13px; color: #333;
                }
                .aws-alert-banner.error {
                    background: #fdf0ef; border-color: #d13212; color: #0f1111;
                }

                /* Floating Toast */
                .aws-toast {
                    position: fixed; bottom: 50px; right: 24px; background: #161e2d; color: #fff;
                    padding: 10px 18px; border-radius: 6px; font-size: 13px; z-index: 2000;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.25); display: flex; align-items: center; gap: 8px;
                }

                /* Records Table */
                .records-table-container {
                    background: #fff; border: 1px solid #d5d9d9; border-radius: 4px; overflow-x: auto;
                }
                .aws-table {
                    width: 100%; border-collapse: collapse; font-size: 13px; table-layout: auto;
                }
                .aws-table th {
                    text-align: left; padding: 8px 12px; border-bottom: 1px solid #d5d9d9;
                    font-weight: 700; color: #0f1111; position: relative; white-space: nowrap;
                    background: #fafafa;
                }
                .aws-table th.sortable::after {
                    content: "▼"; font-size: 8px; margin-left: 6px; color: #545b64;
                }
                .aws-table td {
                    padding: 10px 12px; border-bottom: 1px solid #eaeded; vertical-align: top;
                    color: #0f1111; line-height: 1.5;
                }
                .aws-table tr:hover td { background: #f2f8fd; }
                
                /* Selection state matching AWS screenshot */
                .aws-table tr.selected td {
                    background: #f2f8fd;
                }
                .aws-table tr.selected td:first-child {
                    border-left: 3px solid #0073bb;
                }
                .aws-table tr.selected td {
                    border-top: 1px solid #0073bb;
                    border-bottom: 1px solid #0073bb;
                }

                .val-multiline {
                    font-family: inherit; white-space: pre-line; word-break: break-all;
                }

                /* Right Sidebar Section */
                .hz-sidebar-section {
                    width: 320px;
                    flex-shrink: 0;
                    border-left: 1px solid #eaeded;
                    padding: 24px 24px;
                    background: #ffffff;
                }
                .record-side-header {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px;
                }
                .record-side-title {
                    font-size: 16px; font-weight: 700; color: #0f1111; margin: 0;
                }
                .record-side-actions {
                    display: flex; align-items: center; gap: 8px; color: #545b64;
                }
                .record-side-item {
                    margin-bottom: 16px;
                }
                .record-side-label {
                    font-size: 12px; color: #545b64; font-weight: 500; margin-bottom: 4px;
                }
                .record-side-value {
                    font-size: 13px; font-weight: 400; color: #0f1111; word-break: break-all;
                }
                .record-side-value-line {
                    display: flex; align-items: flex-start; gap: 6px; margin-bottom: 4px; font-size: 13px;
                }
                .record-copy-icon-btn {
                    background: none; border: none; cursor: pointer; color: #0073bb; padding: 0;
                    display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px;
                }
                .record-copy-icon-btn:hover { color: #005a9e; }

                /* Modals */
                .modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;
                    z-index: 1000;
                }
                .modal-box {
                    background: #fff; width: 560px; max-width: 95vw; border-radius: 8px;
                    padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;
                }
                .modal-head {
                    display: flex; justify-content: space-between; align-items: center;
                    margin-bottom: 16px; border-bottom: 1px solid #d5d9d9; padding-bottom: 12px;
                }
                .modal-head h2 { font-size: 18px; font-weight: 700; margin: 0; }
                .modal-form-group { margin-bottom: 16px; }
                .modal-form-group label { display: block; font-weight: 700; font-size: 13px; margin-bottom: 6px; }
                .modal-form-group input, .modal-form-group select, .modal-form-group textarea {
                    width: 100%; border: 1px solid #aab7b8; border-radius: 2px;
                    padding: 6px 10px; font-size: 13px; box-sizing: border-box; background: #fff;
                }
                .modal-form-group input:focus, .modal-form-group select:focus, .modal-form-group textarea:focus {
                    border-color: #0073bb; outline: none; box-shadow: 0 0 0 1px #0073bb;
                }
                .modal-form-actions {
                    display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;
                    border-top: 1px solid #d5d9d9; padding-top: 16px;
                }
            `}</style>

            <div className="hz-page-wrapper">
                {/* Main Section */}
                <div className="hz-main-section">
                    {/* Notice Alert if present */}
                    {alertMessage && (
                        <div className="aws-alert-banner error">
                            <AlertCircle size={18} color="#d13212" style={{ flexShrink: 0 }} />
                            <span style={{ flex: 1 }}>{alertMessage}</span>
                            <button 
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555' }}
                                onClick={() => setAlertMessage(null)}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )}

                    {/* Toast Notification */}
                    {toastMessage && (
                        <div className="aws-toast">
                            <span>{toastMessage}</span>
                        </div>
                    )}

                    {/* ── Top Zone Header ── */}
                    <div className="zone-top-header">
                        <div className="zone-title-area">
                            <span className="zone-public-badge">
                                {zone?.zone_type === "PUBLIC" ? "Public" : zone?.zone_type || "Public"}
                            </span>
                            <h1 className="zone-heading">{zone?.name || "Loading..."}</h1>
                            <span className="zone-info-link" onClick={() => {}}>Info</span>
                        </div>
                        <div className="zone-top-actions">
                            <button className="aws-btn-secondary" onClick={() => setShowDeleteZoneModal(true)}>
                                Delete zone
                            </button>
                            <button className="aws-btn-secondary" onClick={() => showComingSoon("Test record")}>
                                Test record
                            </button>
                            <button className="aws-btn-secondary" onClick={() => showComingSoon("Configure query logging")}>
                                Configure query logging
                            </button>
                        </div>
                    </div>

                    {/* ── Hosted Zone Details (Exactly as in screenshot) ── */}
                    <div className="hz-details-container">
                        <div className="hz-details-header">
                            <button 
                                className="hz-details-toggle"
                                onClick={() => setDetailsOpen(!detailsOpen)}
                            >
                                <span style={{ fontSize: '11px' }}>{detailsOpen ? "▼" : "▶"}</span>
                                Hosted zone details
                            </button>
                            <button className="aws-btn-secondary" onClick={() => setShowEditModal(true)}>
                                Edit hosted zone
                            </button>
                        </div>

                        {detailsOpen && zone && (
                            <div className="hz-details-grid">
                                {/* Column 1 */}
                                <div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Hosted zone name</div>
                                        <div className="hz-detail-val">{zone.name}</div>
                                    </div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Hosted zone ID</div>
                                        <div className="hz-detail-val">{formattedZoneId}</div>
                                    </div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Description</div>
                                        <div className="hz-detail-val">{zone.description || "-"}</div>
                                    </div>
                                </div>

                                {/* Column 2 */}
                                <div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Query log</div>
                                        <div className="hz-detail-val">-</div>
                                    </div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Type</div>
                                        <div className="hz-detail-val">Public hosted zone</div>
                                    </div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Record count</div>
                                        <div className="hz-detail-val">{records.length}</div>
                                    </div>
                                </div>

                                {/* Column 3 */}
                                <div>
                                    <div className="hz-detail-item">
                                        <div className="hz-detail-label">Name servers</div>
                                        <div className="hz-detail-val" style={{ lineHeight: '1.6' }}>
                                            {nameServers.map((ns: string, idx: number) => (
                                                <div key={idx}>{ns.replace(/\.$/, "")}</div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Tabs Bar ── */}
                    <div className="zone-tabs-container">
                        <button 
                            className={`zone-tab ${activeTab === "records" ? "active" : ""}`}
                            onClick={() => setActiveTab("records")}
                        >
                            Records ({records.length})
                        </button>
                        <button 
                            className={`zone-tab ${activeTab === "recovery" ? "active" : ""}`}
                            onClick={() => setActiveTab("recovery")}
                        >
                            Accelerated recovery
                        </button>
                        <button 
                            className={`zone-tab ${activeTab === "dnssec" ? "active" : ""}`}
                            onClick={() => setActiveTab("dnssec")}
                        >
                            DNSSEC signing
                        </button>
                        <button 
                            className={`zone-tab ${activeTab === "tags" ? "active" : ""}`}
                            onClick={() => setActiveTab("tags")}
                        >
                            Hosted zone tags (0)
                        </button>
                    </div>

                    {/* ── TAB CONTENT ── */}
                    {activeTab === "records" && (
                        <div>
                            {/* Records Header */}
                            <div className="records-tab-header">
                                <div className="records-tab-title">
                                    <span>Records ({selectedRecords.length}/{records.length})</span>
                                    <span className="zone-info-link" onClick={() => {}}>Info</span>
                                </div>
                                <div className="records-tab-actions">
                                    <button className="aws-icon-btn" onClick={() => loadZoneAndRecords(search)} title="Refresh">
                                        <RefreshCw size={14} />
                                    </button>
                                    <button 
                                        className="aws-btn-plain" 
                                        disabled={selectedRecords.length === 0}
                                        onClick={handleDeleteSelectedRecords}
                                    >
                                        Delete record
                                    </button>
                                    <button className="aws-btn-secondary" onClick={() => showComingSoon("Import zone file")}>
                                        Import zone file
                                    </button>
                                    <button className="aws-btn-primary" onClick={() => setShowCreateModal(true)}>
                                        Create record
                                    </button>
                                </div>
                            </div>

                            {/* Notice Subtitle */}
                            <div className="records-subtext">
                                The following table lists the existing records in {zone?.name}. You can't delete the SOA record or the NS record named {zone?.name}.
                            </div>

                            {/* Filter Toolbar */}
                            <div className="records-filter-toolbar">
                                <form className="records-filter-left" onSubmit={handleSearch}>
                                    <div className="records-search-box">
                                        <Search className="records-search-icon" size={14} />
                                        <input 
                                            type="text"
                                            className="records-search-input"
                                            placeholder="Filter records by property or value"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                        />
                                    </div>
                                    <select 
                                        className="filter-pill-select"
                                        value={selectedTypeFilter}
                                        onChange={(e) => setSelectedTypeFilter(e.target.value)}
                                    >
                                        <option value="ALL">Type</option>
                                        {RECORD_TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                    <button 
                                        type="button" 
                                        className="filter-pill-select" 
                                        style={{ border: '1px solid #aab7b8', borderRadius: '20px' }}
                                        onClick={() => showComingSoon("Routing policy filter")}
                                    >
                                        Routing p... ▼
                                    </button>
                                    <button 
                                        type="button" 
                                        className="filter-pill-select" 
                                        style={{ border: '1px solid #aab7b8', borderRadius: '20px' }}
                                        onClick={() => showComingSoon("Alias filter")}
                                    >
                                        Alias ▼
                                    </button>
                                </form>

                                <div className="records-filter-right">
                                    <div className="records-page-controls">
                                        <span style={{ cursor: 'pointer' }}>&lt;</span>
                                        <span style={{ fontWeight: 700, color: '#0f1111' }}>1</span>
                                        <span style={{ cursor: 'pointer' }}>&gt;</span>
                                    </div>
                                    <Settings size={16} style={{ cursor: 'pointer' }} onClick={() => showComingSoon("Preferences")} />
                                </div>
                            </div>

                            {/* Records Table */}
                            <div className="records-table-container">
                                {loading ? (
                                    <div style={{ padding: "40px", textAlign: "center", color: "#545b64" }}>Loading records...</div>
                                ) : (
                                    <table className="aws-table">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '38px', textAlign: 'center' }}>
                                                    <input 
                                                        type="checkbox"
                                                        checked={filteredRecords.length > 0 && selectedRecords.length === filteredRecords.length}
                                                        onChange={toggleSelectAll}
                                                    />
                                                </th>
                                                <th className="sortable">Record name</th>
                                                <th className="sortable">Type</th>
                                                <th className="sortable">Routin...</th>
                                                <th className="sortable">Differ...</th>
                                                <th className="sortable">Alias</th>
                                                <th className="sortable">Value/Route traffic to</th>
                                                <th className="sortable">TTL (s...</th>
                                                <th className="sortable">Health ...</th>
                                                <th className="sortable">Evalua...</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRecords.length === 0 ? (
                                                <tr>
                                                    <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#545b64" }}>
                                                        No records found.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredRecords.map((record) => {
                                                    const isSelected = selectedRecords.includes(record.id);
                                                    return (
                                                        <tr 
                                                            key={record.id}
                                                            className={isSelected ? "selected" : ""}
                                                            onClick={() => handleRowClick(record)}
                                                            style={{ cursor: "pointer" }}
                                                        >
                                                            <td style={{ textAlign: "center" }} onClick={(e) => toggleSelectRecord(record, e)}>
                                                                <input 
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => {}} // handled by onClick
                                                                />
                                                            </td>
                                                            <td style={{ fontWeight: 400 }}>{record.name}</td>
                                                            <td>{record.record_type}</td>
                                                            <td>Simple</td>
                                                            <td>-</td>
                                                            <td>No</td>
                                                            <td className="val-multiline">{record.value}</td>
                                                            <td>{formatTTL(record.ttl)}</td>
                                                            <td>-</td>
                                                            <td>-</td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Accelerated recovery Tab */}
                    {activeTab === "recovery" && (
                        <div style={{ background: "#fff", padding: "32px", borderRadius: "4px", border: "1px solid #eaeded" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Accelerated recovery</h2>
                            <p style={{ color: "#545b64", marginBottom: "16px" }}>
                                Coming soon — Route 53 Application Recovery Controller helps you recover applications faster.
                            </p>
                        </div>
                    )}

                    {/* DNSSEC signing Tab */}
                    {activeTab === "dnssec" && (
                        <div style={{ background: "#fff", padding: "32px", borderRadius: "4px", border: "1px solid #eaeded" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>DNSSEC signing</h2>
                            <p style={{ color: "#545b64", marginBottom: "16px" }}>
                                Coming soon — DNSSEC signs your DNS records so that resolvers can verify authenticity.
                            </p>
                        </div>
                    )}

                    {/* Hosted zone tags Tab */}
                    {activeTab === "tags" && (
                        <div style={{ background: "#fff", padding: "32px", borderRadius: "4px", border: "1px solid #eaeded" }}>
                            <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "8px" }}>Hosted zone tags (0)</h2>
                            <p style={{ color: "#545b64", marginBottom: "16px" }}>
                                Coming soon — Manage resource tags for your Route 53 hosted zones.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Record Details Sidebar (matching screenshot) ── */}
                {sidePanelOpen && activeRecord && (
                    <aside className="hz-sidebar-section">
                        <div className="record-side-header">
                            <h3 className="record-side-title">Record details</h3>
                            <div className="record-side-actions">
                                <Settings size={16} style={{ cursor: 'pointer' }} onClick={() => showComingSoon("Preferences")} />
                                <button 
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#545b64', display: 'flex', alignItems: 'center', padding: 0 }}
                                    onClick={() => setSidePanelOpen(false)}
                                    title="Close record details"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div style={{ marginBottom: "18px" }}>
                            <button 
                                className="aws-btn-secondary"
                                onClick={() => {
                                    setEditRecordValue(activeRecord.value);
                                    setEditRecordTtl(activeRecord.ttl);
                                    setShowEditRecordModal(true);
                                }}
                            >
                                Edit record
                            </button>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">Record name</div>
                            <div className="record-side-value-line">
                                <button 
                                    className="record-copy-icon-btn" 
                                    title="Copy record name"
                                    onClick={() => copyField(activeRecord.name, `name-${activeRecord.id}`)}
                                >
                                    {copiedField === `name-${activeRecord.id}` ? <Check size={14} color="#1d8102" /> : <Copy size={14} />}
                                </button>
                                <span>{activeRecord.name}</span>
                            </div>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">Record type</div>
                            <div className="record-side-value">{activeRecord.record_type}</div>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">Value</div>
                            <div>
                                {activeRecord.value.split('\n').map((valLine: string, idx: number) => (
                                    <div key={idx} className="record-side-value-line">
                                        <button 
                                            className="record-copy-icon-btn" 
                                            title="Copy value line"
                                            onClick={() => copyField(valLine, `val-${activeRecord.id}-${idx}`)}
                                        >
                                            {copiedField === `val-${activeRecord.id}-${idx}` ? <Check size={14} color="#1d8102" /> : <Copy size={14} />}
                                        </button>
                                        <span>{valLine}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">Alias</div>
                            <div className="record-side-value">No</div>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">TTL (seconds)</div>
                            <div className="record-side-value">{formatTTL(activeRecord.ttl)}</div>
                        </div>

                        <div className="record-side-item">
                            <div className="record-side-label">Routing policy</div>
                            <div className="record-side-value">Simple</div>
                        </div>
                    </aside>
                )}
            </div>

            {/* ── MODALS ── */}

            {/* Create Record Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-head">
                            <h2>Quick create record</h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowCreateModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRecord}>
                            {createError && (
                                <div className="aws-alert-banner error" style={{ marginBottom: "16px" }}>
                                    <AlertCircle size={16} color="#d13212" />
                                    <span>{createError}</span>
                                </div>
                            )}

                            <div className="modal-form-group">
                                <label>Record name</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <input 
                                        type="text" 
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        placeholder="subdomain"
                                    />
                                    <span style={{ fontSize: '13px', color: '#545b64', whiteSpace: 'nowrap' }}>.{zone?.name}</span>
                                </div>
                                <div style={{ fontSize: '11px', color: '#545b64', marginTop: '4px' }}>
                                    Leave blank to create a record at the zone apex.
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label>Record type</label>
                                <select 
                                    value={newType}
                                    onChange={(e) => setNewType(e.target.value)}
                                >
                                    <option value="A">A - Routes traffic to an IPv4 address</option>
                                    <option value="AAAA">AAAA - Routes traffic to an IPv6 address</option>
                                    <option value="CNAME">CNAME - Routes traffic to another domain name</option>
                                    <option value="MX">MX - Specifies mail servers</option>
                                    <option value="TXT">TXT - Text record (e.g., SPF, verification)</option>
                                    <option value="PTR">PTR - Maps an IP address to a domain name</option>
                                    <option value="SRV">SRV - Specifies location of services</option>
                                    <option value="CAA">CAA - Specifies certificate authorities</option>
                                </select>
                            </div>

                            <div className="modal-form-group">
                                <label>Value/Route traffic to</label>
                                <textarea 
                                    style={{ height: '80px', resize: 'vertical' }}
                                    value={newValue}
                                    onChange={(e) => setNewValue(e.target.value)}
                                    placeholder={newType === "A" ? "192.0.2.235" : newType === "CNAME" ? "target.example.com" : "Value"}
                                    required
                                />
                                <div style={{ fontSize: '11px', color: '#545b64', marginTop: '4px' }}>
                                    Enter multiple values on separate lines.
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label>TTL (seconds)</label>
                                <input 
                                    type="number"
                                    value={newTtl}
                                    onChange={(e) => setNewTtl(Number(e.target.value))}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="modal-form-actions">
                                <button type="button" className="aws-btn-plain" onClick={() => setShowCreateModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="aws-btn-primary" disabled={creating}>
                                    {creating ? "Creating..." : "Create records"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Record Modal */}
            {showEditRecordModal && activeRecord && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-head">
                            <h2>Edit record: {activeRecord.name}</h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditRecordModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveRecordEdit}>
                            {editRecordError && (
                                <div className="aws-alert-banner error" style={{ marginBottom: "16px" }}>
                                    <AlertCircle size={16} color="#d13212" />
                                    <span>{editRecordError}</span>
                                </div>
                            )}

                            <div className="modal-form-group">
                                <label>Record name</label>
                                <input type="text" value={activeRecord.name} disabled style={{ background: '#f2f3f3' }} />
                            </div>

                            <div className="modal-form-group">
                                <label>Record type</label>
                                <input type="text" value={activeRecord.record_type} disabled style={{ background: '#f2f3f3' }} />
                            </div>

                            <div className="modal-form-group">
                                <label>Value/Route traffic to</label>
                                <textarea 
                                    style={{ height: '90px', resize: 'vertical' }}
                                    value={editRecordValue}
                                    onChange={(e) => setEditRecordValue(e.target.value)}
                                    required
                                />
                                <div style={{ fontSize: '11px', color: '#545b64', marginTop: '4px' }}>
                                    Enter multiple values on separate lines.
                                </div>
                            </div>

                            <div className="modal-form-group">
                                <label>TTL (seconds)</label>
                                <input 
                                    type="number"
                                    value={editRecordTtl}
                                    onChange={(e) => setEditRecordTtl(Number(e.target.value))}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="modal-form-actions">
                                <button type="button" className="aws-btn-plain" onClick={() => setShowEditRecordModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="aws-btn-primary" disabled={savingRecordEdit}>
                                    {savingRecordEdit ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Hosted Zone Modal */}
            {showEditModal && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-head">
                            <h2>Edit hosted zone</h2>
                            <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowEditModal(false)}>
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveZoneEdit}>
                            <div className="modal-form-group">
                                <label>Domain name</label>
                                <input type="text" value={zone?.name} disabled style={{ background: '#f2f3f3' }} />
                            </div>
                            <div className="modal-form-group">
                                <label>Description / Comment</label>
                                <textarea 
                                    style={{ height: '70px', resize: 'vertical' }}
                                    value={editDesc}
                                    onChange={(e) => setEditDesc(e.target.value)}
                                />
                            </div>
                            <div className="modal-form-actions">
                                <button type="button" className="aws-btn-plain" onClick={() => setShowEditModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="aws-btn-primary" disabled={savingEdit}>
                                    {savingEdit ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Hosted Zone Modal matching screenshot */}
            {showDeleteZoneModal && (
                <div className="modal-overlay">
                    <div className="modal-box" style={{ width: "540px", borderRadius: "12px", padding: "24px 28px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                            <h2 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#0f1111" }}>
                                Delete hosted zone {zone?.name}?
                            </h2>
                            <button 
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#545b64", padding: 0 }} 
                                onClick={() => {
                                    setShowDeleteZoneModal(false);
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
                                    setShowDeleteZoneModal(false);
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
                                onClick={handleDeleteZone}
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
