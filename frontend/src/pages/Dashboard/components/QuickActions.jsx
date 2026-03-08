import React from 'react';
import { Plus, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Create New Opportunity',
            icon: Plus,
            path: '/ngo/opportunities/createopportunities'
        },
        {
            title: 'View Messages',
            icon: MessageSquare,
            path: '/ngo/messages'
        }
    ];

    return (
        <div className="overview-section">
            <div className="overview-header">
                <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-container">
                {actions.map((action, index) => (
                    <div
                        key={index}
                        className="premium-card glass flex flex-col items-center justify-center gap-4 p-10 cursor-pointer interactive-card hover:scale-[1.02] transition-all duration-300"
                        onClick={() => navigate(action.path, { state: action.state })}
                    >
                        <div className="text-[var(--color-primary)]">
                            <action.icon size={32} />
                        </div>
                        <div className="action-text">
                            <h4 className="text-base font-semibold text-[var(--text-primary)]">{action.title}</h4>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;
