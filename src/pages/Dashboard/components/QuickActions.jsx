import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';

const QuickActions = () => {
    const actions = [
        {
            title: 'Create New Opportunity',
            desc: 'Post a new mission for volunteers',
            icon: Plus,
            color: 'primary'
        },
        {
            title: 'View Messages',
            desc: 'Check your inbox for updates',
            icon: MessageSquare,
            color: 'secondary'
        }
    ];

    return (
        <div className="quick-actions">
            <h3 className="card-title" style={{ marginBottom: '1.5rem' }}>
                Quick Actions
            </h3>
            <div className="quick-actions-container">
                {actions.map((action, index) => (
                    <div key={index} className="action-card">
                        <div className="action-icon-box">
                            <action.icon size={24} />
                        </div>
                        <div className="action-text">
                            <h4>{action.title}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
