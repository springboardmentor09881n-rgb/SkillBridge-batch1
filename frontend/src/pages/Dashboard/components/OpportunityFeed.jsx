import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Clock, ChevronDown, Filter, Check } from 'lucide-react';
import './OpportunityFeed.css';

const SKILL_SUGGESTIONS = ['Web Development', 'UI/UX Design', 'Translation', 'Marketing', 'React', 'Python', 'Graphic Design', 'Event Planning'];
const LOCATION_SUGGESTIONS = ['New York', 'Remote', 'Chicago', 'San Francisco', 'London', 'Toronto', 'Sydney'];
const STATUS_OPTIONS = ['Open', 'Closed', 'All Statuses'];

const OpportunityFeed = ({ opportunities, appliedOpps = [], onApply = () => { } }) => {
    const navigate = useNavigate();

    // In a real app, these would drive the filtering logic.
    const [skillSearch, setSkillSearch] = useState('');
    const [isSkillsOpen, setIsSkillsOpen] = useState(false);

    const [locationSearch, setLocationSearch] = useState('');
    const [isLocationOpen, setIsLocationOpen] = useState(false);

    const [statusFilter, setStatusFilter] = useState('Open');
    const [isStatusOpen, setIsStatusOpen] = useState(false);

    // Refs for outside click detection
    const skillsRef = useRef(null);
    const locationRef = useRef(null);
    const statusRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (skillsRef.current && !skillsRef.current.contains(event.target)) {
                setIsSkillsOpen(false);
            }
            if (locationRef.current && !locationRef.current.contains(event.target)) {
                setIsLocationOpen(false);
            }
            if (statusRef.current && !statusRef.current.contains(event.target)) {
                setIsStatusOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSkills = SKILL_SUGGESTIONS.filter(skill =>
        skill.toLowerCase().includes(skillSearch.toLowerCase())
    );

    const filteredLocations = LOCATION_SUGGESTIONS.filter(loc =>
        loc.toLowerCase().includes(locationSearch.toLowerCase())
    );

    return (
        <section className="volunteer-feed-container">
            {/* Filter Section (Matches Mockup) */}
            <div className="vol-feed-header">
                <h1 className="vol-feed-title">Volunteering Opportunities</h1>
                <p className="vol-feed-subtitle">Find opportunities that match your skills and interests</p>

                <div className="vol-filters-grid">
                    {/* Skills Filter */}
                    <div className="vol-filter-group" ref={skillsRef}>
                        <label className="vol-filter-label">Skills</label>
                        <div className="vol-search-input-wrapper">
                            <Search size={16} className="vol-search-icon" />
                            <input
                                type="text"
                                placeholder="Search skills..."
                                className="vol-search-input"
                                value={skillSearch}
                                onChange={(e) => {
                                    setSkillSearch(e.target.value);
                                    setIsSkillsOpen(true);
                                }}
                                onClick={() => setIsSkillsOpen(true)}
                                onFocus={() => setIsSkillsOpen(true)}
                            />
                            {isSkillsOpen && filteredSkills.length > 0 && (
                                <div className="vol-dropdown-menu">
                                    {filteredSkills.map(skill => (
                                        <div
                                            key={skill}
                                            className="vol-dropdown-item"
                                            onClick={() => {
                                                setSkillSearch(skill);
                                                setIsSkillsOpen(false);
                                            }}
                                        >
                                            {skill}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Filter */}
                    <div className="vol-filter-group" ref={locationRef}>
                        <label className="vol-filter-label">Location</label>
                        <div className="vol-search-input-wrapper">
                            <Search size={16} className="vol-search-icon" />
                            <input
                                type="text"
                                placeholder="Search locations..."
                                className="vol-search-input"
                                value={locationSearch}
                                onChange={(e) => {
                                    setLocationSearch(e.target.value);
                                    setIsLocationOpen(true);
                                }}
                                onClick={() => setIsLocationOpen(true)}
                                onFocus={() => setIsLocationOpen(true)}
                            />
                            {isLocationOpen && filteredLocations.length > 0 && (
                                <div className="vol-dropdown-menu">
                                    {filteredLocations.map(loc => (
                                        <div
                                            key={loc}
                                            className="vol-dropdown-item"
                                            onClick={() => {
                                                setLocationSearch(loc);
                                                setIsLocationOpen(false);
                                            }}
                                        >
                                            {loc}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="vol-filter-group" ref={statusRef}>
                        <label className="vol-filter-label">Status</label>
                        <div className="vol-select-wrapper dropdown-wrapper" onClick={() => setIsStatusOpen(!isStatusOpen)}>
                            <div className={`vol-custom-select ${isStatusOpen ? 'is-open' : ''}`}>
                                <span>{statusFilter}</span>
                                <ChevronDown size={16} className="vol-select-icon-styled" />
                            </div>
                            {isStatusOpen && (
                                <div className="vol-dropdown-menu w-full mt-1 absolute z-50">
                                    {STATUS_OPTIONS.map(status => (
                                        <div
                                            key={status}
                                            className="vol-dropdown-item"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setStatusFilter(status);
                                                setIsStatusOpen(false);
                                            }}
                                        >
                                            {status}
                                            {statusFilter === status && <span className="vol-dropdown-check">✓</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="vol-filter-actions">
                    <button
                        className="vol-apply-filters-btn"
                        onClick={() => {
                            console.log('Filters Applied:', { skillSearch, locationSearch, statusFilter });
                        }}
                    >
                        <Check size={16} /> Apply Filters
                    </button>
                    <button
                        className="vol-reset-btn"
                        onClick={() => {
                            setSkillSearch('');
                            setLocationSearch('');
                            setStatusFilter('Open');
                        }}
                    >
                        <Filter size={16} /> Reset
                    </button>
                </div>
            </div>

            {/* Opportunity Cards */}
            {opportunities.map((opp) => {
                const isApplied = appliedOpps.includes(opp.id);

                return (
                    <div key={opp.id} className="vol-opp-card">
                        <div className="vol-opp-header">
                            <div>
                                <h3 className="vol-opp-title">{opp.title}</h3>
                                <span className="vol-opp-ngo">NGO ID: {opp.ngoId || 2}</span>
                            </div>
                            <span className="vol-opp-status">{opp.status}</span>
                        </div>

                        <p className="vol-opp-desc">{opp.description}</p>

                        <div className="vol-opp-tags">
                            {opp.tags.map((tag, i) => (
                                <span key={i} className="vol-opp-tag">{tag}</span>
                            ))}
                        </div>

                        <div className="vol-opp-meta">
                            <div className="vol-meta-item">
                                <MapPin size={14} />
                                <span>{opp.location || 'New York, NY'}</span>
                            </div>
                            <div className="vol-meta-item">
                                <Clock size={14} />
                                <span>{opp.duration || '2-3 weeks'}</span>
                            </div>
                        </div>

                        <div className="vol-opp-footer">
                            <button
                                onClick={() => navigate('/volunteer/opportunities/details')}
                                className="vol-view-details"
                            >
                                View details <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>&rsaquo;</span>
                            </button>

                            <button
                                className={`vol-apply-btn flex items-center gap-1 transition-colors ${isApplied ? 'applied' : ''}`}
                                onClick={() => onApply(opp.id, opp.title)}
                                disabled={isApplied}
                            >
                                {isApplied ? (
                                    <>
                                        <Check size={16} />
                                        Applied
                                    </>
                                ) : (
                                    'Apply'
                                )}
                            </button>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default OpportunityFeed;
