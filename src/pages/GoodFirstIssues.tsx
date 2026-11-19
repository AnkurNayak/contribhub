import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LanguageTag } from '@/components/common/LanguageTag'
import { PageHeader } from '@/components/common/PageHeader'
import { Card } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { LANGUAGE_PAGES } from '@/seo/languages'
import { PAGE_META } from '@/seo/routes'

export default function GoodFirstIssues() {
  useDocumentTitle(PAGE_META.languages.title, { description: PAGE_META.languages.description })

  return (
    <>
      <PageHeader
        title="Good First Issues by Programming Language"
        description="Pick the language you know best and see open, unassigned GitHub issues that maintainers have labelled as good first issues. Each page lists typical beginner tasks, setup commands and popular projects for that ecosystem."
      />
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGE_PAGES.map((page) => (
          <li key={page.slug}>
            <Card className="h-full p-4 transition-colors hover:bg-accent/50">
              <Link to={`/good-first-issues/${page.slug}`} className="group block">
                <h2 className="flex items-center justify-between font-semibold tracking-tight">
                  <LanguageTag language={page.language} />
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                </h2>
                <p className="mt-2 line-clamp-3 text-[13px] text-muted-foreground">{page.intro}</p>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted-foreground">
        Looking for another language or label?{' '}
        <Link to="/issues" className="text-foreground underline underline-offset-4">
          Use the full issue search
        </Link>
        , or read{' '}
        <Link to="/guide" className="text-foreground underline underline-offset-4">
          how to contribute to open source
        </Link>
        .
      </p>
    </>
  )
}
