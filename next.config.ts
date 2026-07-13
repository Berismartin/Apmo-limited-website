import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { redirects as redirectRules } from "./src/lib/redirects";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // Supabase public storage — explicit path keeps the allowlist tight.
    // Images are also served with `unoptimized` via AppImage because Next 16
    // / Vercel can still return INVALID_IMAGE_OPTIMIZE_REQUEST for these hosts.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zlurvqpjmevouxyhonbg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Redirects are defined in src/lib/redirects.ts — edit there.
  async redirects() {
    return redirectRules;
  },
};

export default withNextIntl(nextConfig);
