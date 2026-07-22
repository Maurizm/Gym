import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permitir la IP de la red local para HMR y scripts en modo dev
  allowedDevOrigins: ["192.168.100.205", "http://192.168.100.205", "http://192.168.100.205:3000"],
};

export default nextConfig;
