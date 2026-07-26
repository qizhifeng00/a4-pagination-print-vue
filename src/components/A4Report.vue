<script setup lang="ts">
import type { DateGroup, PaginatorConfig, Page } from '@a4-pagination-print/core';
import { computed } from 'vue';
import { useReport } from '../composables/useReport';
import A4Page from './A4Page.vue';

const props = withDefaults(defineProps<{
  groups: DateGroup[];
  paginatorConfig?: PaginatorConfig;
  scale?: number;
  title?: string;
  echarts?: any;
  toolbarPosition?: 'top' | 'bottom' | 'both';
  showToolbar?: boolean;
}>(), {
  scale: 3.78,
  toolbarPosition: 'top',
  showToolbar: true,
});

const emit = defineEmits<{
  (e: 'print-current-page'): void;
  (e: 'print-all-pages'): void;
  (e: 'export-current-pdf', page: Page): void;
  (e: 'export-date-range-pdf', pages: Page[], startDate: string, endDate: string): void;
  (e: 'export-all-pdf', pages: Page[]): void;
  (e: 'block-change', blockId: string, value: string): void;
}>();

const {
  pages,
  currentPage,
  currentIndex,
  currentDate,
  currentPageNumber,
  totalPages,
  isFirst,
  isLast,
  goNext,
  goPrev,
} = useReport({ groups: props.groups, ...props.paginatorConfig });

// 计算每个日期是第几天
const dateOrder = computed(() => {
  const seen = new Map<string, number>();
  let idx = 0;
  for (const p of pages.value) {
    if (!seen.has(p.date)) {
      seen.set(p.date, ++idx);
    }
  }
  return seen;
});

function onBlockChange(blockId: string, value: string) {
  emit('block-change', blockId, value);
}

// Toolbar button styles
const btnBase = {
  padding: '8px 16px',
  border: '1px solid #d9d9d9',
  borderRadius: '6px',
  fontSize: '13px',
} as const;

const toolbarStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '12px 0',
  gap: '8px',
  flexWrap: 'wrap',
} as const;

const navInfoStyle = {
  margin: '0 12px',
  fontSize: '14px',
  color: '#666',
  minWidth: '160px',
  textAlign: 'center',
} as const;

const sepStyle = { margin: '0 8px', color: '#ddd' };

function prevBtnStyle(disabled: boolean) {
  return { ...btnBase, background: disabled ? '#f5f5f5' : '#fff', color: disabled ? '#ccc' : '#333', cursor: disabled ? 'not-allowed' : 'pointer' };
}
function nextBtnStyle(disabled: boolean) {
  return { ...btnBase, background: disabled ? '#f5f5f5' : '#fff', color: disabled ? '#ccc' : '#333', cursor: disabled ? 'not-allowed' : 'pointer' };
}
const primaryBtnStyle = { ...btnBase, background: '#1890ff', color: '#fff', borderColor: '#1890ff', cursor: 'pointer' };
const normalBtnStyle = { ...btnBase, background: '#fff', color: '#333', cursor: 'pointer' };
</script>

<template>
  <div class="a4-report">
    <h2 v-if="title" style="text-align:center;font-size:18px;margin-bottom:16px;color:#333;">
      {{ title }}
    </h2>

    <!-- Toolbar top -->
    <div v-if="showToolbar && (toolbarPosition === 'top' || toolbarPosition === 'both')" :style="toolbarStyle">
      <button :style="prevBtnStyle(isFirst)" :disabled="isFirst" @click="goPrev">◀ 上一页</button>
      <span :style="navInfoStyle">{{ currentDate }} · 第 {{ currentPageNumber }} 页 / 共 {{ totalPages }} 页</span>
      <button :style="nextBtnStyle(isLast)" :disabled="isLast" @click="goNext">下一页 ▶</button>
      <span :style="sepStyle">|</span>
      <button :style="primaryBtnStyle" @click="emit('print-current-page')">🖨 打印当前页</button>
      <button :style="normalBtnStyle" @click="emit('print-all-pages')">📑 打印全部</button>
      <span :style="sepStyle">|</span>
      <button :style="normalBtnStyle" @click="currentPage && emit('export-current-pdf', currentPage)">📄 导出当前页</button>
      <button :style="normalBtnStyle" @click="emit('export-all-pdf', pages)">📦 导出全部</button>
    </div>

    <!-- Pages -->
    <div class="a4-container">
      <A4Page
        v-for="(page, i) in pages"
        :key="page.date + '-' + page.pageNumber"
        :page="page"
        :visible="i === currentIndex"
        :active="i === currentIndex"
        :scale="scale"
        :day-number="dateOrder.get(page.date)"
        :echarts="echarts"
        @block-change="onBlockChange"
      />
    </div>

    <!-- Toolbar bottom -->
    <div v-if="showToolbar && (toolbarPosition === 'bottom' || toolbarPosition === 'both')" :style="toolbarStyle">
      <button :style="prevBtnStyle(isFirst)" :disabled="isFirst" @click="goPrev">◀ 上一页</button>
      <span :style="navInfoStyle">{{ currentDate }} · 第 {{ currentPageNumber }} 页 / 共 {{ totalPages }} 页</span>
      <button :style="nextBtnStyle(isLast)" :disabled="isLast" @click="goNext">下一页 ▶</button>
    </div>
  </div>
</template>
