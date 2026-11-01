import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/common/States'
import { Button } from '@/components/ui/button'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found', { noindex: true })
  return (
    <div className="mx-auto max-w-lg py-10">
      <EmptyState icon={Compass} title="Page not found" description="This page doesn’t exist or may have moved.">
        <Button variant="outline" size="sm" asChild>
          <Link to="/overview">Go to Overview</Link>
        </Button>
      </EmptyState>
    </div>
  )
}
