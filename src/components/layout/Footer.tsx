import Link from 'next/link';
import { Heart, GitBranch, FlaskConical, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Honest disclaimer + community call-to-collaborate */}
        <div className="rounded-2xl border border-[#1dda63]/30 bg-[#1dda63]/[0.05] p-6 mb-10">
          <div className="flex items-start gap-3">
            <FlaskConical className="w-5 h-5 text-[#1dda63] mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5">
                This is an experiment — and we&apos;d love your help
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
                SignBridge is early and evolving. There&apos;s a lot still to get right — sign accuracy,
                vocabulary, more languages — and we want to build it <em>with</em> the community, not just
                for it. If you&apos;re a Deaf signer, a sign-language practitioner, interpreter, educator, or
                an accessibility advocate, we&apos;d genuinely love to work with you.
              </p>
              <a
                href="mailto:ammar@mycocoon.life?subject=SignBridge%20%E2%80%94%20let%27s%20collaborate"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-lg bg-[#1dda63] text-white text-sm font-medium hover:bg-[#15b850] transition-colors"
              >
                <Mail className="w-4 h-4" />
                Get in touch
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <span>🤟</span>
              <span className="text-[#1dda63]">SignBridge</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Free, open-source sign language learning for everyone. Breaking communication barriers one sign at a time.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Learn</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li><Link href="/learn" className="hover:text-[#1dda63] transition-colors">Courses</Link></li>
              <li><Link href="/practice" className="hover:text-[#1dda63] transition-colors">Practice</Link></li>
              <li><Link href="/dictionary" className="hover:text-[#1dda63] transition-colors">Dictionary</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Project</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#1dda63] transition-colors">
                  <GitBranch className="w-4 h-4" />
                  Open Source
                </a>
              </li>
              <li><Link href="/progress" className="hover:text-[#1dda63] transition-colors">Your Progress</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-sm text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the deaf and hard of hearing community
          </p>
          <p className="text-sm text-gray-400">
            A <a href="https://mycocoon.life" target="_blank" rel="noopener noreferrer" className="text-[#1dda63] hover:underline">Cocoon</a> Project &mdash; Free forever
          </p>
        </div>
      </div>
    </footer>
  );
}
