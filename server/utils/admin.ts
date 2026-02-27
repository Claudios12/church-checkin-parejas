import { H3Event } from 'h3'

/**
 * Check if the request contains a valid admin password header.
 * Returns true when valid, false otherwise.
 */
export function isAdminRequest(event: H3Event): boolean {
  const config = useRuntimeConfig()
  const header = event.node.req.headers['x-admin-password'] as string | undefined
  if (!header) return false
  const expected = config.adminPassword
  return header === expected
}
