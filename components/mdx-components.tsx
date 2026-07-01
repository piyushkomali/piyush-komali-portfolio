import { codeToHtml } from "shiki"
import type { ComponentProps, ReactNode } from "react"

/** Server component: highlights code via shiki with dual themes */
async function CodeBlock({
  code,
  lang,
  title,
}: {
  code: string
  lang: string
  title?: string
}) {
  const html = await codeToHtml(code, {
    lang: lang || "txt",
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
  })

  return (
    <figure className="not-prose my-6 hairline rounded-[6px] overflow-hidden bg-code-bg">
      <figcaption className="hairline-b flex items-center justify-between px-3 h-8">
        <span className="font-mono text-[11px] text-muted truncate">
          {title ?? `${lang || "txt"}`}
        </span>
        <span className="meta" style={{ fontSize: 10 }}>
          {lang || "txt"}
        </span>
      </figcaption>
      <div
        className="shiki-wrap text-[13px] leading-[1.65] font-mono overflow-x-auto"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </figure>
  )
}

/** Parse the optional `title="..."` from the className/meta */
function parseMeta(metaString?: string): { title?: string } {
  if (!metaString) return {}
  const m = metaString.match(/title="([^"]+)"/)
  return { title: m?.[1] }
}

export const mdxComponents = {
  h1: (props: ComponentProps<"h1">) => (
    <h1
      className="text-[26px] font-[540] tracking-[-0.035em] mt-10 mb-3"
      {...props}
    />
  ),
  h2: (props: ComponentProps<"h2">) => (
    <h2
      className="text-[20px] font-[540] tracking-[-0.03em] mt-10 mb-2"
      {...props}
    />
  ),
  h3: (props: ComponentProps<"h3">) => (
    <h3
      className="text-[16.5px] font-[540] tracking-[-0.025em] mt-8 mb-2"
      {...props}
    />
  ),
  a: ({ href, ...rest }: ComponentProps<"a">) => {
    const external = href?.startsWith("http")
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        {...rest}
      />
    )
  },
  hr: () => <hr className="border-0 border-t my-10" />,
  blockquote: (props: ComponentProps<"blockquote">) => (
    <blockquote
      className="border-l pl-4 text-muted italic my-5"
      {...props}
    />
  ),
  pre: (props: ComponentProps<"pre">) => {
    // pull lang + title out of child <code>
    const child = (props as { children?: ReactNode }).children as
      | { props?: { className?: string; children?: string; title?: string } }
      | undefined
    const className = child?.props?.className ?? ""
    const lang = className.replace(/^language-/, "")
    const meta = parseMeta((child as { props?: { metastring?: string } } | undefined)?.props?.metastring)
    const code =
      typeof child?.props?.children === "string"
        ? child.props.children.replace(/\n$/, "")
        : ""
    // @ts-expect-error async server component is fine here
    return <CodeBlock code={code} lang={lang} title={meta.title ?? child?.props?.title} />
  },
  code: (props: ComponentProps<"code">) => (
    <code {...props} />
  ),
}
