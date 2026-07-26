<script setup lang="ts">
import type { Page, Block } from '@a4-pagination-print/core';
import { A4_MM, DEFAULT_MARGIN, DEFAULT_USABLE_HEIGHT } from '@a4-pagination-print/core';
import { computed } from 'vue';
import TableBlock from './blocks/TableBlock.vue';
import ChartBlock from './blocks/ChartBlock.vue';
import InputBlock from './blocks/InputBlock.vue';
import TextBlock from './blocks/TextBlock.vue';

const props = withDefaults(defineProps<{
  page: Page;
  visible?: boolean;
  active?: boolean;
  scale?: number;
  showHeader?: boolean;
  showFooter?: boolean;
  dayNumber?: number;
  echarts?: any;
}>(), {
  visible: true,
  active: false,
  scale: 3.78,
  showHeader: true,
  showFooter: true,
});

const emit = defineEmits<{
  (e: 'block-change', blockId: string, value: string): void;
}>();

// ---- Computed styles (objects, not strings — Vue 3 requirement) ----

const pageStyle = computed(() => ({
  width: `${A4_MM.width * props.scale}px`,
  height: `${A4_MM.height * props.scale}px`,
  padding: [
    DEFAULT_MARGIN.top * props.scale,
    DEFAULT_MARGIN.right * props.scale,
    DEFAULT_MARGIN.bottom * props.scale,
    DEFAULT_MARGIN.left * props.scale,
  ].map(v => `${v}px`).join(' '),
  boxSizing: 'border-box' as const,
  background: '#fff',
  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  margin: '0 auto 20px',
  position: 'relative' as const,
  overflow: 'hidden',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
  fontSize: `${3.5 * props.scale}px`,
  color: '#333',
  display: props.visible ? 'block' : 'none',
}));

const HDR_FONT = 2;  // mm → ~7.5px (compact date only)
const HDR_MB = 0.5;  // mm
const HDR_PB = 0.5;  // mm
const FTR_FONT = 3.5; // mm → ~13px (bold page number, larger)

const headerStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: `${HDR_MB * props.scale}px`,
  fontSize: `${HDR_FONT * props.scale}px`,
  color: '#999',
  borderBottom: '0.5px solid #e0e0e0',
  paddingBottom: `${HDR_PB * props.scale}px`,
}));

const footerStyle = computed(() => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: `${0.5 * props.scale}px`,
  borderTop: '0.5px solid #e0e0e0',
  fontSize: `${FTR_FONT * props.scale}px`,
  fontWeight: 700,
  color: '#333',
}));

const contentW = computed(() =>
  (A4_MM.width - DEFAULT_MARGIN.left - DEFAULT_MARGIN.right) * props.scale
);

const contentH = computed(() =>
  DEFAULT_USABLE_HEIGHT * props.scale
);

const contentStyle = computed(() => ({
  width: `${contentW.value}px`,
  height: `${contentH.value}px`,
  overflow: 'hidden',
}));

const unknownBlockStyle = computed(() => ({
  marginBottom: `${3 * props.scale}px`,
  padding: `${4 * props.scale}px`,
  background: '#fff3cd',
  border: '1px solid #ffc107',
  fontSize: `${3 * props.scale}px`,
}));

function onBlockChange(blockId: string, value: string) {
  emit('block-change', blockId, value);
}
</script>

<template>
  <div
    class="a4-page"
    :class="{ 'a4-page--active': active }"
    :data-date="page.date"
    :data-page-number="page.pageNumber"
    :style="pageStyle"
  >
    <!-- 页眉：仅日期 -->
    <div v-if="showHeader" class="a4-page-header" :style="headerStyle">
      <span>{{ page.date }}</span>
    </div>

    <!-- 内容区域 -->
    <div class="a4-page-content" :style="contentStyle">
      <template v-for="block in page.blocks" :key="block.id">
        <slot :name="`block-${block.type}`" :block="block" :scale="scale">
          <TableBlock
            v-if="block.type === 'table'"
            :block="(block as any)"
            :scale="scale"
          />
          <ChartBlock
            v-else-if="block.type === 'chart'"
            :block="(block as any)"
            :scale="scale"
            :echarts="echarts"
          />
          <InputBlock
            v-else-if="block.type === 'input'"
            :block="(block as any)"
            :scale="scale"
            @change="onBlockChange"
          />
          <TextBlock
            v-else-if="block.type === 'text'"
            :block="(block as any)"
            :scale="scale"
          />
          <div v-else :style="unknownBlockStyle">
            未知 Block 类型: {{ block.type }}
          </div>
        </slot>
      </template>
    </div>

    <!-- 页脚：第X天 第X页 · 加粗 -->
    <div v-if="showFooter" class="a4-page-footer" :style="footerStyle">
      第{{ dayNumber ?? '-' }}天 · 第{{ page.pageNumber }}页
    </div>
  </div>
</template>
