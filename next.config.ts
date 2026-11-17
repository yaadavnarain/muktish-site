import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Homepage is the recreated Shopify homepage (static copy in public/pages/home.html).
  // The previous Next.js hero page is kept in app/page.tsx and can be restored by removing this rewrite.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/", destination: "/pages/home.html" }],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
