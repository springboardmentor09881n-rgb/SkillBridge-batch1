import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Clock, ChevronRight, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { getNgoOpportunities } from '../../../services/api';

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

    useEffect(() => {
        const fetchOpportunities = async () => {
            setIsLoading(true);
            const result = await getNgoOpportunities();
            if (result.success) {
                setOpportunities(result.data || []);
            }
            setIsLoading(false);
        };
        fetchOpportunities();
    }, []);

    const [activeFilter, setActiveFilter] = useState('All');
    const [sortBy, setSortBy] = useState('All Opportunities');

    // Edit functionality state
    const [editingOppId, setEditingOppId] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    const handleEditClick = (opp) => {
        setEditingOppId(opp.id);
        setEditFormData({ ...opp, tagsString: opp.tags.join(', ') });
    };

    const handleEditSave = () => {
        // Update local state mock
        setOpportunities(opportunities.map(opp =>
            opp.id === editingOppId
                ? {
                    ...opp,
                    ...editFormData,
                    tags: editFormData.tagsString.split(',').map(t => t.trim()).filter(Boolean)
                }
                : opp
        ));
        setEditingOppId(null);
    };

    const filteredOpportunities = opportunities.filter(opp => {
        if (activeFilter === 'All') return true;
        return opp.status === activeFilter;
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
                <div className="opps-filter-tabs">
                    <div className={`filter-tab ${activeFilter === 'All' ? 'active' : ''}`} onClick={() => setActiveFilter('All')}>
                        All ({opportunities.length})
                    </div>
                    <div className={`filter-tab ${activeFilter === 'Open' ? 'active' : ''}`} onClick={() => setActiveFilter('Open')}>
                        Open ({opportunities.filter(o => o.status === 'Open').length})
                    </div>
                    <div className={`filter-tab ${activeFilter === 'Closed' ? 'active' : ''}`} onClick={() => setActiveFilter('Closed')}>
                        Closed ({opportunities.filter(o => o.status === 'Closed').length})
                    </div>
                </div>

                <div className="opps-filter-dropdown" style={{ padding: '0', position: 'relative' }}>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', padding: '0.5rem 2rem 0.5rem 1rem', cursor: 'pointer', appearance: 'none', width: '100%', fontWeight: '600', color: '#334155' }}
                    >
                        <option>All Opportunities</option>
                        <option>Most Recent</option>
                        <option>Oldest</option>
                    </select>
                    <ChevronDown size={16} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b' }} />
                </div>
            </div>

            <div className="opps-cards-list">
                {filteredOpportunities.length > 0 ? filteredOpportunities.map(opp => (
                    <div key={opp.id} className="ngo-opp-card">
                        <div className="ngo-opp-header">
                            <div className="ngo-opp-title-group">
                                <h3>{opp.title}</h3>
                                <span className="ngo-id-label">NGO ID: {opp.ngoId}</span>
                            </div>
                            <span className="opp-status-badge">{opp.status}</span>
                        </div>

                        <p className="ngo-opp-desc">{opp.description}</p>

                        <div className="ngo-opp-tags">
                            {opp.tags.map((tag, idx) => (
                                <span key={idx} className="ngo-opp-tag">{tag}</span>
                            ))}
                        </div>

                        <div className="ngo-opp-meta">
                            <div className="meta-item">
                                <MapPin size={14} className="meta-icon" />
                                <span>{opp.location}</span>
                            </div>
                            <div className="meta-item">
                                <Clock size={14} className="meta-icon" />
                                <span>{opp.duration}</span>
                            </div>
                        </div>

                        <div className="ngo-opp-footer">
                            <button
                                onClick={() => navigate('/ngo/opportunities/details')}
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
                                {opp.status === 'Open' && (
                                    <button
                                        className="close-opp-btn"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to close this opportunity?')) {
                                                setOpportunities(opportunities.map(o => o.id === opp.id ? { ...o, status: 'Closed' } : o));
                                            }
                                        }}
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
                    </div>
                )) : (
                    <div className="empty-state text-center py-8 text-slate-500">
                        <p>No opportunities found for this status.</p>
                    </div>
                )}
            </div>

            {/* Edit Modal Overlay */}
            {editingOppId && createPortal(
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: 'white', borderRadius: '12px', padding: '32px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Edit Opportunity</h2>
                            <button onClick={() => setEditingOppId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Title</label>
                                <input type="text" value={editFormData.title} onChange={e => setEditFormData({ ...editFormData, title: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Description</label>
                                <textarea value={editFormData.description} onChange={e => setEditFormData({ ...editFormData, description: e.target.value })} rows={3} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }} />
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Required Skills (comma separated)</label>
                                <input type="text" value={editFormData.tagsString} onChange={e => setEditFormData({ ...editFormData, tagsString: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                            </div>

                            <div style={{ display: 'flex', gap: '16px' }}>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Duration</label>
                                    <input type="text" value={editFormData.duration} onChange={e => setEditFormData({ ...editFormData, duration: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Location</label>
                                    <input type="text" value={editFormData.location} onChange={e => setEditFormData({ ...editFormData, location: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Status</label>
                                <select value={editFormData.status} onChange={e => setEditFormData({ ...editFormData, status: e.target.value })} style={{ padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', backgroundColor: 'white' }}>
                                    <option>Open</option>
                                    <option>Closed</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                            <button onClick={() => setEditingOppId(null)} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: 'white', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={handleEditSave} style={{ padding: '8px 16px', borderRadius: '6px', backgroundColor: '#3b82f6', border: 'none', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Save Changes</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default NgoOpportunities;

