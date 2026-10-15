import { useState } from 'react';
import { FileText, ShieldCheck } from 'lucide-react';
import type { Asset, Doc } from '../types';
import { formatDateTime } from '../format';
import { Button, Modal } from './ui';

export function DocumentList({ asset }: { asset: Asset }) {
  const [preview, setPreview] = useState<Doc | null>(null);
  return (
    <>
      <ul className="divide-y divide-ink-100">
        {asset.documents.map((doc) => (
          <li key={doc.id}>
            <button type="button" onClick={() => setPreview(doc)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-ink-50/60">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-700">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-ink-900">{doc.name}</span>
                <span className="block text-xs text-ink-500">
                  {doc.size} · added {formatDateTime(doc.addedAt)}
                </span>
              </span>
              <span className="shrink-0 text-xs font-medium text-sky-800">View</span>
            </button>
          </li>
        ))}
      </ul>
      <Modal open={!!preview} onClose={() => setPreview(null)} title={preview?.name ?? ''}>
        {preview && (
          <div className="space-y-4">
            <div className="rounded-xl border border-ink-100 bg-ink-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-500">{asset.issuer}</p>
              <p className="mt-1 text-lg font-semibold text-ink-950">{preview.name.replace(/\.pdf$/, '')}</p>
              <p className="mt-1 text-sm text-ink-600">{asset.name}</p>
              <div className="mt-4 space-y-2" aria-hidden>
                {[92, 100, 84, 96, 70].map((w, i) => (
                  <div key={i} className="h-2 rounded bg-ink-200" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
            <p className="flex items-start gap-2 text-sm text-ink-600">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" aria-hidden />
              Document hash anchored on OUSIA Chain. This is a mock document for the demo; no real file is attached.
            </p>
            <Button variant="secondary" className="w-full" onClick={() => setPreview(null)} data-autofocus>
              Close preview
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
