import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
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
import { getNgoDashboardData, getProfile, updateProfile } from '../../services/api';
import './NgoDashboard.css';

const NgoDashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const { tab, action } = useParams();
    const activeTab = tab || 'dashboard';

    // Data structured to be passed via props or state in the future
    // Mock data structures kept as reference in comments
    /*
    const initialMockData = {
        organization: {
            name: user?.organization_name || user?.organizationName || '',
            role: 'ngo/organization'
        },
        metrics: {
            opportunitiesCount: 3,
            applicationsCount: 1,
            activeVolunteersCount: 0,
            pendingApplicationsCount: 1
        },
        recentApplications: [
            {
                id: 1,
                volunteerName: 'John Doe',
                opportunityTitle: 'Website Redesign for Local Shelter',
                status: 'pending',
                message: "I have 5 years of experience in web development and design. I've worked with several nonprofits before and would love to help improve your online presence."
            }
        ],
        recentActivity: []
    };
    */

    const [dashboardData, setDashboardData] = useState({
        organization: {
            name: user?.organization_name || user?.organizationName || user?.full_name || '',
            role: user?.role || 'ngo/organization',
            location: user?.location || '',
            website_url: user?.website_url || '',
            email: user?.email || ''
        },
        metrics: {
            opportunitiesCount: 0,
            applicationsCount: 0,
            activeVolunteersCount: 0,
            pendingApplicationsCount: 0
        },
        recentApplications: [],
        recentActivity: []
    });

    const recordActivity = (text) => {
        const newActivity = {
            id: Date.now(),
            text,
            date: 'Just now'
        };
        setDashboardData(prev => ({
            ...prev,
            recentActivity: [newActivity, ...prev.recentActivity].slice(0, 8)
        }));

        if (user) {
            updateProfile({
                recentActivity: [newActivity, ...(user.recentActivity || [])].slice(0, 8)
            });
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            // 1. Fetch backend dashboard mock stats
            const result = await getNgoDashboardData();
            if (result.success) {
                setDashboardData(prev => ({
                    ...prev,
                    metrics: result.metrics || prev.metrics,
                    recentApplications: result.recentApplications || prev.recentApplications
                }));
            }

            // 2. Fetch authenticated profile info to get the actual organization name
            const profileRes = await getProfile();
            if (profileRes.success && profileRes.user) {
                setDashboardData(prev => ({
                    ...prev,
                    organization: {
                        ...prev.organization,
                        name: profileRes.user.organization_name || profileRes.user.full_name || 'SkillBridge Partner',
                        role: profileRes.user.role || 'ngo/organization',
                        location: profileRes.user.location || '',
                        website_url: profileRes.user.website_url || '',
                        email: profileRes.user.email || ''
                    }
                }));
            } else if (user) {
                // Fallback to minimal context user obj
                setDashboardData(prev => ({
                    ...prev,
                    organization: {
                        ...prev.organization,
                        name: user.organization_name || user.organizationName || user.full_name || 'SkillBridge Partner',
                        role: user.role || 'ngo/organization',
                        location: user.location || '',
                        website_url: user.website_url || '',
                        email: user.email || ''
                    }
                }));
            }
        };

        fetchData();
    }, [user]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ngo/organization')) {
            // navigate('/login');
        }
    }, [user, isLoading, navigate]);
    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    if (!tab) {
        return <Navigate to="/ngo/dashboard" replace />;
    }

    const isFullPageTab = (activeTab === 'opportunities' && action === 'createopportunities') || (activeTab === 'opportunities' && action === 'details');

    return (
        <div className="ngo-dashboard-container">
            <Header role={dashboardData.organization.role} activeTab={activeTab} />

            <div className={`dashboard-layout ${isFullPageTab ? 'full-page-view' : ''}`}>
                {isFullPageTab ? (
                    <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        {(activeTab === 'opportunities' && action === 'createopportunities') && <CreateOpportunity />}
                        {(activeTab === 'opportunities' && action === 'details') && <OpportunityDetails />}
                    </main>
                ) : (
                    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="dashboard-grid">
                            <Sidebar
                                organization={dashboardData.organization}
                                activeTab={activeTab}
                                recentActivity={dashboardData.recentActivity}
                            />
                            <main className="dashboard-content w-full flex-1 min-w-0">
                                {activeTab === 'dashboard' && (
                                    <div className="ngo-dashboard-content-wrapper">
                                        <Overview metrics={dashboardData.metrics} />
                                        <RecentApplications applications={dashboardData.recentApplications} />
                                        <QuickActions />
                                    </div>
                                )}
                                {(activeTab === 'opportunities' && !action) && (
                                    <NgoOpportunities />
                                )}
                                {activeTab === 'applications' && (
                                    <NgoApplications onActivityRecord={recordActivity} />
                                )}
                                {activeTab !== 'dashboard' && activeTab !== 'opportunities' && activeTab !== 'applications' && (
                                    <div className="placeholder-section">
                                        <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}</h2>
                                        <p>This section is structured for backend integration.</p>
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
