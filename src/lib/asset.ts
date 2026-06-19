// SignBridge is served from the /signbridge subpath (see `basePath` in
// next.config.ts). Unlike next/link, the next/image component does NOT apply
// basePath automatically — per the Next.js docs you must prepend it to `src`
// for static assets in /public. Keep BASE_PATH in sync with next.config.ts.
export const BASE_PATH = '/signbridge';

/** Prefix a /public asset path with the app basePath. */
export const asset = (path: string): string =>
  `${BASE_PATH}${path.startsWith('/') ? '' : '/'}${path}`;
