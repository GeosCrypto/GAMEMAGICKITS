"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";
import type {
  Market,
  MarketOption,
  Prediction,
  UserProfile,
} from "../../../types";

/* ─────────────────────────────────────────────────────────────────────── */
/* Helpers                                                                  */
/* ─────────────────────────────────────────────────────────────────────── */

function formatTimeLeft(closesAt: string): string {
  const diff = new Date(closesAt).getTime() - Date.now();
  if (diff <= 0) return "Closed";
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Types                                                                    */
/* ─────────────────────────────────────────────────────────────────────── */

interface OptionWithStakes extends MarketOption {
  total_staked: number;
}

/* ─────────────────────────────────────────────────────────────────────── */
/* Component                                                                */
/* ─────────────────────────────────────────────────────────────────────── */

export default function MarketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const marketId = params?.id;

  /* ── state ── */
  const [market, setMarket] = useState<Market | null>(null);
  const [options, setOptions] = useState<OptionWithStakes[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [creditsInput, setCreditsInput] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userPrediction, setUserPrediction] = useState<Prediction | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  /* ── derive sentiment percentages ── */
  const totalAllStaked = options.reduce((s, o) => s + o.total_staked, 0);

  function sentimentPct(option: OptionWithStakes): number {
    if (totalAllStaked === 0) return Math.round(100 / Math.max(options.length, 1));
    return Math.round((option.total_staked / totalAllStaked) * 100);
  }

  /* ── fetch helpers ── */
  const fetchOptionsWithStakes = useCallback(
    async (mktId: string) => {
      const { data: opts } = await supabase
        .from("MarketOption")
        .select("*")
        .eq("market_id", mktId)
        .order("order_index");

      if (!opts) return;

      const withStakes: OptionWithStakes[] = await Promise.all(
        opts.map(async (opt: MarketOption) => {
          const { data: preds } = await supabase
            .from("Prediction")
            .select("credits_staked")
            .eq("option_id", opt.id);

          const total =
            preds?.reduce(
              (s: number, p: { credits_staked: number }) =>
                s + (p.credits_staked ?? 0),
              0
            ) ?? 0;

          return { ...opt, total_staked: total };
        })
      );

      setOptions(withStakes);
    },
    []
  );

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from("UserProfile")
      .select("*")
      .eq("user_id", userId)
      .single();
    if (data) setUserProfile(data as UserProfile);
  }, []);

  const fetchUserPrediction = useCallback(
    async (userId: string, mktId: string) => {
      const { data } = await supabase
        .from("Prediction")
        .select("*")
        .eq("user_id", userId)
        .eq("market_id", mktId)
        .maybeSingle();
      if (data) setUserPrediction(data as Prediction);
    },
    []
  );

  /* ── initial load ── */
  useEffect(() => {
    if (!marketId) return;

    (async () => {
      setLoading(true);
      setError(null);

      /* market */
      const { data: mkt, error: mktErr } = await supabase
        .from("Market")
        .select("*")
        .eq("id", marketId)
        .single();

      if (mktErr || !mkt) {
        setError("Market not found.");
        setLoading(false);
        return;
      }
      setMarket(mkt as Market);
      setTimeLeft(formatTimeLeft((mkt as Market).closes_at));

      /* options */
      await fetchOptionsWithStakes(marketId);

      /* auth */
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await fetchUserProfile(user.id);
        await fetchUserPrediction(user.id, marketId);
      }

      setLoading(false);
    })();
  }, [marketId, fetchOptionsWithStakes, fetchUserProfile, fetchUserPrediction]);

  /* ── countdown ticker ── */
  useEffect(() => {
    if (!market) return;
    const id = setInterval(
      () => setTimeLeft(formatTimeLeft(market.closes_at)),
      60_000
    );
    return () => clearInterval(id);
  }, [market]);

  /* ── submit prediction ── */
  async function handleSubmit() {
    setError(null);
    setSuccess(null);

    const credits = parseInt(creditsInput, 10);

    if (!selectedOption) {
      setError("Please select an outcome.");
      return;
    }
    if (!creditsInput || isNaN(credits) || credits <= 0) {
      setError("Enter a valid number of credits to stake.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth/sign-in");
      return;
    }

    if (!userProfile) {
      setError("Could not load your profile. Please try again.");
      return;
    }

    if (credits > userProfile.total_credits) {
      setError(
        `Insufficient credits. You have ${userProfile.total_credits} credits available.`
      );
      return;
    }

    if (market?.status !== "OPEN") {
      setError("This market is no longer accepting predictions.");
      return;
    }

    setSubmitting(true);

    try {
      /* 1. Create Prediction */
      const { data: pred, error: predErr } = await supabase
        .from("Prediction")
        .insert({
          user_id: user.id,
          market_id: marketId,
          option_id: selectedOption,
          credits_staked: credits,
          result: "PENDING",
        })
        .select()
        .single();

      if (predErr) throw new Error(predErr.message);

      /* 2. Create CreditTransaction (negative amount = stake) */
      const { error: txErr } = await supabase
        .from("CreditTransaction")
        .insert({
          user_id: user.id,
          amount: -credits,
          type: "STAKE",
          note: `Staked on market "${market.title}"`,
        });

      if (txErr) throw new Error(txErr.message);

      /* 3. Update UserProfile total_credits */
      const newCredits = userProfile.total_credits - credits;
      const { error: profileErr } = await supabase
        .from("UserProfile")
        .update({ total_credits: newCredits })
        .eq("user_id", user.id);

      if (profileErr) throw new Error(profileErr.message);

      /* success — update local state without refresh */
      setUserProfile({ ...userProfile, total_credits: newCredits });
      setUserPrediction(pred as Prediction);
      await fetchOptionsWithStakes(marketId!);
      setSuccess(
        `Prediction locked in! You staked ${credits} credits on "${
          options.find((o) => o.id === selectedOption)?.label
        }".`
      );
      setCreditsInput("");
      setSelectedOption(null);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  /* ─────────────────────────── render ─────────────────────────── */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">
        <p className="text-lg">{error ?? "Market not found."}</p>
      </div>
    );
  }

  const isClosed = market.status !== "OPEN";
  const alreadyPredicted = !!userPrediction;
  const creditsNum = parseInt(creditsInput, 10);
  const validCredits =
    !isNaN(creditsNum) && creditsNum > 0;
  const overBudget =
    validCredits && userProfile
      ? creditsNum > userProfile.total_credits
      : false;

  return (
    <main className="min-h-screen bg-gray-950 text-white px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">

        {/* ── Header ── */}
        <section>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="bg-indigo-600 text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {market.category}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                isClosed
                  ? "bg-gray-700 text-gray-400"
                  : "bg-green-700 text-green-200"
              }`}
            >
              {market.status}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
            {market.title}
          </h1>
          {market.description && (
            <p className="mt-2 text-gray-400 text-sm">{market.description}</p>
          )}
          <p className="mt-3 text-indigo-400 text-sm font-medium">
            ⏱ {isClosed ? "Market closed" : timeLeft}
          </p>
        </section>

        {/* ── User credits strip ── */}
        {userProfile && (
          <div className="flex items-center gap-2 bg-gray-900 rounded-xl px-4 py-3 border border-gray-800">
            <span className="text-yellow-400 text-lg">💰</span>
            <span className="text-sm text-gray-300">
              Your balance:{" "}
              <span className="font-bold text-white">
                {userProfile.total_credits.toLocaleString()} credits
              </span>
            </span>
          </div>
        )}

        {/* ── Already predicted banner ── */}
        {alreadyPredicted && (
          <div className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 text-sm text-green-300">
            ✅ You already locked in a prediction on this market (
            {userPrediction!.credits_staked} credits staked on &ldquo;
            {options.find((o) => o.id === userPrediction!.option_id)?.label ??
              "an outcome"}
            &rdquo;).
          </div>
        )}

        {/* ── Outcome options ── */}
        <section>
          <h2 className="text-lg font-semibold mb-3">Outcomes</h2>
          <div className="space-y-3">
            {options.map((opt) => {
              const pct = sentimentPct(opt);
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() =>
                    !isClosed && !alreadyPredicted && setSelectedOption(opt.id)
                  }
                  disabled={isClosed || alreadyPredicted}
                  aria-pressed={isSelected}
                  className={`w-full text-left rounded-xl border px-4 py-3 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400
                    ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-900/30"
                        : "border-gray-700 bg-gray-900 hover:border-indigo-600 hover:bg-gray-800"
                    }
                    ${isClosed || alreadyPredicted ? "cursor-default opacity-80" : "cursor-pointer"}
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-sm text-gray-400">{pct}%</span>
                  </div>
                  {/* Sentiment bar */}
                  <div
                    className="h-2 rounded-full bg-gray-700 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${opt.label} sentiment`}
                  >
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected ? "bg-indigo-500" : "bg-indigo-700"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {opt.total_staked.toLocaleString()} credits staked
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Stake form ── */}
        {!isClosed && !alreadyPredicted && (
          <section className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-5 space-y-4">
            <h2 className="text-lg font-semibold">Lock In Your Prediction</h2>

            <div>
              <label
                htmlFor="credits-input"
                className="block text-sm text-gray-400 mb-1"
              >
                Credits to stake
              </label>
              <input
                id="credits-input"
                type="number"
                min="1"
                max={userProfile?.total_credits ?? undefined}
                value={creditsInput}
                onChange={(e) => {
                  setCreditsInput(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 100"
                className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${overBudget ? "border-red-500" : "border-gray-700"}`}
              />
              {overBudget && (
                <p className="mt-1 text-xs text-red-400">
                  Not enough credits. You have{" "}
                  {userProfile!.total_credits.toLocaleString()} available.
                </p>
              )}
            </div>

            {/* Error / Success feedback */}
            {error && (
              <div
                role="alert"
                className="bg-red-900/40 border border-red-700 rounded-lg px-4 py-2 text-sm text-red-300"
              >
                {error}
              </div>
            )}
            {success && (
              <div
                role="status"
                className="bg-green-900/40 border border-green-700 rounded-lg px-4 py-2 text-sm text-green-300"
              >
                {success}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedOption || !validCredits || overBudget}
              className="w-full py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
            >
              {submitting ? "Locking in…" : "🔒 Lock In Prediction"}
            </button>

            {!userProfile && (
              <p className="text-xs text-center text-gray-500">
                <a
                  href="/auth/sign-in"
                  className="text-indigo-400 hover:underline"
                >
                  Sign in
                </a>{" "}
                to place a prediction.
              </p>
            )}
          </section>
        )}

        {/* ── Success message after closed / already predicted ── */}
        {(isClosed || alreadyPredicted) && success && (
          <div
            role="status"
            className="bg-green-900/40 border border-green-700 rounded-xl px-4 py-3 text-sm text-green-300"
          >
            {success}
          </div>
        )}

        {/* ── Error shown outside form (e.g. market fetch error) ── */}
        {error && (isClosed || alreadyPredicted) && (
          <div
            role="alert"
            className="bg-red-900/40 border border-red-700 rounded-xl px-4 py-2 text-sm text-red-300"
          >
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
