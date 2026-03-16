'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface EditDisplayNameProps {
  currentName: string;
}

export default function EditDisplayName({ currentName }: EditDisplayNameProps) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSave() {
    if (!name.trim() || name.trim() === currentName) {
      setEditing(false);
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: name.trim() }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Failed to update name');
      return;
    }

    setEditing(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="shrink-0 text-sm border border-gray-700 hover:border-purple-500/50 text-gray-400 hover:text-white px-4 py-2 rounded-xl transition-colors"
      >
        ✏️ Edit Name
      </button>
    );
  }

  return (
    <div className="shrink-0 flex flex-col gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={30}
        className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500 w-48"
        autoFocus
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={loading}
          className="text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
        <button
          onClick={() => { setEditing(false); setName(currentName); setError(null); }}
          className="text-xs border border-gray-700 text-gray-400 px-3 py-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
