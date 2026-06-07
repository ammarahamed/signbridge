import Link from 'next/link';
import { Heart, GitBranch } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
