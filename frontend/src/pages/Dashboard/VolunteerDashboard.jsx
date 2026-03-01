import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import VolunteerNavbar from './components/VolunteerNavbar';
import UserSidebar from './components/UserSidebar';
import OpportunityFeed from './components/OpportunityFeed';
import VolunteerOverview from './components/VolunteerOverview';
import OpportunityDetails from './components/OpportunityDetails';
import './VolunteerDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { getVolunteerDashboardData, applyForOpportunity, getVolunteerApplications } from '../../services/api';

const VolunteerDashboard = () => {
    const { user, isLoading } = useAuth();
    const { tab, action } = useParams();
    const activeTab = tab || 'dashboard';

    const [appliedOpps, setAppliedOpps] = useState([]);
    const [applications, setApplications] = useState([]);

    // State for backend data
    const [volunteerData, setVolunteerData] = useState({
        profile: {
            name: user?.full_name || user?.fullName || user?.username || '',
            initials: (user?.full_name || user?.fullName || user?.username) ? (user.full_name || user.fullName || user.username).split(' ').map(n => n[0]).join('') : '',
            role: 'Volunteer',
            skills: user?.skills || [],
            recentActivity: []
        },
        opportunities: []
    });

    useEffect(() => {
        const fetchData = async () => {
            const result = await getVolunteerDashboardData();
            if (result.success) {
                setVolunteerData(prev => ({
                    ...prev,
                    opportunities: result.opportunities || prev.opportunities,
                    profile: {
                        ...prev.profile,
                        ...result.profile,
                        initials: result.profile?.name
                            ? result.profile.name.split(' ').map(n => n[0]).join('')
                            : prev.profile.initials
                    }
                }));
            }

            const appsResult = await getVolunteerApplications();
            if (appsResult.success) {
                setApplications(appsResult.data || []);
                setAppliedOpps((appsResult.data || []).map(a => a.opportunityId));
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            const displayName = user.full_name || user.fullName || user.username || '';
            setVolunteerData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    name: displayName,
                    initials: displayName ? displayName.split(' ').map(n => n[0]).join('') : '',
                    skills: user.skills ? (typeof user.skills === 'string' ? user.skills.split(',') : user.skills) : []
                }
            }));
        }
    }, [user]);

    const handleApply = async (oppId, oppTitle) => {
        // Prevent applying multiple times to same ID
        if (appliedOpps.includes(oppId)) return;

        const result = await applyForOpportunity(oppId, "I would like to volunteer for this opportunity.");

        if (result.success) {
            setAppliedOpps([...appliedOpps, oppId]);

            // Add to recent activity
            setVolunteerData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    recentActivity: [
                        { id: Date.now(), text: `Applied for ${oppTitle}`, date: 'Just now' },
                        ...(prev.profile.recentActivity || [])
                    ].slice(0, 5) // Keep last 5
                }
            }));
        } else {
            alert(result.message || 'Failed to apply');
        }
    };

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    if (!tab) {
        return <Navigate to="/volunteer/dashboard" replace />;
    }

    const isFullPageTab = (activeTab === 'opportunities' && action === 'details');

    return (
        <div className="volunteer-dashboard-container">
            <VolunteerNavbar
                activeTab={activeTab}
                userName={volunteerData.profile.name}
            />
            <div className={`dashboard-layout w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 ${isFullPageTab ? 'full-page-view mt-6' : ''}`}>
                {isFullPageTab ? (
                    <main className="w-full">
                        <OpportunityDetails
                            appliedOpps={appliedOpps}
                            onApply={handleApply}
                        />
                    </main>
                ) : (
                    <div className="v-dashboard-main !max-w-none !m-0 !p-0">
                        <div className="dashboard-grid">
                            <UserSidebar profile={volunteerData.profile} />
                            <div className="dashboard-content">
                                {activeTab === 'dashboard' && (
                                    <VolunteerOverview
                                        profile={volunteerData.profile}
                                        applicationsCount={applications.length}
                                        acceptedCount={applications.filter(a => a.status === 'Accepted').length}
                                        pendingCount={applications.filter(a => a.status === 'Pending').length}
                                    />
                                )}
                                {(activeTab === 'opportunities' && !action) && (
                                    <OpportunityFeed
                                        opportunities={volunteerData.opportunities}
                                        appliedOpps={appliedOpps}
                                        onApply={handleApply}
                                    />
                                )}
                                {activeTab === 'messages' && (
                                    <div className="placeholder-section bg-white rounded-2xl border border-slate-200 p-8 text-center">
                                        <h2 className="text-xl font-bold text-slate-800 mb-2">Messages</h2>
                                        <p className="text-slate-500">Your inbox is empty.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolunteerDashboard;
