'use client';

import { useState } from 'react';
import Link from 'next/link';

const FAQS = [
  {
    q: 'Is this real money gambling?',
    a: 'Absolutely not. GameMagicKit uses 100% virtual credits that have no real monetary value. This is a free-to-play skill-based prediction arcade. There is no way to spend real money, and credits cannot be redeemed for anything of real value.',
  },
  {
    q: 'How do I get credits?',
    a: 'Every new account starts with 1,000 free virtual credits — no payment required. You earn more credits by making correct predictions (2× your stake on a win). Keep an eye out for bonus credit events!',
  },
  {
    q: 'What happens if I run out of credits?',
    a: "Don't panic! You can still participate in markets to earn XP for participation (10 XP per prediction). You can also wait for bonus credit grants. You won't lose your XP, level, or badges.",
  },
  {
    q: 'Can I make more than one prediction per market?',
    a: 'No — you can only make one prediction per market. This keeps the competition fair and prevents hedging.',
  },
  {
    q: 'How is the leaderboard ranked?',
    a: 'The leaderboard is ranked by total XP. You earn XP by making predictions (10 XP per prediction) and winning them (100 XP per win). The more you predict and win, the higher you climb.',
  },
  {
    q: 'When do markets get settled?',
    a: 'Markets are settled by our admin team after the real-world event resolves. Once settled, the resolved outcome is set, and all winning predictions are automatically rewarded with 2× their staked credits and 100 XP.',
  },
  {
    q: 'How accurate do markets need to be?',
    a: 'Markets are based on real-world outcomes in gaming, esports, tech, and pop culture. The admin team carefully researches each outcome before settling a market. If there is genuine ambiguity, markets may be cancelled and credits refunded.',
  },
  {
    q: 'What types of markets are available?',
    a: 'We currently have four categories: Games (video game releases, sales), Esports (tournament winners, match results), Tech (product launches, company announcements), and Pop Culture (movies, TV shows, music).',
  },
  {
    q: 'How do I earn badges?',
    a: 'Badges are earned by hitting specific milestones: making your first prediction, winning streaks, staking large amounts, reaching the top 10, and more. Check your Profile page to see which badges you\'ve unlocked.',
  },
  {
    q: 'Is there a mobile app?',
    a: 'GameMagicKit is a fully responsive web application that works great on mobile browsers. There is no separate app to download.',
  },
  {
    q: 'Can I change my username or display name?',
    a: 'You can update your display name from your Profile page at any time. Your username (used for @mentions) is set at signup and cannot currently be changed.',
  },
  {
    q: 'How do I report an issue or give feedback?',
    a: 'This is a community project! If you find a bug or have a suggestion, please reach out through the community channels linked in the footer.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            Frequently Asked{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="text-xl text-gray-400">Everything you need to know about GameMagicKit</p>
        </div>

        {/* Highlight box */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 mb-10 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-white mb-2">This is NOT gambling</h2>
          <p className="text-gray-400 text-sm">
            GameMagicKit uses virtual credits with zero real-world monetary value.
            No purchases, no real money, no gambling. Pure skill and prediction fun.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className={`bg-gray-900 border rounded-2xl overflow-hidden transition-all ${
                openIndex === i ? 'border-purple-500/40' : 'border-gray-800 hover:border-gray-700'
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span className={`font-semibold text-sm sm:text-base ${openIndex === i ? 'text-purple-300' : 'text-white'}`}>
                  {faq.q}
                </span>
                <svg
                  className={`w-5 h-5 shrink-0 transition-transform text-gray-400 ${openIndex === i ? 'rotate-180 text-purple-400' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* More help */}
        <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <p className="text-gray-400 mb-4">Still have questions? Check out our full guide.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/how-it-works"
              className="border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-6 py-3 rounded-xl font-medium transition-colors"
            >
              How It Works →
            </Link>
            <Link
              href="/auth/sign-up"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
