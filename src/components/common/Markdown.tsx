import ReactMarkdown, { defaultUrlTransform } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

/** READMEs use repo-relative links; point them back at the repository on GitHub. */
function resolveUrl(url: string, key: string, repoFullName: string, branch: string): string {
  const safe = defaultUrlTransform(url)
  if (!safe || safe.startsWith('#') || /^[a-z][a-z0-9+.-]*:|^\/\//i.test(safe)) return safe
  const path = safe.replace(/^\.?\//, '')
  return key === 'src'
    ? `https://raw.githubusercontent.com/${repoFullName}/${branch}/${path}`
    : `https://github.com/${repoFullName}/blob/${branch}/${path}`
}

export default function Markdown({
  source,
  repoFullName,
  branch,
}: {
  source: string
  repoFullName: string
  branch: string
}) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        urlTransform={(url, key) => resolveUrl(url, key, repoFullName, branch)}
        components={{
          a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noreferrer noopener" />,
          img: ({ node: _node, ...props }) => <img {...props} loading="lazy" />,
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  )
}
