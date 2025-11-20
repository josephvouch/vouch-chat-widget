<template>
  <div class="markdown-body" v-html="html"></div>
  <!-- We intentionally use v-html to render pre-sanitized markdown output from markdown-it
       with html disabled and safe link validation. -->
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { renderMarkdown } from '../utils/markdown'

const props = defineProps<{ content: string }>()

const html = computed(() => renderMarkdown(props.content))
</script>

<style>
.markdown-body {
  /* inherit font styles from the bubble */
  font: inherit;
  color: inherit;
  line-height: inherit;
  word-break: break-word;
  /* improve readability for longer content */
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.markdown-body p {
  margin: 0.375rem 0; /* slightly more breathing room */
}

.markdown-body ul,
.markdown-body ol {
  /* margin: 0.375rem 0 0.375rem 1.25rem; */
  /* padding: 0 0 0 0.25rem; */
  list-style-position: outside;
  display: block;
  list-style-type: decimal;
  margin-block-start: 1em;
  margin-block-end: 1em;
  padding-inline-start: 40px;
  unicode-bidi: isolate;
}

.markdown-body ul {
  list-style-type: disc;
}
.markdown-body ol {
  list-style-type: decimal;
}

.markdown-body li + li {
  margin-top: 0.25rem;
}

.markdown-body code {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  padding: 0.1rem 0.25rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 0.9em;
}

.markdown-body pre {
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  overflow: auto;
}

.markdown-body pre code {
  background: transparent;
  padding: 0;
}

.markdown-body a {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.markdown-body blockquote {
  margin: 0.5rem 0;
  padding-left: 0.75rem;
  border-left: 3px solid currentColor;
  opacity: 0.8;
}

/* Headings: modest scale for chat bubbles */
.markdown-body h1 {
  margin: 0.5rem 0 0.25rem;
  font-weight: 700;
  font-size: 1.125rem;
}

.markdown-body h2 {
  margin: 0.5rem 0 0.25rem;
  font-weight: 700;
  font-size: 1.0625rem;
}

.markdown-body h3,
.markdown-body h4,
.markdown-body h5,
.markdown-body h6 {
  margin: 0.5rem 0 0.25rem;
  font-weight: 600;
  font-size: 1rem;
}

/* Horizontal rule */
.markdown-body hr {
  margin: 0.75rem 0;
  border: none;
  border-top: 1px solid currentColor;
  opacity: 0.2;
}

/* Tables: compact and scrollable */
.markdown-body table {
  width: 100%;
  border-collapse: collapse;
  margin: 0.5rem 0;
  overflow: hidden;
}
.markdown-body th,
.markdown-body td {
  border: 1px solid currentColor;
  border-color: color-mix(in srgb, currentColor 20%, transparent);
  padding: 0.375rem 0.5rem;
  text-align: left;
}
.markdown-body thead th {
  font-weight: 600;
  background: color-mix(in srgb, currentColor 6%, transparent);
}

/* Images: never overflow the bubble */
.markdown-body img {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
}

/* Task lists checkboxes */
.markdown-body input[type='checkbox'] {
  margin-right: 0.5rem;
  transform: scale(0.9);
  vertical-align: text-bottom;
  pointer-events: none;
}

/* Remove outer gaps inside bubble */
.markdown-body > :first-child {
  margin-top: 0 !important;
}
.markdown-body > :last-child {
  margin-bottom: 0 !important;
}
</style>
