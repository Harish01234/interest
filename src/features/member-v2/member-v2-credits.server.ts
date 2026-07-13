import { prisma } from '#/db'

import { requireAuthSession } from '@/members/auth.server'

export async function sumActiveMemberV2CreditsImpl() {
  const session = await requireAuthSession()
  const userId = session.user.id

  const members = await prisma.memberV2.findMany({
    where: {
      userId,
      active: true,
    },
    select: {
      credit: true,
    },
  })

  const total = members.reduce((sum, member) => {
    return sum + member.credit
  }, 0)

  return {
    total,
    count: members.length,
  }
}
