import clsx from 'clsx'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import MarkdownToHtml from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'

import 'highlight.js/styles/github-dark.css'

export interface MarkdownProps {
  content: string | null | undefined
  className?: string
}

type ExtraNode = { node?: unknown }

function stripNode<T extends ExtraNode>(props: T): Omit<T, 'node'> {
  const { node, ...rest } = props

  return rest
}

export function Markdown({ content, className }: MarkdownProps) {
  if (!content || content.trim() === '') return null

  return (
    <div className={clsx('markdown-content text-sm leading-relaxed', className)}>
      <MarkdownToHtml
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { languages: { dockerfile } }]]}
        components={{
          h1: (props) => (
            <h3
              className="font-bold text-base sm:text-lg text-text-main mt-4 mb-2 first:mt-0"
              {...stripNode(props)}
            />
          ),
          h2: (props) => (
            <h3
              className="font-bold text-base sm:text-lg text-text-main mt-4 mb-2 first:mt-0"
              {...stripNode(props)}
            />
          ),
          h3: (props) => (
            <h4
              className="font-bold text-sm sm:text-base text-text-main mt-3.5 mb-2 first:mt-0"
              {...stripNode(props)}
            />
          ),
          h4: (props) => (
            <h5 className="font-bold text-sm text-text-main mt-3 mb-1.5 first:mt-0" {...stripNode(props)} />
          ),
          p: (props) => <p className="my-2 first:mt-0 last:mb-0" {...stripNode(props)} />,
          strong: (props) => <strong className="font-bold" {...stripNode(props)} />,
          em: (props) => <em className="italic" {...stripNode(props)} />,
          a: (props) => (
            <a
              className="text-primary underline underline-offset-2 hover:text-primary-hover break-words"
              target="_blank"
              rel="noreferrer noopener"
              {...stripNode(props)}
            />
          ),
          ul: (props) => <ul className="list-disc ps-5 my-2 space-y-1" {...stripNode(props)} />,
          ol: (props) => <ol className="list-decimal ps-5 my-2 space-y-1" {...stripNode(props)} />,
          blockquote: (props) => (
            <blockquote
              className="border-s-4 border-primary/40 bg-primary-light/40 rounded-e-md px-3 py-2 my-2 text-text-muted"
              {...stripNode(props)}
            />
          ),
          hr: () => <hr className="border-border my-3" />,
          table: (props) => (
            <div className="overflow-x-auto my-2 rounded-md border border-border">
              <table className="w-full text-xs border-collapse" {...stripNode(props)} />
            </div>
          ),
          th: (props) => (
            <th
              className="bg-surface-muted/60 border-b border-border px-3 py-2 text-start font-bold"
              {...stripNode(props)}
            />
          ),
          td: (props) => (
            <td className="border-b border-border-subtle px-3 py-2 align-top" {...stripNode(props)} />
          ),
          pre: (props) => (
            <div dir="ltr" className="my-2.5 rounded-md border border-border overflow-hidden bg-[#0d1117]">
              <pre
                className="p-3.5 overflow-x-auto text-xs leading-relaxed text-left m-0 bg-transparent [&_code]:bg-transparent"
                {...stripNode(props)}
              />
            </div>
          ),
          code: (props) => {
            const { className: codeClassName, children, ...rest } = stripNode(props)
            const isBlock =
              typeof codeClassName === 'string' &&
              (codeClassName.includes('hljs') || codeClassName.includes('language-'))

            if (isBlock) {
              return (
                <code className={clsx('hljs font-mono text-xs bg-transparent', codeClassName)} {...rest}>
                  {children}
                </code>
              )
            }

            return (
              <code
                dir="ltr"
                className="font-mono text-[0.8em] bg-primary-light border border-border-subtle rounded px-1 py-0.5 text-primary-hover"
                {...rest}
              >
                {children}
              </code>
            )
          },
        }}
      >
        {content}
      </MarkdownToHtml>
    </div>
  )
}
