<script setup lang="ts">
import type { TextBlock as TextBlockType } from '@a4-pagination-print/core';
import { computed } from 'vue';

const props = defineProps<{
  block: TextBlockType;
  scale?: number;
}>();

const s = computed(() => props.scale ?? 3.78);

const TEXT_FONT = 3.18; // mm → 12px (PDF text block)
const GAP = 2;           // mm

const textStyle = computed(() => ({
  marginBottom: `${GAP * s.value}px`,
  fontSize: `${TEXT_FONT * s.value}px`,
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap' as const,
  wordBreak: 'break-word' as const,
}));
</script>

<template>
  <div class="a4-block a4-block--text" :style="textStyle">
    {{ block.content }}
  </div>
</template>
