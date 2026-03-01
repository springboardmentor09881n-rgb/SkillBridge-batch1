import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw, MessageSquare, Check, X } from 'lucide-react';
import { getNgoApplications, updateApplicationStatus } from '../../../services/api';
import './NgoApplications.css';

const NgoApplications = ({ onActivityRecord }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Mock data kept as reference in comments
    /*
    const mockApplications = [
        {
            id: 1,
            opportunityTitle: "Website Redesign for Local Shelter",
            volunteerName: "John Doe",
            appliedDate: "May 8, 2025",
            message: "I have 5 years of experience in web development and design. I've worked with several nonprofits before and would love to help improve your online presence.",
            tags: ["Web Development", "UI/UX Design"],
            status: "Pending"
        }
    ];
    */

    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApplications = async () => {
            setIsLoading(true);
            const result = await getNgoApplications();
            if (result.success) {
                setApplications(result.data || []);
            }
            setIsLoading(false);
        };
        fetchApplications();
    }, []);

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.volunteerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.opportunityTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusCount = (status) => {
        if (status === 'All') return applications.length;
        return applications.filter(app => app.status === status).length;
    };

    const handleStatusChange = async (appId, newStatus) => {
        const app = applications.find(a => a.id === appId);
        if (app) {
            const result = await updateApplicationStatus(appId, newStatus);
            if (result.success) {
                setApplications(applications.map(a =>
                    a.id === appId ? { ...a, status: newStatus } : a
                ));

                if (onActivityRecord) {
                    onActivityRecord(`${newStatus} application from ${app.volunteerName} for "${app.opportunityTitle}"`);
                }
            } else {
                alert(result.message || 'Failed to update status');
            }
        }
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
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="All">All Applications</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown size={16} className="dropdown-icon" />
                </div>

                <button className="reset-btn" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                    <RotateCcw size={16} />
                    Reset
                </button>
            </div>

            <div className="status-tabs-container">
                {['All', 'Pending', 'Accepted', 'Rejected'].map(status => (
                    <button
                        key={status}
                        className={`status-tab ${statusFilter === status ? 'active' : ''}`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status} ({getStatusCount(status)})
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
                                        {app.volunteerName} • Applied {app.appliedDate}
                                    </p>
                                </div>
                                <span className={`status-badge ${app.status.toLowerCase()}`}>
                                    {app.status}
                                </span>
                            </div>

                            <div className="message-bubble bg-[var(--bg-main)] p-4 rounded-xl border border-[var(--border-color)]">
                                <p className="text-[var(--text-secondary)]">{app.message}</p>
                            </div>

                            <div className="card-tags flex gap-2">
                                {app.tags.map((tag, idx) => (
                                    <span key={idx} className="app-tag bg-[var(--color-primary-light)] text-[var(--color-primary)] px-3 py-1 rounded-md text-xs font-semibold">{tag}</span>
                                ))}
                            </div>

                            <div className="card-footer flex justify-between items-center mt-2">
                                <div className="action-buttons flex gap-3">
                                    {app.status === 'Pending' && (
                                        <>
                                            <button className="btn-accept bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'Accepted')}>
                                                Accept
                                            </button>
                                            <button className="btn-reject bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'Rejected')}>
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    {app.status !== 'Pending' && (
                                        <button className="btn-revert bg-[var(--bg-surface)] text-[var(--text-muted)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-bold hover:bg-[var(--bg-main)] transition-colors" onClick={() => handleStatusChange(app.id, 'Pending')}>
                                            Revert to Pending
                                        </button>
                                    )}
                                </div>
                                <button className="btn-message flex items-center gap-2 bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-color)] px-5 py-2 rounded-lg font-semibold hover:bg-[var(--bg-main)] transition-colors">
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
