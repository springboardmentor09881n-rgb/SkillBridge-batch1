import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, X, Maximize2, Minimize2, X as RejectIcon, User, Briefcase, MessageSquare, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMatchSuggestions, interactWithMatch } from '../services/api';
import './MatchSuggestionsPopup.css';

const MatchSuggestionsPopup = () => {
    const { user }  = useAuth();
    const navigate  = useNavigate();

    const [isOpen, setIsOpen]         = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading]   = useState(false);

    // Track dismissed/accepted locally so UI stays responsive
    const [dismissed, setDismissed]   = useState(new Set());
    const [accepted, setAccepted]     = useState(new Set());

    const isNgo = user?.iam === 'ngo';

    // ── FETCH — runs on mount AND every time popup opens ────────
    const fetchMatches = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await getMatchSuggestions();
            if (res.success) {
                const formatted = res.data.map(item => ({
                    // common
                    id:          item.id,
                    name:        item.fullName,
                    matchScore:  item.match_score || 0,

                    // volunteer view
                    title:       item.title,
                    ngoId:       item.ngoId,
                    ngoName:     item.organizationName || 'NGO',
                    skills:      item.requiredSkills || [],

                    // ngo view
                    volunteerId:             item.id,
                    volSkills:               item.skills || [],
                    matchedOpportunityId:    item.matchedOpportunity?.id    || null,
                    matchedOpportunityTitle: item.matchedOpportunity?.title || null,
                }));
                setSuggestions(formatted);
                // Clear local dismissed/accepted — backend already excludes
                // interacted ones, so reset so new results show correctly
                setDismissed(new Set());
                setAccepted(new Set());
            }
        } catch (err) {
            console.error('Match fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Fetch once on mount so badge count is ready even before opening
  // ── Fetch once on mount ─────────────────────────────
useEffect(() => {
    fetchMatches();
}, [fetchMatches]);

// ── Refetch when popup opens ────────────────────────
useEffect(() => {
    if (isOpen) {
        fetchMatches();
    }
}, [isOpen, fetchMatches]);

// 🔥 Listen for profile updates
useEffect(() => {
    const handleProfileUpdate = () => {
        fetchMatches();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
        window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
}, [fetchMatches]);

// ✅ OUTSIDE useEffect
const visible = suggestions.filter(
    s => !dismissed.has(s.id) && !accepted.has(s.id)
);

    // ── CONNECT ──────────────────────────────────────────────────
    const handleConnect = async (e, match) => {
        e.stopPropagation();
        try {
            setAccepted(prev => new Set([...prev, match.id]));

            const interactId = isNgo ? match.matchedOpportunityId : match.id;
            if (interactId) await interactWithMatch(interactId, 'applied');

            const dest = isNgo ? '/ngo/messages' : '/volunteer/messages';

            if (isNgo) {
                navigate(dest, {
                    state: {
                        receiverId:    match.volunteerId,
                        opportunityId: match.matchedOpportunityId,
                        receiverName:  match.name,
                    }
                });
            } else {
                navigate(dest, {
                    state: {
                        receiverId:    match.ngoId,
                        opportunityId: match.id,
                        receiverName:  match.ngoName,
                    }
                });
            }

            setIsOpen(false);
            setIsExpanded(false);
        } catch (err) {
            console.error('Connect error:', err);
        }
    };

    // ── SKIP ─────────────────────────────────────────────────────
    const handleDismiss = async (e, match) => {
        e.stopPropagation();
        try {
            setDismissed(prev => new Set([...prev, match.id]));
            const interactId = isNgo ? match.matchedOpportunityId : match.id;
            if (interactId) await interactWithMatch(interactId, 'ignored');
        } catch (err) {
            console.error('Dismiss error:', err);
        }
    };

    const togglePopup  = () => {
        setIsOpen(prev => !prev);
        if (isOpen) setIsExpanded(false);
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    };

    // ── COLLAPSED BUBBLE ─────────────────────────────────────────
    if (!isOpen) {
        return (
            <button className="match-bot-bubble" onClick={togglePopup} title="Smart Matches">
                <div className="match-bubble-icon"><Sparkles size={24} /></div>
                {visible.length > 0 && (
                    <span className="match-bubble-badge">{visible.length}</span>
                )}
            </button>
        );
    }

    // ── POPUP ────────────────────────────────────────────────────
    return (
        <div className={`match-popup ${isExpanded ? 'expanded' : ''}`}>

            {/* HEADER */}
            <div className="match-popup-header">
                <div className="match-header-title">
                    <Sparkles size={18} />
                    <span>Smart Matches</span>
                    {visible.length > 0 && (
                        <span className="match-header-count">{visible.length}</span>
                    )}
                </div>
                <div className="match-header-actions">
                    <button
                        className="match-action-btn"
                        onClick={fetchMatches}
                        title="Refresh matches"
                    >
                        <RefreshCw size={14} className={isLoading ? 'spin' : ''} />
                    </button>
                    <button className="match-action-btn" onClick={toggleExpand} title="Expand">
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button className="match-action-btn close-btn" onClick={togglePopup}>
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* CONTENT — scrollable, shows all results */}
            <div className="match-popup-content">
                {isLoading ? (
                    <div className="match-loading">
                        <RefreshCw size={24} className="spin" />
                        <p>Finding matches...</p>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="match-empty-state">
                        <Sparkles size={32} strokeWidth={1.5} />
                        <h4>No new matches</h4>
                        <p>
                            Update your {isNgo ? 'opportunities' : 'skills & location'} to get better matches.
                        </p>
                        <button className="match-refresh-btn" onClick={fetchMatches}>
                            <RefreshCw size={14} /> Refresh
                        </button>
                    </div>
                ) : (
                    <div className="match-list">
                        <p className="match-introText">
                            Based on your {isNgo ? 'requirements' : 'skills & location'} — {visible.length} match{visible.length !== 1 ? 'es' : ''} found
                        </p>

                        {visible.map(match => {
                            const skills = isNgo ? match.volSkills : match.skills;
                            return (
                                <div key={match.id} className="match-card">

                                    <div className="match-card-header">
                                        <div className="match-card-icon">
                                            {isNgo ? <User size={18} /> : <Briefcase size={18} />}
                                        </div>
                                        <div className="match-score-wrap">
                                            {/* Score bar */}
                                            <div className="match-score-bar">
                                                <div
                                                    className="match-score-fill"
                                                    style={{ width: `${match.matchScore}%` }}
                                                />
                                            </div>
                                            <span className="match-score">{match.matchScore}% Match</span>
                                        </div>
                                    </div>

                                    <div className="match-card-body">
                                        <h5 className="match-title">
                                            {isNgo ? match.name : match.title}
                                        </h5>
                                        <p className="match-subtitle">
                                            {isNgo ? 'Volunteer' : match.ngoName}
                                        </p>

                                        {/* Which opportunity this volunteer matches */}
                                        {isNgo && match.matchedOpportunityTitle && (
                                            <p className="match-opportunity-label">
                                                🎯 For: {match.matchedOpportunityTitle}
                                            </p>
                                        )}

                                        {/* Skills */}
                                        {skills && skills.length > 0 && (
                                            <div className="match-skills">
                                                {skills.map((skill, i) => (
                                                    <span key={i} className="match-skill-tag">{skill}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="match-card-actions">
                                        <button
                                            className="match-btn match-reject"
                                            onClick={(e) => handleDismiss(e, match)}
                                        >
                                            <RejectIcon size={14} /> Skip
                                        </button>
                                        <button
                                            className="match-btn match-accept"
                                            onClick={(e) => handleConnect(e, match)}
                                        >
                                            <MessageSquare size={14} /> Connect
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchSuggestionsPopup;