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

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                setFormData({ channelId: channels[0]?.id || '', title: '', content: '' });
                setIsExpanded(false);
                router.refresh();
            }
        } catch (error) {
            console.error('Failed to create post:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="glass-card p-4">
            {!isExpanded ? (
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full text-left p-3 rounded-lg bg-[var(--background-card)] hover:bg-[var(--background-secondary)] transition text-[var(--text-muted)]"
                >
                    What&apos;s on your mind?
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <select
                        value={formData.channelId}
                        onChange={(e) => setFormData({ ...formData, channelId: e.target.value })}
                        className="input-field"
                        required
                    >
                        {channels.map((channel) => (
                            <option key={channel.id} value={channel.id}>
                                {channel.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Post title..."
                        className="input-field"
                        required
                    />

                    <textarea
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        placeholder="Share your thoughts..."
                        className="input-field"
                        rows={4}
                        required
                    />

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={() => setIsExpanded(false)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary" disabled={isSubmitting}>
                            <Send className="w-5 h-5" />
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}
