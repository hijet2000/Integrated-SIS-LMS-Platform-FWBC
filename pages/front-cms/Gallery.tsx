import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import Modal from '@/components/ui/Modal';
import EmptyState from '@/components/ui/EmptyState';
import { useCan } from '@/hooks/useCan';
import { useAuth } from '@/hooks/useAuth';
import { cmsAlbumApi, cmsPhotoApi } from '@/services/sisApi';
import type { CmsAlbum, CmsPhoto } from '@/types';

const Gallery: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();

    const [isAlbumModalOpen, setAlbumModalOpen] = useState(false);
    const [isPhotoManagerOpen, setPhotoManagerOpen] = useState(false);
    const [selectedAlbum, setSelectedAlbum] = useState<CmsAlbum | null>(null);
    
    const canManage = can('update', 'front-cms.gallery', { kind: 'site', id: siteId! });

    const { data: albums = [], isLoading: l1 } = useQuery<CmsAlbum[], Error>({ queryKey: ['cmsAlbums', siteId], queryFn: () => cmsAlbumApi.get(siteId!) });
    const { data: photos = [], isLoading: l2 } = useQuery<CmsPhoto[], Error>({ queryKey: ['cmsPhotos', siteId], queryFn: () => cmsPhotoApi.get(siteId!) });

    const photoCountMap = useMemo(() => {
        return photos.reduce((acc, photo) => {
            acc.set(photo.albumId, (acc.get(photo.albumId) || 0) + 1);
            return acc;
        }, new Map<string, number>());
    }, [photos]);

    const albumMutationOptions = {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cmsAlbums', siteId] });
            setAlbumModalOpen(false);
        },
        onError: (err: Error) => alert(`Failed to save album: ${err.message}`),
    };

    const addAlbumMutation = useMutation({
        mutationFn: (data: any) => cmsAlbumApi.add(data),
        ...albumMutationOptions,
    });
    
    const updateAlbumMutation = useMutation({
        mutationFn: (data: CmsAlbum) => cmsAlbumApi.update(data.id, data),
        ...albumMutationOptions,
    });
    
    const deleteAlbumMutation = useMutation({
        mutationFn: (id: string) => cmsAlbumApi.delete(id),
        ...albumMutationOptions,
    });

    const handleSaveAlbum = (data: any) => {
        const payload = {
            ...data,
            createdBy: user!.id,
            createdAt: new Date().toISOString(),
        };
        if (selectedAlbum) {
            updateAlbumMutation.mutate({ ...selectedAlbum, ...payload });
        } else {
            addAlbumMutation.mutate(payload);
        }
    };
    
    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Gallery" subtitle="Manage photo albums for your school website." actions={canManage && <Button onClick={() => { setSelectedAlbum(null); setAlbumModalOpen(true); }}>Create Album</Button>} />
            
            {isLoading && <Spinner/>}
            {!isLoading && (
                albums.length > 0 ? (
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {albums.map(album => (
                            <Card key={album.id}>
                                {/* FIX: Property 'title' does not exist on type 'CmsAlbum'. Use 'name' instead. */}
                                <img src={album.coverImageUrl} alt={album.name} className="w-full h-40 object-cover" />
                                <CardHeader>
                                    {/* FIX: Property 'title' does not exist on type 'CmsAlbum'. Use 'name' instead. */}
                                    <h3 className="font-bold">{album.name}</h3>
                                    <p className="text-sm text-gray-500">{album.description}</p>
                                </CardHeader>
                                <CardFooter className="flex justify-between items-center">
                                    <span className="text-sm font-semibold">{photoCountMap.get(album.id) || 0} Photos</span>
                                    {canManage && <div className="space-x-2">
                                        <Button size="sm" onClick={() => { setSelectedAlbum(album); setPhotoManagerOpen(true); }}>Manage</Button>
                                        <Button size="sm" variant="danger" onClick={() => deleteAlbumMutation.mutate(album.id)}>Delete</Button>
                                    </div>}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : <EmptyState title="No Albums Found" message="Create a new album to start adding photos." onAction={canManage ? () => setAlbumModalOpen(true) : undefined} actionText="Create Album" />
            )}
            
            <Modal isOpen={isAlbumModalOpen} onClose={() => setAlbumModalOpen(false)} title={selectedAlbum ? 'Edit Album' : 'Create Album'}>
                <AlbumForm album={selectedAlbum} onSave={handleSaveAlbum} onCancel={() => setAlbumModalOpen(false)} isSaving={addAlbumMutation.isPending || updateAlbumMutation.isPending} />
            </Modal>
            
            {selectedAlbum && (
                 // FIX: Property 'title' does not exist on type 'CmsAlbum'. Use 'name' instead.
                 <Modal isOpen={isPhotoManagerOpen} onClose={() => setPhotoManagerOpen(false)} title={`Manage: ${selectedAlbum.name}`}>
                    <PhotoManager album={selectedAlbum} photos={photos.filter(p => p.albumId === selectedAlbum.id)} />
                </Modal>
            )}
        </div>
    );
};

// --- Album Form ---
const AlbumForm: React.FC<{ album: CmsAlbum | null, onSave: (data: any) => void, onCancel: () => void, isSaving: boolean }> = ({ album, onSave, onCancel, isSaving }) => {
    // FIX: Property 'title' does not exist on type 'CmsAlbum'. Use 'name' instead.
    const [form, setForm] = useState({ name: album?.name ?? '', description: album?.description ?? '', coverImageUrl: album?.coverImageUrl ?? 'https://via.placeholder.com/400x300/cccccc/1a202c?Text=New+Album' });
    return (
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
            {/* FIX: Property 'title' does not exist on type 'CmsAlbum'. Use 'name' instead. */}
            <div><label>Album Name</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full rounded-md" /></div>
            <div><label>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full rounded-md" rows={3}/></div>
            <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit" isLoading={isSaving}>Save Album</Button></div>
        </form>
    );
};

// --- Photo Manager ---
const PhotoManager: React.FC<{ album: CmsAlbum, photos: CmsPhoto[] }> = ({ album, photos }) => {
    const queryClient = useQueryClient();
    const photoMutationOptions = { onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cmsPhotos', album.siteId] }) };
    const addPhotoMutation = useMutation({ mutationFn: (data: any) => cmsPhotoApi.add(data), ...photoMutationOptions });
    const deletePhotoMutation = useMutation({ mutationFn: (id: string) => cmsPhotoApi.delete(id), ...photoMutationOptions });
    const setCoverMutation = useMutation({ mutationFn: (url: string) => cmsAlbumApi.update(album.id, { coverImageUrl: url }), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cmsAlbums', album.siteId] }) });
    
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            Array.from(e.target.files).forEach(file => {
                addPhotoMutation.mutate({ albumId: album.id, url: `https://via.placeholder.com/800x600?text=${file.name}`, orderIndex: 0 });
            });
        }
    };

    return (
        <div className="max-h-[60vh] overflow-y-auto">
            <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Add Photos</label>
                <input type="file" multiple onChange={handleFileUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map(photo => (
                    <div key={photo.id} className="relative group">
                        <img src={photo.url} alt={photo.caption || ''} className="w-full h-24 object-cover rounded-md" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center space-y-1">
                            <Button size="sm" onClick={() => setCoverMutation.mutate(photo.url)}>Set as Cover</Button>
                            <Button size="sm" variant="danger" onClick={() => deletePhotoMutation.mutate(photo.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Gallery;