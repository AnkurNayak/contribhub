import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { EmptyState } from './States'

/** Catches render errors and failed lazy-route chunks (common right after a deploy). */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div className="mx-auto max-w-lg p-8">
        <EmptyState title="This page failed to load" description="Reloading usually fixes it.">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </EmptyState>
      </div>
    )
  }
}
