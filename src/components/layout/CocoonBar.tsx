// The parent mycocoon.life global nav, shown above the SignBridge nav so the
// tool feels embedded in the Cocoon site. Links are absolute (SignBridge lives
// at the /signbridge subpath, so relative paths would resolve wrong).
const COCOON = 'https://mycocoon.life';

const links = [
  { label: 'About', href: `${COCOON}/about.html` },
  { label: 'Programmes', href: `${COCOON}/#programs` },
  { label: 'Solutions', href: `${COCOON}/solutions.html` },
  { label: 'Tools', href: `${COCOON}/tools.html` },
  { label: 'Blog', href: `${COCOON}/blog.html` },
];

export function CocoonBar() {
  return (
    <div className="w-full bg-white/95 backdrop-blur border-b border-black/5 text-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between">
        <a href={COCOON} className="font-bold text-lg tracking-tight text-[#0a0a0a]">
          cocoon<span className="text-[#1dda63]">.</span>
        </a>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-[#1dda63] transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <a
          href={`${COCOON}/book`}
          className="text-sm font-semibold px-4 py-1.5 rounded-full border border-black/15 hover:bg-[#1dda63] hover:border-[#1dda63] hover:text-[#0a0a0a] transition-colors"
        >
          Book a Call →
        </a>
      </div>
    </div>
  );
}
