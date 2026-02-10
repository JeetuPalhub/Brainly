import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTwitter, FiYoutube, FiFileText, FiLink, FiHash, FiGrid, FiFolder, FiPlus, FiX } from 'react-icons/fi';
import { Collection } from '../types';

interface SidebarProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  tags: string[];
  collections: Collection[];
  activeCollectionId: string | null;
  onCollectionFilterChange: (collectionId: string | null) => void;
  onCreateCollection: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeFilter,
  onFilterChange,
  tags,
  collections,
  activeCollectionId,
  onCollectionFilterChange,
  onCreateCollection,
  isOpen,
  onClose
}) => {
  const [isDesktop, setIsDesktop] = useState(() => window.innerWidth >= 1024);

  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const FolderIcon = FiFolder as React.ComponentType<{ className?: string }>;
  const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;
  const HashIcon = FiHash as React.ComponentType<{ className?: string }>;
  const CloseIcon = FiX as React.ComponentType<{ className?: string }>;

  const menuItems = [
    { id: 'all', label: 'All Notes', icon: FiGrid },
    { id: 'tweet', label: 'Tweets', icon: FiTwitter },
    { id: 'youtube', label: 'Videos', icon: FiYoutube },
    { id: 'document', label: 'Documents', icon: FiFileText },
    { id: 'link', label: 'Links', icon: FiLink }
  ];

  const handleFilterClick = (filter: string) => {
    onFilterChange(filter);
    onClose();
  };

  const handleCollectionClick = (collectionId: string | null) => {
    onCollectionFilterChange(collectionId);
    onClose();
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" onClick={onClose} aria-hidden="true" />}

      <motion.aside
        initial={false}
        animate={{ x: isDesktop ? 0 : isOpen ? 0 : -320 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="w-72 max-w-[85vw] bg-slate-950/95 text-slate-100 h-screen shadow-2xl fixed left-0 top-0 p-6 overflow-y-auto border-r border-cyan-400/20 z-40"
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-cyan-300">SB</span> Second Brain
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-300 hover:text-white"
            aria-label="Close menu"
          >
            <CloseIcon className="text-2xl" />
          </button>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon as React.ComponentType<{ className?: string }>;
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.03 * index }}
                onClick={() => handleFilterClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  activeFilter === item.id
                    ? 'bg-cyan-500/20 text-cyan-200 font-semibold border border-cyan-400/40'
                    : 'text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between text-slate-300 mb-3 px-1">
            <div className="flex items-center gap-2">
              <FolderIcon />
              <span className="font-semibold">Collections</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onCreateCollection();
              }}
              className="text-cyan-300 hover:text-cyan-200"
              title="Create collection"
            >
              <PlusIcon />
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <button
              onClick={() => handleCollectionClick(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                activeCollectionId === null
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              All Collections
            </button>
            {collections.map((collection) => (
              <button
                key={collection._id}
                onClick={() => handleCollectionClick(collection._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                  activeCollectionId === collection._id
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-slate-300 mb-3 px-1">
              <HashIcon />
              <span className="font-semibold">Tags</span>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterClick(`tag:${tag}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeFilter === `tag:${tag}`
                      ? 'bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/40'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
