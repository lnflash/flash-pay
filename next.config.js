module.exports = {
  typescript: {
    // Temporarily ignore TypeScript errors during production build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during production build
    ignoreDuringBuilds: true,
  },
  rewrites() {
    return [
      { source: "/.well-known/lnurlp/:username", destination: "/api/lnurlp/:username" },
    ]
  },
}
