import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate, useLocation } from 'react-router-dom';
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
import { getNgoDashboardData, getProfile } from '../../services/api';
import './NgoDashboard.css';

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
        pendingApplicationsCount: 0
    });
    const [recentApplications, setRecentApplications] = useState([]);
    const [organization, setOrganization] = useState({
        name: user?.organizationName || user?.fullName || user?.username || '',
        iam: user?.iam || 'ngo',
        location: user?.location || '',
        websiteUrl: user?.websiteUrl || '',
        email: user?.email || ''
    });

    useEffect(() => {
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

        fetchData();
    }, []);

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    if (!tab) {
        return <Navigate to="/ngo/dashboard" replace />;
    }

    const isFullPageTab =
        (activeTab === 'opportunities' && action === 'createopportunities') ||
        (activeTab === 'opportunities' && action === 'details');

    return (
        <div className="ngo-dashboard-container">
            <Header iam={organization.iam} activeTab={activeTab} />

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
                                recentActivity={[]}
                            />
                            <main className="dashboard-content w-full flex-1 min-w-0">
                                {activeTab === 'dashboard' && (
                                    <div className="ngo-dashboard-content-wrapper">
                                        <Overview metrics={metrics} />
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
        </div>
    );
};

export default NgoDashboard;
