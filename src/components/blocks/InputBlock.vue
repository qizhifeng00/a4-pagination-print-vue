<script setup lang="ts">
import type { InputBlock as InputBlockType } from '@a4-pagination-print/core';
import { ref, computed } from 'vue';

const props = defineProps<{
  block: InputBlockType;
  scale?: number;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'change', id: string, value: string): void;
}>();

const s = computed(() => props.scale ?? 3.78);
const value = ref(props.block.value || '');

const lineCount = computed(() => value.value.split('\n').length);

const inputHeight = computed(() =>
  Math.max(
    (props.block.height || lineCount.value * 20),
    lineCount.value * 20
  ) * s.value
);

const INPUT_FONT = 2.65; // mm → 10px (PDF input)
const GAP = 2;           // mm
const IPAD_V = 1;        // mm
const IPAD_H = 2;        // mm

const wrapperStyle = computed(() => ({
  marginBottom: `${GAP * s.value}px`,
}));

const labelStyle = computed(() => ({
  display: 'block',
  fontSize: `${INPUT_FONT * s.value}px`,
  marginBottom: `${1 * s.value}px`,
  color: '#666',
}));

const textareaStyle = computed(() => ({
  width: '100%',
  boxSizing: 'border-box' as const,
  padding: `${IPAD_V * s.value}px ${IPAD_H * s.value}px`,
  border: '0.5px solid #ddd',
  borderRadius: '1px',
  fontSize: `${INPUT_FONT * s.value}px`,
  fontFamily: 'inherit',
  resize: 'vertical' as const,
  minHeight: `${inputHeight.value}px`,
}));

function handleInput(event: Event) {
  const newValue = (event.target as HTMLTextAreaElement).value;
  value.value = newValue;
  emit('change', props.block.id, newValue);
}
</script>

<template>
  <div class="a4-block a4-block--input" :style="wrapperStyle">
    <label v-if="block.label" :style="labelStyle">
      {{ block.label }}
    </label>
    <textarea
      :value="value"
      @input="handleInput"
      :placeholder="block.placeholder"
      :readonly="readOnly"
      :style="textareaStyle"
    />
  </div>
</template>
