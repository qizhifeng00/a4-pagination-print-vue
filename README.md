# @a4-pagination-print/vue

A4 分页 — Vue 3 组件与 Composables，用于在浏览器中渲染和打印 A4 报表页。

```bash
npm install @a4-pagination-print/vue @a4-pagination-print/core
```

## 适用场景

- Vue 3 项目中需要**分页报表展示**
- 医疗报告、财务报表、数据日报等需要**精确 A4 打印**
- 浏览器端 PDF 导出

## 架构分层

本包提供三层 API，按需选用：

### Layer 2: 自由搭建页面

直接用 `A4Page` + Block 组件自建页面，适合高度自定义场景：

```vue
<script setup>
import { A4Page } from '@a4-pagination-print/vue';
import * as echarts from 'echarts';

const page = {
  date: '2026-07-24',
  pageNumber: 1,
  blocks: [
    { id: '1', type: 'text', height: 8, breakable: false, content: '患者信息' },
    { id: '2', type: 'table', height: 0, breakable: true, columns: [...], rows: [...] },
    { id: '3', type: 'chart', height: 100, breakable: false, option: {...} },
  ],
};
</script>

<template>
  <A4Page :page="page" :echarts="echarts" />
</template>
```

### A4Page Props

| Prop | 类型 | 默认 | 说明 |
|---|---|---|---|
| `page` | `Page` | required | 页面数据 |
| `scale` | `number` | `3.78` | mm→px 缩放 |
| `visible` | `boolean` | `true` | 是否显示 |
| `active` | `boolean` | `false` | 打印时的 active 标记 |
| `dayNumber` | `number` | — | 第几天（页脚显示"第X天"） |
| `showHeader` | `boolean` | `true` | 显示页眉 |
| `showFooter` | `boolean` | `true` | 显示页脚 |
| `echarts` | `any` | — | ECharts 引用 |

### 自定义 Block 类型

通过 slot 注入业务组件，库代码零修改：

```vue
<!-- 定义业务类型 -->
<script setup>
interface SignatureBlock extends Block {
  type: 'signature';
  label: string;
  signer?: string;
}
</script>

<!-- 注入到 A4Page -->
<A4Page :page="page">
  <template #block-signature="{ block, scale }">
    <SignatureCell :block="block" :scale="scale" />
  </template>
</A4Page>
```

### Layer 3: Composables

#### useReport — 报表状态管理

```typescript
import { useReport } from '@a4-pagination-print/vue';

const {
  pages,            // ComputedRef<Page[]>
  currentPage,      // ComputedRef<Page | null>
  currentIndex,     // Ref<number>
  totalPages,        // ComputedRef<number>
  isFirst,           // ComputedRef<boolean>
  isLast,            // ComputedRef<boolean>
  meta,              // ComputedRef<DatePaginationMeta>
  goNext,            // () => void
  goPrev,            // () => void
  goToDate,          // (date: string) => void
  goToPage,          // (index: number) => void
  setGroups,         // (groups: DateGroup[]) => void
} = useReport({ groups: [...], pageHeight: 280 });
```

#### usePdfGenerator — PDF 导出

```typescript
import { usePdfGenerator } from '@a4-pagination-print/vue';

const { generate, loading, error } = usePdfGenerator();

// 导出当前页
await generate([page], { filename: 'page1.pdf' });

// 导出日期范围
const filtered = pages.filter((p) => p.date >= '2026-07-24');
await generate(filtered, { filename: 'range.pdf' });

// 导出全部
await generate(pages, { title: '报表', filename: 'all.pdf' });

// autoDownload: false → 返回 Response
const res = await generate(pages, { autoDownload: false });
```

| Option | 默认 | 说明 |
|---|---|---|
| `baseUrl` | `http://localhost:3000` | PDF Service 地址 |
| `title` | — | 报表标题 |
| `filename` | `report-{timestamp}.pdf` | 下载文件名 |
| `perPage` | `false` | 逐页独立 PDF |
| `printBackground` | `true` | 打印背景 |
| `autoDownload` | `true` | `false` 返回 Response |

### Layer 4: A4Report — 开箱即用

```vue
<template>
  <A4Report
    :groups="groups"
    title="医疗报表"
    :echarts="echarts"
    @export-current-pdf="..."
    @export-all-pdf="..."
  />
</template>
```

| Prop | 类型 | 默认 |
|---|---|---|
| `groups` | `DateGroup[]` | required |
| `title` | `string` | — |
| `scale` | `number` | `3.78` |
| `echarts` | `any` | — |
| `showToolbar` | `boolean` | `true` |
| `toolbarPosition` | `'top' \| 'bottom' \| 'both'` | `'top'` |

## 依赖

- `@a4-pagination-print/core` — 分页引擎
- `vue` — ^3.4.0 (peer)
- `echarts` — ^5.0.0 或 ^6.0.0 (peer, 可选，仅图表需要)

## License

MIT
