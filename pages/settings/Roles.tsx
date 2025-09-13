
import React from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card, { CardContent } from '@/components/ui/Card';

const content = {
    title: 'System Settings — Overview',
    subtitle: 'Controls global settings, integrations, security, user management, and customization. Scoped per-tenant (siteId, optionally campusId) but with super-admin override.',
    sections: [
      {
          title: '1) General / Session / Notification',
          items: [
              { title: 'General Settings', text: 'School name, logo, contact details, timezone, academic year start.' },
              { title: 'Branding', text: 'theme colors, report headers/footers.' },
              { title: 'Session Settings', text: 'Define academic sessions (e.g., 2024–2025).\nSet start/end dates, holidays, weekends.' },
              { title: 'Notification Settings', text: 'Configure which events trigger notices: fee reminders, attendance alerts, exam results, system updates.\nChoose channels (Portal, Email, SMS, WhatsApp, Push).' }
          ]
      },
      {
          title: '2) SMS / Email / Payment Methods',
          items: [
              { title: 'SMS Gateways', text: 'Plug in Twilio, Nexmo, local SMS APIs.\nConfigure sender ID, rate limits.' },
              { title: 'Email', text: 'SMTP or transactional providers (SendGrid, AWS SES, Gmail).\nDKIM/SPF checks for deliverability.' },
              { title: 'Payment Methods', text: 'Stripe, PayPal, Razorpay, Flutterwave, Mobile Money.\nEnable per-site (Bank module ties in here).\nTest mode vs live.' }
          ]
      },
      {
          title: '3) Print Header & Footer',
          text: 'Define custom headers/footers for all PDFs: Receipts, Certificates, Marksheets, ID cards.\nElements: school logo, motto, signatures, QR codes for verification.\nPreview before save.'
      },
      {
          title: '4) Front CMS Setting',
          text: 'Control website defaults:',
          list: [
              'Default home banner set.',
              'SEO defaults (title/description).',
              'Analytics tags (Google Analytics, Matomo).',
              'Social links, favicon.',
              'Toggle modules: show/hide Events, Gallery, News, Alumni.'
          ]
      },
      {
          title: '5) Roles & Permissions',
          text: 'Manage RBAC with Spatie-like granularity:',
          list: [
              'Global roles (Admin, Teacher, Student, Parent).',
              'Custom roles (Exam Officer, Transport Manager).',
              'Assign permissions per module/sub-module.',
              'Scope roles: global, site, campus.',
              'Audit log of role changes.'
          ]
      },
      {
          title: '6) Backup / Restore',
          text: 'On-demand or scheduled backups:',
          list: [
              'Database (Postgres).',
              'Uploaded media.',
              'Store locally or external (AWS S3, Google Drive).',
              'Restore workflow: select backup, preview data size, confirm.',
              'Notifications on backup success/failure.'
          ]
      },
      {
          title: '7) Languages / Users / Modules',
          items: [
              { title: 'Languages', text: 'Multi-language UI; switcher per user.\nManage translations.' },
              { title: 'Users', text: 'Add/edit users, assign roles.\nPassword reset, MFA enforcement.' },
              { title: 'Modules', text: 'Enable/disable system modules (Library, Hostel, Alumni, etc.).\nOptional per-site feature flags.' }
          ]
      },
      {
          title: '8) Custom Fields / Captcha',
          items: [
              { title: 'Custom Fields', text: 'Add extra fields to Student/Staff profiles.\nField types: text, number, date, dropdown, multi-select.\nMark required/optional, visible on forms/reports.' },
              { title: 'Captcha', text: 'Enable CAPTCHA on login, admission, and forms.\nProviders: Google reCAPTCHA, hCaptcha.' }
          ]
      },
      {
          title: '9) System Fields / Student Profile Update',
          items: [
              { title: 'System Fields', text: 'Configure which fields are visible/editable (e.g., show guardian occupation, hide blood group).' },
              { title: 'Student Profile Update', text: 'Allow/disallow students/parents to update certain profile fields via portal.\nPending approvals by admin.' }
          ]
      },
      {
          title: '10) File Types / System Update',
          items: [
              { title: 'File Types', text: 'Whitelist file extensions and max size per module (Assignments, Library, Comms).\nSecurity: block dangerous types.' },
              { title: 'System Update', text: 'Admin triggers system version updates.\nLogs release notes, applies DB migrations safely.\nHealth check pre/post update.' }
          ]
      }
    ],
    benefits: [
        'Centralized control = one place for all configs.',
        'Tenant safety: backups & restore prevent data loss.',
        'Compliance: audit-ready role logs, CAPTCHA, data fields.',
        'Flexibility: customize per school without touching core code.'
    ]
  };

const SystemSettingsOverview: React.FC = () => {
    return (
      <div>
        <PageHeader
          title={content.title}
          subtitle={content.subtitle}
        />
  
        <div className="space-y-6">
          {content.sections.map((section, index) => (
            <Card key={index}>
              <CardContent>
                <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">{section.title}</h2>
                <div className="space-y-4 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {section.text && <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{section.text}</p>}
                    {section.items?.map((item, subIndex) => (
                        <div key={subIndex}>
                        <h3 className="font-semibold text-indigo-600 dark:text-indigo-400">{item.title}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{item.text}</p>
                        </div>
                    ))}
                    {section.list && (
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            {section.list.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    )}
                </div>
              </CardContent>
            </Card>
          ))}
  
          <Card>
            <CardContent>
              <h2 className="text-xl font-bold text-green-600 dark:text-green-400 mb-2">✅ Benefits</h2>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {content.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };
  
  export default SystemSettingsOverview;
