'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1.1fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--slot4-accent)] text-[var(--slot4-on-accent)]">
                <img src="/favicon.png?v=20260413" alt={SITE_CONFIG.name} className="h-7 w-7 object-contain" />
              </span>
              <span className="editable-display text-2xl font-semibold tracking-[-0.01em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--editable-footer-text)]/70">{globalContent.footer?.description || SITE_CONFIG.description}</p>
            <div className="mt-6 flex gap-2">
              <span className="h-1.5 w-8 rounded-full bg-[var(--slot4-accent)]" />
              <span className="h-1.5 w-8 rounded-full bg-[var(--editable-footer-text)]/25" />
              <span className="h-1.5 w-8 rounded-full bg-[var(--editable-footer-text)]/25" />
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--editable-footer-text)]/50">Site</h3>
            <div className="mt-5 grid gap-3">
              {[
                ['About', '/about'],
                ['Contact', '/contact'],
                ...(session ? [['Create', '/create']] : [['Login', '/login'], ['Sign up', '/signup']]),
              ].map(([label, href]) => (
                <Link key={href} href={href} className="text-sm font-medium text-[var(--editable-footer-text)]/85 transition hover:text-[var(--editable-footer-text)]">{label}</Link>
              ))}
              {session ? <button type="button" onClick={logout} className="text-left text-sm font-medium text-[var(--editable-footer-text)]/85 transition hover:text-[var(--editable-footer-text)]">Logout</button> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--editable-footer-text)]/15 bg-[var(--editable-footer-text)]/5 p-6">
            <h3 className="editable-display text-lg font-semibold tracking-[-0.01em]">Have something to list?</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--editable-footer-text)]/70">Post your business or classified ad in minutes — free to get started.</p>
            <Link href="/create" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--slot4-on-accent)] transition hover:brightness-110">
              Post an ad <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--editable-footer-text)]/10 px-4 py-6 text-center text-xs font-medium tracking-[0.12em] text-[var(--editable-footer-text)]/60">
        © {year} {SITE_CONFIG.name}. All rights reserved.
      </div>
    </footer>
  )
}
