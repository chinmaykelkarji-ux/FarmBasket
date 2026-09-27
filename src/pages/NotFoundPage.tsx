import { ButtonLink } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export default function NotFoundPage() {
  return <EmptyState art="potato" title="This page wandered off" body="The page you're looking for doesn't exist." action={<ButtonLink to="/">Back to home</ButtonLink>} />
}
