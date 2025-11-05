import MarkdownIt, { type PluginSimple, type PluginWithOptions } from 'markdown-it'
import abbr from 'markdown-it-abbr'
import deflist from 'markdown-it-deflist'
import { full as emoji } from 'markdown-it-emoji'
import ins from 'markdown-it-ins'
import mark from 'markdown-it-mark'
import sub from 'markdown-it-sub'
import taskLists from 'markdown-it-task-lists'

// Singleton markdown-it instance configured for safe chat rendering
const md = new MarkdownIt({
  // Keep HTML disabled for safety inside chat bubbles
  // html: false,
  // Autolink plain URLs and emails
  linkify: true,
  // Smart quotes, dashes, ellipses, etc.
  typographer: true,
  // Treat single newlines as <br> to preserve chat formatting
  breaks: true,
})

// Keep default rules enabled so inline code and fences render properly

// Plugin options: task lists
md.use(taskLists as PluginWithOptions, { enabled: true })

// Additional plugins
md.use(mark as PluginSimple)
md.use(sub as PluginSimple)
md.use(ins as PluginSimple)
md.use(emoji as PluginSimple)
md.use(abbr as PluginSimple)
md.use(deflist as PluginSimple)

// Allow only http/https/mailto/tel links
const originalValidateLink = md.validateLink
md.validateLink = (url) => {
  if (!originalValidateLink(url)) return false
  const lower = url.trim().toLowerCase()
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('mailto:') ||
    lower.startsWith('tel:')
  )
}

export function renderMarkdown(input: string): string {
  try {
    return md.render(input || '')
  } catch {
    // In case of unexpected input, render as escaped text
    return md.utils.escapeHtml(String(input ?? ''))
  }
}

export default md
