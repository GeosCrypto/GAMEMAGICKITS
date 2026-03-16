'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['GAMES', 'ESPORTS', 'TECH', 'POP_CULTURE'];

export default function NewMarketPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GAMES');
  const [type, setType] = useState<'YES_NO' | 'MULTI'>('YES_NO');
  const [closesAt, setClosesAt] = useState('');
  const [options, setOptions] = useState(['Yes', 'No']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleTypeChange(newType: 'YES_NO' | 'MULTI') {
    setType(newType);
    setOptions(newType === 'YES_NO' ? ['Yes', 'No'] : ['Option A', 'Option B', 'Option C']);
  }

  function updateOption(i: number, value: string) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    setOptions((opts) => [...opts, '']);
  }

  function removeOption(i: number) {
    setOptions((opts) => opts.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const cleanOptions = options.filter((o) => o.trim());
    if (cleanOptions.length < 2) {
      setError('At least 2 options are required.');
      return;
    }

    setLoading(true);

    const res = await fetch('/api/markets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        category,
        type,
        closes_at: new Date(closesAt).toISOString(),
        options: cleanOptions,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Failed to create market');
      return;
    }

    router.push('/admin/markets');
    router.refresh();
  }

  const [minDate] = useState(() =>
    new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/admin/markets" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            ← Back to Markets
          </Link>
        </div>

        <h1 className="text-4xl font-bold text-white mb-8">Create Market</h1>

        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="title">
              Market Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              placeholder="Will GTA VI launch in 2025?"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="desc">
              Description
            </label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide context for this prediction market…"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    category === cat
                      ? 'bg-purple-600 border-purple-600 text-white'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Market Type *</label>
            <div className="flex gap-3">
              {[
                { value: 'YES_NO' as const, label: 'Yes / No', desc: '2 options' },
                { value: 'MULTI' as const, label: 'Multi-outcome', desc: '3+ options' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex-1 p-4 rounded-xl border text-sm text-left transition-colors ${
                    type === t.value
                      ? 'bg-purple-500/10 border-purple-500 text-purple-300'
                      : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold">{t.label}</div>
                  <div className="text-xs opacity-70">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Closes at */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2" htmlFor="closes-at">
              Closes At *
            </label>
            <input
              id="closes-at"
              type="datetime-local"
              value={closesAt}
              onChange={(e) => setClosesAt(e.target.value)}
              required
              min={minDate}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">Options *</label>
            <div className="flex flex-col gap-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    required
                    placeholder={`Option ${i + 1}`}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 text-sm"
                  />
                  {type === 'MULTI' && options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(i)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              {type === 'MULTI' && options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="text-sm text-purple-400 hover:text-purple-300 border border-purple-500/30 hover:border-purple-500/50 rounded-xl px-4 py-2 transition-colors"
                >
                  + Add Option
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Creating…' : 'Create Market'}
          </button>
        </form>
      </div>
    </div>
  );
}
