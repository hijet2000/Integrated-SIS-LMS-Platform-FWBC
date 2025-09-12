/** @type {import('vite').UserConfig} */
import config from './vite.config.ts';

// Re-export the TypeScript configuration
// Vite prioritizes .js over .ts, so this ensures the correct config is used.
export default config;
