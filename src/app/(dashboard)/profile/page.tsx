import { redirect } from 'next/navigation'

export default function ProfileRedirectPage() {
  // Redirect to dashboard with the modal open
  redirect('/dashboard?modal=profile')
}
