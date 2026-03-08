import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw, MessageSquare, Check, X } from 'lucide-react';
import { getNgoApplications, updateApplicationStatus } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import './NgoApplications.css';

const NgoApplications = ({ onActivityRecord }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            const result = await getNgoApplications();
            if (result.success) {
                // Parse volunteerSkills if it comes as a string (JSONB from DB)
                const apps = (result.data || []).map(app => ({
                    ...app,
                    volunteerSkills: Array.isArray(app.volunteerSkills)
                        ? app.volunteerSkills
                        : (() => { try { return JSON.parse(app.volunteerSkills || '[]'); } catch { return []; } })()
                }));
                setApplications(apps);
            }
            setIsLoading(false);
        };
        fetchApplications();
    }, []);

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.volunteerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.opportunityTitle?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusCount = (status) => {
        if (status === 'All') return applications.length;
        return applications.filter(app => app.status?.toLowerCase() === status.toLowerCase()).length;
    };

    const handleStatusChange = async (appId, newStatus) => {
        const app = applications.find(a => a.id === appId);
        if (!app) return;

        const result = await updateApplicationStatus(appId, newStatus);
        if (result.success) {
            // Use functional updater to avoid stale closure
            setApplications(prev => prev.map(a =>
                a.id === appId ? { ...a, status: newStatus } : a
            ));

            if (onActivityRecord) {
                onActivityRecord(`${newStatus} application from ${app.volunteerName} for "${app.opportunityTitle}"`);
            }
        } else {
            console.error('updateApplicationStatus failed:', result.message);
            alert(result.message || 'Failed to update status. Check if backend is running.');
        }
    };

    const navigate = useNavigate();

    const handleMessageVolunteer = (app) => {
        navigate('/ngo/messages', { state: { receiverId: app.volunteerId, opportunityId: app.opportunityId } });
    };

    return (
        <div className="applications-view transition-colors duration-300">
            <div className="apps-header mb-6">
                <h1 className="text-[var(--text-primary)]">Applications</h1>
                <p className="text-[var(--text-muted)]">Manage volunteer applications for your opportunities</p>
            </div>

            <div className="apps-controls-card premium-card flex gap-4 p-4 items-center mb-6">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search volunteers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-dropdown">
                    <select
                        className="premium-dropdown"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Applications</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <button className="reset-btn" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                    <RotateCcw size={16} />
                    Reset
                </button>
            </div>

            <div className="status-tabs-container">
                {['All', 'pending', 'accepted', 'rejected'].map(status => (
                    <button
                        key={status}
                        className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({getStatusCount(status)})
                    </button>
                ))}
            </div>

            <div className="applications-list flex flex-col gap-6">
                {filteredApplications.length > 0 ? (
                    filteredApplications.map(app => (
                        <div key={app.id} className="application-card premium-card p-6 flex flex-col gap-4">
                            <div className="card-header flex justify-between items-start">
                                <div className="title-section">
                                    <h3 className="text-[var(--text-primary)]">{app.opportunityTitle}</h3>
                                    <p className="applicant-info text-[var(--text-muted)]">
                                        {app.volunteerName} • Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                </div>
                                <span className={`status-badge ${app.status?.toLowerCase() || 'pending'}`}>
                                    {app.status || 'Pending'}
                                </span>
                            </div>

                            <div className="message-bubble bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                                <p className="text-[var(--text-secondary)]">{app.message || 'No message provided.'}</p>
                            </div>

                            <div className="card-tags flex gap-2">
                                {app.volunteerSkills && (Array.isArray(app.volunteerSkills) ? app.volunteerSkills : JSON.parse(app.volunteerSkills || '[]')).map((tag, idx) => (
                                    <span key={idx} className="app-tag bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-md text-xs font-semibold">{tag}</span>
                                ))}
                            </div>

                            <div className="card-footer flex justify-between items-center mt-2">
                                <div className="action-buttons flex gap-3">
                                    {app.status === 'pending' && (
                                        <>
                                            <button className="btn-accept bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'accepted')}>
                                                Accept
                                            </button>
                                            <button className="btn-reject bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'rejected')}>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {app.status !== 'pending' && (
                                        <button className="btn-revert bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'pending')}>
                                            Revert to Pending
                                        </button>
                                    )}
                                </div>
                                <button
                                    className="btn-message flex items-center gap-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-semibold hover:bg-[var(--bg-main)] transition-colors"
                                    onClick={() => handleMessageVolunteer(app)}
                                >
                                    <MessageSquare size={16} />
                                    Message
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state text-center py-12 text-[var(--text-muted)]">
                        <p>No applications found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NgoApplications;
