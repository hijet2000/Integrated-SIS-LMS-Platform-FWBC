
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

const GuestDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Guest / Attendee Portal"
                subtitle="A self-service dashboard for registered attendees: credentials, schedule, tickets/QR, accommodation, payments, kids programs, and notifications."
            />

            <Card>
                <CardHeader><h3 className="text-lg font-bold">🎯 Purpose</h3></CardHeader>
                <CardContent>
                    <p>Give registered attendees a self-service dashboard: credentials, schedule, tickets/QR, accommodation, payments, kids programs, and notifications.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">📋 Core Modules</h3></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">My Dashboard</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Registration status, QR badge, announcements, outstanding actions (upload ID/visa letter, pay balance).</li>
                            <li>Quick cards: My Schedule, Accommodation, Kids Check-in, Receipts.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">My Schedule</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Personalized timetable (sessions, workshops).</li>
                            <li>Add/remove optional sessions (capacity aware); room/venue map; “Add to calendar (.ics)”.</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Accommodation</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Booking summary (hotel/site), room, dates; roommate info (if shared).</li>
                            <li>Change requests / special needs (routed to admins).</li>
                            <li>For on-site hostels: bed/room and check-in QR.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Wallet / Payments</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Invoices, receipts, partial payments, refunds.</li>
                            <li>Pay now (Bank portal handoff), show balance; export receipts PDF.</li>
                            <li>If Faith Coin enabled: balance & transactions.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Kids / Programs (optional)</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Child profiles, assigned groups, check-in QR, dietary/allergy flags.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Profile & Documents</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Contact details, photo, ID/visa uploads, consent forms.</li>
                            <li>Status checks (verified / pending).</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Messages & Notifications</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Targeted announcements; alerts (room change, session updates, transport times).</li>
                        </ul>
                    </div>
                     <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Support / Help Desk</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Raise ticket (lost item, schedule conflict, invoice query).</li>
                            <li>Track status and replies.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">🖥️ Workflow</h3></CardHeader>
                <CardContent>
                     <ul className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>User logs in (email+OTP or password).</li>
                        <li>Lands on Dashboard → sees QR, tasks, next session.</li>
                        <li>Navigates to Schedule/Accommodation/Wallet; updates details.</li>
                        <li>At venue: uses QR for badge printing and kids check-in.</li>
                    </ul>
                </CardContent>
            </Card>

             <Card>
                <CardHeader><h3 className="text-lg font-bold">🔐 Permissions & Tenancy</h3></CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Scope by siteId (conference) and, where relevant, campusId.</li>
                        <li>Guests see only their records; admins/coordinators see assigned attendees.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">🔗 Integrations</h3></CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Conference: registration, sessions, check-in, volunteers.</li>
                        <li>Hotel/Hostel: room & bed assignments, check-in QR.</li>
                        <li>Bank: invoices, receipts, Faith Coin (optional).</li>
                        <li>Comms: confirmations, reminders, on-site alerts via Email/SMS/WhatsApp.</li>
                        <li>Live Broadcast (optional): stream links for hybrid sessions.</li>
                        <li>Vehicle Requests (if enabled publicly): airport shuttles.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">📊 Reports (staff view)</h3></CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Attendee health: completed vs pending tasks.</li>
                        <li>Payment status by cohort; accommodation fill rate.</li>
                        <li>Check-in spikes; support ticket categories.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold text-green-600 dark:text-green-400">✅ Benefits</h3></CardHeader>
                <CardContent>
                     <p>Reduces desk load; improves attendee experience; real-time accuracy for allocations and finance.</p>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><h3 className="text-lg font-bold">✍️ Acceptance Checklist</h3></CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Guest login shows QR badge, schedule, payments, accommodation.</li>
                        <li>RBAC & tenancy enforced; data visible only to the right site/campus.</li>
                        <li>Payments/receipts work end-to-end (mock or live Bank integration).</li>
                        <li>Comms sends confirmations and reminders; Help Desk tickets flow.</li>
                    </ul>
                </CardContent>
            </Card>

        </div>
    );
};

export default GuestDashboard;
