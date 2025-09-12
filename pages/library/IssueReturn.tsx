
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { bookApi, libraryMemberApi, bookIssueApi, getStudents, getTeachers } from '@/services/sisApi';
// FIX: Corrected import path for domain types from '@/constants' to '@/types' to resolve module resolution errors.
import type { Book, LibraryMember, BookIssue, Student, Teacher } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

const BarcodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M3 10h18M3 14h18M3 18h18M8 3v18M12 3v18M16 3v18"/></svg>
);

const IssueReturn: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [memberSearch, setMemberSearch] = useState('');
    const [bookSearch, setBookSearch] = useState('');
    const [selectedMember, setSelectedMember] = useState<LibraryMember | null>(null);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [isScanning, setIsScanning] = useState<false | 'member' | 'book'>(false);


    const canRead = can('read', 'library.issue-return', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'library.issue-return', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'library.issue-return', { kind: 'site', id: siteId! });

    const { data: books = [], isLoading: l1 } = useQuery<Book[], Error>({ queryKey: ['books', siteId], queryFn: () => bookApi.get(siteId!) });
    const { data: members = [], isLoading: l2 } = useQuery<LibraryMember[], Error>({ queryKey: ['libraryMembers', siteId], queryFn: () => libraryMemberApi.get(siteId!) });
    const { data: issues = [], isLoading: l3 } = useQuery<BookIssue[], Error>({ queryKey: ['bookIssues', siteId], queryFn: () => bookIssueApi.get(siteId!) });
    const { data: students = [], isLoading: l4 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: teachers = [], isLoading: l5 } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });

    const isLoading = l1 || l2 || l3 || l4 || l5;

    const issueMutation = useMutation({
        mutationFn: (data: { bookId: string; memberId: string; }) => bookIssueApi.add({
            ...data,
            issueDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], // 14 days from now
            status: 'Issued',
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookIssues', siteId] });
            queryClient.invalidateQueries({ queryKey: ['books', siteId] });
            alert('Book issued successfully!');
            setSelectedBook(null);
            setBookSearch('');
        },
        onError: (err: Error) => alert(`Failed to issue book: ${err.message}`),
    });

    const returnMutation = useMutation({
        mutationFn: (issue: BookIssue) => bookIssueApi.update(issue.id, { ...issue, status: 'Returned', returnDate: new Date().toISOString().split('T')[0] }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bookIssues', siteId] });
            queryClient.invalidateQueries({ queryKey: ['books', siteId] });
            alert('Book returned successfully!');
        },
        onError: (err: Error) => alert(`Failed to return book: ${err.message}`),
    });

    const userMap = useMemo(() => {
        const map = new Map<string, string>();
        students.forEach(s => map.set(s.id, `${s.firstName} ${s.lastName}`));
        teachers.forEach(t => map.set(t.id, t.name));
        return map;
    }, [students, teachers]);

    const memberWithUserNameMap = useMemo(() => {
        const map = new Map<string, { name: string, libraryCardNo: string, type: 'Student' | 'Teacher' }>();
        members.forEach(m => {
            const name = userMap.get(m.userId) || 'Unknown User';
            map.set(m.id, { name, libraryCardNo: m.libraryCardNo, type: m.memberType });
        });
        return map;
    }, [members, userMap]);

    const bookMap = useMemo(() => new Map(books.map(b => [b.id, b])), [books]);
    const memberSearchResults = useMemo(() => memberSearch ? members.filter(m => m.libraryCardNo.toLowerCase().includes(memberSearch.toLowerCase()) || memberWithUserNameMap.get(m.id)?.name.toLowerCase().includes(memberSearch.toLowerCase())) : [], [members, memberSearch, memberWithUserNameMap]);
    const bookSearchResults = useMemo(() => bookSearch ? books.filter(b => b.title.toLowerCase().includes(bookSearch.toLowerCase()) || b.isbn.includes(bookSearch)) : [], [books, bookSearch]);

    const activeIssues = useMemo(() => issues.filter(i => i.status !== 'Returned'), [issues]);

    const handleIssue = () => {
        if (selectedMember && selectedBook) {
            issueMutation.mutate({ memberId: selectedMember.id, bookId: selectedBook.id });
        }
    };
    
    const handleScan = async (type: 'member' | 'book') => {
        setIsScanning(type);
        // In a real app, this would use navigator.mediaDevices.getUserMedia and a barcode scanning library.
        // For this demo, we simulate a scan with a delay and a hardcoded result.
        await new Promise(resolve => setTimeout(resolve, 500)); 

        let scannedId: string | null = null;
        
        if (type === 'member') {
            const memberToScan = members.find(m => m.id !== selectedMember?.id && m.status === 'Active');
            scannedId = memberToScan ? memberToScan.libraryCardNo : null;
            if (scannedId) {
                const foundMember = members.find(m => m.libraryCardNo === scannedId);
                if (foundMember) {
                    setSelectedMember(foundMember);
                    setMemberSearch(''); // clear search
                } else {
                    alert(`Member with Card No. "${scannedId}" not found.`);
                }
            } else {
                alert('Simulation failed: No other active member found to scan.');
            }
        } else if (type === 'book') {
            const bookToScan = books.find(b => b.available > 0 && b.id !== selectedBook?.id);
            scannedId = bookToScan ? bookToScan.isbn : null;
            if (scannedId) {
                const foundBook = books.find(b => b.isbn === scannedId);
                if (foundBook) {
                    if (foundBook.available > 0) {
                        setSelectedBook(foundBook);
                        setBookSearch(''); // clear search
                    } else {
                        alert(`Book "${foundBook.title}" is currently not available.`);
                    }
                } else {
                    alert(`Book with ISBN "${scannedId}" not found.`);
                }
            } else {
                alert('Simulation failed: No other available book found to scan.');
            }
        }
        
        setIsScanning(false);
    };

    if (!canRead && !canCreate && !canUpdate) {
        return <ErrorState title="Access Denied" message="You do not have permission to manage book circulation." />;
    }

    return (
        <div>
            <PageHeader title="Issue / Return Books" />
            
            {isLoading && <div className="flex justify-center p-8"><Spinner/></div>}

            {!isLoading && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-lg">1. Find Member</h3></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-grow">
                                        <input type="text" placeholder="Search by Card No. or Name..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} className="w-full rounded-md"/>
                                        {memberSearchResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                                {memberSearchResults.map(m => (
                                                    <li key={m.id} onClick={() => { setSelectedMember(m); setMemberSearch(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
                                                        {memberWithUserNameMap.get(m.id)?.name} ({m.libraryCardNo})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        size="md"
                                        className="px-3"
                                        onClick={() => handleScan('member')}
                                        isLoading={isScanning === 'member'}
                                        aria-label="Scan Member ID"
                                    >
                                        <BarcodeIcon />
                                    </Button>
                                </div>
                                {selectedMember && (
                                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-sm">
                                        <p><strong>Name:</strong> {memberWithUserNameMap.get(selectedMember.id)?.name}</p>
                                        <p><strong>Card No:</strong> {selectedMember.libraryCardNo}</p>
                                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setSelectedMember(null)}>Clear</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader><h3 className="font-semibold text-lg">2. Find Book</h3></CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2">
                                    <div className="relative flex-grow">
                                        <input type="text" placeholder="Search by Title or ISBN..." value={bookSearch} onChange={e => setBookSearch(e.target.value)} disabled={!selectedMember} className="w-full rounded-md"/>
                                        {bookSearchResults.length > 0 && (
                                            <ul className="absolute z-10 w-full bg-white dark:bg-gray-800 border rounded-md mt-1 shadow-lg max-h-48 overflow-y-auto">
                                                {bookSearchResults.map(b => (
                                                    <li key={b.id} onClick={() => { setSelectedBook(b); setBookSearch(''); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm">
                                                        {b.title} ({b.available > 0 ? <span className="text-green-600">{b.available} available</span> : <span className="text-red-600">Unavailable</span>})
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                     <Button
                                        variant="secondary"
                                        size="md"
                                        className="px-3"
                                        onClick={() => handleScan('book')}
                                        isLoading={isScanning === 'book'}
                                        disabled={!selectedMember}
                                        aria-label="Scan Book ID"
                                    >
                                        <BarcodeIcon />
                                    </Button>
                                </div>
                                {selectedBook && (
                                    <div className="mt-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md text-sm">
                                        <p><strong>Title:</strong> {selectedBook.title}</p>
                                        <p><strong>Author:</strong> {selectedBook.author}</p>
                                        <p><strong>Available Copies:</strong> {selectedBook.available}</p>
                                        <Button size="sm" variant="secondary" className="mt-2" onClick={() => setSelectedBook(null)}>Clear</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Button className="w-full" onClick={handleIssue} disabled={!selectedMember || !selectedBook || selectedBook.available <= 0 || !canCreate} isLoading={issueMutation.isPending}>Issue Book</Button>
                    </div>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader><h3 className="font-semibold text-lg">Currently Issued Books</h3></CardHeader>
                            <CardContent>
                                {activeIssues.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y">
                                            <thead><tr>
                                                <th className="p-2 text-left text-xs uppercase">Book Title</th>
                                                <th className="p-2 text-left text-xs uppercase">Member</th>
                                                <th className="p-2 text-left text-xs uppercase">Due Date</th>
                                                <th className="p-2 text-right text-xs uppercase">Actions</th>
                                            </tr></thead>
                                            <tbody className="divide-y">
                                                {activeIssues.map(issue => {
                                                    const isOverdue = new Date(issue.dueDate) < new Date();
                                                    return (
                                                        <tr key={issue.id}>
                                                            <td className="p-2">{bookMap.get(issue.bookId)?.title || 'Unknown Book'}</td>
                                                            <td className="p-2">{memberWithUserNameMap.get(issue.memberId)?.name || 'Unknown Member'}</td>
                                                            <td className={`p-2 font-semibold ${isOverdue ? 'text-red-500' : ''}`}>{new Date(issue.dueDate + 'T00:00:00').toLocaleDateString()} {isOverdue && '(Overdue)'}</td>
                                                            <td className="p-2 text-right">
                                                                {canUpdate && <Button size="sm" onClick={() => returnMutation.mutate(issue)} isLoading={returnMutation.isPending && returnMutation.variables?.id === issue.id}>Return</Button>}
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : <EmptyState title="No Books Issued" message="No books are currently on loan." />}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default IssueReturn;
