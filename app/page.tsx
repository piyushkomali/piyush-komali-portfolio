import Link from "next/link"
import { SiteNav } from "@/components/site-nav"
import { projects } from "@/lib/projects"
import { getAllPosts } from "@/lib/writing"

const films = [
  {
    title: "Good Will Hunting",
    year: "1997",
    src: "/images/good-will.png",
    href: "https://letterboxd.com/film/good-will-hunting/",
  },
  {
    title: "Dunkirk",
    year: "2017",
    src: "/images/dunkirk.png",
    href: "https://letterboxd.com/film/dunkirk-2017/",
  },
  {
    title: "Dune",
    year: "2021",
    src: "/images/dune.png",
    href: "https://letterboxd.com/film/dune-2021/",
  },
  {
    title: "Yeh Jawaani Hai Deewani",
    year: "2013",
    src: "/images/yjhd.png",
    href: "https://letterboxd.com/film/yeh-jawaani-hai-deewani/",
  },
]

export default async function Home() {
  const posts = await getAllPosts()
  return (
    <main>
      <SiteNav />

      <div className="mx-auto max-w-[720px] px-6 sm:px-8 py-16 sm:py-20">
        {/* ---------- Hero ---------- */}
        <section className="space-y-7">
          <div className="space-y-1.5">
            <p className="meta">Engineer · Blacksburg, VA</p>
          </div>

          <h1 className="text-[40px] sm:text-[52px] leading-[1.02] tracking-[-0.045em] font-[540] text-fg">
            What makes an interface
            <br className="hidden sm:block" /> feel great?
          </h1>

          <div className="space-y-3 text-[15px] sm:text-[16px] leading-[1.6] text-fg/85 max-w-[60ch]">
            <p>
              I&apos;m <span className="text-fg">Piyush Komali</span> — a computer
              science student at Virginia Tech, currently AI Engineer Intern at{" "}
              <a
                href="https://www.ibm.com/olabs"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-[3px] decoration-border-strong hover:decoration-fg micro"
              >
                IBM oLabs
              </a>
              . I build software that ships: streaming pipelines, agentic search,
              full-stack platforms used by thousands.
            </p>
            <p className="text-muted">
              I optimize for taste, latency, and the smallest legible surface area.
              Everything else is decoration.
            </p>
          </div>

          {/* Inline meta strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-2">
            <a
              href="https://github.com/piyushkomali"
              target="_blank"
              rel="noopener noreferrer"
              className="micro text-[13px] text-muted hover:text-fg"
            >
              github
            </a>
            <a
              href="https://www.linkedin.com/in/piyush-komali-53bb09240"
              target="_blank"
              rel="noopener noreferrer"
              className="micro text-[13px] text-muted hover:text-fg"
            >
              linkedin
            </a>
            <a
              href="mailto:komali.piyush@gmail.com"
              className="micro text-[13px] text-muted hover:text-fg"
            >
              email
            </a>
            <a
              href="https://letterboxd.com/piyushkomali"
              target="_blank"
              rel="noopener noreferrer"
              className="micro text-[13px] text-muted hover:text-fg"
            >
              letterboxd
            </a>
            <span className="text-[13px] text-muted-2 flex items-center gap-2">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
              <span className="ml-1">command menu</span>
            </span>
          </div>
        </section>

        {/* ---------- Work ---------- */}
        <section id="work" className="mt-24">
          <div className="flex items-baseline justify-between hairline-b pb-2 mb-2">
            <h2 className="text-[13px] tracking-[-0.01em] text-fg font-[510]">
              Work
            </h2>
            <span className="meta">Selected · 2024–2025</span>
          </div>

          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {projects.map((p) => {
              const isExternal = !!p.href
              const href = p.href ?? p.github ?? "#"
              return (
                <li key={p.slug}>
                  <a
                    href={href}
                    target={isExternal || p.github ? "_blank" : undefined}
                    rel={isExternal || p.github ? "noopener noreferrer" : undefined}
                    className="micro group block py-5 hover:bg-hover -mx-3 px-3 rounded-[4px]"
                  >
                    <div className="flex items-baseline justify-between gap-6">
                      <h3 className="text-[15.5px] font-[510] tracking-[-0.025em] text-fg group-hover:underline underline-offset-[3px] decoration-border-strong">
                        {p.title}
                      </h3>
                      <span className="meta whitespace-nowrap">{p.year}</span>
                    </div>
                    <p className="mt-1.5 text-[14px] text-muted leading-[1.55] max-w-[62ch]">
                      {p.description}
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1">
                      {p.tags.map((t) => (
                        <span key={t} className="meta">
                          {t}
                        </span>
                      ))}
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ---------- Writing ---------- */}
        <section id="writing" className="mt-24">
          <div className="flex items-baseline justify-between hairline-b pb-2 mb-2">
            <h2 className="text-[13px] tracking-[-0.01em] text-fg font-[510]">
              Writing
            </h2>
            <Link
              href="/writing"
              className="micro meta hover:text-fg"
            >
              All →
            </Link>
          </div>

          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  href={`/writing/${post.slug}`}
                  className="micro group block py-5 hover:bg-hover -mx-3 px-3 rounded-[4px]"
                >
                  <div className="flex items-baseline justify-between gap-6">
                    <h3 className="text-[15.5px] font-[510] tracking-[-0.025em] text-fg group-hover:underline underline-offset-[3px] decoration-border-strong">
                      {post.title}
                    </h3>
                    <time
                      dateTime={post.date}
                      className="meta whitespace-nowrap font-mono"
                    >
                      {post.date}
                    </time>
                  </div>
                  <p className="mt-1.5 text-[14px] text-muted leading-[1.55] max-w-[62ch]">
                    {post.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Now Listening ---------- */}
        <section id="listening" className="mt-24">
          <div className="flex items-baseline justify-between hairline-b pb-2 mb-3">
            <h2 className="text-[13px] tracking-[-0.01em] text-fg font-[510]">
              Currently Listening
            </h2>
            <a
              href="https://www.last.fm/user/piyushk12"
              target="_blank"
              rel="noopener noreferrer"
              className="micro meta hover:text-fg"
            >
              last.fm →
            </a>
          </div>
          <p className="text-[13.5px] text-muted leading-[1.6] max-w-[62ch]">
            A live scrobble feed pinned bottom-left of every page. Powered by
            Last.fm via an edge function — refreshes every 15s. Music informs
            taste; taste informs interface.
          </p>
        </section>

        {/* ---------- Films / Letterboxd ---------- */}
        <section id="films" className="mt-24">
          <div className="flex items-baseline justify-between hairline-b pb-2 mb-4">
            <h2 className="text-[13px] tracking-[-0.01em] text-fg font-[510]">
              Films
            </h2>
            <a
              href="https://letterboxd.com/piyushkomali"
              target="_blank"
              rel="noopener noreferrer"
              className="micro meta hover:text-fg"
            >
              letterboxd →
            </a>
          </div>

          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {films.map((f) => (
              <li key={f.title}>
                <a
                  href={f.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="micro group block hairline rounded-[6px] overflow-hidden hover:border-border-strong"
                >
                  <div className="aspect-[2/3] overflow-hidden bg-hover">
                    <img
                      src={f.src}
                      alt={f.title}
                      className="w-full h-full object-cover micro group-hover:scale-[1.02]"
                    />
                  </div>
                  <div className="px-2.5 py-2 hairline-t">
                    <p className="text-[12.5px] text-fg truncate leading-tight">
                      {f.title}
                    </p>
                    <p className="meta mt-1" style={{ fontSize: 10.5 }}>
                      {f.year}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Footer ---------- */}
        <footer className="mt-24 pt-6 hairline-t flex items-center justify-between text-[12px] text-muted">
          <span>© {new Date().getFullYear()} Piyush Komali</span>
          <span className="font-mono">v2 — built in Next.js</span>
        </footer>
      </div>
    </main>
  )
}
