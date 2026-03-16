'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Market, MarketOption } from '@/types';
import { createClient } from '@/lib/supabase/client';

interface PredictionFormProps {
  market: Market;
  options: MarketOption[];
  userCredits: number;
}

export default function PredictionForm({ market, options, userCredits }: PredictionFormProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const stake = parseInt(amount, 10);
  const validStake = !isNaN(stake) && stake > 0 && stake <= userCredits;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedOption) { setError('Please select a prediction option.'); return; }
    if (!validStake) { setError(`Enter a valid stake between 1 and ${userCredits}.`); return; }

    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('You must be signed in.'); setLoading(false); return; }

    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        market_id: market.id,
        option_id: selectedOption,
        credits_staked: stake,
      }),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? 'Failed to place prediction.');
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  if (market.status !== 'OPEN') {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 text-center text-gray-400">
        <p className="text-2xl mb-2">🔒</p>
        <p>This market is {market.status.toLowerCase()} – predictions are no longer accepted.</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-gray-900 border border-green-500/30 rounded-2xl p-6 text-center">
        <p className="text-3xl mb-3">🎉</p>
        <p className="text-green-400 font-semibold text-lg">Prediction Placed!</p>
        <p className="text-gray-400 text-sm mt-2">
          You staked <span className="text-yellow-400">{stake} credits</span>.
          Good luck!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Make Your Prediction</h3>
        <span className="text-sm text-yellow-400 font-medium">{userCredits.toLocaleString()} credits</span>
      </div>

      {/* Option selection */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 font-medium">Choose an outcome</label>
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setSelectedOption(opt.id)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              selectedOption === opt.id
                ? 'border-purple-500 bg-purple-500/10 text-purple-300'
                : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-gray-600'
            }`}
          >
            <span className={`mr-2 inline-block w-4 h-4 rounded-full border-2 align-middle ${
              selectedOption === opt.id ? 'border-purple-400 bg-purple-400' : 'border-gray-600'
            }`} />
            {opt.label}
          </button>
        ))}
      </div>

      {/* Credit amount */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-gray-400 font-medium" htmlFor="stake-amount">
          Credits to stake
        </label>
        <div className="relative">
          <input
            id="stake-amount"
            type="number"
            min={1}
            max={userCredits}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 100"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
            {[25, 50, 100].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => setAmount(String(Math.floor(userCredits * pct / 100)))}
                className="text-xs text-purple-400 hover:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded"
              >
                {pct}%
              </button>
            ))}
          </div>
        </div>
        {amount && !validStake && (
          <p className="text-xs text-red-400">
            {stake > userCredits ? `Not enough credits (max: ${userCredits})` : 'Enter a positive number'}
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !selectedOption || !validStake}
        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? 'Placing…' : `Stake ${amount ? `${parseInt(amount, 10).toLocaleString()} credits` : 'Credits'}`}
      </button>

      <p className="text-xs text-center text-gray-500">
        Potential reward: <span className="text-green-400">{validStake ? (stake * 2).toLocaleString() : '—'} credits</span> (2× on win)
      </p>
    </form>
  );
}
