'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, MoreVertical, UserPlus, Download, ChevronLeft, ChevronRight, CheckCircle, XCircle, FileSpreadsheet, FileText, File } from 'lucide-react';
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
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const exportMenuRef = useRef<HTMLDivElement>(null);
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

    // Selection Logic
    const toggleSelectAll = () => {
        if (selectedUsers.size === filteredUsers.length) {
            setSelectedUsers(new Set());
        } else {
            setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
        }
    };

    const toggleSelectUser = (id: string) => {
        // e.stopPropagation(); // Handled by parent td onClick
        const newSelected = new Set(selectedUsers);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedUsers(newSelected);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setShowExportMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getUsersToExport = () => {
        if (selectedUsers.size > 0) {
            return users.filter(u => selectedUsers.has(u.id)); // Use global users to find full object by ID to support selection across pages if needed, though for now filtering current view is safer. Actually, safer to filter 'users' (all loaded) by ID.
        }
        return filteredUsers;
    };

    const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
        setIsExporting(true);
        setShowExportMenu(false);

        try {
            const usersToExport = getUsersToExport();
            const timestamp = new Date().toISOString().split('T')[0];
            const fileName = `zenith_users_${timestamp}`;

            if (format === 'csv') {
                // CSV Export
                const headers = ['ID', 'Name', 'Email', 'Role', 'Points', 'Progress', 'Last Active', 'Joined Date'];
                const csvContent = [
                    headers.join(','),
                    ...usersToExport.map(user => [
                        user.id,
                        `"${user.name}"`,
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
                link.href = URL.createObjectURL(blob);
                link.download = `${fileName}.csv`;
                link.click();
            }
            else if (format === 'excel') {
                const XLSX = (await import('xlsx')).default;

                // Excel Export (xlsx)
                const data = usersToExport.map(user => ({
                    ID: user.id,
                    Name: user.name,
                    Email: user.email,
                    Role: user.role,
                    Points: user.points,
                    Progress: `${user.progress}%`,
                    'Last Active': user.lastActive,
                    'Joined Date': user.createdAt
                }));

                const worksheet = XLSX.utils.json_to_sheet(data);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Users");
                XLSX.writeFile(workbook, `${fileName}.xlsx`);
            }
            else if (format === 'pdf') {
                const jsPDF = (await import('jspdf')).default;
                const autoTable = (await import('jspdf-autotable')).default;

                // PDF Export
                const doc = new jsPDF();
                doc.text("Zenith AI Academy - User Report", 14, 20);
                doc.text(`Generated on: ${timestamp}`, 14, 28);

                autoTable(doc, {
                    startY: 35,
                    head: [['Name', 'Email', 'Role', 'Points', 'Progress', 'Last Active']],
                    body: usersToExport.map((u: any) => [
                        u.name,
                        u.email,
                        u.role,
                        u.points.toLocaleString(),
                        `${u.progress}%`,
                        u.lastActive
                    ]),
                });

                doc.save(`${fileName}.pdf`);
            }

        } catch (error) {
            console.error("Export failed", error);
            alert("Export failed. Please try again.");
        } finally {
            setIsExporting(false);
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

                <div className="flex items-center gap-3 relative" ref={exportMenuRef}>
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={isExporting || selectedUsers.size === 0}
                        className={`btn-secondary min-w-[140px] justify-between transition-all ${isExporting ? 'opacity-80 cursor-wait' : ''
                            } ${selectedUsers.size === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center">
                            {isExporting ? (
                                <div className="w-5 h-5 mr-2 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Download className="w-5 h-5 mr-2" />
                            )}
                            <span>{isExporting ? 'Exporting...' : 'Export'}</span>
                        </div>
                        {selectedUsers.size > 0 && (
                            <span className="ml-2 bg-[var(--primary)] text-white text-xs px-2 py-0.5 rounded-full">
                                {selectedUsers.size}
                            </span>
                        )}
                    </button>

                    {/* Styled Export Dropdown */}
                    {showExportMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-[var(--surface)] border border-[var(--border-color)] rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={() => handleExport('csv')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-secondary)] rounded-lg transition text-left"
                                >
                                    <FileText className="w-4 h-4 text-emerald-500" />
                                    CSV
                                </button>
                                <button
                                    onClick={() => handleExport('excel')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-secondary)] rounded-lg transition text-left"
                                >
                                    <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                    Excel (.xlsx)
                                </button>
                                <button
                                    onClick={() => handleExport('pdf')}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-[var(--background-secondary)] rounded-lg transition text-left"
                                >
                                    <File className="w-4 h-4 text-red-500" />
                                    PDF
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--border-color)] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[var(--border-color)] bg-[var(--background-secondary)]/30">
                                <th className="p-4 w-10">
                                    <input
                                        type="checkbox"
                                        className="rounded border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)] w-4 h-4 cursor-pointer"
                                        checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
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
                                        className={`border-b border-[var(--border-color)] transition cursor-pointer group ${selectedUsers.has(user.id) ? 'bg-[var(--primary)]/5' : 'hover:bg-[var(--background-secondary)]/50'
                                            }`}
                                    >
                                        <td className="p-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                className="rounded border-[var(--border-color)] bg-[var(--surface)] text-[var(--primary)] focus:ring-[var(--primary)] w-4 h-4 cursor-pointer"
                                                checked={selectedUsers.has(user.id)}
                                                onChange={() => toggleSelectUser(user.id)}
                                            />
                                        </td>
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
                                    <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
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
