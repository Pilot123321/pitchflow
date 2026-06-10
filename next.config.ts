import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack never infers a parent directory
  // (e.g. ~/ via a stray lockfile) and ends up watching the whole home folder.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
