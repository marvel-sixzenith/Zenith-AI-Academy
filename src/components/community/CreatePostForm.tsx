'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Channel {
    id: string;
    name: string;
}

export default function CreatePostForm({ channels }: { channels: Channel[] }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [formData, setFormData] = useState({
        channelId: channels[0]?.id || '',
        title: '',
        content: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Auto-assign channel logic
        let targetChannelId = channels.find(c => c.name === 'General')?.id || channels[0]?.id;
        const lowerContent = (formData.title + ' ' + formData.content).toLowerCase();

        if (lowerContent.includes('help') || lowerContent.includes('error') || lowerContent.includes('bug') || lowerContent.includes('issue') || lowerContent.includes('?')) {
            targetChannelId = channels.find(c => c.name === 'Help')?.id || targetChannelId;
        } else if (lowerContent.includes('show') || lowerContent.includes('check') || lowerContent.includes('feedback')) {
            // Fallback to General/Announcements if Showcase doesn't exist, here we assume General is fine or specific logic
            // If we had a 'Showcase' channel we'd pick it.
            // For now, let's stick to General as default, or maybe Random if it's off-topic.
            // Let's keep it simple: Help logic is the most important one.
        }

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    channelId: targetChannelId
                }),
            });

            if (response.ok) {
                setFormData({ channelId: '', title: '', content: '' });
                setIsExpanded(false);
                router.refresh();
                // Ideally show a toast here
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card p-6 transition-all duration-200">
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full text-left p-4 rounded-xl bg-[var(--background-secondary)] hover:bg-[var(--background-secondary)]/80 transition-all text-[var(--text-muted)] flex items-center gap-3 group"
                >
                    <div className="w-10 h-10 rounded-full bg-[var(--surface)] flex items-center justify-center border border-[var(--border-color)] group-hover:border-[var(--primary)]/50 transition-colors">
                        <Send className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                    </div>
                    <span className="text-lg">What&apos;s on your mind?</span>
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Post title..."
                        className="w-full bg-transparent text-xl font-bold placeholder-[var(--text-muted)] border-none focus:ring-0 px-0 py-2"
                        required
                        autoFocus
                    />

                    <div className="h-px w-full bg-[var(--border-color)]" />

                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share your thoughts... (We'll automatically categorize this for you)"
                        className="w-full bg-[var(--background-secondary)]/30 rounded-xl p-4 min-h-[120px] focus:ring-1 focus:ring-[var(--primary)] border-none resize-y placeholder-[var(--text-muted)]"
                        required
                    />

                    <div className="flex gap-3 justify-end pt-2">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="btn-ghost"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary min-w-[100px]"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Posting...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Send className="w-4 h-4" />
                                    Post
                                </span>
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
