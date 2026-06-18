import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve images directly instead of through Next's optimizer. The optimizer
    // rejects Firebase Storage URLs that resolve to NAT64 / "private" IPs (SSRF
    // guard) which broke uploaded image previews & banners. Firebase already
    // serves these images fine, so we skip optimization for reliability.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
};

export default nextConfig;
