import React from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { libraryApi } from '@/services/libraryApi'
import type { DigitalAsset } from '@/types/library'
import SecurePlayer from '@/components/digital/SecurePlayer'
import EBookReader from '@/components/digital/EBookReader'
import Spinner from '@/components/ui/Spinner'
import ErrorState from '@/components/ui/ErrorState'

export default function DigitalViewer() {
  const { siteId = 'site_123', assetId = '' } = useParams()

  const { data, error, isLoading } = useQuery({
    queryKey: ['digital-asset', siteId, assetId],
    queryFn: () => libraryApi.getDigitalAsset(assetId),
    enabled: !!assetId,
  })

  if (!assetId) return <div className="p-6 text-red-600">Missing asset id.</div>
  if (isLoading) return <div className="p-6">Loading asset…</div>
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>

  const asset = data as DigitalAsset

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{asset.title}</h1>

      {asset.kind === 'VIDEO' && <SecurePlayer kind="VIDEO" src={asset.storageKey} />}

      {asset.kind === 'AUDIO' && (
         <SecurePlayer kind="AUDIO" src={asset.storageKey} />
      )}

      {asset.kind === 'EBOOK' && (
        <EBookReader />
      )}

      <div className="text-xs text-gray-500">
        Streaming only. Downloads and screen captures are prohibited by policy.
      </div>
    </div>
  )
}