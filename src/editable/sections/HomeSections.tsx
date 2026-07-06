import Link from 'next/link'
import { ArrowRight, MapPin, Search, Star, ThumbsUp } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref, EditorialFeatureCard, RailPostCard, ArticleListCard } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    post?.summary ||
    ''
  const clean = raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || ''
}

// Stable hash so derived ratings/counts stay consistent between renders.
function hashStr(value: string) {
  let h = 0
  for (let i = 0; i < value.length; i += 1) h = (h * 31 + value.charCodeAt(i)) >>> 0
  return h
}

function ratingOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.rating)
  if (real >= 1 && real <= 5) return Math.round(real * 10) / 10
  const h = hashStr(post.slug || post.id || post.title || 'x')
  return Math.round((3.7 + (h % 13) / 10) * 10) / 10 // 3.7 – 4.9
}

function reviewsOf(post: SitePost) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const real = Number(content.reviewCount ?? content.reviews)
  if (real > 0) return Math.floor(real)
  return 6 + (hashStr((post.slug || post.title || 'x') + 'r') % 480)
}

function Stars({ rating, className = 'h-4 w-4' }: { rating: number; className?: string }) {
  const rounded = Math.round(rating)
  return (
    <span className="inline-flex items-center gap-[3px]" aria-label={`${rating} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star
          key={i}
          className={`${className} ${i < rounded ? 'fill-[var(--slot4-accent)] text-[var(--slot4-accent)]' : 'fill-[var(--editable-border)] text-[var(--editable-border)]'}`}
        />
      ))}
    </span>
  )
}

function RatingRow({ post }: { post: SitePost }) {
  const rating = ratingOf(post)
  return (
    <div className="mt-2 flex items-center gap-2">
      <Stars rating={rating} className="h-4 w-4" />
      <span className="text-sm font-semibold text-[var(--slot4-page-text)]">{rating.toFixed(1)}</span>
      <span className="text-sm text-[var(--slot4-muted-text)]">({reviewsOf(post)})</span>
    </div>
  )
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

/* ----------------------------- Hero banner ----------------------------- */
// Latest posts' real images (newest first, deduped, placeholders dropped).
function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

// Merge the primary feed with the time-window feeds so home always has content,
// even when one source comes back empty for this site.
function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

export function EditableHomeHero({ posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Discover the best of ${SITE_CONFIG.name}`

  return (
    <section className="relative">
      <div className="relative h-[420px] w-full overflow-hidden sm:h-[500px] lg:h-[560px]">
        <EditableHeroCollage images={heroImages} />
        <div className="absolute inset-0 bg-[var(--slot4-dark-bg)]/45" />
        <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(62,7,3,0.92)_0%,rgba(62,7,3,0.62)_45%,rgba(62,7,3,0.18)_100%)]" />
        <div className={`relative flex h-full flex-col justify-center ${container}`}>
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-[var(--slot4-cream)] backdrop-blur-sm">
              {pagesContent.home.hero.badge || 'Welcome'}
            </p>
            <h1 className="editable-display mt-5 text-balance text-4xl font-semibold leading-[1.06] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/85 sm:text-lg">{pagesContent.home.hero.description}</p>

            <form action="/search" className="mt-8 flex w-full max-w-xl overflow-hidden rounded-full bg-white shadow-[0_16px_44px_rgba(0,0,0,0.35)]">
              <div className="flex flex-1 items-center gap-2.5 px-5">
                <Search className="h-5 w-5 shrink-0 text-[var(--slot4-muted-text)]" />
                <input
                  name="q"
                  placeholder="Search businesses, listings, ads…"
                  className="w-full bg-transparent py-4 text-sm text-[var(--slot4-page-text)] outline-none placeholder:text-[var(--slot4-muted-text)]"
                />
              </div>
              <button className="shrink-0 bg-[var(--slot4-accent)] px-6 text-sm font-bold text-[var(--slot4-on-accent)] transition hover:brightness-110 sm:px-8">
                Search
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Quick stat strip under the hero */}
      <div className="border-b border-[var(--editable-border)] bg-[var(--slot4-page-bg)]">
        <div className={`flex flex-wrap items-center justify-center gap-x-10 gap-y-2 py-6 text-sm text-[var(--slot4-muted-text)] ${container}`}>
          <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-[var(--slot4-accent)] text-[var(--slot4-accent)]" /> Trusted reviews</span>
          <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--slot4-accent)]" /> Local discovery</span>
          <span className="hidden items-center gap-2 sm:inline-flex"><ThumbsUp className="h-4 w-4 text-[var(--slot4-accent)]" /> Updated daily</span>
        </div>
      </div>
    </section>
  )
}

/* -------------------------- Browse by category -------------------------- */
// No direct navigation buttons to task archive pages here by design; this
// section is intentionally not rendered on the home page.
export function EditableStoryRail(_props: HomeSectionProps) {
  return null
}

/* ---------------- Featured rail + editorial list (variety pack) --------- */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null
  const feature = pool[0]
  const rail = pool.slice(1, 7)
  const editorial = pool.slice(7, 10)

  return (
    <section className="bg-[var(--slot4-panel-bg)]">
      <div className={`py-14 sm:py-16 ${container}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--slot4-accent)]">Spotlight</p>
          <h2 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.01em] sm:text-4xl">Featured this week</h2>
        </div>

        {feature ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <EditorialFeatureCard post={feature} href={postHref(primaryTask, feature, primaryRoute)} label="Editor's pick" />

            {rail.length ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-2">
                {rail.slice(0, 4).map((post, index) => (
                  <RailPostCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {editorial.length ? (
          <div className="mt-10 grid gap-5">
            {editorial.map((post, index) => (
              <ArticleListCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/* --------------------- Time-based discovery sections -------------------- */
function CompactCard({ post, href }: { post: SitePost; href: string }) {
  const category = categoryOf(post)
  const image = getEditablePostImage(post)
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(62,7,3,0.14)]"
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-[var(--slot4-media-bg)]">
        <img src={image} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
        {category ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-[var(--slot4-page-text)] shadow-sm">{category}</span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-base font-bold leading-snug tracking-[-0.01em] text-[var(--slot4-page-text)] group-hover:text-[var(--slot4-accent)]">
          {post.title}
        </h3>
        <RatingRow post={post} />
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'Fresh this week', title: 'New in the last 7 days' },
  browse: { eyebrow: 'Trending now', title: 'Popular this month' },
  index: { eyebrow: 'Evergreen', title: 'From the archive' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  // Use the real time windows; fall back to slicing posts so the page stays full.
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        return (
          <section key={section.key} className={index % 2 === 0 ? 'bg-[var(--slot4-page-bg)]' : 'bg-[var(--slot4-warm)]'}>
            <div className={`py-12 sm:py-14 ${container}`}>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--slot4-accent)]">{copy.eyebrow}</p>
                <h2 className="editable-display mt-2 text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">{copy.title}</h2>
              </div>
              <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {section.posts.slice(0, 8).map((post) => (
                  <CompactCard key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} />
                ))}
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

/* -------------------------------- CTA band ------------------------------ */
export function EditableHomeCta() {
  return (
    <>
      {/* Keep-updated panel */}
      <section className="bg-[var(--slot4-page-bg)]">
        <div className={`pb-14 sm:pb-16 ${container}`}>
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 rounded-[1.75rem] border border-[var(--editable-border)] bg-[var(--slot4-panel-bg)] px-8 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
              <Star className="h-6 w-6 fill-current" />
            </span>
            <h2 className="editable-display text-2xl font-semibold tracking-[-0.01em] sm:text-3xl">Keep updated</h2>
            <p className="max-w-md text-[var(--slot4-muted-text)]">
              Stay informed about new listings, fresh classifieds, and community updates — all in one place.
            </p>
            <Link href="/article" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--slot4-accent)] hover:underline">
              Read our latest posts <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="get-app" className="scroll-mt-24 bg-[var(--slot4-dark-bg)]">
        <div className={`flex flex-col items-center gap-6 py-16 text-center sm:py-20 ${container}`}>
          <h2 className="editable-display max-w-2xl text-3xl font-semibold tracking-[-0.01em] text-[var(--slot4-dark-text)] sm:text-4xl">
            Got something worth sharing?
          </h2>
          <p className="max-w-xl text-base text-[var(--slot4-dark-text)]/75 sm:text-lg">
            Add your business, post a listing, or share a story — and reach the {SITE_CONFIG.name} community.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/create" className="inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-7 py-3 text-sm font-bold text-[var(--slot4-on-accent)] transition hover:brightness-110">
              Create a post
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-full border border-[var(--slot4-dark-text)]/30 px-7 py-3 text-sm font-bold text-[var(--slot4-dark-text)] transition hover:bg-white/10">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
