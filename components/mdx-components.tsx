import type { MDXComponents } from "mdx/types"
import type {
  AnchorHTMLAttributes,
  BlockquoteHTMLAttributes,
  DetailedHTMLProps,
  HTMLAttributes,
  ImgHTMLAttributes,
  LiHTMLAttributes,
  OlHTMLAttributes,
} from "react"

type CodeProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
type PreProps = DetailedHTMLProps<HTMLAttributes<HTMLPreElement>, HTMLPreElement>
type HrProps = DetailedHTMLProps<HTMLAttributes<HTMLHRElement>, HTMLHRElement>

export const mdxComponents: MDXComponents = {
  h1: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      {...props}
      className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-0 mb-6"
    />
  ),
  h2: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h2
      {...props}
      className="scroll-mt-24 text-2xl font-semibold text-white mt-12 mb-4"
    />
  ),
  h3: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      {...props}
      className="scroll-mt-24 text-xl font-medium text-white mt-8 mb-3"
    />
  ),
  h4: (props: HTMLAttributes<HTMLHeadingElement>) => (
    <h4
      {...props}
      className="scroll-mt-24 text-lg font-medium text-white mt-6 mb-2"
    />
  ),
  p: (props: HTMLAttributes<HTMLParagraphElement>) => (
    <p {...props} className="mb-4 leading-relaxed text-[15px] text-gray-300" />
  ),
  a: (props: AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const { href = "", ...rest } = props
    const isExternal = /^https?:\/\//.test(href)
    return (
      <a
        href={href}
        {...rest}
        {...(isExternal
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
        className="text-white underline underline-offset-4 decoration-white/30 hover:decoration-white/70 transition-colors"
      />
    )
  },
  ul: (props: HTMLAttributes<HTMLUListElement>) => (
    <ul
      {...props}
      className="mb-4 ml-5 list-disc space-y-2 text-[15px] text-gray-300 marker:text-gray-500"
    />
  ),
  ol: (props: OlHTMLAttributes<HTMLOListElement>) => (
    <ol
      {...props}
      className="mb-4 ml-5 list-decimal space-y-2 text-[15px] text-gray-300 marker:text-gray-500"
    />
  ),
  li: (props: LiHTMLAttributes<HTMLLIElement>) => (
    <li {...props} className="leading-relaxed" />
  ),
  blockquote: (props: BlockquoteHTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      {...props}
      className="my-6 border-l-2 border-white/20 pl-4 italic text-gray-400"
    />
  ),
  hr: (props: HrProps) => (
    <hr {...props} className="my-10 border-white/10" />
  ),
  img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        {...props}
        alt={props.alt ?? ""}
        className="rounded-lg my-6 border border-white/10 max-w-full h-auto"
      />
    )
  },
  code: (props: CodeProps) => {
    const { className, children, ...rest } = props
    // Block code (fenced) is wrapped in <pre><code class="language-xxx">
    // Detect by presence of language- class.
    const isBlock = typeof className === "string" && className.includes("language-")
    if (isBlock) {
      return (
        <code {...rest} className={`${className} text-sm font-mono`}>
          {children}
        </code>
      )
    }
    return (
      <code
        {...rest}
        className="bg-white/10 px-1.5 py-0.5 rounded text-[0.9em] font-mono text-white"
      >
        {children}
      </code>
    )
  },
  pre: (props: PreProps) => (
    <pre
      {...props}
      className="my-6 bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto text-sm font-mono text-gray-200"
    />
  ),
  strong: (props: HTMLAttributes<HTMLElement>) => (
    <strong {...props} className="text-white font-semibold" />
  ),
  em: (props: HTMLAttributes<HTMLElement>) => (
    <em {...props} className="italic text-gray-200" />
  ),
}
