import { useEffect } from 'react'

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title ? `${title} · ContribHub` : 'ContribHub – Find your next open-source contribution'
  }, [title])
}
