import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useLocation } from 'react-router-dom';
import VolunteerNavbar from './components/VolunteerNavbar';
import UserSidebar from './components/UserSidebar';
import OpportunityFeed from './components/OpportunityFeed';
import VolunteerOverview from './components/VolunteerOverview';
import OpportunityDetails from './components/OpportunityDetails';
import MessagesPage from './components/MessagesPage';
import MatchSuggestionsPopup from '../../components/MatchSuggestionsPopup';
import WelcomeModal from '../../components/WelcomeModal';
import './VolunteerDashboard.css';
import { useAuth } from '../../context/AuthContext';
import {
    getVolunteerDashboardData,
    getVolunteerOpportunities,
    applyForOpportunity,
    getVolunteerApplications
} from '../../services/api';
import { io } from 'socket.io-client';

const VolunteerDashboard = () => {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const { tab, action } = useParams();
    const activeTab = tab || 'dashboard';
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);

    const [dashData, setDashData] = useState({
        appliedCount: 0,
        acceptedCount: 0,
        pendingCount: 0,
        skillsCount: 0,
        recentMessages: [],
        applications: [],
        unreadMessagesCount: 0
    });

    const [opportunities, setOpportunities] = useState([]);
    const [appliedOpps, setAppliedOpps] = useState([]);
    const [filters, setFilters] = useState({ skill: '', location: '', status: 'open' });

    const profile = {
        name: user?.fullName || user?.username || '',
        initials: (user?.fullName || user?.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase(),
        iam: user?.iam || 'volunteer',
        skills: (() => {
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
        })()
    };

    const refreshAllData = async () => {
        // 1. Fetch Dashboard Stats
        const dashResult = await getVolunteerDashboardData();
        if (dashResult.success && dashResult.data) {
            setDashData({
                appliedCount: dashResult.data.appliedCount || 0,
                acceptedCount: dashResult.data.acceptedCount || 0,
                pendingCount: dashResult.data.pendingCount || 0,
                skillsCount: dashResult.data.skillsCount || 0,
                recentMessages: dashResult.data.recentMessages || [],
                applications: dashResult.data.applications || [],
                unreadMessagesCount: dashResult.data.unreadMessagesCount || 0
            });
        }

        // 2. Fetch Applied Opportunity IDs (for feed status)
        const appsResult = await getVolunteerApplications();
        if (appsResult.success) {
            setAppliedOpps((appsResult.data || []).map(a => a.opportunityId));
        }
    };

    // Keep legacy fetchDashboard for basic stats if needed, or just use refreshAllData
    const fetchDashboard = refreshAllData;

    // Load dashboard stats
    useEffect(() => {
        fetchDashboard();

        // Real-time stats sync
        const socket = io('http://localhost:5000');
        if (user?.id) {
            socket.emit('join', user.id);
        }

        socket.on('statsUpdate', (data) => {
            console.log('Real-time stats update received:', data);
            refreshAllData(); // Use unified refresh
        });

        // Welcome Trigger
        if (user?.id) {
            const hasSeenWelcome = localStorage.getItem(`sb_welcome_shown_${user.id}`);
            if (!hasSeenWelcome) {
                setIsWelcomeOpen(true);
                localStorage.setItem(`sb_welcome_shown_${user.id}`, 'true');
            }
        }

        return () => socket.disconnect();
    }, [user?.id]);

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

    // Load applied opp IDs and dash on mount
    useEffect(() => {
        refreshAllData();
    }, []);

    const handleApply = async (oppId, oppTitle) => {
        if (appliedOpps.includes(oppId)) return;
        const result = await applyForOpportunity(oppId, `I would like to volunteer for: ${oppTitle}`);
        if (result.success) {
            refreshAllData(); // Use unified refresh for immediate consistency
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
            <VolunteerNavbar 
                activeTab={activeTab} 
                userName={profile.name} 
                unreadCount={dashData.unreadMessagesCount}
            />
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
                                        recentMessages={dashData.recentMessages}
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
                                    <MessagesPage 
                                        initialReceiverId={location.state?.receiverId}
                                        initialOpportunityId={location.state?.opportunityId}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <MatchSuggestionsPopup onSuccess={refreshAllData} />
            <WelcomeModal 
                isOpen={isWelcomeOpen} 
                onClose={() => setIsWelcomeOpen(false)} 
                userName={user?.fullName || user?.username} 
            />
        </div>
    );
};

export default VolunteerDashboard;
