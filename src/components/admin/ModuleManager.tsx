'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Track {
    id: string;
    name: string;
}

interface Module {
    id: string;
    trackId: string;
    name: string;
    description: string;
    orderIndex: number;
    track?: Track;
}

export default function ModuleManager() {
    const [modules, setModules] = useState<Module[]>([]);
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
    const [formData, setFormData] = useState({
        trackId: '',
        name: '',
        description: '',
        orderIndex: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tracksRes, modulesRes] = await Promise.all([
                fetch('/api/admin/tracks'),
                fetch('/api/admin/tracks').then(r => r.json()).then(data => {
                    // Fetch all modules from all tracks
                    return Promise.all(
                        (data.tracks || []).map((t: Track) =>
                            fetch(`/api/admin/tracks/${t.id}`).then(r => r.json())
                        )
                    );
                })
            ]);

            const tracksData = await tracksRes.json();
            setTracks(tracksData.tracks || []);

            // Flatten modules from all tracks
            const allModules = (await modulesRes).flatMap((track: any) =>
                (track.track?.modules || []).map((m: any) => ({
                    ...m,
                    track: { id: track.track.id, name: track.track.name }
                }))
            );
            // Sort by orderIndex
            allModules.sort((a: Module, b: Module) => a.orderIndex - b.orderIndex);
            setModules(allModules);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Auto-calculate order index for new modules if not specified
            let orderIndex = formData.orderIndex;
            if (!editingModule && orderIndex === 0) {
                const trackModules = modules.filter(m => m.trackId === formData.trackId);
                orderIndex = trackModules.length; // Place at end
            }

            const url = editingModule ? `/api/admin/modules/${editingModule.id}` : '/api/admin/modules';
            const method = editingModule ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    orderIndex
                }),
            });

            if (response.ok) {
                fetchData();
                resetForm();
            } else {
                alert('Failed to save module');
            }
        } catch (error) {
            console.error('Failed to save module:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will delete all lessons in this module.')) return;

        try {
            await fetch(`/api/admin/modules/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Failed to delete module:', error);
        }
    };

    const handleEdit = (module: Module) => {
        setEditingModule(module);
        setFormData({
            trackId: module.trackId,
            name: module.name,
            description: module.description || '',
            orderIndex: module.orderIndex,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingModule(null);
        setFormData({
            trackId: selectedTrackFilter !== 'all' ? selectedTrackFilter : '', // Pre-select if filtered
            name: '',
            description: '',
            orderIndex: 0
        });
    };

    // Filter modules based on selection
    const filteredModules = selectedTrackFilter === 'all'
        ? modules
        : modules.filter(m => m.trackId === selectedTrackFilter);

    if (isLoading) return <div>Loading modules...</div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-4">
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Add New Module
                    </button>
                )}

                {/* Track Filter */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-muted)]">Filter by track:</span>
                    <select
                        value={selectedTrackFilter}
                        onChange={(e) => setSelectedTrackFilter(e.target.value)}
                        className="input-field text-sm py-2"
                    >
                        <option value="all">All Tracks</option>
                        {tracks.map((track) => (
                            <option key={track.id} value={track.id}>
                                {track.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {showForm && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4">
                        {editingModule ? 'Edit Module' : 'Create New Module'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Track *</label>
                                <select
                                    required
                                    value={formData.trackId}
                                    onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="">Select a track</option>
                                    {tracks.map((track) => (
                                        <option key={track.id} value={track.id}>
                                            {track.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Module Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="input-field w-full"
                                    placeholder="e.g., Foundations of Automation"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field w-full"
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Order</label>
                            <input
                                type="number"
                                min="0"
                                value={formData.orderIndex}
                                onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                                className="input-field w-full"
                                placeholder="0"
                            />
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                                Lower = appears first in track
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary">
                                <Save className="w-5 h-5" />
                                {editingModule ? 'Update Module' : 'Create Module'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card divide-y divide-[var(--border-color)]">
                {filteredModules.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        {selectedTrackFilter === 'all'
                            ? 'No modules yet. Create tracks first, then add modules!'
                            : 'No modules in this track yet.'}
                    </div>
                ) : (
                    filteredModules.map((module) => (
                        <div key={module.id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--background-secondary)] px-1.5 py-0.5 rounded">
                                        #{module.orderIndex + 1}
                                    </span>
                                    <h4 className="font-bold">{module.name}</h4>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    Track: {module.track?.name || 'Unknown'}
                                </p>
                                {module.description && (
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{module.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(module)}
                                    className="p-2 rounded-lg hover:bg-[var(--background-card)]"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(module.id)}
                                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
