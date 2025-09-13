import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import { useCan } from '@/hooks/useCan';
import { bookApi } from '@/services/sisApi';
// FIX: Corrected import path for domain types.
import type { Book } from '@/types';
import EmptyState from '@/components/ui/EmptyState';

type BookStatus = 'Available' | 'All Issued';

const getBookStatus = (book: Book): BookStatus => {
    if (book.available > 0) return 'Available';
    return 'All Issued';
};

const statusColors: { [key in BookStatus]: string } = {
    Available: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    'All Issued': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
};


const BookForm: React.FC<{
    book?: Book | null;
    onSave: (book: Omit<Book, 'id' | 'siteId' | 'available'> | (Book & { newQuantity: number })) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ book, onSave, onCancel }) => {
    const [formState, setFormState] = useState({
        title: book?.title ?? '',
        author: book?.author ?? '',
        isbn: book?.isbn ?? '',
        publisher: book?.publisher ?? '',
        year: book?.year ?? new Date().getFullYear(),
        edition: book?.edition ?? '',
        category: book?.category ?? '',
        language: book?.language ?? 'English',
        quantity: book?.quantity ?? 1,
        shelf: book?.shelf ?? '',
        coverUrl: book?.coverUrl ?? '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormState(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) || 0 : value,
        }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormState(prev => ({ ...prev, coverUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (book) {
            // Pass the original book data along with the new quantity and other form state
            onSave({ ...book, ...formState, newQuantity: formState.quantity });
        } else {
            // When adding, 'available' will be set to 'quantity' on the backend.
            onSave(formState as Omit<Book, 'id' | 'siteId' | 'available'>);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium">Title <span className="text-red-500">*</span></label><input type="text" name="title" value={formState.title} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Author <span className="text-red-500">*</span></label><input type="text" name="author" value={formState.author} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">ISBN/Accession No <span className="text-red-500">*</span></label><input type="text" name="isbn" value={formState.isbn} onChange={handleChange} required className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Publisher</label><input type="text" name="publisher" value={formState.publisher} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Publication Year</label><input type="number" name="year" value={formState.year} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Edition</label><input type="text" name="edition" value={formState.edition} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Category/Subject</label><input type="text" name="category" value={formState.category} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Language</label><input type="text" name="language" value={formState.language} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Number of Copies <span className="text-red-500">*</span></label><input type="number" name="quantity" value={formState.quantity} onChange={handleChange} required min="0" className="mt-1 w-full rounded-md"/></div>
                <div><label className="block text-sm font-medium">Shelf/Location</label><input type="text" name="shelf" value={formState.shelf} onChange={handleChange} className="mt-1 w-full rounded-md"/></div>
            </div>
            <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium">Book Cover</label>
                <input type="file" accept="image/*" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                {formState.coverUrl && <img src={formState.coverUrl} alt="Cover preview" className="mt-2 h-32 w-auto object-contain border p-1 rounded" />}
            </div>
            <div className="hidden"><button type="submit"/></div>
        </form>
    );
};


const BookList: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [filters, setFilters] = useState({ searchTerm: '', language: 'all', status: 'all' });
    
    const canRead = can('read', 'library', { kind: 'site', id: siteId! });
    const canCreate = can('create', 'library', { kind: 'site', id: siteId! });
    const canUpdate = can('update', 'library', { kind: 'site', id: siteId! });
    const canDelete = can('delete', 'library', { kind: 'site', id: siteId! });

    const { data: books, isLoading, isError, error } = useQuery<Book[], Error>({
        queryKey: ['books', siteId],
        queryFn: () => bookApi.get(siteId!),
        enabled: canRead,
    });
    
    const mutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['books', siteId] });
            setIsModalOpen(false);
        },
        onError: (err: Error) => alert(`Operation failed: ${err.message}`),
    };

    const addMutation = useMutation({
        mutationFn: (newBook: Omit<Book, 'id' | 'siteId' | 'available'>) => {
            return bookApi.add({ ...newBook, available: newBook.quantity });
        },
        ...mutationOptions
    });
    
    const updateMutation = useMutation({
        mutationFn: (bookData: Book & { newQuantity: number }) => {
            const quantityChange = bookData.newQuantity - bookData.quantity;
            const newAvailable = Math.max(0, bookData.available + quantityChange);
            return bookApi.update(bookData.id, { ...bookData, quantity: bookData.newQuantity, available: newAvailable });
        },
        ...mutationOptions
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => bookApi.delete(id),
        ...mutationOptions
    });

    const handleSave = (bookData: Omit<Book, 'id' | 'siteId' | 'available'> | (Book & { newQuantity: number })) => {
        if ('id' in bookData) {
            updateMutation.mutate(bookData);
        } else {
            addMutation.mutate(bookData);
        }
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this book? This will remove all copies.')) {
            deleteMutation.mutate(id);
        }
    };

    const uniqueLanguages = useMemo(() => {
        if (!books) return [];
        const languages = new Set(books.map(b => b.language).filter((l): l is string => !!l));
        return Array.from(languages).sort();
    }, [books]);
    
    const filteredBooks = useMemo(() => {
        if (!books) return [];
        return books
            .filter(b => filters.status === 'all' || getBookStatus(b) === filters.status)
            .filter(b => filters.language === 'all' || b.language === filters.language)
            .filter(b => !filters.searchTerm || 
                b.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                b.author.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                b.isbn.toLowerCase().includes(filters.searchTerm.toLowerCase())
            );
    }, [books, filters]);

    if (!canRead) {
        return <ErrorState title="Access Denied" message="You do not have permission to view the library." />;
    }
// FIX: The component was missing a return statement, which caused a type error. Added the main JSX structure for the page.
    return (
        <div>
            <PageHeader
                title="Book List"
                subtitle="Browse and manage all books in the library."
                actions={canCreate && <Button onClick={() => { setSelectedBook(null); setIsModalOpen(true); }}>Add Book</Button>}
            />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Books</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input type="text" placeholder="Search title, author, ISBN..." value={filters.searchTerm} onChange={e => setFilters(f => ({ ...f, searchTerm: e.target.value }))} className="w-full rounded-md"/>
                    <select value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))} className="w-full rounded-md">
                        <option value="all">All Languages</option>
                        {uniqueLanguages.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                    </select>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value as 'all' | BookStatus }))} className="w-full rounded-md">
                        <option value="all">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="All Issued">All Issued</option>
                    </select>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
                    {isError && <ErrorState title="Failed to load books" message={error.message} />}
                    {!isLoading && !isError && (
                        filteredBooks.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y">
                                    <thead>
                                        <tr>
                                            <th className="p-2 text-left">Title</th>
                                            <th className="p-2 text-left">Author</th>
                                            <th className="p-2 text-left">ISBN</th>
                                            <th className="p-2 text-left">Copies (Available)</th>
                                            <th className="p-2 text-left">Status</th>
                                            <th className="p-2 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {filteredBooks.map(book => {
                                            const status = getBookStatus(book);
                                            return (
                                            <tr key={book.id}>
                                                <td className="p-2 font-semibold">{book.title}</td>
                                                <td className="p-2">{book.author}</td>
                                                <td className="p-2">{book.isbn}</td>
                                                <td className="p-2">{book.quantity} ({book.available})</td>
                                                <td className="p-2"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status]}`}>{status}</span></td>
                                                <td className="p-2 text-right space-x-2">
                                                    {canUpdate && <Button size="sm" variant="secondary" onClick={() => { setSelectedBook(book); setIsModalOpen(true); }}>Edit</Button>}
                                                    {canDelete && <Button size="sm" variant="danger" onClick={() => handleDelete(book.id)}>Delete</Button>}
                                                </td>
                                            </tr>
                                        )})}
                                    </tbody>
                                </table>
                            </div>
                        ) : <EmptyState title="No Books Found" message="No books match your search. Try adding one." />
                    )}
                </CardContent>
            </Card>
            
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedBook ? 'Edit Book' : 'Add Book'}
                footer={
                    <>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))} isLoading={addMutation.isPending || updateMutation.isPending} className="ml-2">Save</Button>
                    </>
                }
            >
                <BookForm book={selectedBook} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
            </Modal>
        </div>
    );
};
export default BookList;