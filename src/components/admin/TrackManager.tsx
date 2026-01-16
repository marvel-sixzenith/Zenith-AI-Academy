'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

interface Track {
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string;
    orderIndex: number;
}

export default function TrackManager() {
    const [tracks, setTracks] = useState<Track[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingTrack, setEditingTrack] = useState<Track | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: 'wrench',
        orderIndex: 0,
    });

    useEffect(() => {
        fetchTracks();
    }, []);

    const fetchTracks = async () => {
        try {
            const response = await fetch('/api/admin/tracks');
            const data = await response.json();
            setTracks(data.tracks || []);
        } catch (error) {
            console.error('Failed to fetch tracks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingTrack ? `/api/admin/tracks/${editingTrack.id}` : '/api/admin/tracks';
            const method = editingTrack ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchTracks();
                resetForm();
            }
        } catch (error) {
            console.error('Failed to save track:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this track?')) return;

        try {
            await fetch(`/api/admin/tracks/${id}`, { method: 'DELETE' });
            fetchTracks();
        } catch (error) {
            console.error('Failed to delete track:', error);
        }
    };

    const handleEdit = (track: Track) => {
        setEditingTrack(track);
        setFormData({
            name: track.name,
            slug: track.slug,
            description: track.description || '',
            icon: track.icon || 'wrench',
            orderIndex: track.orderIndex,
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingTrack(null);
        setFormData({ name: '', slug: '', description: '', icon: 'wrench', orderIndex: 0 });
    };

    if (isLoading) return <div>Loading tracks...</div>;

    return (
        <div className="space-y-6">
            {/* Add Track Button */}
            {!showForm && (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Add New Track
                </button>
            )}

            {/* Track Form */}
            {showForm && (
                <div className="glass-card p-6">
                    <h3 className="text-lg font-bold mb-4">
                        {editingTrack ? 'Edit Track' : 'Create New Track'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Track Name *</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="input-field"
                                placeholder="e.g., Engineer Track"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Slug * (URL-friendly)</label>
                            <input
                                type="text"
                                required
                                value={formData.slug}
                                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                className="input-field"
                                placeholder="e.g., engineer"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="input-field"
                                rows={3}
                                placeholder="Brief description of the track"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Icon</label>
                                <select
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="wrench">Wrench</option>
                                    <option value="briefcase">Briefcase</option>
                                    <option value="rocket">Rocket</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Order</label>
                                <input
                                    type="number"
                                    value={formData.orderIndex}
                                    onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                                    className="input-field"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary">
                                <Save className="w-5 h-5" />
                                {editingTrack ? 'Update Track' : 'Create Track'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn-secondary">
                                <X className="w-5 h-5" />
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Tracks List */}
            <div className="glass-card divide-y divide-[var(--border-color)]">
                {tracks.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        No tracks yet. Create your first track to get started!
                    </div>
                ) : (
                    tracks.map((track) => (
                        <div key={track.id} className="p-4 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold">{track.name}</h4>
                                <p className="text-sm text-[var(--text-muted)]">/{track.slug}</p>
                                {track.description && (
                                    <p className="text-sm text-[var(--text-secondary)] mt-1">{track.description}</p>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(track)}
                                    className="p-2 rounded-lg hover:bg-[var(--background-card)]"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(track.id)}
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
