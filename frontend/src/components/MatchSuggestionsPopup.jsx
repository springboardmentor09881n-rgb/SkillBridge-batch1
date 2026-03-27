import React, { useState } from 'react';
import { Sparkles, X, Maximize2, Minimize2, Check, X as RejectIcon, User, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MatchSuggestionsPopup.css';

const mockOpportunities = [];

const mockVolunteers = [];

const MatchSuggestionsPopup = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [dismissedMatches, setDismissedMatches] = useState(new Set());
    const [acceptedMatches, setAcceptedMatches] = useState(new Set());

    // Automatically use volunteer view if user object isn't fully loaded, otherwise check iam
    const isNgo = user?.iam === 'ngo';
    const suggestions = isNgo ? mockVolunteers : mockOpportunities;

    const visibleSuggestions = suggestions.filter(
        s => !dismissedMatches.has(s.id) && !acceptedMatches.has(s.id)
    );

    const handleAccept = (e, id) => {
        e.stopPropagation();
        setAcceptedMatches(prev => new Set([...prev, id]));
        // In a real app, this would trigger an API call to create an application or send a message
    };

    const handleDismiss = (e, id) => {
        e.stopPropagation();
        setDismissedMatches(prev => new Set([...prev, id]));
    };

    const togglePopup = () => {
        setIsOpen(!isOpen);
        if (isOpen) setIsExpanded(false); // Reset expansion on close
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
                {visibleSuggestions.length > 0 && (
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
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="match-popup-content">
                {visibleSuggestions.length === 0 ? (
                    <div className="match-empty-state">
                        <Sparkles size={32} strokeWidth={1.5} />
                        <h4>No new matches</h4>
                        <p>We'll notify you when we find new {isNgo ? 'volunteers' : 'opportunities'} matching your profile.</p>
                    </div>
                ) : (
                    <div className="match-list">
                        <p className="match-introText">Based on your {isNgo ? 'opportunity requirements' : 'skills & location'}:</p>
                        {visibleSuggestions.map(match => (
                            <div key={match.id} className="match-card">
                                <div className="match-card-header">
                                    <div className="match-card-icon">
                                        {isNgo ? <User size={18} /> : <Briefcase size={18} />}
                                    </div>
                                    <div className="match-score">
                                        {match.matchScore}% Match
                                    </div>
                                </div>
                                <div className="match-card-body">
                                    <h5 className="match-title">{isNgo ? match.name : match.title}</h5>
                                    <p className="match-subtitle">{isNgo ? match.title : match.ngoName}</p>
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
                                    <button 
                                        className="match-btn match-accept" 
                                        onClick={(e) => handleAccept(e, match.id)}
                                    >
                                        <Check size={16} /> Connect
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchSuggestionsPopup;
