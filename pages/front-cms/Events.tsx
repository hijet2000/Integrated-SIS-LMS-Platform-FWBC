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
import { useAuth } from '@/constants/useAuth';
import { cmsEventApi, cmsEventRsvpApi } from '@/services/sisApi';
import type { CmsEvent, CmsEventRsvp, CmsEventStatus, CmsEventAudience } from '@/types';

const STATUS_OPTIONS: CmsEventStatus[] = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];
const AUDIENCE_OPTIONS: CmsEventAudience[] = ['Public', 'Parents', 'Students', 'Staff', 'Alumni'];

const statusColors: { [key in CmsEventStatus]: string } = {
  DRAFT: 'bg-gray-100 text-gray-800 dark:bg-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50',
  PUBLISHED: 'bg-green-100 text-green-800 dark:bg-green-900/50',
  ARCHIVED: 'bg-red-100 text-red-800 dark:bg-red-900/50',
};

// --- Event Form Component ---
const EventForm: React.FC<{
    event?: CmsEvent | null;
    onSave: (data: Omit<CmsEvent, 'id' | 'siteId'> | CmsEvent) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ event, onSave, onCancel }) => {
    const [form, setForm] = useState({
        title: event?.title ?? '',
        summary: event?.summary ?? '',
        description: event?.description ?? '',
        startDate: event?.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
        endDate: event?.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
        venue: event?.venue ?? '',
        audience: event?.audience ?? [],
        coverImageUrl: event?.coverImageUrl ?? '',
        status: event?.status ?? 'DRAFT',
        rsvpEnabled: event?.rsvpEnabled ?? false,
        ticketCapacity: event?.ticketCapacity ?? 100,
        ticketPrice: event?.ticketPrice ?? 0,
    });

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;
        if (name === 'audience') {
            const options = Array.from(e.target.selectedOptions, (option: any) => option.value);
            setForm(prev => ({ ...prev, audience: options }));
        } else {
            setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(event ? { ...event, ...form } : form as Omit<CmsEvent, 'id' | 'siteId'>);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Event Title *</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Start Date & Time *</label><input type="datetime-local" name="startDate" value={form.startDate} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>End Date & Time *</label><input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Venue *</label><input name="venue" value={form.venue} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Status</label><select name="status" value={form.status} onChange={handleChange} className="w-full rounded-md">{STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                <div className="md:col-span-2"><label>Summary</label><input name="summary" value={form.summary} onChange={handleChange} className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={4} className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Cover Image URL</label><input name="coverImageUrl" value={form.coverImageUrl} onChange={handleChange} className="w-full rounded-md"/></div>
                <div><label>Audience</label><select multiple name="audience" value={form.audience} onChange={handleChange} className="w-full rounded-md h-24">{AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}</select></div>
                <div className="space-y-2">
                    <label className="flex items-center"><input type="checkbox" name="rsvpEnabled" checked={form.rsvpEnabled} onChange={handleChange} className="mr-2"/> Enable RSVP/Ticketing</label>
                    {form.rsvpEnabled && <>
                        <div><label>Capacity</label><input type="number" name="ticketCapacity" value={form.ticketCapacity} onChange={handleChange} className="w-full rounded-md"/></div>
                        <div><label>Ticket Price ($)</label><input type="number" step="0.01" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} className="w-full rounded-md"/></div>
                    </>}
                </div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const CmsEvents: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();
    const { user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CmsEvent | null>(null);
    const [statusFilter, setStatusFilter] = useState<CmsEventStatus | 'all'>('all');

    const canManage = can('update', 'front-cms.events', { kind: 'site', id: siteId! });

    const { data: events = [], isLoading: l1 } = useQuery<CmsEvent[], Error>({ queryKey: ['cmsEvents', siteId], queryFn: () => cmsEventApi.get(siteId!) });
    const { data: rsvps = [] } = useQuery<CmsEventRsvp[], Error>({ queryKey: ['cmsRsvps', siteId], queryFn: () => cmsEventRsvpApi.get(siteId!) });
    
    const rsvpCountMap = useMemo(() => {
        return rsvps.reduce((acc, rsvp) => {
            acc.set(rsvp.eventId, (acc.get(rsvp.eventId) || 0) + 1);
            return acc;
        }, new Map<string, number>());
    }, [rsvps]);
    
    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cmsEvents', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => cmsEventApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: CmsEvent) => cmsEventApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => cmsEventApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => {
        const payload = { ...item, createdBy: user!.id, createdAt: new Date().toISOString(), slug: item.title.toLowerCase().replace(/\s+/g, '-') };
        selectedEvent ? updateMutation.mutate({ ...selectedEvent, ...payload }) : addMutation.mutate(payload);
    };
    
    const filteredEvents = useMemo(() => {
        return events.filter(e => statusFilter === 'all' || e.status === statusFilter);
    }, [events, statusFilter]);

    const isLoading = l1;

    return (
        <div>
            <PageHeader title="Manage Events" subtitle="Create and publish events for your school website." actions={canManage && <Button onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}>Create Event</Button>} />
            
            <Card className="mb-6">
                <CardHeader><h3 className="font-semibold">Filter Events</h3></CardHeader>
                <CardContent>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} className="rounded-md">
                        <option value="all">All Statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </CardContent>
            </Card>
            
            {isLoading && <Spinner/>}
            {!isLoading && (
                filteredEvents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map(event => (
                            <Card key={event.id} className="flex flex-col">
                                <img src={event.coverImageUrl} alt={event.title} className="w-full h-40 object-cover"/>
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-lg">{event.title}</h3>
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[event.status]}`}>{event.status}</span>
                                    </div>
                                    <p className="text-sm text-indigo-500 font-semibold mt-1">{new Date(event.startDate).toLocaleString()}</p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.summary}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <span className="text-sm font-bold">{rsvpCountMap.get(event.id) || 0} RSVPs</span>
                                    {canManage && <div className="space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(event.id)}>Delete</Button>
                                    </div>}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : <EmptyState title="No Events Found" message="Create an event to engage with your community." onAction={canManage ? () => setIsModalOpen(true) : undefined} actionText="Create Event"/>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? 'Edit Event' : 'Create Event'}>
                <EventForm event={selectedEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
                 <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save Event</Button></div>
            </Modal>
        </div>
    );
};

export default CmsEvents;