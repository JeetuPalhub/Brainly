import React, { useMemo, useState } from 'react';
import { contentAPI } from '../utils/api';
import { Collection, Content } from '../types';
import { useNotification } from '../utils/NotificationContext';

interface EditContentModalProps {
  content: Content;
  collections: Collection[];
  onClose: () => void;
  onUpdate: () => void;
}

const EditContentModal: React.FC<EditContentModalProps> = ({ content, collections, onClose, onUpdate }) => {
  const { success, error } = useNotification();
  const [type, setType] = useState(content.type);
  const [link, setLink] = useState(content.link);
  const [title, setTitle] = useState(content.title);
  const [tags, setTags] = useState(content.tags.map((t) => t.title).join(', '));
  const [collectionId, setCollectionId] = useState(content.collectionId?._id || '');
  const [loading, setLoading] = useState(false);

  const collectionOptions = useMemo(() => collections, [collections]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contentAPI.delete(content._id);

      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t);

      await contentAPI.add({
        type,
        link,
        title,
        tags: tagsArray,
        collectionId: collectionId || undefined
      });

      success('Content updated');
      onUpdate();
      onClose();
    } catch (err: any) {
      error(err?.response?.data?.message || 'Failed to update content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 sm:p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Content</h2>
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
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 dark:text-gray-200 font-semibold mb-2">Link</label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="w-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
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
              {collectionOptions.map((collection) => (
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

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold transition"
            >
              {loading ? 'Updating...' : 'Update Content'}
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

export default EditContentModal;

