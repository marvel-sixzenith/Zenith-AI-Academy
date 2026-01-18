'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GripVertical } from 'lucide-react';
import VideoEditor from './lesson-editors/VideoEditor';
import PdfEditor from './lesson-editors/PdfEditor';
import QuizEditor from './lesson-editors/QuizEditor';
import AssignmentEditor from './lesson-editors/AssignmentEditor';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable Lesson Item Component
function SortableLessonItem({
    lesson,
    onEdit,
    onDelete
}: {
    lesson: Lesson;
    onEdit: (lesson: Lesson) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lesson.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 flex items-center justify-between border-b border-[var(--border-color)] last:border-b-0 ${isDragging ? 'bg-[var(--primary)]/5' : ''}`}
        >
            <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <button
                    {...attributes}
                    {...listeners}
                    className="p-1.5 rounded-lg cursor-grab hover:bg-[var(--background-card)] text-[var(--text-muted)] active:cursor-grabbing"
                    title="Drag to reorder"
                >
                    <GripVertical className="w-5 h-5" />
                </button>

                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-[var(--text-muted)] font-mono bg-[var(--background-secondary)] px-1.5 py-0.5 rounded">
                            #{lesson.orderIndex + 1}
                        </span>
                        <h4 className="font-bold">{lesson.title}</h4>
                        <span className={`badge text-xs ${lesson.status === 'PUBLISHED'
                            ? 'badge-success'
                            : 'badge badge-warning'
                            }`}>
                            {lesson.status === 'PUBLISHED' ? '✅' : '📝'} {lesson.status}
                        </span>
                        <span className="badge text-xs">{lesson.contentType}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">
                        {lesson.module?.track?.name} → {lesson.module?.name} • {lesson.pointsValue} pts
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(lesson)}
                    className="p-2 rounded-lg hover:bg-[var(--background-card)]"
                >
                    <Edit className="w-5 h-5" />
                </button>
                <button
                    onClick={() => onDelete(lesson.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export default function LessonManager() {
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [selectedModuleFilter, setSelectedModuleFilter] = useState<string>('all');
    const [formData, setFormData] = useState({
        moduleId: '',
        title: '',
        contentType: 'VIDEO',
        contentData: '{}',
        pointsValue: 10,
        orderIndex: 0,
        status: 'DRAFT',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

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
            // Sort by orderIndex
            allLessons.sort((a: Lesson, b: Lesson) => a.orderIndex - b.orderIndex);
            setLessons(allLessons);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Get filtered lessons based on selected module
    const filteredLessons = selectedModuleFilter === 'all'
        ? lessons
        : lessons.filter(l => l.moduleId === selectedModuleFilter);

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = filteredLessons.findIndex(l => l.id === active.id);
        const newIndex = filteredLessons.findIndex(l => l.id === over.id);

        // Reorder locally
        const reorderedLessons = arrayMove(filteredLessons, oldIndex, newIndex);

        // Update order indices
        const updatedLessons = reorderedLessons.map((lesson, index) => ({
            ...lesson,
            orderIndex: index
        }));

        // Update state optimistically
        if (selectedModuleFilter === 'all') {
            setLessons(updatedLessons);
        } else {
            // Merge with lessons from other modules
            const otherLessons = lessons.filter(l => l.moduleId !== selectedModuleFilter);
            setLessons([...otherLessons, ...updatedLessons].sort((a, b) => a.orderIndex - b.orderIndex));
        }

        // Send updates to server
        try {
            await Promise.all(
                updatedLessons.map(lesson =>
                    fetch(`/api/admin/lessons/${lesson.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ orderIndex: lesson.orderIndex }),
                    })
                )
            );
        } catch (error) {
            console.error('Failed to update order:', error);
            // Revert on error
            fetchData();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            let contentDataToSend = formData.contentData.trim();

            // Handle VIDEO and PDF types - convert URL to proper JSON format
            if (formData.contentType === 'VIDEO' || formData.contentType === 'PDF') {
                try {
                    const parsed = JSON.parse(contentDataToSend);
                    contentDataToSend = JSON.stringify(parsed);
                } catch {
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
                try {
                    const parsed = JSON.parse(contentDataToSend);
                    contentDataToSend = JSON.stringify(parsed);
                } catch (error) {
                    alert('Invalid JSON format for content data. Please check your input.');
                    return;
                }
            }

            // Auto-calculate order index for new lessons
            let orderIndex = formData.orderIndex;
            if (!editingLesson) {
                const moduleLessons = lessons.filter(l => l.moduleId === formData.moduleId);
                orderIndex = moduleLessons.length; // Place at end
            }

            const url = editingLesson ? `/api/admin/lessons/${editingLesson.id}` : '/api/admin/lessons';
            const method = editingLesson ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    contentData: contentDataToSend,
                    orderIndex,
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
        try {
            const response = await fetch(`/api/admin/lessons/${lesson.id}`);
            const data = await response.json();
            const lessonData = data.lesson;

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
            <div className="flex flex-wrap items-center gap-4">
                {!showForm && (
                    <button onClick={() => setShowForm(true)} className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Add New Lesson
                    </button>
                )}

                {/* Module Filter for drag-and-drop */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-[var(--text-muted)]">Filter by module:</span>
                    <select
                        value={selectedModuleFilter}
                        onChange={(e) => setSelectedModuleFilter(e.target.value)}
                        className="input-field text-sm py-2"
                    >
                        <option value="all">All Modules</option>
                        {modules.map((module) => (
                            <option key={module.id} value={module.id}>
                                {module.track?.name} → {module.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Points Reward
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.pointsValue}
                                    onChange={(e) => setFormData({ ...formData, pointsValue: parseInt(e.target.value) || 0 })}
                                    className="input-field w-full"
                                />
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Points earned upon completion
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
                                <select
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    className="input-field w-full"
                                >
                                    <option value="DRAFT">📝 Draft</option>
                                    <option value="PUBLISHED">✅ Published</option>
                                </select>
                                <p className="text-xs text-[var(--text-muted)] mt-1">
                                    Draft = hidden from students
                                </p>
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

            {/* Lessons List with Drag and Drop */}
            <div className="glass-card overflow-hidden">
                <div className="p-4 border-b border-[var(--border-color)] bg-[var(--background-secondary)]/30">
                    <div className="flex items-center gap-2">
                        <GripVertical className="w-4 h-4 text-[var(--text-muted)]" />
                        <span className="text-sm text-[var(--text-muted)]">
                            Drag lessons to reorder them within the selected module
                        </span>
                    </div>
                </div>

                {filteredLessons.length === 0 ? (
                    <div className="p-8 text-center text-[var(--text-muted)]">
                        {selectedModuleFilter === 'all'
                            ? 'No lessons yet. Create modules first, then add lessons!'
                            : 'No lessons in this module yet.'}
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredLessons.map(l => l.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {filteredLessons.map((lesson) => (
                                <SortableLessonItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
