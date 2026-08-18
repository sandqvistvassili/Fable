'use client'

import { useState } from 'react'

/**
 * The one client component on a share page. Clipboard first, with a
 * select-the-text fallback for browsers that refuse the API.
 */
export default function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle')

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      setState('done')
    } catch {
      setState('failed')
    }
    window.setTimeout(() => setState('idle'), 2000)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="cursor-pointer rounded-[2px] border border-accent bg-transparent px-2.5 py-1 font-mach text-micro uppercase tracking-[0.08em] text-accent hover:bg-accent hover:text-surface"
      aria-live="polite"
    >
      {state === 'done' ? 'Copied' : state === 'failed' ? 'Select and copy manually' : label}
    </button>
  )
}
