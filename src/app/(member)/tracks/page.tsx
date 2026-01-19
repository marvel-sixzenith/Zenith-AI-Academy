import { auth } from '@/lib/auth';
import { getTracks } from '@/lib/tracks';
import TrackCardInteractive from '@/components/learning/TrackCardInteractive';

export default async function TracksPage() {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
        return null;
    }

    const tracks = await getTracks(userId);

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Track Pembelajaran</h1>
                <p className="text-[var(--text-secondary)]">
                    Pilih jalur pembelajaran yang sesuai dengan tujuan karir Anda.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {tracks.map((track: any) => (
                    <TrackCardInteractive key={track.id} track={track} />
                ))}
            </div>
        </div>
    );
}
