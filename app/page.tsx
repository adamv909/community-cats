import { redirect } from 'next/navigation'

// Root URL redirects to home — the proxy handles auth
export default function RootPage() {
  redirect('/home')
}
