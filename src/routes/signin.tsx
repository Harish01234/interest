import { createFileRoute } from '@tanstack/react-router'

import { AppShell } from '@/components/app-shell'
import { SignInForm } from '@/components/signinform'

export const Route = createFileRoute('/signin')({
  component: SignInPage,
})

function SignInPage() {
  return (
    <AppShell centered withGlow mainClassName="py-12 sm:py-16">
      <SignInForm />
    </AppShell>
  )
}
