/**
 * @type {import('vite').UserConfig}
 */
const config = {
  build: {
    target: 'esnext',
    modulePreload: {
      polyfill: false,
    },
  },
  plugins: [],
  server: {
    // https: true,
    // host: true,
  },
  optimizeDeps: {
    include: [],
  },
};

export default config;
