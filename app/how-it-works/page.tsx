import Link from 'next/link';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-950 pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-white mb-4">
            How{' '}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              GameMagicKit
            </span>{' '}
            Works
          </h1>
          <p className="text-xl text-gray-400">Everything you need to know to start predicting</p>
        </div>

        {/* Sections */}
        <div className="flex flex-col gap-10">
          {/* Virtual Credits */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">💰</span>
              <h2 className="text-2xl font-bold text-white">Virtual Credits</h2>
            </div>
            <div className="flex flex-col gap-3 text-gray-400 leading-relaxed">
              <p>
                When you sign up for GameMagicKit, you receive{' '}
                <strong className="text-white">1,000 free virtual credits</strong> instantly.
                These credits are the currency of the prediction arcade.
              </p>
              <p>
                <strong className="text-white">Credits have no real monetary value</strong> –
                they&apos;re purely for fun and competition. You can&apos;t buy them, sell them, or exchange
                them for real money. This is not gambling; it&apos;s a skill-based prediction game.
              </p>
              <p>
                If you run out of credits, don&apos;t worry! You can still participate to earn XP from
                correct predictions, or wait for bonus credit events.
              </p>
            </div>
          </div>

          {/* Making Predictions */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">🎯</span>
              <h2 className="text-2xl font-bold text-white">Staking Credits on Predictions</h2>
            </div>
            <div className="flex flex-col gap-3 text-gray-400 leading-relaxed">
              <p>
                Browse the <Link href="/markets" className="text-purple-400 hover:text-purple-300">Markets page</Link> to
                find active prediction markets. Each market has a question (e.g., &quot;Will GTA VI launch in 2025?&quot;)
                and a set of possible outcomes.
              </p>
              <p>
                Choose your prediction and stake between{' '}
                <strong className="text-white">1 and all of your credits</strong> on it.
                You can only make one prediction per market.
              </p>
              <div className="bg-gray-800 rounded-xl p-4 mt-2">
                <p className="text-sm text-gray-300 font-semibold mb-2">Reward Structure:</p>
                <ul className="list-disc list-inside text-sm flex flex-col gap-1">
                  <li>✅ Correct prediction: <span className="text-green-400 font-medium">2× your staked credits back</span></li>
                  <li>❌ Incorrect prediction: <span className="text-red-400 font-medium">Staked credits are lost</span></li>
                  <li>🔄 Market cancelled: <span className="text-yellow-400 font-medium">Credits returned</span></li>
                </ul>
              </div>
            </div>
          </div>

          {/* XP and Leveling */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">⚡</span>
              <h2 className="text-2xl font-bold text-white">XP and Leveling Up</h2>
            </div>
            <div className="flex flex-col gap-3 text-gray-400 leading-relaxed">
              <p>
                XP (Experience Points) is how you track your progress as a predictor.
                There are <strong className="text-white">50 levels</strong> to unlock.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {[
                  { icon: '🏆', title: 'Winning prediction', xp: '+100 XP' },
                  { icon: '🎯', title: 'Participation (any prediction)', xp: '+10 XP' },
                ].map((item) => (
                  <div key={item.title} className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-sm text-gray-300 font-medium">{item.title}</div>
                      <div className="text-cyan-400 font-bold">{item.xp}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2">
                Higher levels unlock bragging rights and are displayed on your profile card in the leaderboard.
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">🏅</span>
              <h2 className="text-2xl font-bold text-white">Badges</h2>
            </div>
            <div className="flex flex-col gap-3 text-gray-400 leading-relaxed">
              <p>
                Earn badges by hitting special milestones. Badges are displayed on your profile
                and show off your achievements.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {[
                  { icon: '🎯', name: 'First Prediction', desc: 'Make your first prediction' },
                  { icon: '🔥', name: 'Win Streak 3', desc: 'Win 3 in a row' },
                  { icon: '💎', name: 'High Roller', desc: 'Stake 500+ credits' },
                  { icon: '🏆', name: 'Top 10', desc: 'Enter top 10 leaderboard' },
                  { icon: '⭐', name: 'Perfect Week', desc: 'Win all predictions in a week' },
                  { icon: '💯', name: 'Century Club', desc: '100 total predictions' },
                ].map((badge) => (
                  <div key={badge.name} className="bg-gray-800 rounded-xl p-3 flex items-start gap-3">
                    <span className="text-2xl shrink-0">{badge.icon}</span>
                    <div>
                      <div className="text-xs font-semibold text-white">{badge.name}</div>
                      <div className="text-xs text-gray-500">{badge.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
            <div className="flex items-center gap-4 mb-5">
              <span className="text-4xl">📊</span>
              <h2 className="text-2xl font-bold text-white">The Leaderboard</h2>
            </div>
            <p className="text-gray-400 leading-relaxed">
              The{' '}
              <Link href="/leaderboard" className="text-purple-400 hover:text-purple-300">global leaderboard</Link>{' '}
              ranks all players by XP. The more you predict and win, the higher you climb.
              The top 3 players earn a special podium display. Your win rate, total credits,
              and prediction count are all visible to other players.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Ready to start predicting?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/sign-up"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-4 rounded-2xl transition-colors shadow-lg shadow-purple-500/25"
            >
              🚀 Create Free Account
            </Link>
            <Link
              href="/faq"
              className="border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 px-8 py-4 rounded-2xl font-medium transition-colors"
            >
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
