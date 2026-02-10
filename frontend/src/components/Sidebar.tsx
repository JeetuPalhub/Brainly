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
        className="w-72 max-w-[85vw] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl text-slate-900 dark:text-slate-100 h-screen shadow-2xl fixed left-0 top-0 p-6 overflow-y-auto border-r border-gray-200 dark:border-cyan-400/20 z-40 transition-transform duration-300 ease-in-out"
      >
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="text-cyan-300">SB</span> Second Brain
          </h1>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-r-lg transition-all duration-200 group ${activeFilter === item.id
                  ? 'bg-gradient-to-r from-indigo-500/20 to-transparent border-l-4 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:pl-5 border-l-4 border-transparent'
                  }`}
              >
                <Icon className="text-xl" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-300 mb-3 px-1">
            <div className="flex items-center gap-2">
              <FolderIcon />
              <span className="font-semibold">Collections</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onCreateCollection();
              }}
              className="text-indigo-500 hover:text-indigo-400 p-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition"
              title="Create collection"
            >
              <PlusIcon />
            </button>
          </div>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            <button
              onClick={() => handleCollectionClick(null)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeCollectionId === null
                ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
            >
              All Collections
            </button>
            {collections.map((collection) => (
              <button
                key={collection._id}
                onClick={() => handleCollectionClick(collection._id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeCollectionId === collection._id
                  ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        {tags.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-300 mb-3 px-1">
              <HashIcon />
              <span className="font-semibold">Tags</span>
            </div>
            <div className="space-y-1 max-h-52 overflow-y-auto">
              {tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleFilterClick(`tag:${tag}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${activeFilter === `tag:${tag}`
                    ? 'bg-fuchsia-100 dark:bg-fuchsia-500/20 text-fuchsia-700 dark:text-fuchsia-300 font-medium'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
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
