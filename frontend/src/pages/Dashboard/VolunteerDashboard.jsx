import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import VolunteerNavbar from './components/VolunteerNavbar';
import UserSidebar from './components/UserSidebar';
import OpportunityFeed from './components/OpportunityFeed';
import VolunteerOverview from './components/VolunteerOverview';
import OpportunityDetails from './components/OpportunityDetails';
import MessagesPage from './components/MessagesPage';
import MatchSuggestionsPopup from '../../components/MatchSuggestionsPopup';
import './VolunteerDashboard.css';
import { useAuth } from '../../context/AuthContext';
import {
    getVolunteerDashboardData,
    getVolunteerOpportunities,
    applyForOpportunity,
    getVolunteerApplications
} from '../../services/api';

const VolunteerDashboard = () => {
    const { user, isLoading } = useAuth();
    const { tab, action } = useParams();
    const activeTab = tab || 'dashboard';

    const [dashData, setDashData] = useState({
        appliedCount: 0,
        acceptedCount: 0,
        pendingCount: 0,
        skillsCount: 0,
        recentMessages: [],
        applications: []
    });

    const [opportunities, setOpportunities] = useState([]);
    const [appliedOpps, setAppliedOpps] = useState([]);
    const [filters, setFilters] = useState({ skill: '', location: '', status: 'open' });

    const profile = {
        name: user?.fullName || user?.username || '',
        initials: (user?.fullName || user?.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
        iam: user?.iam || 'volunteer',
        skills: Array.isArray(user?.skills) ? user.skills :
            (typeof user?.skills === 'string' ? JSON.parse(user.skills || '[]') : [])
    };

    // Load dashboard stats
    useEffect(() => {
        const fetchDashboard = async () => {
            const result = await getVolunteerDashboardData();
            if (result.success && result.data) {
                setDashData({
                    appliedCount: result.data.appliedCount || 0,
                    acceptedCount: result.data.acceptedCount || 0,
                    pendingCount: result.data.pendingCount || 0,
                    skillsCount: result.data.skillsCount || 0,
                    recentMessages: result.data.recentMessages || [],
                    applications: result.data.applications || []
                });
            }
        };
        fetchDashboard();
    }, []);

    // Load opportunities when on opportunities tab
    useEffect(() => {
        if (activeTab !== 'opportunities') return;
        const fetchOpps = async () => {
            const result = await getVolunteerOpportunities(filters);
            if (result.success) {
                setOpportunities(result.data || []);
            }
        };
        fetchOpps();
    }, [activeTab, filters]);

    // Load applied opp IDs
    useEffect(() => {
        const fetchApps = async () => {
            const result = await getVolunteerApplications();
            if (result.success) {
                setAppliedOpps((result.data || []).map(a => a.opportunityId));
            }
        };
        fetchApps();
    }, []);

    const handleApply = async (oppId, oppTitle) => {
        if (appliedOpps.includes(oppId)) return;
        const result = await applyForOpportunity(oppId, `I would like to volunteer for: ${oppTitle}`);
        if (result.success) {
            setAppliedOpps(prev => [...prev, oppId]);
            // Refresh counts
            setDashData(prev => ({
                ...prev,
                appliedCount: prev.appliedCount + 1,
                pendingCount: prev.pendingCount + 1
            }));
        } else {
            alert(result.message || 'Failed to apply');
        }
    };

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    if (!tab) {
        return <Navigate to="/volunteer/dashboard" replace />;
    }

    const isFullPageTab = activeTab === 'opportunities' && action === 'details';

    return (
        <div className="volunteer-dashboard-container">
            <VolunteerNavbar activeTab={activeTab} userName={profile.name} />
            <div className={`dashboard-layout w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 ${isFullPageTab ? 'full-page-view mt-6' : ''}`}>
                {isFullPageTab ? (
                    <main className="w-full">
                        <OpportunityDetails appliedOpps={appliedOpps} onApply={handleApply} />
                    </main>
                ) : (
                    <div className="v-dashboard-main !max-w-none !m-0 !p-0">
                        <div className="dashboard-grid">
                            <UserSidebar 
                                profile={profile} 
                                recentActivity={(dashData.applications || []).map(app => ({
                                    id: app.id,
                                    text: `Applied to ${app.opportunityTitle || 'Opportunity'}`,
                                    date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Just now'
                                }))}
                            />
                            <div className="dashboard-content">
                                {activeTab === 'dashboard' && (
                                    <VolunteerOverview
                                        profile={profile}
                                        applicationsCount={dashData.appliedCount}
                                        acceptedCount={dashData.acceptedCount}
                                        pendingCount={dashData.pendingCount}
                                        skillsCount={dashData.skillsCount}
                                    />
                                )}
                                {activeTab === 'opportunities' && !action && (
                                    <OpportunityFeed
                                        opportunities={opportunities}
                                        appliedOpps={appliedOpps}
                                        onApply={handleApply}
                                        filters={filters}
                                        onFiltersChange={setFilters}
                                    />
                                )}
                                {activeTab === 'messages' && (
                                    <MessagesPage />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <MatchSuggestionsPopup />
        </div>
    );
};

export default VolunteerDashboard;
