import type { NextConfig } from "next";
import path from "path";

const isStaticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),
  ...(isStaticExport ? { output: "export" as const } : {}),
  ...(isStaticExport ? { trailingSlash: true } : {}),
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  turbopack: {
    // Avoid picking parent folder when multiple package-lock.json exist (e.g. home dir).
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
