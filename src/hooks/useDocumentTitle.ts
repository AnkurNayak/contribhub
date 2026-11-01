import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/utils/constants'

function setHeadTag(selector: string, tag: 'meta' | 'link', attributes: Record<string, string>) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement(tag)
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
}

/** Sets per-page search metadata. Filter params are left out of the canonical URL. */
export function useDocumentTitle(title: string, options: { description?: string; noindex?: boolean } = {}) {
  const { pathname } = useLocation()
  const { description = SITE_DESCRIPTION, noindex = false } = options

  useEffect(() => {
    document.title = title ? `${title} · ContribHub` : SITE_TITLE
    setHeadTag('meta[name="description"]', 'meta', { name: 'description', content: description })
    setHeadTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: `${SITE_URL}${pathname}` })
    setHeadTag('meta[name="robots"]', 'meta', { name: 'robots', content: noindex ? 'noindex' : 'index,follow' })
  }, [title, description, noindex, pathname])
}
