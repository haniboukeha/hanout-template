/**
 * Central feature flags driven by Vite env vars.
 *
 * Mock mode (offline demo with localStorage data) is OFF by default.
 * Set VITE_ALLOW_MOCK=true in .env for local demos without a backend.
 * It must NEVER be enabled in production.
 */
export const ALLOW_MOCK: boolean = import.meta.env.VITE_ALLOW_MOCK === 'true';

export const IS_PROD: boolean = import.meta.env.PROD;
