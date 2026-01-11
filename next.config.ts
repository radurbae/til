import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: "export",
    basePath: "/til_rads",
    images: {
        unoptimized: true,
    },
};

export default nextConfig;
