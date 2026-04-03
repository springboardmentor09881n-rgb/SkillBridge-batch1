import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
import { Award } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Overview from './components/Overview';
import RecentApplications from './components/RecentApplications';
import QuickActions from './components/QuickActions';
import NgoOpportunities from './components/NgoOpportunities';
import CreateOpportunity from './components/CreateOpportunity';
import OpportunityDetails from './components/OpportunityDetails';
import NgoApplications from './components/NgoApplications';
import MessagesPage from './components/MessagesPage';
import MatchSuggestionsPopup from '../../components/MatchSuggestionsPopup';
import WelcomeModal from '../../components/WelcomeModal';
import { getNgoDashboardData, getProfile } from '../../services/api';
import './NgoDashboard.css';

import { io } from 'socket.io-client';

const NgoDashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { tab, action } = useParams();
    const activeTab = tab || 'dashboard';

    const [metrics, setMetrics] = useState({
        opportunitiesCount: 0,
        applicationsCount: 0,
        activeVolunteersCount: 0,
        pendingApplicationsCount: 0,
        unreadMessagesCount: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
    const [organization, setOrganization] = useState({
        name: user?.organizationName || user?.fullName || user?.username || '',
        iam: user?.iam || 'ngo',
        location: user?.location || '',
        websiteUrl: user?.websiteUrl || '',
        email: user?.email || ''
    });

    const fetchData = async () => {
        // Fetch dashboard stats
        const dashResult = await getNgoDashboardData();
        if (dashResult.success && dashResult.data) {
            setMetrics(dashResult.data.metrics || {});
            setRecentApplications(dashResult.data.recentApplications || []);
        }

        // Fetch full profile for accurate org info
        const profileResult = await getProfile();
        if (profileResult.success && profileResult.data) {
            const u = profileResult.data;
            setOrganization({
                name: u.organizationName || u.fullName || 'SkillBridge Partner',
                iam: u.iam || 'ngo',
                location: u.location || '',
                websiteUrl: u.websiteUrl || '',
                email: u.email || ''
            });
        }
    };

    useEffect(() => {
        fetchData();

        // Real-time stats sync
        const socket = io('http://localhost:5000');
        if (user?.id) {
            socket.emit('join', user.id);
        }

        socket.on('statsUpdate', (data) => {
            console.log('Real-time stats update received:', data);
            fetchData();
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

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    if (!tab) {
        return <Navigate to="/ngo/dashboard" replace />;
    }

    const isFullPageTab =
        (activeTab === 'opportunities' && action === 'createopportunities') ||
        (activeTab === 'opportunities' && action === 'details');

    return (
        <div className="ngo-dashboard-container">
            <Header iam={organization.iam} activeTab={activeTab} unreadCount={metrics.unreadMessagesCount} />

            <div className={`dashboard-layout ${isFullPageTab ? 'full-page-view' : ''}`}>
                {isFullPageTab ? (
                    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {activeTab === 'opportunities' && action === 'createopportunities' && <CreateOpportunity />}
                        {activeTab === 'opportunities' && action === 'details' && <OpportunityDetails />}
                    </main>
                ) : (
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="dashboard-grid">
                            <Sidebar
                                organization={organization}
                                activeTab={activeTab}
                                recentActivity={(recentApplications || []).map(app => ({
                                    id: app.id,
                                    text: `${app.volunteerName || 'Volunteer'} applied to ${app.opportunityTitle || 'Opportunity'}`,
                                    date: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Just now'
                                }))}
                            />
                            <main className="dashboard-content w-full flex-1 min-w-0">
                                {activeTab === 'dashboard' && (
                                    <div className="ngo-dashboard-content-wrapper">
                                        <Overview metrics={metrics} />
                                        
                                        {/* Smart Match Suggestion for New NGOs */}
                                        {metrics.opportunitiesCount === 0 && (
                                            <div className="smart-match-card" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }} onClick={() => {
                                                window.dispatchEvent(new CustomEvent('open-smart-match'));
                                            }}>
                                                <div className="smart-match-content">
                                                    <div className="smart-match-icon-wrap">
                                                        <Award className="sparkle-icon" size={24} style={{ color: 'white' }} />
                                                    </div>
                                                    <div className="smart-match-text">
                                                        <h3>Unlock Smart Matching</h3>
                                                        <p>Post your first opportunity to activate AI-powered volunteer matching! Once live, we'll find and suggest the perfect volunteers based on your requirements.</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <RecentApplications applications={recentApplications} />
                                        <QuickActions />
                                    </div>
                                )}
                                {activeTab === 'opportunities' && !action && (
                                    <NgoOpportunities />
                                )}
                                {activeTab === 'applications' && (
                                    <NgoApplications />
                                )}
                                {activeTab === 'messages' && (
                                    <MessagesPage
                                        initialReceiverId={location.state?.receiverId}
                                        initialOpportunityId={location.state?.opportunityId}
                                    />
                                )}
                                {activeTab !== 'dashboard' && activeTab !== 'opportunities' && activeTab !== 'applications' && activeTab !== 'messages' && (
                                    <div className="placeholder-section">
                                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                                        <p>This section is under construction.</p>
                                    </div>
                                )}
                            </main>
                        </div>
                    </div>
                )}
            </div>
            <MatchSuggestionsPopup />
            <WelcomeModal 
                isOpen={isWelcomeOpen} 
                onClose={() => setIsWelcomeOpen(false)} 
                userName={user?.fullName || user?.username} 
            />
        </div>
    );
};

export default NgoDashboard;
