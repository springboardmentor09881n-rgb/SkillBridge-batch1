import React from 'react';
import Header from './Header';

const DashboardLayout = ({ children, role, userName, activeTab, setActiveTab }) => {
    return (
        <div className="bg-[var(--bg-main)] min-h-screen w-full font-sans flex flex-col transition-colors duration-300">
            <Header role={role} userName={userName} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main content area */}
            <main className="flex-1 w-full flex justify-center pt-24 px-4 sm:px-6 lg:px-8 pb-12">
                <div className="w-full max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
