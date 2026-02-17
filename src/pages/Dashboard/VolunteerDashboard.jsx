import React, { useState, useEffect } from 'react';
import VolunteerNavbar from './components/VolunteerNavbar';
import UserSidebar from './components/UserSidebar';
import OpportunityFeed from './components/OpportunityFeed';
import './VolunteerDashboard.css';
import { useAuth } from '../../context/AuthContext';
import { getVolunteerDashboardData } from '../../services/api';

const VolunteerDashboard = () => {
    const { user, isLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');

    // State structured for backend integration
    const [volunteerData, setVolunteerData] = useState({
        profile: {
            name: user?.name || '',
            initials: user?.name ? user.name.split(' ').map(n => n[0]).join('') : '',
            role: 'Volunteer',
            skills: user?.skills || [],
            recentActivity: []
        },
        opportunities: [
            {
                id: 1,
                title: 'Website Redesign for Local Shelter',
                ngoId: 2,
                description: 'Help us redesign our website to improve our online presence and reach more potential adopters.',
                tags: ['Web Development', 'UI/UX Design'],
                status: 'Open'
            },
            {
                id: 2,
                title: 'Translation of Educational Materials',
                ngoId: 2,
                description: 'Translate educational materials from English to Spanish, French, or Arabic to support our global literacy programs.',
                tags: ['Translation', 'Language Skills'],
                status: 'Open'
            },
            {
                id: 3,
                title: 'Fundraising Gala Event Coordinator',
                ngoId: 2,
                description: 'Help plan and coordinate our annual fundraising gala to support children’s medical research.',
                tags: ['Event Planning', 'Marketing'],
                status: 'Open'
            }
        ]
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
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (user) {
            setVolunteerData(prev => ({
                ...prev,
                profile: {
                    ...prev.profile,
                    name: user.name,
                    initials: user.name.split(' ').map(n => n[0]).join(''),
                    skills: user.skills || []
                }
            }));
        }
    }, [user]);

    if (isLoading) return <div className="loading-screen">Loading Dashboard...</div>;

    return (
        <div className="volunteer-dashboard-container">
            <VolunteerNavbar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                userName={volunteerData.profile.name}
            />
            <div className="container dashboard-layout">
                <div className="v-dashboard-main">
                    <div className="dashboard-grid">
                        <UserSidebar profile={volunteerData.profile} />
                        <div className="dashboard-content">
                            {activeTab === 'dashboard' && (
                                <OpportunityFeed opportunities={volunteerData.opportunities} />
                            )}
                            {activeTab !== 'dashboard' && (
                                <div className="placeholder-section">
                                    <h2>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                                    <p>This section is structured for backend integration.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VolunteerDashboard;
