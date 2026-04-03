import React, { useState, useEffect } from 'react';
import { Sparkles, Maximize2, Minimize2, Check, X as RejectIcon, User, Briefcase, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MatchSuggestionsPopup.css';

import { getAIRecommendations, applyForOpportunity, sendMessage } from '../services/api';

const MatchSuggestionsPopup = ({ onSuccess }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [hasOpportunities, setHasOpportunities] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [dismissedMatches, setDismissedMatches] = useState(new Set());
    const [acceptedMatches, setAcceptedMatches] = useState(new Set());

    // User data
    const isNgo = user?.iam?.toLowerCase() === 'ngo';
    const userSkills = (() => {
        const rawSkills = user?.skills;
        if (!rawSkills) return [];
        if (Array.isArray(rawSkills)) return rawSkills;
        if (typeof rawSkills === 'string') {
            try {
                const parsed = JSON.parse(rawSkills);
                if (Array.isArray(parsed)) return parsed;
            } catch {
                return rawSkills.split(',').map(s => s.trim()).filter(Boolean);
            }
        }
        return [];
    })();

    const fetchMatches = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const result = await getAIRecommendations(userSkills, user.iam, user.id || user._id || user.userId);
            if (result.success && result.matches) {
                setSuggestions(result.matches);
                setHasOpportunities(result.hasOpportunities ?? true);
            } else if (result.success && Array.isArray(result.data)) {
                // Fallback for old API format if needed (though we updated it)
                setSuggestions(result.data);
            }
        } catch (err) {
            console.error('[SmartMatch] Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load matching data
    useEffect(() => {
        fetchMatches();

        // Listen for remote open events
        const handleRemoteOpen = () => {
            setIsOpen(true);
            fetchMatches();
        };
        window.addEventListener('open-smart-match', handleRemoteOpen);
        return () => window.removeEventListener('open-smart-match', handleRemoteOpen);
    }, [user?.id]);

    const visibleSuggestions = suggestions.filter(
        s => !dismissedMatches.has(s.id) && !acceptedMatches.has(s.id)
    );

    const handleAccept = async (e, match) => {
        e.stopPropagation();
        
        // If not already applied/connected, perform the action
        if (!match.isApplied) {
            try {
                // Optimistic UI Update: Mark as applied immediately in local state
                setSuggestions(prev => prev.map(s => 
                    s.id === match.id ? { ...s, isApplied: true, applicationStatus: 'pending' } : s
                ));

                if (isNgo) {
                    // NGO: Send invite message including the specific match title
                    const projectTitle = match.matchedOpportunityTitle || "one of our projects";
                    const res = await sendMessage(
                        match.id, 
                        match.matchedOpportunityId, 
                        `Hi ${match.name}, I saw your profile on Smart Matches and I'd love for you to apply to our "${projectTitle}" opportunity!`
                    );
                    if (res.success && onSuccess) onSuccess();
                } else {
                    // Volunteer: Apply to the opportunity
                    const res = await applyForOpportunity(match.id, "Applied via Smart Match");
                    if (res.success) {
                        if (onSuccess) onSuccess(); // Trigger parent refresh
                    } else {
                        // Rollback if API fails
                        setSuggestions(prev => prev.map(s => 
                            s.id === match.id ? { ...s, isApplied: false } : s
                        ));
                        return;
                    }
                }
            } catch (err) {
                console.error('[SmartMatch] Action error:', err);
                // Rollback on error
                setSuggestions(prev => prev.map(s => 
                    s.id === match.id ? { ...s, isApplied: false } : s
                ));
            }
        } else {
            // If already applied, clicking 'Message' navigates to messages
            const targetTab = user?.iam === 'ngo' ? '/ngo/messages' : '/volunteer/messages';
            navigate(targetTab, { 
                state: { 
                    receiverId: isNgo ? match.id : (match.ngoId || match.id),
                    receiverName: isNgo ? match.name : (match.ngoName || match.title),
                    opportunityId: isNgo ? null : match.id
                } 
            });
            setIsOpen(false);
        }
    };

    const handleMessageOnly = (e, match) => {
        e.stopPropagation();
        const targetTab = user?.iam === 'ngo' ? '/ngo/messages' : '/volunteer/messages';
        navigate(targetTab, { 
            state: { 
                receiverId: isNgo ? match.id : (match.ngoId || match.id),
                receiverName: isNgo ? match.name : (match.ngoName || match.title),
                opportunityId: isNgo ? null : match.id
            } 
        });
        setIsOpen(false);
    };

    const handleDismiss = (e, id) => {
        e.stopPropagation();
        setDismissedMatches(prev => new Set([...prev, id]));
    };

    const togglePopup = () => {
        const nextState = !isOpen;
        setIsOpen(nextState);
        if (nextState) {
            setIsExpanded(false); // Reset expansion on close
            fetchMatches(); // Refresh matches whenever opened to capture new opportunities/profile changes
        }
    };

    const toggleExpand = (e) => {
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    // Chatbot bubble (collapsed state)
    if (!isOpen) {
        return (
            <button className="match-bot-bubble" onClick={togglePopup} title="Smart Matches">
                <div className="match-bubble-icon">
                    <Sparkles size={24} />
                </div>
                {/* Only show badge if we are not in an empty/onboarding state */}
                {visibleSuggestions.length > 0 && !(isNgo && !hasOpportunities) && (
                    <span className="match-bubble-badge">{visibleSuggestions.length}</span>
                )}
            </button>
        );
    }

    // Expanded / Opened state
    return (
        <div className={`match-popup ${isExpanded ? 'expanded' : ''}`}>
            {/* Header */}
            <div className="match-popup-header" onClick={toggleExpand}>
                <div className="match-header-title">
                    <Sparkles size={18} />
                    <span>Smart Matches</span>
                </div>
                <div className="match-header-actions">
                    <button className="match-action-btn" onClick={toggleExpand} title={isExpanded ? "Minimize" : "Expand"}>
                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                    <button className="match-action-btn close-btn" onClick={togglePopup} title="Close">
                        <RejectIcon size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="match-popup-content">
                {isLoading ? (
                    <div className="match-loading-state">
                        <div className="match-spinner"></div>
                        <p>Finding the best matches for you...</p>
                    </div>
                ) : (visibleSuggestions.length === 0 || (isNgo && !hasOpportunities)) ? (
                    <div className="match-empty-state">
                        <Sparkles size={32} strokeWidth={1.5} />
                        {isNgo ? (
                            !hasOpportunities ? (
                                <>
                                    <h4>Ready to Find Volunteers?</h4>
                                    <p>Post any opportunities to get smart matches</p>
                                    <button 
                                        className="match-btn match-accept profile-link-btn" 
                                        onClick={() => { navigate('/ngo/opportunities/createopportunities'); setIsOpen(false); }}
                                    >
                                        Post Opportunity
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h4>No matches found yet</h4>
                                    <p>Try refining your opportunity requirements or adding more details to attract the best volunteers!</p>
                                </>
                            )
                        ) : (
                            <>
                                <h4>No matches found yet</h4>
                                <p>{isNgo ? 'Add more specialized project tags to your opportunities to attract suitable volunteers!' : 'Add more skills to your profile to get personalized recommendations for volunteering opportunities!'}</p>
                                <button 
                                    className="match-btn match-accept profile-link-btn" 
                                    onClick={() => { navigate(isNgo ? '/ngo/profile' : '/volunteer/profile'); setIsOpen(false); }}
                                >
                                    Update Profile
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="match-list">
                        <p className="match-introText">Based on your {isNgo ? 'opportunity requirements' : 'skills & location'}:</p>
                        {visibleSuggestions.map(match => {
                            const score = match.matchScore || 0;
                            const scoreColor = score >= 60 ? '#10b981' : score >= 30 ? '#f59e0b' : '#ef4444';
                            return (
                            <div key={match.id} className="match-card">
                                <div className="match-card-header">
                                    <div className="match-card-icon">
                                        {isNgo ? <User size={18} /> : <Briefcase size={18} />}
                                    </div>
                                    <div className="match-header-right">
                                        <div className={`match-status-pill status-${match.isApplied ? (match.applicationStatus || 'pending') : 'none'}`}>
                                            {match.isApplied ? (match.applicationStatus ? match.applicationStatus.charAt(0).toUpperCase() + match.applicationStatus.slice(1) : 'Pending') : 'Not Applied'}
                                        </div>
                                        <div className="match-score" style={{ background: scoreColor }}>
                                            {score}% Match
                                        </div>
                                    </div>
                                </div>
                                <div className="match-card-body">
                                    <h5 className="match-title">{isNgo ? match.name : match.title}</h5>
                                    {isNgo && match.matchedOpportunityTitle && (
                                        <p className="match-matched-opp">
                                            Matches: <span className="opp-tag">"{match.matchedOpportunityTitle}"</span>
                                        </p>
                                    )}
                                    <p className="match-subtitle">{match.location || (isNgo ? 'Volunteer' : 'Opportunity')}</p>
                                    <div className="match-skills">
                                        {match.skills.map(skill => (
                                            <span key={skill} className="match-skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                </div>
                                 <div className="match-card-actions">
                                    <button 
                                        className="match-btn match-reject" 
                                        onClick={(e) => handleDismiss(e, match.id)}
                                    >
                                        <RejectIcon size={16} /> Skip
                                    </button>
                                    
                                    {/* Status moved to header */}

                                    <div className="match-action-group">
                                        <button 
                                            className="match-btn match-message-only"
                                            onClick={(e) => handleMessageOnly(e, match)}
                                            title="Send Message"
                                        >
                                            <MessageSquare size={16} />
                                        </button>
                                        <button 
                                            className={`match-btn match-accept ${match.isApplied ? 'already-applied' : ''}`}
                                            onClick={(e) => handleAccept(e, match)}
                                            disabled={match.isApplied && isNgo} // NGOs don't need to "Connect" again if already applied
                                        >
                                            <Check size={16} /> {match.isApplied ? 'Message' : 'Connect'}
                                        </button>
                                    </div>
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
