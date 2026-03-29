/**
 * Health Service — /api/health
 *
 * Endpoints:
 *   GET /api/health   — check if the API server is running
 */

import { request } from './client.js'

/**
 * Ping the API server.
 * @returns {{ status: 'ok' }}
 */
export async function checkHealth() {
  return request('/api/health')
}
