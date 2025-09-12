import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Spinner from '@/components/ui/Spinner';
import ErrorState from '@/components/ui/ErrorState';
import { getDigitalAssetById, getDigitalViewToken, logDigitalAudit } from '@/services/sisApi';
import { useAuth } from '@/hooks/useAuth';
import Watermark from '@/components/digital/Watermark';
import EBookReader from '@/components/digital/EBookReader';
import SecurePlayer from '@/components/digital/SecurePlayer';

const DigitalViewer: React.FC = () => {
    const { siteId, assetId } = useParams<{ siteId: string; assetId: string }>();
    const { user } = useAuth();

    const { data: asset, isLoading: isLoadingAsset } = useQuery({
        queryKey: ['digitalAsset', assetId],
        queryFn: () => getDigitalAssetById(assetId!),
        enabled: !!assetId,
    });

    const { data: viewToken, isLoading: isLoadingToken, isError, error } = useQuery({
        queryKey: ['digitalViewToken', assetId, user?.id],
        queryFn: () => getDigitalViewToken(assetId!),
        enabled: !!assetId && !!user,
        retry: false, // Don't retry on auth errors
    });

    useEffect(() => {
        if (assetId && user) {
            logDigitalAudit({ assetId, event: 'view_started' });
        }
    }, [assetId, user]);
    
    // Prevent context menu on the whole page to protect content
    useEffect(() => {
        const preventContext = (e: MouseEvent) => e.preventDefault();
        document.addEventListener('contextmenu', preventContext);
        return () => document.removeEventListener('contextmenu', preventContext);
    }, []);

    const isLoading = isLoadingAsset || isLoadingToken;
    const watermarkText = viewToken ? `${viewToken.watermark.name} • ${viewToken.watermark.userId}\n${new Date(viewToken.watermark.ts).toLocaleString()}` : '';

    return (
        <div className="select-none">
            <div className="mb-4">
                <Link to={`/library/${siteId}/digital`} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">&larr; Back to Digital Library</Link>
            </div>

            {isLoading && <div className="flex justify-center p-8"><Spinner /></div>}
            
            {isError && <ErrorState title="Access Denied" message={error?.message || "You do not have permission to view this asset, or your access has expired."} />}
            
            {!isLoading && asset && viewToken && (
                <>
                    <PageHeader
                        title={asset.title}
                        subtitle={<>
                            <span className="capitalize">{asset.kind.toLowerCase()}</span>
                            {asset.subject && ` • ${asset.subject}`}
                        </>}
                    />
                    <div className="relative mt-6">
                        <Watermark text={watermarkText} />
                        {asset.kind === 'EBOOK' && <EBookReader />}
                        {(asset.kind === 'AUDIO' || asset.kind === 'VIDEO') && <SecurePlayer kind={asset.kind} src={viewToken.src} />}
                    </div>
                </>
            )}
        </div>
    );
};

export default DigitalViewer;