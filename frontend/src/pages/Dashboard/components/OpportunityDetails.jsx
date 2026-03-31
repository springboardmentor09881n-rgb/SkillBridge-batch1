import React, { useState } from 'react';
import { ChevronLeft, MapPin, Clock, Users, Calendar, CheckCircle, X, MessageSquare } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { updateOpportunity } from '../../../services/api';
import './OpportunityDetails.css';

const OpportunityDetails = ({ appliedOpps = [], onApply = () => { } }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    const isNgo = user?.iam === 'ngo';
    const backRoute = isNgo ? '/ngo/opportunities' : '/volunteer/opportunities';

    const rawOpp = location.state?.opportunity;

    const normalizeSkills = (skills) => {
        if (!skills) return [];
        if (Array.isArray(skills)) return skills;
        try { return JSON.parse(skills); } catch { return []; }
    };

    const [oppData, setOppData] = useState(
        rawOpp
            ? {
                ...rawOpp,
                tags: normalizeSkills(rawOpp.requiredSkills),
                postedDate: rawOpp.createdAt
                    ? new Date(rawOpp.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                    })
                    : 'N/A',
            }
            : null
    );

    // ── Edit state ───────────────────────────────────────────────
    const [isEditing, setIsEditing]   = useState(false);
    const [editForm, setEditForm]     = useState({});
    const [isSaving, setIsSaving]     = useState(false);

    const handleEditClick = () => {
        setEditForm({
            title:       oppData.title,
            description: oppData.description,
            tagsString:  oppData.tags.join(', '),
            location:    oppData.location || '',
            duration:    oppData.duration || '',
            status:      oppData.status || 'open',
        });
        setIsEditing(true);
    };

    const handleEditSave = async () => {
        setIsSaving(true);
        const payload = {
            title:          editForm.title,
            description:    editForm.description,
            requiredSkills: editForm.tagsString.split(',').map(t => t.trim()).filter(Boolean),
            location:       editForm.location,
            duration:       editForm.duration,
            status:         editForm.status,
        };
        const result = await updateOpportunity(oppData.id, payload);
        setIsSaving(false);
        if (result.success) {
            setOppData(prev => ({ ...prev, ...payload, tags: payload.requiredSkills }));
            setIsEditing(false);
        } else {
            alert(result.message || 'Failed to save changes.');
        }
    };

    // ── Close state ──────────────────────────────────────────────
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [isClosing, setIsClosing]               = useState(false);

    const handleCloseOpp = async () => {
        setIsClosing(true);
        const result = await updateOpportunity(oppData.id, { status: 'closed' });
        setIsClosing(false);
        if (result.success) {
            setOppData(prev => ({ ...prev, status: 'closed' }));
            setShowCloseConfirm(false);
        } else {
            alert(result.message || 'Failed to close opportunity.');
        }
    };

    // ✅ NEW: Message NGO handler for volunteers
    // Navigates to messages tab passing the NGO's userId + opportunityId
    // MessagesPage reads this from location.state and auto-opens the chat
    const handleMessageNgo = () => {
        navigate('/volunteer/messages', {
            state: {
                receiverId:   oppData.ngoId,
                opportunityId: oppData.id,
                receiverName:  oppData.ngoName || 'NGO'
            }
        });
    };

    // ── Not found fallback ───────────────────────────────────────
    if (!oppData) {
        return (
            <div className="opportunity-details-page">
                <button onClick={() => navigate(backRoute)} className="opp-detail-back-btn">
                    <ChevronLeft size={16} /> Back to Opportunities
                </button>
                <div className="opp-detail-card" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p style={{ color: '#64748b' }}>Opportunity not found. Please go back and select one.</p>
                </div>
            </div>
        );
    }

    const hasApplied = appliedOpps.includes(oppData.id);
    const isOpen     = oppData.status === 'open';

    return (
        <div className="opportunity-details-page">
            <button onClick={() => navigate(backRoute)} className="opp-detail-back-btn">
                <ChevronLeft size={16} /> Back to Opportunities
            </button>

            {/* ── INLINE EDIT FORM ─────────────────────────────── */}
            {isEditing ? (
                <div className="opp-detail-card">
                    <div className="edit-form-header">
                        <h2 className="edit-form-title">Edit Opportunity</h2>
                        <button className="edit-form-close-btn" onClick={() => setIsEditing(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="edit-form-body">
                        <div className="edit-field">
                            <label>Title</label>
                            <input
                                type="text"
                                value={editForm.title}
                                onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                placeholder="Opportunity title"
                            />
                        </div>

                        <div className="edit-field">
                            <label>Description</label>
                            <textarea
                                value={editForm.description}
                                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                placeholder="Describe this opportunity..."
                            />
                        </div>

                        <div className="edit-field">
                            <label>Required Skills (comma separated)</label>
                            <input
                                type="text"
                                value={editForm.tagsString}
                                onChange={e => setEditForm({ ...editForm, tagsString: e.target.value })}
                                placeholder="e.g. React, Node.js, Design"
                            />
                        </div>

                        <div className="edit-form-row">
                            <div className="edit-field">
                                <label>Duration</label>
                                <input
                                    type="text"
                                    value={editForm.duration}
                                    onChange={e => setEditForm({ ...editForm, duration: e.target.value })}
                                    placeholder="e.g. 2 weeks"
                                />
                            </div>
                            <div className="edit-field">
                                <label>Location</label>
                                <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                                    placeholder="e.g. Remote"
                                />
                            </div>
                        </div>

                        <div className="edit-field">
                            <label>Status</label>
                            <select
                                value={editForm.status}
                                onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                            >
                                <option value="open">Open</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    <div className="edit-form-actions">
                        <button className="edit-cancel-btn" onClick={() => setIsEditing(false)}>
                            Cancel
                        </button>
                        <button className="edit-save-btn" onClick={handleEditSave} disabled={isSaving}>
                            {isSaving ? 'Saving…' : 'Save Changes'}
                        </button>
                    </div>
                </div>
            ) : (
                /* ── READ VIEW ───────────────────────────────────── */
                <div className="opp-detail-card">
                    <div className="opp-detail-header">
                        <h1 className="opp-detail-title">{oppData.title}</h1>
                        <div className="opp-detail-org">{oppData.ngoName || 'NGO Partner'}</div>
                        <div className="opp-detail-tags">
                            {oppData.tags.map((tag, idx) => (
                                <span key={idx} className="detail-tag">{tag}</span>
                            ))}
                        </div>
                    </div>

                    <div className="opp-detail-meta">
                        <div className="meta-item">
                            <MapPin size={18} className="meta-icon" />
                            <div><span>Location</span><br /><strong>{oppData.location || 'Not specified'}</strong></div>
                        </div>
                        <div className="meta-item">
                            <Clock size={18} className="meta-icon" />
                            <div><span>Duration</span><br /><strong>{oppData.duration || 'Flexible'}</strong></div>
                        </div>
                        <div className="meta-item">
                            <Users size={18} className="meta-icon" />
                            <div><span>Open Spots</span><br /><strong>{oppData.spots ? `${oppData.spots} Volunteers` : 'Open'}</strong></div>
                        </div>
                        <div className="meta-item">
                            <Calendar size={18} className="meta-icon" />
                            <div><span>Posted</span><br /><strong>{oppData.postedDate}</strong></div>
                        </div>
                    </div>

                    <div className="opp-detail-content">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <h2 className="content-section-title" style={{ margin: 0 }}>About the Opportunity</h2>
                            <span style={{
                                padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '700',
                                backgroundColor: isOpen ? '#dcfce7' : '#fee2e2',
                                color: isOpen ? '#166534' : '#991b1b',
                                textTransform: 'capitalize',
                            }}>
                                {oppData.status}
                            </span>
                        </div>
                        <p className="content-text">{oppData.description}</p>
                    </div>

                    {/* Inline Close Confirmation Banner */}
                    {showCloseConfirm && (
                        <div className="close-confirm-banner">
                            <p className="close-confirm-text">
                                Are you sure you want to close this opportunity? Volunteers will no longer be able to apply.
                            </p>
                            <div className="close-confirm-actions">
                                <button className="close-confirm-cancel" onClick={() => setShowCloseConfirm(false)}>
                                    Cancel
                                </button>
                                <button className="close-confirm-yes" onClick={handleCloseOpp} disabled={isClosing}>
                                    {isClosing ? 'Closing…' : 'Yes, Close It'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="opp-detail-footer">
                        {isNgo ? (
                            <>
                                <button className="btn-edit-opp" onClick={handleEditClick}>
                                    Edit Opportunity
                                </button>
                                {isOpen && !showCloseConfirm && (
                                    <button className="btn-close-opp" onClick={() => setShowCloseConfirm(true)}>
                                        Close Opportunity
                                    </button>
                                )}
                            </>
                        ) : (
                            // ── VOLUNTEER FOOTER ──────────────────────────────
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                {/* Apply button — unchanged */}
                                <button
                                    onClick={() => onApply(oppData.id, oppData.title)}
                                    disabled={hasApplied || !isOpen}
                                    className={`btn-apply-now ${hasApplied ? 'applied' : ''}`}
                                >
                                    {!isOpen ? 'Opportunity Closed'
                                        : hasApplied ? <><CheckCircle size={18} /> Applied</>
                                            : 'Apply Now'}
                                </button>

                                {/* ✅ NEW: Message NGO button — only shown when opp is open */}
                                {isOpen && oppData.ngoId && (
                                    <button
                                        onClick={handleMessageNgo}
                                        className="btn-message-ngo"
                                    >
                                        <MessageSquare size={16} />
                                        Message NGO
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OpportunityDetails;