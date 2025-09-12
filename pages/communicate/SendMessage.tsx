
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import Card, { CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { useCan } from '@/hooks/useCan';
import { getClassrooms, getStudents, getTeachers } from '@/services/sisApi';
import type { Classroom, Student, Teacher, Role } from '@/types';
import { ROLES } from '@/constants';

type Channel = 'Email' | 'SMS' | 'Telegram' | 'WhatsApp' | 'Custom';
type RecipientGroup = 'All Students' | 'All Staff' | 'By Class' | 'By Role' | 'Individual';

const SendMessage: React.FC = () => {
    const { siteId } = useParams<{ siteId: string }>();
    const can = useCan();

    // --- State Management ---
    const [channel, setChannel] = useState<Channel>('Email');
    const [customChannelName, setCustomChannelName] = useState('');
    const [recipientGroup, setRecipientGroup] = useState<RecipientGroup>('All Students');
    const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
    const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
    const [selectedIndividuals, setSelectedIndividuals] = useState<string[]>([]);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [attachment, setAttachment] = useState<File | null>(null);

    // --- Permissions ---
    const canSend = can('create', 'communicate.send', { kind: 'site', id: siteId! });

    // --- Data Fetching ---
    const { data: classrooms = [], isLoading: l1 } = useQuery<Classroom[], Error>({ queryKey: ['classrooms', siteId], queryFn: () => getClassrooms(siteId!) });
    const { data: students = [], isLoading: l2 } = useQuery<Student[], Error>({ queryKey: ['students', siteId], queryFn: () => getStudents(siteId!) });
    const { data: teachers = [], isLoading: l3 } = useQuery<Teacher[], Error>({ queryKey: ['teachers', siteId], queryFn: () => getTeachers(siteId!) });
    
    const allUsers = useMemo(() => [
        ...students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}`, role: 'student' })),
        ...teachers.map(t => ({ id: t.id, name: t.name, role: 'teacher' })) // Simplification
    ], [students, teachers]);
    
    const sendMutation = useMutation({
        mutationFn: () => new Promise(resolve => setTimeout(resolve, 1000)), // Mock API call
        onSuccess: () => alert('Message sent successfully! (Simulation)'),
        onError: () => alert('Failed to send message.'),
    });

    const isLoading = l1 || l2 || l3;
    
    const recipientSummary = useMemo(() => {
        switch (recipientGroup) {
            case 'All Students': return 'All Students & Parents';
            case 'All Staff': return 'All Staff Members';
            case 'By Class':
                return `Students & Parents in: ${selectedClassIds.map(id => classrooms.find(c => c.id === id)?.name).join(', ')}`;
            case 'By Role':
                return `Users with roles: ${selectedRoles.join(', ')}`;
            case 'Individual':
                return `Individuals: ${selectedIndividuals.map(id => allUsers.find(u => u.id === id)?.name).join(', ')}`;
            default: return 'No recipients selected.';
        }
    }, [recipientGroup, selectedClassIds, selectedRoles, selectedIndividuals, classrooms, allUsers]);


    if (!canSend) {
        return <ErrorState title="Access Denied" message="You do not have permission to send messages." />;
    }

    return (
        <div>
            <PageHeader title="Send Message" subtitle="Compose and send targeted messages to students, staff, and parents." />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Message Composition */}
                <Card className="lg:col-span-2">
                    <CardHeader><h3 className="font-semibold text-lg">Compose Message</h3></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium">Channel</label>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-1">
                                <label className="flex items-center"><input type="radio" name="channel" value="Email" checked={channel === 'Email'} onChange={() => setChannel('Email')} className="mr-1" /> Email</label>
                                <label className="flex items-center"><input type="radio" name="channel" value="SMS" checked={channel === 'SMS'} onChange={() => setChannel('SMS')} className="mr-1" /> SMS</label>
                                <label className="flex items-center"><input type="radio" name="channel" value="Telegram" checked={channel === 'Telegram'} onChange={() => setChannel('Telegram')} className="mr-1" /> Telegram</label>
                                <label className="flex items-center"><input type="radio" name="channel" value="WhatsApp" checked={channel === 'WhatsApp'} onChange={() => setChannel('WhatsApp')} className="mr-1" /> WhatsApp</label>
                                <label className="flex items-center">
                                    <input type="radio" name="channel" value="Custom" checked={channel === 'Custom'} onChange={() => setChannel('Custom')} className="mr-1" /> Custom
                                    {channel === 'Custom' && (
                                        <input 
                                            type="text" 
                                            value={customChannelName} 
                                            onChange={e => setCustomChannelName(e.target.value)} 
                                            placeholder="e.g., Slack" 
                                            className="ml-2 p-1 text-sm border-gray-300 rounded-md dark:bg-gray-900 dark:border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    )}
                                </label>
                            </div>
                        </div>
                        
                        {(channel === 'Email') && (
                            <div>
                                <label className="block text-sm font-medium">Subject</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="mt-1 w-full rounded-md" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium">Message Body</label>
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={10} className="mt-1 w-full rounded-md" />
                            <p className="text-xs text-gray-500 mt-1">Available placeholders: `{'{{student_name}}'}`, `{'{{class}}'}`, `{'{{due_amount}}'}`</p>
                        </div>
                        
                        {['Email', 'Telegram', 'WhatsApp'].includes(channel) && (
                            <div>
                                <label className="block text-sm font-medium">Attachment</label>
                                <input type="file" onChange={e => setAttachment(e.target.files?.[0] || null)} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-end space-x-2">
                        <Button variant="secondary">Schedule</Button>
                        <Button isLoading={sendMutation.isPending}>Send Now</Button>
                    </CardFooter>
                </Card>

                {/* Recipient Selection */}
                <Card>
                    <CardHeader><h3 className="font-semibold text-lg">Select Recipients</h3></CardHeader>
                    <CardContent className="space-y-4">
                         {isLoading ? <Spinner/> : (
                             <>
                                <div>
                                    <label className="block text-sm font-medium">Recipient Group</label>
                                    <select value={recipientGroup} onChange={e => setRecipientGroup(e.target.value as RecipientGroup)} className="mt-1 w-full rounded-md">
                                        <option>All Students</option>
                                        <option>All Staff</option>
                                        <option>By Class</option>
                                        <option>By Role</option>
                                        <option>Individual</option>
                                    </select>
                                </div>

                                {recipientGroup === 'By Class' && (
                                    <div>
                                        <label className="block text-sm font-medium">Select Classes</label>
                                        <select multiple value={selectedClassIds} onChange={e => setSelectedClassIds(Array.from(e.target.selectedOptions, option => option.value))} className="mt-1 w-full rounded-md h-32">
                                            {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                )}
                                
                                {recipientGroup === 'By Role' && (
                                     <div>
                                        <label className="block text-sm font-medium">Select Roles</label>
                                        <select multiple value={selectedRoles} onChange={e => setSelectedRoles(Array.from(e.target.selectedOptions, option => option.value as Role))} className="mt-1 w-full rounded-md h-32">
                                            {ROLES.map(r => <option key={r} value={r}>{r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                                        </select>
                                    </div>
                                )}
                                
                                {recipientGroup === 'Individual' && (
                                    <div>
                                        <label className="block text-sm font-medium">Search & Select</label>
                                         <p className="text-xs text-gray-500 mt-1">Individual search and selection UI would be here.</p>
                                    </div>
                                )}
                                
                                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                                    <h4 className="font-semibold text-sm">Summary</h4>
                                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{recipientSummary}</p>
                                </div>
                             </>
                         )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SendMessage;
