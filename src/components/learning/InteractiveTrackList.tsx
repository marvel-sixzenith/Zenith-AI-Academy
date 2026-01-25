'use client';

import { useState } from 'react';
import TrackCardInteractive from './TrackCardInteractive';

interface InteractiveTrackListProps {
    tracks: any[];
}

export default function InteractiveTrackList({ tracks }: InteractiveTrackListProps) {
    const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

    const handleToggle = (id: string) => {
        setActiveTrackId(prev => (prev === id ? null : id));
    };

    return (
        <div className="grid md:grid-cols-3 gap-3 md:gap-6 items-start">
            {tracks.map((track) => (
                <TrackCardInteractive
                    key={track.id}
                    track={track}
                    isExpanded={activeTrackId === track.id}
                    onToggle={() => handleToggle(track.id)}
                />
            ))}
        </div>
    );
}
