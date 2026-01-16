'use client';

import { useState } from 'react';
import { Plus, BookOpen, List, Settings } from 'lucide-react';
import TrackManager from '@/components/admin/TrackManager';
import ModuleManager from '@/components/admin/ModuleManager';
import LessonManager from '@/components/admin/LessonManager';

type Tab = 'tracks' | 'modules' | 'lessons';

export default function ContentManagementPage() {
    const [activeTab, setActiveTab] = useState<Tab>('tracks');

    const tabs = [
        { id: 'tracks' as Tab, label: 'Tracks', icon: BookOpen },
        { id: 'modules' as Tab, label: 'Modules', icon: List },
        { id: 'lessons' as Tab, label: 'Lessons', icon: Settings },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold mb-2">Content Management</h1>
                <p className="text-[var(--text-secondary)]">
                    Create and manage learning tracks, modules, and lessons
                </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-[var(--border-color)]">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${activeTab === tab.id
                                    ? 'border-[var(--primary)] text-[var(--primary)]'
                                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            <div>
                {activeTab === 'tracks' && <TrackManager />}
                {activeTab === 'modules' && <ModuleManager />}
                {activeTab === 'lessons' && <LessonManager />}
            </div>
        </div>
    );
}
