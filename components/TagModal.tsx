import { useState, useEffect, useRef } from 'react';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tag: string) => void;
}

export default function TagModal({ isOpen, onClose, onSubmit }: TagModalProps) {
  const [tag, setTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tag && /^[a-zA-Z0-9]+$/.test(tag)) {
      onSubmit(tag.toLowerCase());
      setTag('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 w-full max-w-md rounded-lg shadow-xl overflow-hidden">
        <div className="p-2 bg-gray-800 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
          <div className="text-gray-400 text-sm font-mono">add-tag.sh</div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="font-mono text-green-400 mb-4">$ Enter tag name:</div>
          <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg">
            <span className="text-green-500 font-mono">#</span>
            <input
              ref={inputRef}
              type="text"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              className="bg-transparent border-none outline-none text-white font-mono flex-1"
              placeholder="tag"
              pattern="[a-zA-Z0-9]+"
              title="Letters and numbers only, no spaces"
            />
          </div>
          
          {tag && !(/^[a-zA-Z0-9]+$/.test(tag)) && (
            <div className="text-red-400 text-sm mt-2 font-mono">
              Error: Only letters and numbers allowed
            </div>
          )}
          
          <div className="flex justify-end mt-6 gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 font-mono text-sm transition-colors"
            >
              cancel
            </button>
            <button
              type="submit"
              disabled={!tag || !(/^[a-zA-Z0-9]+$/.test(tag))}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm transition-colors"
            >
              submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 