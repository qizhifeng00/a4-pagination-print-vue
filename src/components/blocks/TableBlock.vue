<script setup lang="ts">
import type { TableBlock as TableBlockType } from '@a4-pagination-print/core';
import { computed } from 'vue';

const props = defineProps<{
  block: TableBlockType;
  scale?: number;
}>();

const s = computed(() => props.scale ?? 3.78);

// 样式参数 — 与 PDF html-builder 完全一致，通过 scale 换算 px
const TABLE_FONT = 2.65; // mm → 10px
const TH_PAD_V = 1;       // mm
const TH_PAD_H = 2;       // mm
const TD_PAD_V = 0.8;     // mm
const TD_PAD_H = 2;       // mm
const GAP = 2;            // mm: block 间距

const wrapperStyle = computed(() => ({
  marginBottom: `${GAP * s.value}px`,
  width: '100%',
}));

const tableStyle = computed(() => ({
  width: '100%',
  borderCollapse: 'collapse' as const,
  border: '0.5px solid #ddd',
  borderBottom: 'none',
  fontSize: `${TABLE_FONT * s.value}px`,
  tableLayout: 'auto' as const,
}));

function thStyle(i: number) {
  const col = props.block.columns[i];
  const base: Record<string, any> = {
    padding: `${TH_PAD_V * s.value}px ${TH_PAD_H * s.value}px`,
    border: '0.5px solid #ddd',
    fontWeight: 600,
    textAlign: 'left' as const,
    background: '#f5f5f5',
  };
  if (col.width) {
    base.width = `${col.width * s.value}px`;
  }
  return base;
}

function rowStyle(ri: number) {
  return { background: ri % 2 === 0 ? '#fff' : '#fafafa' };
}

const tdStyle = computed(() => ({
  padding: `${TD_PAD_V * s.value}px ${TD_PAD_H * s.value}px`,
  border: '0.5px solid #eee',
}));

// ---- rowspan 渲染预处理 ----
const renderRows = computed(() => {
  const skips: Record<string, number> = {};

  return props.block.rows.map((row, ri) => {
    const rowspan = (row as any)._rowspan as Record<string, number> | undefined;
    const cells = props.block.columns.map((col) => {
      const key = col.key;
      if (skips[key] > 0) {
        skips[key]--;
        return { content: '', rowspan: 0 }; // 被合并，跳过
      }
      const span = rowspan?.[key] ?? 1;
      if (span > 1) {
        skips[key] = span - 1;
      }
      return { content: String(row[key] ?? ''), rowspan: span };
    });
    return { ri, cells };
  });
});
</script>

<template>
  <div class="a4-block a4-block--table" :style="wrapperStyle">
    <table :style="tableStyle">
      <thead>
        <tr>
          <th v-for="(col, i) in block.columns" :key="col.key" :style="thStyle(i)">
            {{ col.title }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in renderRows" :key="item.ri" :style="rowStyle(item.ri)">
          <template v-for="(cell, ci) in item.cells" :key="block.columns[ci].key">
            <td v-if="cell.rowspan > 0"
                :style="tdStyle"
                :rowspan="cell.rowspan > 1 ? cell.rowspan : undefined"
                :class="{ 'a4-cell--merged': cell.rowspan > 1 }">
              {{ cell.content }}
            </td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>
</template>
