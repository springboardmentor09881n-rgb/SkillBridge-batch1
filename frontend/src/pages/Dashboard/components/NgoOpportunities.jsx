import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, ChevronRight, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Select from '../../../components/common/Select';
import { getNgoOpportunities, updateOpportunity } from '../../../services/api';

const NgoOpportunities = () => {
    const navigate = useNavigate();
    // Temporary mock data kept as reference in comments
    /*
    const mockOpportunities = [
        {
            id: 1,
            title: "Website Redesign for Local Shelter",
            ngoId: 2,
            description: "Help us redesign our website to improve our online presence and reach more potential adopters.",
            tags: ["Web Development", "UI/UX Design"],
            location: "New York, NY",
            duration: "2-3 weeks",
            status: "Open"
        },
        {
            id: 2,
            title: "Translation of Educational Materials",
            ngoId: 2,
            description: "Translate educational materials from English to Spanish, French, or Arabic to support our global literacy programs.",
            tags: ["Translation", "Language Skills"],
            location: "Remote",
            duration: "Ongoing",
            status: "Open"
        },
        {
            id: 3,
            title: "Fundraising Gala Event Coordinator",
            ngoId: 2,
            description: "Help plan and coordinate our annual fundraising gala to support children's medical research.",
            tags: ["Event Planning", "Marketing"],
            location: "Chicago, IL",
            duration: "3 months",
            status: "Open"
        }
    ];
    */

    const [opportunities, setOpportunities] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOpportunities = async () => {
        setIsLoading(true);
        const result = await getNgoOpportunities();
        if (result.success) {
            const opps = (result.data || []).map(opp => ({
                ...opp,
                requiredSkills: Array.isArray(opp.requiredSkills)
                    ? opp.requiredSkills
                    : (() => { try { return JSON.parse(opp.requiredSkills || '[]'); } catch { return []; } })()
            }));
            setOpportunities(opps);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchOpportunities();
    }, []);

    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('All Opportunities');
    const [isSortOpen, setIsSortOpen] = useState(false);

    // Edit functionality state
    const [editingOppId, setEditingOppId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const handleEditClick = (opp) => {
        setEditingOppId(opp.id);
        const tagsString = Array.isArray(opp.requiredSkills) ? opp.requiredSkills.join(', ') : '';
        setEditFormData({ ...opp, tagsString });
    };

    const handleEditSave = async () => {
        const payload = {
            ...editFormData,
            requiredSkills: editFormData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
        };
        delete payload.tagsString;

        const result = await updateOpportunity(editingOppId, payload);
        if (result.success) {
            setEditingOppId(null);
            fetchOpportunities(); // Refresh list
        } else {
            alert(result.message || 'Failed to save changes');
        }
    };

    const handleCloseOpportunity = async (oppId) => {
        if (window.confirm('Are you sure you want to close this opportunity?')) {
            const result = await updateOpportunity(oppId, { status: 'closed' });
            if (result.success) {
                fetchOpportunities(); // Refresh list
            } else {
                alert(result.message || 'Failed to close opportunity');
            }
        }
    };

    const filteredOpportunities = opportunities
        .filter(opp => {
            const status = opp.status || 'open';
            const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
            return matchesStatus;
        })
        .sort((a, b) => {
            if (sortBy === 'Most Recent') {
                return b.id - a.id; // Assuming higher id is more recent
            } else if (sortBy === 'Oldest') {
                return a.id - b.id;
            }
            return 0; // Default or 'All Opportunities'
        });

    return (
        <div className="ngo-opportunities-section">
            <div className="opps-header-top">
                <div className="opps-titles">
                    <h2>Your Opportunities</h2>
                    <p>Manage your volunteering opportunities</p>
                </div>
                <button className="create-opp-btn" onClick={() => navigate('/ngo/opportunities/createopportunities')}>
                    <Plus size={18} />
                    <span>Create New Opportunity</span>
                </button>
            </div>

            <div className="opps-filters-bar">
                <div className="ngo-filter-group">
                    <button
                        className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('all')}
                    >
                        All
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'open' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('open')}
                    >
                        Open
                    </button>
                    <button
                        className={`filter-btn ${statusFilter === 'closed' ? 'active' : ''}`}
                        onClick={() => setStatusFilter('closed')}
                    >
                        Closed
                    </button>
                </div>

                <div 
                    className="opps-filter-dropdown" 
                    style={{ 
                        position: 'relative', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '9999px', 
                        backgroundColor: 'var(--bg-surface)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onClick={() => setIsSortOpen(!isSortOpen)}
                >
                    <div style={{ padding: '0.4rem 2.2rem 0.4rem 1rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        {sortBy}
                    </div>
                    <ChevronDown 
                        size={14} 
                        style={{ 
                            position: 'absolute', 
                            right: '0.875rem', 
                            top: '50%', 
                            transform: isSortOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)', 
                            transition: 'transform 0.2s', 
                            color: 'var(--text-muted)' 
                        }} 
                    />

                    {isSortOpen && (
                        <div style={{
                            position: 'absolute',
                            top: '110%',
                            right: '0',
                            backgroundColor: 'var(--bg-surface)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                            zIndex: 50,
                            width: '180px',
                            overflow: 'hidden'
                        }}>
                            {['All Opportunities', 'Most Recent', 'Oldest'].map((opt) => (
                                <div 
                                    key={opt}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSortBy(opt);
                                        setIsSortOpen(false);
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: sortBy === opt ? 'var(--color-primary)' : 'var(--text-secondary)',
                                        backgroundColor: sortBy === opt ? 'var(--bg-main)' : 'transparent',
                                        cursor: 'pointer',
                                        transition: 'background-color 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--bg-main)'}
                                    onMouseLeave={(e) => { if (sortBy !== opt) e.target.style.backgroundColor = 'transparent'; }}
                                >
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="opps-cards-list">
                {filteredOpportunities.length > 0 ? filteredOpportunities.map(opp => (
                    <motion.div 
                        key={opp.id} 
                        className="ngo-opp-card"
                        whileHover={{ y: -4, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
                        style={{ cursor: 'pointer', transition: 'all 0.2s ease-out' }}
                    >
                        <div className="ngo-opp-header">
                            <div className="ngo-opp-title-group">
                                <h3>{opp.title}</h3>
                                <span className="ngo-id-label">NGO ID: {opp.ngoId || 'N/A'}</span>
                            </div>
                            <span className="opp-status-badge">{opp.status || 'open'}</span>
                        </div>

                        <p className="ngo-opp-desc">{opp.description}</p>

                        <div className="ngo-opp-tags">
                            {(Array.isArray(opp.requiredSkills) ? opp.requiredSkills : JSON.parse(opp.requiredSkills || '[]')).map((tag, idx) => (
                                <span key={idx} className="ngo-opp-tag">{tag}</span>
                            ))}
                        </div>

                        <div className="ngo-opp-meta">
                            <div className="meta-item">
                                <MapPin size={14} className="meta-icon" />
                                <span>{opp.location || 'Remote'}</span>
                            </div>
                            <div className="meta-item">
                                <Clock size={14} className="meta-icon" />
                                <span>{opp.duration || 'Flexible'}</span>
                            </div>
                        </div>

                        <div className="ngo-opp-footer">
                            <button
                                onClick={() => navigate('/ngo/opportunities/details', { state: { opportunity: opp } })}
                                className="view-details-link"
                            >
                                View details <ChevronRight size={14} />
                            </button>
                            <div className="foot-actions" style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    className="edit-opp-btn"
                                    onClick={() => handleEditClick(opp)}
                                >
                                    Edit
                                </button>
                                {opp.status === 'open' && (
                                    <button
                                        className="close-opp-btn"
                                        onClick={() => handleCloseOpportunity(opp.id)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            backgroundColor: '#fef2f2',
                                            color: '#dc2626',
                                            border: 'none',
                                            transition: 'background-color 0.2s'
                                        }}
                                    >
                                        Close
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )) : (
                    <div className="empty-state text-center py-8 text-[var(--text-muted)]">
                        <p>No opportunities found for this status.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {editingOppId && createPortal(
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Edit Opportunity</h2>
                            <button onClick={() => setEditingOppId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Title</label>
                                <input type="text" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '14px' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Description</label>
                                <textarea value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} rows={3} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Required Skills (comma separated)</label>
                                <input type="text" value={editFormData.tagsString} onChange={e => setEditFormData({ ...editFormData, tagsString: e.target.value })} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '14px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Duration</label>
                                    <input type="text" value={editFormData.duration} onChange={e => setEditFormData({ ...editFormData, duration: e.target.value })} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-secondary)' }}>Location</label>
                                    <input type="text" value={editFormData.location} onChange={e => setEditFormData({ ...editFormData, location: e.target.value })} style={{ padding: '10px 12px', border: '1px solid var(--border-color)', background: 'var(--bg-main)', color: 'var(--text-primary)', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>

                                <Select
                                    id="edit-status"
                                    label="Status"
                                    value={editFormData.status}
                                    onChange={e => setEditFormData({ ...editFormData, status: e.target.value })}
                                    options={[
                                        { value: 'open', label: 'Open' },
                                        { value: 'closed', label: 'Closed' }
                                    ]}
                                />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                            <button onClick={() => setEditingOppId(null)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleEditSave} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'var(--color-primary)', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NgoOpportunities;

