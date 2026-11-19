import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { absoluteUrl, fullTitle, SITE_DESCRIPTION } from '@/seo/site'

function setHeadTag(selector: string, tag: 'meta' | 'link', attributes: Record<string, string>) {
  let element = document.head.querySelector(selector)
  if (!element) {
    element = document.createElement(tag)
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value))
}

/**
 * Sets per-page search metadata after client-side navigation. It mirrors what the
 * build-time prerender writes into each page's HTML, so the raw and rendered heads
 * agree. Filter params are left out of the canonical URL.
 */
export function useDocumentTitle(title: string, options: { description?: string; noindex?: boolean } = {}) {
  const { pathname } = useLocation()
  const { description = SITE_DESCRIPTION, noindex = false } = options

  useEffect(() => {
    const pageTitle = fullTitle(title)
    const url = absoluteUrl(pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/')
    document.title = pageTitle
    setHeadTag('meta[name="description"]', 'meta', { name: 'description', content: description })
    setHeadTag('meta[name="robots"]', 'meta', {
      name: 'robots',
      content: noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1',
    })
    setHeadTag('meta[property="og:title"]', 'meta', { property: 'og:title', content: pageTitle })
    setHeadTag('meta[property="og:description"]', 'meta', { property: 'og:description', content: description })
    setHeadTag('meta[name="twitter:title"]', 'meta', { name: 'twitter:title', content: pageTitle })
    setHeadTag('meta[name="twitter:description"]', 'meta', { name: 'twitter:description', content: description })
    if (noindex) {
      document.head.querySelector('link[rel="canonical"]')?.remove()
    } else {
      setHeadTag('link[rel="canonical"]', 'link', { rel: 'canonical', href: url })
      setHeadTag('meta[property="og:url"]', 'meta', { property: 'og:url', content: url })
    }
  }, [title, description, noindex, pathname])
}
