# Rebuild this UI draft inside my project

The block below is a self-contained HTML+Tailwind sketch. Treat it as a VISUAL reference for layout, spacing, hierarchy and states — not code to paste.

STEP 1 — Inspect my project first and figure out its stack (do not assume it):
- Framework & language: read package.json / tsconfig (React, Next, Vue, Svelte, Solid, Astro, …; TypeScript or JavaScript).
- Styling system: Tailwind (and which version, via components.json / tailwind config), or CSS Modules, styled-components, vanilla-extract, Emotion, Sass, or plain CSS.
- Component / design system: search the repo for an existing UI kit (shadcn/ui, Radix, MUI, Chakra, Ant, Mantine, or a local components/ui folder) and REUSE its primitives instead of inventing new ones.
- Conventions: path aliases, folder layout, design tokens (theme file or CSS variables), and formatting/lint rules.

STEP 2 — Recreate the sketch using MY stack and MY existing components. Preserve the layout, spacing and visual hierarchy; map the raw HTML onto my own components and design tokens; do not introduce a new UI library or hardcoded colors when my project already has equivalents.

## Constraints

- Match my detected framework, styling system and component library — reuse what exists, don't reinvent it
- Use my design tokens / theme, not hardcoded hex colors
- Only add a dependency or global config if my project genuinely lacks an equivalent, and call it out explicitly
- Real content, no lorem ipsum; keep it accessible

<reference_sketch>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Movie Reviews</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #ffffff;
      --background: #13181d;
      --foreground: #ededed;
      --accent: #1c232b;
      --muted: rgba(255,255,255,0.4);
      --border: #2a3038;
      --radius: 0.25rem;
      --font: 'Inter', sans-serif;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: var(--font);
      background: var(--background);
      color: var(--foreground);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
    }

    .review-list {
      width: 100%;
      max-width: 560px;
    }

    .list-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border);
    }

    .list-title {
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--muted);
    }

    .list-count {
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--muted);
    }

    .review-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.375rem;
    }

    .date-marker {
      width: 28px;
      flex-shrink: 0;
      text-align: center;
      font-size: 0.6875rem;
      font-weight: 500;
      color: var(--muted);
      line-height: 1;
    }

    .date-marker.month-label {
      color: var(--foreground);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      font-size: 0.625rem;
    }

    .review-item {
      flex: 1;
      display: flex;
      gap: 0.625rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border);
      border-radius: var(--radius);
      background: var(--accent);
      transition: border-color 0.15s ease;
      align-items: center;
      min-width: 0;
    }

    .review-item:hover {
      border-color: #3a424c;
    }

    .poster {
      width: 34px;
      height: 50px;
      border-radius: 3px;
      object-fit: cover;
      flex-shrink: 0;
      background: #2a3038;
    }

    .review-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .review-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .movie-title {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--foreground);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
      flex: 1;
    }

    .stars {
      display: flex;
      gap: 1px;
      align-items: center;
      flex-shrink: 0;
    }

    .star {
      display: inline-block;
      position: relative;
      font-size: 12px;
      line-height: 1;
      color: rgba(255,255,255,0.15);
    }

    .star::before {
      content: '★';
    }

    .star.full {
      color: #ffffff;
    }

    .star.half {
      color: rgba(255,255,255,0.15);
    }

    .star.half::after {
      content: '★';
      position: absolute;
      left: 0;
      top: 0;
      width: 50%;
      overflow: hidden;
      color: #ffffff;
    }

    .review-text {
      font-size: 0.6875rem;
      line-height: 1.4;
      color: var(--muted);
      white-space: nowrap;
      overflow: hidden;
      -webkit-mask-image: linear-gradient(to right, black 60%, transparent 95%);
      mask-image: linear-gradient(to right, black 60%, transparent 95%);
    }

    @media (max-width: 480px) {
      .poster {
        width: 28px;
        height: 42px;
      }
      .review-row {
        gap: 0.5rem;
      }
      .date-marker {
        width: 22px;
        font-size: 0.625rem;
      }
      .review-item {
        padding: 0.4rem 0.5rem;
        gap: 0.5rem;
      }
      .movie-title {
        font-size: 0.75rem;
      }
    }
  </style>
</head>
<body>
  <div class="review-list">
    <div class="list-header">
      <span class="list-title">Recent Reviews</span>
      <span class="list-count">5 reviews</span>
    </div>

    <div class="review-row">
      <div class="date-marker month-label">Mar</div>
      <div class="review-item">
        <img class="poster" src="https://image.tmdb.org/t/p/w200/8b8R8l88Qje9dn9OE8PY05Nez7H.jpg" alt="Dune: Part Two" onerror="this.style.background='#2a3038';this.src='';">
        <div class="review-content">
          <div class="review-header">
            <span class="movie-title">Dune: Part Two</span>
            <div class="stars">
              <span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star half"></span>
            </div>
          </div>
          <p class="review-text">Villeneuve delivers a masterclass in world-building. The sandworm riding sequence alone justifies the price of admission.</p>
        </div>
      </div>
    </div>

    <div class="review-row">
      <div class="date-marker month-label">Feb</div>
      <div class="review-item">
        <img class="poster" src="https://image.tmdb.org/t/p/w200/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" alt="Oppenheimer" onerror="this.style.background='#2a3038';this.src='';">
        <div class="review-content">
          <div class="review-header">
            <span class="movie-title">Oppenheimer</span>
            <div class="stars">
              <span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span>
            </div>
          </div>
          <p class="review-text">Nolan's most human film is also his most terrifying. Cillian Murphy's haunted eyes carry three hours of moral weight effortlessly.</p>
        </div>
      </div>
    </div>

    <div class="review-row">
      <div class="date-marker">14</div>
      <div class="review-item">
        <img class="poster" src="https://image.tmdb.org/t/p/w200/74xTEgt7R36Fpooo50r9T25onhq.jpg" alt="The Batman" onerror="this.style.background='#2a3038';this.src='';">
        <div class="review-content">
          <div class="review-header">
            <span class="movie-title">The Batman</span>
            <div class="stars">
              <span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star"></span>
            </div>
          </div>
          <p class="review-text">A noir-drenched detective story that finally treats Batman as the world's greatest detective. Pattinson brings a wounded vulnerability.</p>
        </div>
      </div>
    </div>

    <div class="review-row">
      <div class="date-marker month-label">Jan</div>
      <div class="review-item">
        <img class="poster" src="https://image.tmdb.org/t/p/w200/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg" alt="Everything Everywhere All at Once" onerror="this.style.background='#2a3038';this.src='';">
        <div class="review-content">
          <div class="review-header">
            <span class="movie-title">Everything Everywhere All at Once</span>
            <div class="stars">
              <span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span>
            </div>
          </div>
          <p class="review-text">The Daniels somehow made a film about tax audits, hot dog fingers, and googly eyes that reduced me to tears. Michelle Yeoh is extraordinary.</p>
        </div>
      </div>
    </div>

    <div class="review-row">
      <div class="date-marker">18</div>
      <div class="review-item">
        <img class="poster" src="https://image.tmdb.org/t/p/w200/k7eYdW0G5FnJFgagb9JIqN3BbJg.jpg" alt="Past Lives" onerror="this.style.background='#2a3038';this.src='';">
        <div class="review-content">
          <div class="review-header">
            <span class="movie-title">Past Lives</span>
            <div class="stars">
              <span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star full"></span><span class="star half"></span>
            </div>
          </div>
          <p class="review-text">Celine Song's debut is devastating in its restraint. Two childhood friends reconnect across decades and continents.</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
</reference_sketch>

## Inspired by 21st

- Inspired by 21st component Timeline (Codehagen/timeline) — optionally run `npx @21st-dev/cli add Codehagen/timeline` for a vetted base, then reconcile it to the brief above.
- Inspired by 21st component Animated Review Card (whyte25/animated-review-card) — optionally run `npx @21st-dev/cli add whyte25/animated-review-card` for a vetted base, then reconcile it to the brief above.

## Done when

It matches the sketch's layout and hierarchy, uses my project's own framework, components and design tokens, follows my TS/JS and lint conventions, covers loading/empty/error states, and drops into my codebase without new dependencies or global config (unless I was told one is missing).
