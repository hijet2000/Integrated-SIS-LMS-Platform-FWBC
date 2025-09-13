import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Spinner from '@/components/ui/Spinner';
import { verifyCertificate } from '@/services/sisApi';
import type { IssuedCertificate } from '@/types';

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const VerifyCertificate: React.FC = () => {
    const { serialId } = useParams<{ serialId: string }>();

    const { data: certificate, isLoading, isError } = useQuery<IssuedCertificate | undefined, Error>({
        queryKey: ['verifyCertificate', serialId],
        queryFn: () => verifyCertificate(serialId!),
        enabled: !!serialId,
        retry: 1,
    });

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-500">Verifying document...</p>
                </div>
            );
        }

        if (isError || !certificate) {
            return (
                 <div className="flex flex-col items-center text-center">
                    <XCircleIcon className="w-24 h-24 text-red-500" />
                    <h2 className="mt-4 text-2xl font-bold text-red-800">Invalid Document</h2>
                    <p className="mt-2 text-gray-600">The serial number <span className="font-mono bg-gray-200 px-1 rounded">{serialId}</span> does not correspond to a valid document in our system.</p>
                </div>
            );
        }

        if (certificate.status === 'Valid') {
             return (
                 <div className="flex flex-col items-center text-center">
                    <CheckCircleIcon className="w-24 h-24 text-green-500" />
                    <h2 className="mt-4 text-2xl font-bold text-green-800">Document Verified</h2>
                    <p className="mt-2 text-gray-600">This is a valid document issued by FaithEdu Institutions.</p>
                    <div className="mt-6 text-left bg-green-50 p-4 rounded-lg border border-green-200 w-full max-w-md">
                        <p><strong>Serial Number:</strong> {certificate.serialId}</p>
                        <p><strong>Recipient:</strong> {certificate.recipientName}</p>
                        <p><strong>Issued On:</strong> {new Date(certificate.issueDate).toLocaleDateString()}</p>
                        <p><strong>Issued By:</strong> {certificate.issuedByName}</p>
                        <p><strong>Status:</strong> <span className="font-bold text-green-700">{certificate.status}</span></p>
                    </div>
                </div>
            );
        }

        return (
            <div className="flex flex-col items-center text-center">
                <XCircleIcon className="w-24 h-24 text-yellow-500" />
                <h2 className="mt-4 text-2xl font-bold text-yellow-800">Document Revoked</h2>
                <p className="mt-2 text-gray-600">This document is no longer valid.</p>
                <div className="mt-6 text-left bg-yellow-50 p-4 rounded-lg border border-yellow-200 w-full max-w-md">
                    <p><strong>Serial Number:</strong> {certificate.serialId}</p>
                    <p><strong>Status:</strong> <span className="font-bold text-yellow-700">{certificate.status}</span></p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                    <div className="flex items-center justify-center mb-6">
                         <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">FaithEdu</h1>
                    </div>
                    {renderContent()}
                </div>
                <p className="text-center text-xs text-gray-400 mt-4">
                    This is an automated verification system. If you have questions, please contact the institution directly.
                </p>
            </div>
        </div>
    );
};

export default VerifyCertificate;
