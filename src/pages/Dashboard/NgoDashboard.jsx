import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Overview from './components/Overview';
import RecentApplications from './components/RecentApplications';
import QuickActions from './components/QuickActions';
import { getNgoDashboardData } from '../../services/api';
import './NgoDashboard.css';

const NgoDashboard = () => {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');

    // Data structured to be passed via props or state in the future
    const [dashboardData, setDashboardData] = useState({
        organization: {
            name: user?.organizationName || '',
            role: 'Ngo'
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
        ]
    });

    useEffect(() => {
        const fetchData = async () => {
            const result = await getNgoDashboardData();
            if (result.success) {
                setDashboardData(prev => ({
                    ...prev,
                    organization: result.organization || prev.organization,
                    metrics: result.metrics || prev.metrics,
                    recentApplications: result.recentApplications || prev.recentApplications
                }));
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // This is where real data fetching would happen
        if (user) {
            setDashboardData(prev => ({
                ...prev,
                organization: {
                    ...prev.organization,
                    name: user.organizationName || 'SkillBridge Partner',
                    role: 'Organization Administrator'
                }
            }));
        }
    }, [user]);

    useEffect(() => {
        if (!isLoading && (!user || user.role !== 'ngo')) {
            // Uncomment this for real role protection
            // navigate('/login');
        }
    }, [user, isLoading, navigate]);

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="dashboard-container">
            <Sidebar
                organization={dashboardData.organization}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
            />
            <div className="dashboard-main">
                <Navbar
                    role={dashboardData.organization.role}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />
                <main className="dashboard-content">
                    <div className="content-wrapper">
                        {activeTab === 'dashboard' && (
                            <>
                                <Overview metrics={dashboardData.metrics} />
                                <RecentApplications applications={dashboardData.recentApplications} />
                                <QuickActions />
                            </>
                        )}
                        {activeTab !== 'dashboard' && (
                            <div className="placeholder-section">
                                <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                                <p>This section is structured for backend integration.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default NgoDashboard;
