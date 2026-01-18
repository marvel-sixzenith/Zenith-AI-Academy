'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import VideoEditor from './lesson-editors/VideoEditor';
import PdfEditor from './lesson-editors/PdfEditor';
import QuizEditor from './lesson-editors/QuizEditor';
import AssignmentEditor from './lesson-editors/AssignmentEditor';

interface Module {
    id: string;
    name: string;
    track?: { name: string };
}

interface Lesson {
    id: string;
    moduleId: string;
    title: string;
    contentType: string;
    pointsValue: number;
    orderIndex: number;
    status: string;
    module?: Module;
    contentData: string | any;
}

export default function LessonManager() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [formData, setFormData] = useState({
        moduleId: '',
        title: '',
        contentType: 'VIDEO',
        contentData: '{}',
        pointsValue: 10,
        orderIndex: 0,
        status: 'DRAFT',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tracksRes = await fetch('/api/admin/tracks');
            const tracksData = await tracksRes.json();

            const trackDetails = await Promise.all(
                (tracksData.tracks || []).map((t: any) =>
                    fetch(`/api/admin/tracks/${t.id}`).then(r => r.json())
                )
            );

            const allModules = trackDetails.flatMap((track: any) =>
                (track.track?.modules || []).map((m: any) => ({
                    ...m,
                    track: { name: track.track.name }
                }))
            );
            setModules(allModules);

            const allLessons = allModules.flatMap((m: any) =>
                (m.lessons || []).map((l: any) => ({ ...l, module: m }))
            );
            setLessons(allLessons);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let contentDataToSend = formData.contentData.trim();

            // Handle VIDEO and PDF types - convert URL to proper JSON format
            if (formData.contentType === 'VIDEO' || formData.contentType === 'PDF') {
                // Check if it's already valid JSON
                try {
                    const parsed = JSON.parse(contentDataToSend);
                    // If it's already a proper object, stringify it
                    contentDataToSend = JSON.stringify(parsed);
                } catch {
                    // It's just a URL, wrap it in proper JSON format
                    if (contentDataToSend && contentDataToSend !== '{}') {
                        if (formData.contentType === 'VIDEO') {
                            contentDataToSend = JSON.stringify({
                                type: 'video',
                                youtube_url: contentDataToSend
                            });
                        } else {
                            contentDataToSend = JSON.stringify({
                                type: 'pdf',
                                file_url: contentDataToSend
                            });
                        }
                    }
                }
            } else {
                // For QUIZ and ASSIGNMENT, validate it's proper JSON
                try {
                    const parsed = JSON.parse(contentDataToSend);
                    contentDataToSend = JSON.stringify(parsed);
                } catch (error) {
                    alert('Invalid JSON format for content data. Please check your input.');
                    return;
                }
            }

            const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : '/api/admin/lessons';
            const method = editingLesson ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    contentData: contentDataToSend,
                }),
            });

            if (response.ok) {
                fetchData();
                resetForm();
            } else {
                const errorData = await response.json();
                alert(`Failed to save lesson: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Failed to save lesson:', error);
            alert('An error occurred while saving the lesson.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await fetch(`/api/admin/lessons/${id}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Failed to delete lesson:', error);
        }
    };

    const handleEdit = async (lesson: Lesson) => {
        // Fetch full lesson details including contentData
        try {
            const response = await fetch(`/api/admin/lessons/${lesson.id}`);
            const data = await response.json();
            const lessonData = data.lesson;

            // Parse contentData if it's a string, otherwise use as-is
            let contentDataStr = '{}';
            if (lessonData.contentData) {
                if (typeof lessonData.contentData === 'string') {
                    contentDataStr = lessonData.contentData;
                } else {
                    contentDataStr = JSON.stringify(lessonData.contentData, null, 2);
                }
            }

            setEditingLesson(lesson);
            setFormData({
                moduleId: lesson.moduleId,
                title: lesson.title,
                contentType: lesson.contentType,
                contentData: contentDataStr,
                pointsValue: lesson.pointsValue,
                orderIndex: lesson.orderIndex,
                status: lesson.status,
            });
            setShowForm(true);
        } catch (error) {
            console.error('Failed to fetch lesson details:', error);
            // Fallback to basic data
            setEditingLesson(lesson);
            setFormData({
                moduleId: lesson.moduleId,
                title: lesson.title,
                contentType: lesson.contentType,
                contentData: '{}',
                pointsValue: lesson.pointsValue,
                orderIndex: lesson.orderIndex,
                status: lesson.status,
            });
            setShowForm(true);
        }
    };

    const resetForm = () => {
        setShowForm(false);
        setEditingLesson(null);
        setFormData({
            moduleId: '',
            title: '',
            contentType: 'VIDEO',
            contentData: '{}',
            pointsValue: 10,
            orderIndex: 0,
            status: 'DRAFT',
        });
    };

    if (isLoading) return <div>Loading lessons...</div>;

    return (
        <div className="space-y-6">
            {!showForm && (
                <button onClick={() => setShowForm(true)} className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Add New Lesson
                </button>
            )}

            {showForm && (
                <div className="glass-card p-8">
                    <h3 className="text-xl font-bold mb-6">
                        {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Module *</label>
                                <select
                                    required
                                    value={formData.moduleId}
                                    onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="">Select a module</option>
                                    {modules.map((module) => (
                                        <option key={module.id} value={module.id}>
                                            {module.track?.name} → {module.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Content Type *</label>
                                <select
                                    value={formData.contentType}
                                    onChange={(e) => setFormData({ ...formData, contentType: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="VIDEO">Video</option>
                                    <option value="PDF">PDF</option>
                                    <option value="QUIZ">Quiz</option>
                                    <option value="ASSIGNMENT">Assignment</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Lesson Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="input-field w-full text-lg"
                                placeholder="e.g., Introduction to Automation"
                                style={{ minWidth: '100%' }}
                            />
                        </div>

                        {/* Content Editors */}
                        <div className="border border-[var(--border-color)] rounded-xl p-6 bg-[var(--background-secondary)]/30">
                            <label className="block text-sm font-medium mb-4">Content Configuration</label>

                            {formData.contentType === 'VIDEO' && (
                                <VideoEditor
                                    value={formData.contentData}
                                    onChange={(val) => setFormData({ ...formData, contentData: val })}
                                />
                            )}
                            {formData.contentType === 'PDF' && (
                                <PdfEditor
                                    value={formData.contentData}
                                    onChange={(val) => setFormData({ ...formData, contentData: val })}
                                />
                            )}
                            {formData.contentType === 'QUIZ' && (
                                <QuizEditor
                                    value={formData.contentData}
                                    onChange={(val) => setFormData({ ...formData, contentData: val })}
                                />
                            )}
                            {formData.contentType === 'ASSIGNMENT' && (
                                <AssignmentEditor
                                    value={formData.contentData}
                                    onChange={(val) => setFormData({ ...formData, contentData: val })}
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Points</label>
                                <input
                                    type="number"
                                    value={formData.pointsValue}
                                    onChange={(e) => setFormData({ ...formData, pointsValue: parseInt(e.target.value) })}
                                    className="input-field"
                                />
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

                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="DRAFT">Draft</option>
                                    <option value="PUBLISHED">Published</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="submit" className="btn-primary">
                                <Save className="w-5 h-5" />
                                {editingLesson ? 'Update Lesson' : 'Create Lesson'}
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
                {lessons.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        No lessons yet. Create modules first, then add lessons!
                    </div>
                ) : (
                    lessons.map((lesson) => (
                        <div key={lesson.id} className="p-4 flex items-center justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h4 className="font-bold">{lesson.title}</h4>
                                    <span className={`badge text-xs ${lesson.status === 'PUBLISHED'
                                        ? 'badge-success'
                                        : 'badge badge-warning'
                                        }`}>
                                        {lesson.status}
                                    </span>
                                    <span className="badge text-xs">{lesson.contentType}</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)]">
                                    {lesson.module?.track?.name} → {lesson.module?.name} • {lesson.pointsValue} pts
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(lesson)}
                                    className="p-2 rounded-lg hover:bg-[var(--background-card)]"
                                >
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDelete(lesson.id)}
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
