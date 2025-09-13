
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';

const PublicLanding: React.FC = () => {
    return (
        <div className="space-y-6">
            <PageHeader
                title="Public Conference Portal"
                subtitle="The front door for events/admissions and general information—no login required. Converts interest into registrations or enquiries."
            />

            <Card>
                <CardHeader><h3 className="text-lg font-bold">🎯 Purpose</h3></CardHeader>
                <CardContent>
                    <p>Be the front door for events/admissions and general information—no login required. Converts interest into registrations or enquiries.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">📋 Core Sections</h3></CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Conference Landing</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Hero + highlights, dates/venue, speakers, agenda snapshot, FAQ.</li>
                            <li>CTAs: Register Individual, Register Group, Volunteer, Contact.</li>
                            <li>Optional ticket tiers (free/paid), early-bird timers, sponsors strip.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Register (Individual / Group)</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>Individual: name, email/phone, country, accessibility & dietary fields, add-ons (workshops, childcare).</li>
                            <li>Group: organization/church name, leader details, number of delegates, bulk import CSV.</li>
                            <li>Payment step (if paid): card/mobile money/Bank module handoff; invoice/receipt email.</li>
                            <li>Confirmation page + email with QR code.</li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-semibold text-indigo-600 dark:text-indigo-400">Info Pages (CMS)</h4>
                        <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <li>About, Travel & Visas, Accommodation options, Venue maps, Policies (refund, safeguarding), Contact form.</li>
                            <li>Auto-pull News, Events, Gallery teasers.</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><h3 className="text-lg font-bold">🖥️ Workflow</h3></CardHeader>
                <CardContent>
                    <ul className="list-decimal list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Visitor hits landing → reads highlights → clicks Register.</li>
                        <li>Completes form (and payment if applicable) → receives email with QR + portal invite (optional).</li>
                        <li>Public pages handled via Front CMS (Pages/News/Events).</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">🔐 Permissions</h3></CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Public read-only.</li>
                        <li>Anti-spam: CAPTCHA on forms; rate limits; email verification.</li>
                    </ul>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader><h3 className="text-lg font-bold">🔗 Integrations</h3></CardHeader>
                <CardContent>
                    <p>Front CMS for content; Bank for payments; Comms for confirmations; Conference/Hotel for allocation later.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold text-green-600 dark:text-green-400">✅ Benefits</h3></CardHeader>
                <CardContent>
                     <p>High-conversion funnel; clear info; fewer support calls.</p>
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader><h3 className="text-lg font-bold">✍️ Acceptance Checklist</h3></CardHeader>
                <CardContent>
                     <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        <li>Public landing renders via Front CMS; Register Indiv/Group flows complete with email confirmations & QR.</li>
                    </ul>
                </CardContent>
            </Card>

        </div>
    );
};

export default PublicLanding;
