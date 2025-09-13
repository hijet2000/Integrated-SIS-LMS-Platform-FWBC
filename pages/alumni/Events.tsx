
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
import { alumniEventApi, alumniEventRsvpApi } from '@/services/sisApi';
import type { AlumniEvent, AlumniEventType, AlumniEventRSVP } from '@/types';

const EVENT_TYPES: AlumniEventType[] = ['Reunion', 'Career Fair', 'Fundraiser', 'Webinar', 'Other'];

const EventForm: React.FC<{
    event?: AlumniEvent | null;
    onSave: (data: Omit<AlumniEvent, 'id' | 'siteId'> | AlumniEvent) => void;
    onCancel: () => void;
    isSaving: boolean;
}> = ({ event, onSave, onCancel }) => {
    const [form, setForm] = useState({
        title: event?.title ?? '',
        description: event?.description ?? '',
        eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
        venue: event?.venue ?? '',
        eventType: event?.eventType ?? 'Reunion',
        rsvpRequired: event?.rsvpRequired ?? true,
        ticketPrice: event?.ticketPrice ?? 0,
    });

    const handleChange = (e: React.ChangeEvent<any>) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(event ? { ...event, ...form, eventDate: new Date(form.eventDate).toISOString() } : { ...form, eventDate: new Date(form.eventDate).toISOString() });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2"><label>Title *</label><input name="title" value={form.title} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Date & Time *</label><input type="datetime-local" name="eventDate" value={form.eventDate} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Venue *</label><input name="venue" value={form.venue} onChange={handleChange} required className="w-full rounded-md"/></div>
                <div><label>Event Type</label><select name="eventType" value={form.eventType} onChange={handleChange} className="w-full rounded-md">{EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                <div><label>Ticket Price ($)</label><input type="number" step="0.01" name="ticketPrice" value={form.ticketPrice} onChange={handleChange} className="w-full rounded-md"/></div>
                <div className="md:col-span-2"><label>Description</label><textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full rounded-md"/></div>
                <div><label className="flex items-center"><input type="checkbox" name="rsvpRequired" checked={form.rsvpRequired} onChange={handleChange} className="mr-2"/> RSVP Required</label></div>
            </div>
            <button type="submit" className="hidden"/>
        </form>
    );
};

const Events: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const queryClient = useQueryClient();
    const can = useCan();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<AlumniEvent | null>(null);

    // FIX: Replace complex permission check with a simple scope-based check `can('school:write')` to match the `useCan` hook's implementation and resolve the argument count error.
    const canManage = can('school:write');

    const { data: events = [], isLoading: l1 } = useQuery<AlumniEvent[], Error>({ queryKey: ['alumniEvents', siteId], queryFn: () => alumniEventApi.get(siteId!) });
    const { data: rsvps = [], isLoading: l2 } = useQuery<AlumniEventRSVP[], Error>({ queryKey: ['alumniRsvps', siteId], queryFn: () => alumniEventRsvpApi.get(siteId!) });
    
    const rsvpCountMap = useMemo(() => {
        const counts = new Map<string, number>();
        rsvps.forEach(r => {
            if (r.status === 'Attending') {
                counts.set(r.eventId, (counts.get(r.eventId) || 0) + 1);
            }
        });
        return counts;
    }, [rsvps]);

    const mutationOptions = { onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alumniEvents', siteId] }); setIsModalOpen(false); } };
    const addMutation = useMutation({ mutationFn: (item: any) => alumniEventApi.add(item), ...mutationOptions });
    const updateMutation = useMutation({ mutationFn: (item: AlumniEvent) => alumniEventApi.update(item.id, item), ...mutationOptions });
    const deleteMutation = useMutation({ mutationFn: (id: string) => alumniEventApi.delete(id), ...mutationOptions });
    const handleSave = (item: any) => selectedEvent ? updateMutation.mutate({ ...selectedEvent, ...item }) : addMutation.mutate(item);

    const isLoading = l1 || l2;

    return (
        <div>
            <PageHeader title="Alumni Events" actions={canManage && <Button onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}>Create Event</Button>} />
            
            {isLoading && <Spinner/>}
            {!isLoading && (
                events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map(event => (
                            <Card key={event.id} className="flex flex-col">
                                <CardHeader>
                                    <p className="text-sm text-indigo-500 font-semibold">{new Date(event.eventDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <h3 className="font-bold text-lg mt-1">{event.title}</h3>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{event.description}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center">
                                    <span className="text-sm font-bold">{rsvpCountMap.get(event.id) || 0} Attending</span>
                                    {canManage && <div className="space-x-2">
                                        <Button size="sm" variant="secondary" onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}>Edit</Button>
                                        <Button size="sm" variant="danger" onClick={() => deleteMutation.mutate(event.id)}>Delete</Button>
                                    </div>}
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : <EmptyState title="No Upcoming Events" message="Create an event to engage with your alumni." onAction={canManage ? () => setIsModalOpen(true) : undefined} actionText="Create Event"/>
            )}
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? 'Edit Event' : 'Create Event'}>
                <EventForm event={selectedEvent} onSave={handleSave} onCancel={() => setIsModalOpen(false)} isSaving={addMutation.isPending || updateMutation.isPending} />
                 <div className="flex justify-end gap-2 mt-4"><Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={() => document.querySelector('form button[type="submit"]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }))}>Save Event</Button></div>
            </Modal>
        </div>
    );
};

export default Events;
