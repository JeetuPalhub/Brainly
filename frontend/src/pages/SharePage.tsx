import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { brainAPI } from '../utils/api';
import { Content, SharedBrain } from '../types';

const typeLabel: Record<Content['type'], string> = {
  document: 'Document',
  tweet: 'Tweet',
  youtube: 'YouTube',
  link: 'Link'
};

const SharePage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [sharedBrain, setSharedBrain] = useState<SharedBrain | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!shareId) {
      setLoading(false);
      setError('Missing share ID');
      return;
    }

    setLoading(true);
    setError('');

    void brainAPI
      .getSharedBrain(shareId)
      .then((response) => setSharedBrain(response.data as SharedBrain))
      .catch((err: any) => {
        setSharedBrain(null);
        setError(err?.response?.data?.message || 'Unable to load this shared brain');
      })
      .finally(() => setLoading(false));
  }, [shareId]);

  const contentCount = useMemo(() => sharedBrain?.content?.length || 0, [sharedBrain]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto" />
          <p className="mt-4 text-slate-300">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error || !sharedBrain) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl border border-red-500/40 bg-red-900/20 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Share Link Unavailable</h1>
          <p className="text-red-200 mb-6">{error || 'This shared page does not exist'}</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-slate-900 hover:bg-slate-100 transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/70 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{sharedBrain.username}'s Second Brain</h1>
            <p className="text-sm text-slate-300 mt-1">
              {contentCount} saved {contentCount === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Link to="/" className="text-sm text-cyan-300 hover:text-cyan-200">
            Open your own workspace
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        {sharedBrain.content.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-slate-200 text-lg">No items have been shared yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sharedBrain.content.map((item) => (
              <article key={item._id} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition">
                {item.metadata?.image && (
                  <img
                    src={item.metadata.image}
                    alt={item.title}
                    className="w-full h-44 object-cover rounded-xl mb-4"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                )}

                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                    {typeLabel[item.type] || item.type}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h2 className="text-lg font-semibold text-white line-clamp-2 mb-2">{item.title}</h2>
                <p className="text-sm text-slate-300 line-clamp-3 mb-3">
                  {item.aiSummary || item.metadata?.description || 'No summary available for this item.'}
                </p>

                {(item.metadata?.siteName || item.metadata?.domain) && (
                  <p className="text-xs text-slate-400 mb-3">
                    {item.metadata?.siteName || item.metadata?.domain}
                  </p>
                )}

                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-300 hover:text-cyan-200 break-all"
                >
                  {item.link}
                </a>

                {item.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <span
                        key={tag._id}
                        className="text-xs px-2 py-1 rounded-full bg-slate-700/70 border border-slate-500/30 text-slate-200"
                      >
                        #{tag.title}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SharePage;
