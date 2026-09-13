import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@react-pdf/renderer", "@prisma/client", "bcryptjs"],
};

export default nextConfig;
