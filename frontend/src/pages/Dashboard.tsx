import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../utils/AuthContext';
import { brainAPI, collectionAPI, contentAPI } from '../utils/api';
import { AISuggestions, Collection, Content, ContentMetadata } from '../types';
import Sidebar from '../components/Sidebar';
import SearchBar from '../components/SearchBar';
import EditContentModal from '../components/EditContentModel';
import ThemeToggle from '../components/ThemeToggle';
import { useNotification } from '../utils/NotificationContext';
import { FiEdit2, FiTrash2, FiShare2, FiPlus, FiFolderMinus, FiMenu, FiUpload } from 'react-icons/fi';
import Spotlight from '../components/aceternity/Spotlight';
import Card3D from '../components/aceternity/Card3D';
import AnimatedTabs from '../components/aceternity/AnimatedTabs';
import MovingBorderButton from '../components/aceternity/MovingBorderButton';
import BackgroundBeams from '../components/aceternity/BackgroundBeams';
import ChatInterface from '../components/ChatInterface';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 100
    }
  }
};

const Dashboard: React.FC = () => {
  const EditIcon = FiEdit2 as React.ComponentType<{ className?: string }>;
  const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string }>;
  const ShareIcon = FiShare2 as React.ComponentType<{ className?: string }>;
  const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;
  const FolderMinusIcon = FiFolderMinus as React.ComponentType<{ className?: string }>;
  const MenuIcon = FiMenu as React.ComponentType<{ className?: string }>;
  const UploadIcon = FiUpload as React.ComponentType<{ className?: string }>;

  const [contents, setContents] = useState<Content[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [filteredContents, setFilteredContents] = useState<Content[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [semanticMode, setSemanticMode] = useState(false);
  const [semanticLoading, setSemanticLoading] = useState(false);
  const [semanticSource, setSemanticSource] = useState<'huggingface' | 'fallback' | ''>('');
  const { success: notifySuccess, error: notifyError, info: notifyInfo } = useNotification();
  const tabItems = [
    { id: 'all', label: 'All' },
    { id: 'document', label: 'Docs' },
    { id: 'tweet', label: 'Tweets' },
    { id: 'youtube', label: 'Videos' },
    { id: 'link', label: 'Links' }
  ];

  const { username, logout } = useAuth();
  const navigate = useNavigate();

  const filterContents = useCallback(() => {
    let filtered = [...contents];

    if (activeCollectionId) {
      filtered = filtered.filter((c) => c.collectionId?._id === activeCollectionId);
    }

    if (activeFilter !== 'all') {
      if (activeFilter.startsWith('tag:')) {
        const tagName = activeFilter.replace('tag:', '');
        filtered = filtered.filter((c) =>
          c.tags.some((t) => t.title.toLowerCase() === tagName.toLowerCase())
        );
      } else {
        filtered = filtered.filter((c) => c.type === activeFilter);
      }
    }

    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(normalizedQuery) ||
          c.link.toLowerCase().includes(normalizedQuery) ||
          c.tags.some((t) => t.title.toLowerCase().includes(normalizedQuery)) ||
          Boolean(c.collectionId?.name.toLowerCase().includes(normalizedQuery)) ||
          Boolean(c.aiSummary?.toLowerCase().includes(normalizedQuery)) ||
          Boolean(c.metadata?.description?.toLowerCase().includes(normalizedQuery)) ||
          Boolean(c.metadata?.domain?.toLowerCase().includes(normalizedQuery))
      );
    }

    setFilteredContents(filtered);
  }, [contents, activeCollectionId, activeFilter, searchQuery]);

  useEffect(() => {
    void Promise.all([fetchContents(), fetchCollections()])
      .then(() => console.log('Initial fetch completed'))
      .catch(err => console.error('Initial fetch failed', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (!semanticMode || !searchQuery.trim()) {
        setSemanticSource('');
        setSemanticLoading(false);
        filterContents();
        return;
      }

      setSemanticLoading(true);
      void contentAPI
        .semanticSearch(searchQuery.trim(), 50)
        .then((response) => {
          if (!mounted) {
            return;
          }

          const ranked: Content[] = (response.data?.results || []).map((entry: { content: Content }) => entry.content as Content);
          let filtered: Content[] = ranked;
          if (activeCollectionId) {
            filtered = filtered.filter((c: Content) => c.collectionId?._id === activeCollectionId);
          }
          if (activeFilter !== 'all') {
            if (activeFilter.startsWith('tag:')) {
              const tagName = activeFilter.replace('tag:', '');
              filtered = filtered.filter((c: Content) => c.tags.some((t) => t.title.toLowerCase() === tagName.toLowerCase()));
            } else {
              filtered = filtered.filter((c: Content) => c.type === activeFilter);
            }
          }

          const source = response.data?.source;
          setSemanticSource(source === 'huggingface' || source === 'fallback' ? source : '');
          setFilteredContents(filtered);
        })
        .catch((error: any) => {
          if (!mounted) {
            return;
          }
          setSemanticSource('');
          notifyError(error?.response?.data?.message || 'Semantic search failed. Showing keyword results.');
          filterContents();
        })
        .finally(() => {
          if (mounted) {
            setSemanticLoading(false);
          }
        });
    }, 350);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [contents, activeFilter, searchQuery, activeCollectionId, semanticMode, filterContents, notifyError]);

  const fetchContents = async () => {
    try {
      const response = await contentAPI.getAll();
      console.log('Fetched contents:', response.data.content);
      setContents(response.data.content || []);
    } catch (e) {
      console.error('Error fetching contents:', e);
    }
  };

  const fetchCollections = async () => {
    const response = await collectionAPI.getAll();
    setCollections(response.data.collections);
  };

  const getAllTags = useMemo(() => {
    const tagSet = new Set<string>();
    contents.forEach((c) => {
      c.tags.forEach((t) => tagSet.add(t.title));
    });
    return Array.from(tagSet);
  }, [contents]);

  const getActiveCollectionName = () =>
    collections.find((collection) => collection._id === activeCollectionId)?.name;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleShare = async () => {
    try {
      const response = await brainAPI.createShareLink();
      setShareLink(response.data.link);
      notifySuccess('Share link created');
    } catch (err) {
      console.error('Error creating share link:', err);
      const message = (err as any)?.response?.data?.message || 'Failed to create share link';
      notifyError(message);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!window.confirm('Delete this content?')) {
      return;
    }

    try {
      await contentAPI.delete(contentId);
      setContents((prevContents) => prevContents.filter((content) => content._id !== contentId));
      notifySuccess('Content deleted');
    } catch (err: any) {
      notifyError(err?.response?.data?.message || 'Failed to delete content');
    }
  };

  const handleCreateCollection = async () => {
    const name = window.prompt('Collection name');
    if (!name?.trim()) {
      return;
    }

    try {
      await collectionAPI.create(name);
      await fetchCollections();
      notifySuccess('Collection created');
    } catch (err: any) {
      notifyError(err?.response?.data?.message || 'Failed to create collection');
    }
  };

  const handleDeleteActiveCollection = async () => {
    if (!activeCollectionId) {
      return;
    }

    if (!window.confirm('Delete selected collection? Content will be kept and moved to no collection.')) {
      return;
    }

    try {
      await collectionAPI.delete(activeCollectionId);
      setActiveCollectionId(null);
      await Promise.all([fetchCollections(), fetchContents()]);
      notifySuccess('Collection deleted');
    } catch (err: any) {
      notifyError(err?.response?.data?.message || 'Failed to delete collection');
    }
  };

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      <BackgroundBeams className="opacity-40" />
      <Spotlight className="opacity-80" />
      <Sidebar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        tags={getAllTags}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onCollectionFilterChange={setActiveCollectionId}
        onCreateCollection={handleCreateCollection}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="relative flex-1 lg:ml-72 z-10">
        <div className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-lg shadow-blue-500/5 p-6 sticky top-0 z-30 border-b border-white/20 dark:border-white/5 supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-slate-950/60">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center mb-4">
              <div>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {activeFilter === 'all'
                      ? 'All Notes'
                      : activeFilter.startsWith('tag:')
                        ? `#${activeFilter.replace('tag:', '')}`
                        : `${activeFilter.charAt(0).toUpperCase()}${activeFilter.slice(1)}s`}
                  </h2>
                  <div className="lg:hidden">
                    <MovingBorderButton onClick={() => setIsSidebarOpen(true)}>
                      <MenuIcon className="text-lg" />
                    </MovingBorderButton>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">Welcome, {username}</p>
                {activeCollectionId && (
                  <p className="text-emerald-700 text-sm mt-1">Collection: {getActiveCollectionName()}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <ThemeToggle className="min-w-[108px] border-slate-200 dark:border-slate-700" />
                {activeCollectionId && (
                  <button
                    onClick={handleDeleteActiveCollection}
                    className="flex items-center gap-2 bg-amber-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-amber-600 transition text-sm sm:text-base"
                  >
                    <FolderMinusIcon /> Delete Collection
                  </button>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
                >
                  <ShareIcon /> Share Brain
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-2 bg-teal-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-teal-700 transition text-sm sm:text-base"
                >
                  <UploadIcon /> Import
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                >
                  <PlusIcon /> Add Content
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm sm:text-base"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                semanticMode={semanticMode}
                onSemanticModeChange={setSemanticMode}
              />
              <AnimatedTabs
                items={tabItems}
                activeId={activeFilter.startsWith('tag:') ? 'all' : activeFilter}
                onChange={(id) => setActiveFilter(id)}
                className="self-start"
              />
            </div>
          </div>
        </div>

        {shareLink && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div className="bg-emerald-950/60 border border-emerald-600/50 text-emerald-100 px-4 py-3 rounded-lg flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="flex-1">
                <p className="font-semibold mb-1">Share Link Created</p>
                <p className="font-mono text-sm break-all">{shareLink}</p>
              </div>
              <button
                onClick={() => {
                  void navigator.clipboard.writeText(shareLink);
                  notifyInfo('Link copied to clipboard');
                }}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm whitespace-nowrap self-start sm:self-auto"
              >
                Copy Link
              </button>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {semanticMode && searchQuery.trim() && (
            <div className="mb-4 rounded-lg border border-cyan-500/30 bg-white/80 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
              {semanticLoading
                ? 'Running semantic search...'
                : `Semantic mode active${semanticSource ? ` (${semanticSource})` : ''}`}
            </div>
          )}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="text-slate-600 dark:text-slate-300 mt-4">Loading your content...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center py-16 bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl"
            >
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderMinusIcon className="text-2xl text-slate-400" />
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-lg mb-2 font-medium">{searchQuery ? 'No results found' : 'Your brain is empty'}</p>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                {searchQuery ? 'Try adjusting your search or filters to find what you looking for.' : 'Start adding content to build your personal knowledge base.'}
              </p>
            </motion.div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20"
            >
              {filteredContents.map((content) => (
                <div key={content._id}>
                  <Card3D className="h-full rounded-2xl hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
                    <div
                      className="h-full flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/10 p-4 sm:p-6 rounded-xl shadow-lg hover:bg-white/60 dark:hover:bg-slate-900/60 transition-all duration-300 group"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold">
                          {content.type}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingContent(content)} className="text-blue-500 hover:text-blue-700">
                            <EditIcon />
                          </button>
                          <button onClick={() => handleDelete(content._id)} className="text-red-500 hover:text-red-700">
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100 line-clamp-2">{content.title}</h3>

                      {content.metadata?.image && (
                        <img
                          src={content.metadata.image}
                          alt={content.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                      )}

                      <a
                        href={content.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm break-all block mb-3 line-clamp-1"
                      >
                        {content.link}
                      </a>

                      {(content.metadata?.siteName || content.metadata?.domain) && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                          {content.metadata?.siteName || content.metadata?.domain}
                        </p>
                      )}

                      {(content.aiSummary || content.metadata?.description) && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-2">
                          {content.aiSummary || content.metadata?.description}
                        </p>
                      )}

                      {content.collectionId && (
                        <button
                          onClick={() => setActiveCollectionId(content.collectionId!._id)}
                          className="mb-2 bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs hover:bg-emerald-200"
                        >
                          {content.collectionId.name}
                        </button>
                      )}

                      <div className="flex flex-wrap gap-2 mt-3">
                        {content.tags?.map((tag) => (
                          <span
                            key={tag._id}
                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:bg-purple-200"
                            onClick={() => setActiveFilter(`tag:${tag.title}`)}
                          >
                            #{tag.title}
                          </span>
                        ))}
                      </div>
                      <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">Added {new Date(content.createdAt).toLocaleDateString()}</div>
                    </div>
                  </Card3D>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {
        showAddModal && (
          <AddContentModal
            collections={collections}
            onNotifyError={notifyError}
            onNotifySuccess={notifySuccess}
            onClose={() => setShowAddModal(false)}
            onAdd={async () => {
              await Promise.all([fetchContents(), fetchCollections()]);
            }}
          />
        )
      }

      {
        showImportModal && (
          <ImportContentModal
            onClose={() => setShowImportModal(false)}
            onImported={async () => {
              await Promise.all([fetchContents(), fetchCollections()]);
              setShowImportModal(false);
            }}
            onNotifyError={notifyError}
            onNotifySuccess={notifySuccess}
          />
        )
      }

      {
        editingContent && (
          <EditContentModal
            content={editingContent}
            collections={collections}
            onClose={() => setEditingContent(null)}
            onUpdate={async () => {
              await Promise.all([fetchContents(), fetchCollections()]);
            }}
          />
        )
      }
      <ChatInterface />
    </div >
  );
};

const AddContentModal = ({
  collections,
  onNotifyError,
  onNotifySuccess,
  onClose,
  onAdd
}: {
  collections: Collection[];
  onNotifyError: (message: string) => void;
  onNotifySuccess: (message: string) => void;
  onClose: () => void;
  onAdd: () => Promise<void>;
}) => {
  const [type, setType] = useState<Content['type']>('document');
  const [link, setLink] = useState('');
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewMetadata, setPreviewMetadata] = useState<ContentMetadata | null>(null);
  const [previewError, setPreviewError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestions | null>(null);

  const fetchPreviewMetadata = async () => {
    if (!link.trim()) {
      return;
    }

    setPreviewLoading(true);
    setPreviewError('');
    try {
      const response = await contentAPI.preview(link.trim(), type);
      const metadata = response.data?.metadata as ContentMetadata | undefined;
      setPreviewMetadata(metadata || null);
      if (!title.trim() && metadata?.title) {
        setTitle(metadata.title);
      }
    } catch (err: any) {
      setPreviewMetadata(null);
      setPreviewError(err?.response?.data?.message || 'Preview unavailable for this URL');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      const response = await contentAPI.add({
        type,
        link,
        title,
        tags: tagsArray,
        collectionId: collectionId || undefined
      });

      await onAdd();
      const duplicateCount = Number(response.data?.ai?.duplicateCandidates?.length || 0);
      if (duplicateCount > 0) {
        onNotifyError(`Potential duplicates found: ${duplicateCount}`);
      }
      if (response.data?.ai?.rateLimitedFallback) {
        onNotifySuccess('Content added (AI fallback used due to API limits)');
      } else {
        onNotifySuccess('Content added');
      }
      onClose();
    } catch (error: any) {
      onNotifyError(error?.response?.data?.message || 'Failed to add content');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    const aiTitle = title || previewMetadata?.title;
    const aiDescription = previewMetadata?.description;
    if (!link.trim() && !aiTitle && !aiDescription) {
      onNotifyError('Add link, title, or preview content first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await contentAPI.aiSuggest({
        title: aiTitle,
        description: aiDescription,
        link,
        type
      });
      const suggestions = response.data as AISuggestions;
      setAiSuggestions(suggestions);

      if (suggestions.summary && !title.trim()) {
        setTitle(aiTitle || suggestions.summary.slice(0, 100));
      }

      const existingTags = tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean);
      const mergedTags = Array.from(new Set([...existingTags, ...suggestions.tags]));
      setTags(mergedTags.join(', '));

      if (suggestions.rateLimitedFallback) {
        onNotifySuccess('AI suggestions generated using fallback mode');
      } else {
        onNotifySuccess('AI suggestions generated');
      }
    } catch (error: any) {
      onNotifyError(error?.response?.data?.message || 'Failed to generate AI suggestions');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Add New Content</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 text-2xl" aria-label="Close">X</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as Content['type'])}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="document">Document</option>
              <option value="tweet">Tweet</option>
              <option value="youtube">YouTube</option>
              <option value="link">Link</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Link</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                onBlur={() => {
                  void fetchPreviewMetadata();
                }}
                className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
                required
              />
              <button
                type="button"
                onClick={() => {
                  void fetchPreviewMetadata();
                }}
                className="shrink-0 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm hover:bg-slate-200 dark:hover:bg-slate-600"
              >
                {previewLoading ? '...' : 'Fetch'}
              </button>
            </div>
            {previewError && <p className="text-xs text-red-500 mt-2">{previewError}</p>}
          </div>

          {previewMetadata && (
            <div className="border border-gray-200 dark:border-slate-600 rounded-lg p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Preview</p>
              {previewMetadata.image && (
                <img
                  src={previewMetadata.image}
                  alt={previewMetadata.title || 'Preview'}
                  className="w-full h-28 object-cover rounded mb-2"
                  referrerPolicy="no-referrer"
                />
              )}
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2">
                {previewMetadata.title || 'No title detected'}
              </p>
              {(previewMetadata.siteName || previewMetadata.domain) && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {previewMetadata.siteName || previewMetadata.domain}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter title (auto-filled when available)"
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Collection</label>
            <select
              value={collectionId}
              onChange={(e) => setCollectionId(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection._id} value={collection._id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="productivity, learning, tech"
            />
          </div>

          <div>
            <button
              type="button"
              onClick={() => {
                void handleGenerateAI();
              }}
              disabled={aiLoading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 font-semibold transition"
            >
              {aiLoading ? 'Generating AI...' : 'Auto-Tag + Summarize (Free AI)'}
            </button>
          </div>

          {aiSuggestions && (
            <div className="border border-indigo-300 dark:border-indigo-500/40 rounded-lg p-3 space-y-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                AI Sources: tags={aiSuggestions.sources.tags || 'fallback'}, summary={aiSuggestions.sources.summary || 'fallback'}
              </p>
              <p className="text-sm text-gray-800 dark:text-gray-100">{aiSuggestions.summary}</p>
              {aiSuggestions.duplicateCandidates.length > 0 && (
                <p className="text-xs text-amber-600 dark:text-amber-300">
                  Potential duplicates: {aiSuggestions.duplicateCandidates.map((item) => item.title).join(', ')}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? 'Adding...' : 'Add Content'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-100 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 font-semibold transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

type ImportItem = {
  type?: string;
  link: string;
  title?: string;
  tags?: string[] | string;
  collectionName?: string;
};

const parseCsvLine = (line: string) => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      const isEscapedQuote = inQuotes && line[i + 1] === '"';
      if (isEscapedQuote) {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current.trim());
  return result;
};

const parseImportJson = (text: string): ImportItem[] => {
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) {
    throw new Error('JSON must be an array');
  }

  return parsed.map((item) => ({
    type: item?.type,
    link: item?.link,
    title: item?.title,
    tags: item?.tags,
    collectionName: item?.collectionName || item?.collection
  }));
};

const parseImportCsv = (text: string): ImportItem[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must include a header and at least one row');
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const typeIndex = headers.indexOf('type');
  const linkIndex = headers.indexOf('link');
  const titleIndex = headers.indexOf('title');
  const tagsIndex = headers.indexOf('tags');
  const collectionIndex = headers.findIndex((value) => value === 'collection' || value === 'collectionname');

  if (linkIndex === -1) {
    throw new Error('CSV header must include link');
  }

  return lines.slice(1).map((line) => {
    const cols = parseCsvLine(line);
    return {
      type: typeIndex >= 0 ? cols[typeIndex] : undefined,
      link: cols[linkIndex],
      title: titleIndex >= 0 ? cols[titleIndex] : undefined,
      tags: tagsIndex >= 0 ? cols[tagsIndex] : undefined,
      collectionName: collectionIndex >= 0 ? cols[collectionIndex] : undefined
    };
  });
};

const ImportContentModal = ({
  onClose,
  onImported,
  onNotifyError,
  onNotifySuccess
}: {
  onClose: () => void;
  onImported: () => Promise<void>;
  onNotifyError: (message: string) => void;
  onNotifySuccess: (message: string) => void;
}) => {
  const [fileName, setFileName] = useState('');
  const [rawText, setRawText] = useState('');
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [items, setItems] = useState<ImportItem[]>([]);
  const [parsingError, setParsingError] = useState('');
  const [importing, setImporting] = useState(false);

  const parseItems = (text: string, selectedFormat: 'json' | 'csv') => {
    if (!text.trim()) {
      setItems([]);
      return;
    }

    try {
      const parsed = selectedFormat === 'json' ? parseImportJson(text) : parseImportCsv(text);
      setItems(parsed.filter((item) => item.link));
      setParsingError('');
    } catch (error: any) {
      setItems([]);
      setParsingError(error?.message || 'Unable to parse file');
    }
  };

  const handleFileUpload = async (file: File) => {
    const detectedFormat = file.name.toLowerCase().endsWith('.csv') ? 'csv' : 'json';
    setFormat(detectedFormat);
    setFileName(file.name);

    const text = await file.text();
    setRawText(text);
    parseItems(text, detectedFormat);
  };

  const handleImport = async () => {
    if (items.length === 0) {
      onNotifyError('No valid items to import');
      return;
    }

    setImporting(true);
    try {
      const response = await contentAPI.importItems(items);
      const importedCount = response.data?.importedCount || 0;
      const failedCount = response.data?.failedCount || 0;

      if (importedCount > 0) {
        onNotifySuccess(`Imported ${importedCount} items`);
      }
      if (failedCount > 0) {
        onNotifyError(`${failedCount} items failed to import`);
      }

      await onImported();
    } catch (error: any) {
      onNotifyError(error?.response?.data?.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-8 max-w-2xl w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Import Content</h2>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-300 hover:text-gray-700 text-2xl" aria-label="Close">X</button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Upload a `.json` or `.csv` file with headers: `link`, optional `type`, `title`, `tags`, `collection`.
          </p>

          <input
            type="file"
            accept=".json,.csv,text/csv,application/json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) {
                return;
              }
              void handleFileUpload(file);
            }}
            className="block w-full text-sm text-gray-700 dark:text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFormat('json');
                parseItems(rawText, 'json');
              }}
              className={`px-3 py-2 rounded-lg text-sm ${format === 'json' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200'}`}
            >
              JSON
            </button>
            <button
              type="button"
              onClick={() => {
                setFormat('csv');
                parseItems(rawText, 'csv');
              }}
              className={`px-3 py-2 rounded-lg text-sm ${format === 'csv' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-200'}`}
            >
              CSV
            </button>
          </div>

          <textarea
            value={rawText}
            onChange={(e) => {
              const text = e.target.value;
              setRawText(text);
              parseItems(text, format);
            }}
            rows={8}
            placeholder='Paste JSON array or CSV rows here...'
            className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {fileName && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Loaded file: {fileName}
            </p>
          )}

          {parsingError ? (
            <p className="text-sm text-red-600">{parsingError}</p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Parsed items: {items.length}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          <button
            type="button"
            onClick={handleImport}
            disabled={importing || items.length === 0 || Boolean(parsingError)}
            className="flex-1 bg-teal-600 text-white py-3 rounded-lg hover:bg-teal-700 disabled:bg-gray-400 font-semibold transition"
          >
            {importing ? 'Importing...' : 'Import'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 dark:bg-slate-600 text-gray-700 dark:text-gray-100 py-3 rounded-lg hover:bg-gray-400 dark:hover:bg-slate-500 font-semibold transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;




