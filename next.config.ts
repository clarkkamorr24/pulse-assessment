import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent the app from being framed (clickjacking). Pulse is never embedded.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // Stop MIME-type sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Don't leak full URLs to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Grant only the device APIs Pulse actually uses, and only to itself.
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(self), geolocation=(self)",
  },
];

const nextConfig: NextConfig = {
  // Allow the ngrok tunnel host to access dev resources (HMR, etc.).
  allowedDevOrigins: ["kind-intensely-herring.ngrok-free.app"],
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
