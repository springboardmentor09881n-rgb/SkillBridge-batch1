import React from 'react';

const Skeleton = ({ className = "" }) => {
    return (
        <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />
    );
};

Skeleton.Circle = ({ size = "12", className = "" }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-full h-${size} w-${size} ${className}`} />
);

Skeleton.Text = ({ className = "", width = "w-full", height = "h-4" }) => (
    <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded ${height} ${width} ${className}`} />
);

Skeleton.Card = ({ className = "" }) => (
    <div className={`premium-card p-6 flex flex-col gap-4 animate-pulse ${className} border border-slate-100 dark:border-slate-800`}>
        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 w-2/3">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-16"></div>
        </div>
        <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        <div className="flex gap-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-12"></div>
        </div>
        <div className="flex justify-between mt-2">
            <div className="flex gap-2">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-20"></div>
            </div>
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-24"></div>
        </div>
    </div>
);

export default Skeleton;
