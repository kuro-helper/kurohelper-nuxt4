<template>
  <!-- eslint-disable-next-line vue/no-v-html -- HTML 已經過 DOMPurify sanitize -->
  <div class="markdown-content" v-html="html" />
</template>

<script setup lang="ts">
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';

marked.setOptions({ breaks: true });

const props = defineProps<{ source: string }>();

const html = computed(() =>
  DOMPurify.sanitize(marked.parse(props.source ?? '', { async: false }) as string),
);
</script>

<style scoped>
.markdown-content :deep(:is(p, ul, ol, pre, blockquote)) {
  margin: 0 0 0.75em;
}

.markdown-content :deep(:is(p, ul, ol, pre, blockquote):last-child) {
  margin-bottom: 0;
}

.markdown-content :deep(p) {
  line-height: 1.6;
  word-break: break-word;
}

.markdown-content :deep(:is(h1, h2, h3)) {
  margin: 0.9em 0 0.4em;
  line-height: 1.35;
  font-weight: 700;
}

.markdown-content :deep(:is(h1, h2, h3):first-child) {
  margin-top: 0;
}

.markdown-content :deep(:is(ul, ol)) {
  padding-left: 1.25em;
}

.markdown-content :deep(a) {
  color: rgb(var(--v-theme-primary));
}

.markdown-content :deep(code) {
  padding: 0.1em 0.35em;
  border-radius: 4px;
  font-size: 0.9em;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.markdown-content :deep(pre) {
  padding: 10px 12px;
  overflow-x: auto;
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.08);
}

.markdown-content :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-content :deep(blockquote) {
  padding-left: 0.85em;
  border-left: 3px solid rgba(var(--v-theme-primary), 0.45);
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}
</style>
