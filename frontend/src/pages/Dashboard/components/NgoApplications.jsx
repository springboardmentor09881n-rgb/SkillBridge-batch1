import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw, MessageSquare, Check, X } from 'lucide-react';
import { getNgoApplications, updateApplicationStatus } from '../../../services/api';
import { useNavigate } from 'react-router-dom';
import Skeleton from './Skeleton';
import { motion } from 'framer-motion';
import Select from '../../../components/common/Select';
import './NgoApplications.css';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

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

    console.log('[DEBUG Filter] applications length:', applications.length, 'statusFilter:', statusFilter, 'searchTerm:', searchTerm);
    const filteredApplications = applications.filter(app => {
        const matchesSearch = 
            (app.volunteerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (app.opportunityTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || app.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });
    console.log('[DEBUG Filter] filteredApplications length:', filteredApplications.length);

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
        navigate('/ngo/messages', { 
            state: { 
                receiverId: app.volunteerId, 
                receiverName: app.volunteerName,
                opportunityId: app.opportunityId 
            } 
        });
    };

    return (
        <div className="applications-view transition-colors duration-300">
            <div className="apps-header mb-6">
                <h1 className="text-[var(--text-primary)] font-bold text-2xl">Applications</h1>
                <p className="text-[var(--text-muted)] text-sm">Manage volunteer applications for your opportunities</p>
            </div>

            <div className="apps-controls-card premium-card flex gap-4 p-4 items-center mb-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm">
                <div className="search-box flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 w-full max-w-md">
                    <Search size={18} className="text-slate-400" />
                    <input
                        type="text"
                        className="bg-transparent border-none outline-none text-sm w-full text-[var(--text-primary)]"
                        placeholder="Search volunteers or opportunities..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <Select
                    id="status-filter"
                    className="premium-dropdown bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    wrapperClassName="filter-dropdown"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    options={[
                        { value: 'All', label: 'All Statuses' },
                        { value: 'pending', label: 'Pending Only' },
                        { value: 'accepted', label: 'Accepted Only' },
                        { value: 'rejected', label: 'Rejected Only' }
                    ]}
                />

                <button className="reset-btn flex items-center gap-1 text-slate-500 hover:text-slate-700 text-sm font-medium" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>

            <div className="status-tabs-container flex gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-2">
                {['All', 'pending', 'accepted', 'rejected'].map(status => (
                    <button
                        key={status}
                        className={`status-tab px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                            statusFilter === status 
                            ? 'bg-[var(--color-primary)] text-white shadow-sm' 
                            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        onClick={() => setStatusFilter(status)}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)} ({getStatusCount(status)})
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="applications-list flex flex-col gap-6">
                    {[1, 2, 3].map((_, idx) => <Skeleton.Card key={idx} />)}
                </div>
            ) : (
                <div className="applications-list flex flex-col gap-6">
                    {filteredApplications.length > 0 ? (
                        filteredApplications.map(app => (
                            <motion.div 
                                key={app.id} 
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                className="application-card premium-card p-6 flex flex-col gap-4 hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl"
                            >
                                <div className="card-header flex justify-between items-start">
                                    <div className="title-section">
                                        <h3 className="text-[var(--text-primary)] font-bold text-lg">{app.opportunityTitle}</h3>
                                        <p className="applicant-info text-[var(--text-muted)] text-sm">
                                            {app.volunteerName} • Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                    <span className={`status-badge px-3 py-1 rounded-full text-xs font-bold ${
                                        app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                        app.status === 'rejected' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                    }`}>
                                        {app.status || 'Pending'}
                                    </span>
                                </div>

                                <div className="message-bubble bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <p className="text-[var(--text-secondary)] text-sm">{app.message || 'No message provided.'}</p>
                                </div>

                                <div className="card-tags flex gap-2 flex-wrap">
                                    {app.volunteerSkills && (Array.isArray(app.volunteerSkills) ? app.volunteerSkills : JSON.parse(app.volunteerSkills || '[]')).map((tag, idx) => (
                                        <span key={idx} className="app-tag bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-md text-xs font-semibold">{tag}</span>
                                    ))}
                                </div>

                                <div className="card-footer flex justify-between items-center mt-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                                    <div className="action-buttons flex gap-3">
                                        {app.status === 'pending' && (
                                            <>
                                                <button className="btn-accept bg-emerald-500 text-white border border-emerald-600 px-5 py-2 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-sm text-sm" onClick={() => handleStatusChange(app.id, 'accepted')}>
                                                    Accept
                                                </button>
                                                <button className="btn-reject bg-rose-500 text-white border border-rose-600 px-5 py-2 rounded-lg font-bold hover:bg-rose-600 transition-colors shadow-sm text-sm" onClick={() => handleStatusChange(app.id, 'rejected')}>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {app.status !== 'pending' && (
                                            <button className="btn-revert bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-5 py-2 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors shadow-sm text-sm" onClick={() => handleStatusChange(app.id, 'pending')}>
                                                Revert to Pending
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        className="btn-message flex items-center gap-2 bg-[var(--color-primary)] text-white px-5 py-2 rounded-lg font-semibold hover:bg-[var(--color-primary-hover)] transition-colors shadow-sm text-sm"
                                        onClick={() => handleMessageVolunteer(app)}
                                    >
                                        <MessageSquare size={16} />
                                        Message
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            key="empty-state"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="empty-state text-center py-16 flex flex-col items-center justify-center gap-4 premium-card glass border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900"
                        >
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 border border-slate-100 dark:border-slate-700">
                                <Search size={32} />
                            </div>
                            <div className="empty-state-text flex flex-col gap-1">
                                <h4 className="text-base font-bold text-[var(--text-primary)]">No Applications Found</h4>
                                <p className="text-sm text-slate-400 max-w-xs">We couldn't find any results matching your search terms or filter selection.</p>
                            </div>
                            <button className="reset-btn text-[var(--color-primary)] font-bold text-sm hover:underline" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
                                Clear Filters
                            </button>
                        </motion.div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NgoApplications;

