import React from 'react';
import { Briefcase, FileCheck, Users, Hourglass } from 'lucide-react';
import StatCard from './StatCard';

const Overview = ({ metrics }) => {
    return (
        <div style={{ marginBottom: '0.5rem' }}>
            <h2 style={{
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: '1.1rem',
                marginBottom: '1rem',
                paddingLeft: '0.25rem'
            }}>
                Overview
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
            }}>
                <StatCard
                    title="Active Opportunities"
                    value={metrics.opportunitiesCount}
                    icon={Briefcase}
                    variant="blue"
                />
                <StatCard
                    title="Total Applications"
                    value={metrics.applicationsCount}
                    icon={FileCheck}
                    variant="green"
                />
                <StatCard
                    title="Active Volunteers"
                    value={metrics.activeVolunteersCount}
                    icon={Users}
                    variant="indigo"
                />
                <StatCard
                    title="Pending Applications"
                    value={metrics.pendingApplicationsCount}
                    icon={Hourglass}
                    variant="amber"
                />
            </div>
        </div>
    );
};

export default Overview;
