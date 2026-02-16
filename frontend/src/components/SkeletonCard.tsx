import React from 'react';

const SkeletonCard = () => {
    return (
        <div className="h-[400px] flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-4 sm:p-6 rounded-xl shadow-lg animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="flex gap-2">
                    <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-5 w-5 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
            </div>
            <div className="h-6 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="w-full h-32 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded mb-2" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
            <div className="flex flex-wrap gap-2 mt-auto">
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
                <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
        </div>
    );
};

export default SkeletonCard;
