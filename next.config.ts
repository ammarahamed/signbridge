import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SignBridge ships as a static export served from the /signbridge subpath
  // of mycocoon.life (Cloudflare Pages). basePath rewrites all routes and
  // asset URLs under /signbridge; images must be unoptimized for `output: export`.
  output: "export",
  basePath: "/signbridge",
  images: { unoptimized: true },
};

export default nextConfig;
