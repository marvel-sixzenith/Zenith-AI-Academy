'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MoreVertical, UserPlus, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import Image from 'next/image';

interface UserTableProps {
    users: any[];
}

const roleColors: Record<string, string> = {
    MEMBER: 'var(--primary)',
    ADMIN: 'var(--success)',
};

export default function UserTable({ users }: UserTableProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Filter users
    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
    const paginatedUsers = filteredUsers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExportCSV = () => {
        const headers = ['ID', 'Name', 'Email', 'Role', 'Points', 'Progress', 'Last Active', 'Joined Date'];
        const csvContent = [
            headers.join(','),
            ...filteredUsers.map(user => [
                user.id,
                `"${user.name}"`, // Quote name to handle commas
                user.email,
                user.role,
                user.points,
                `${user.progress}%`,
                user.lastActive,
                user.createdAt
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `zenith_users_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--surface)] border border-[var(--border-color)] focus:border-[var(--primary)] outline-none transition"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExportCSV}
                        className="btn-secondary"
                    >
                        <Download className="w-5 h-5 mr-2" />
                        Export CSV
                    </button>
                    {/* Placeholder for Add User */}
                    <button className="btn-primary opacity-50 cursor-not-allowed">
                        <UserPlus className="w-5 h-5 mr-2" />
                        Add User
                    </button>
                </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--background-secondary)]/30">
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">User</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Role</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Points</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Progress</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Last Active</th>
                                <th className="text-left p-4 text-sm font-medium text-[var(--text-muted)]">Joined</th>
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedUsers.length > 0 ? (
                                paginatedUsers.map((user) => (
                                    <tr
                                        key={user.id}
                                        onClick={() => router.push(`/admin/users/${user.id}`)}
                                        className="border-b border-[var(--border-color)] hover:bg-[var(--background-secondary)]/50 transition cursor-pointer group"
                                    >
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                {user.image ? (
                                                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[var(--border-color)] relative">
                                                        <Image src={user.image} alt={user.name} fill className="object-cover" />
                                                    </div>
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-medium shrink-0">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-medium group-hover:text-[var(--primary)] transition-colors">{user.name}</p>
                                                    <p className="text-sm text-[var(--text-muted)]">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className="px-2 py-1 rounded-full text-xs font-medium"
                                                style={{
                                                    backgroundColor: `color-mix(in srgb, ${roleColors[user.role] || 'gray'} 15%, transparent)`,
                                                    color: roleColors[user.role] || 'gray'
                                                }}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 font-mono font-medium">{user.points.toLocaleString()}</td>
                                        <td className="p-4">
                                            <div className="w-24 h-1.5 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-[var(--primary)] rounded-full"
                                                    style={{ width: `${user.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-[var(--text-muted)] mt-1 block">{user.progress}%</span>
                                        </td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{user.lastActive}</td>
                                        <td className="p-4 text-sm text-[var(--text-muted)]">{user.createdAt}</td>
                                        <td className="p-4 text-right">
                                            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                                        No users found matching "{searchTerm}"
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-[var(--border-color)] flex items-center justify-between">
                        <p className="text-sm text-[var(--text-muted)]">
                            Showing {Math.min(filteredUsers.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredUsers.length, currentPage * itemsPerPage)} of {filteredUsers.length}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg hover:bg-[var(--background-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg hover:bg-[var(--background-secondary)] disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
