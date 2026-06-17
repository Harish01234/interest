import { getRequest } from '@tanstack/react-start/server'

import { auth } from '#/lib/auth'

export async function requireAuthSession() {
  const session = await auth.api.getSession({
    headers: getRequest().headers,
  })

  if (!session?.user) {
    throw new Error('You must be signed in.')
  }

  return session
}
