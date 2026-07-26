// ============================================================
// @a4/vue — Vue 3 组件和 Composables
// ============================================================

// Components
export { default as A4Page } from './components/A4Page.vue';
export { default as A4Report } from './components/A4Report.vue';

// Block Components
export { default as TableBlock } from './components/blocks/TableBlock.vue';
export { default as ChartBlock } from './components/blocks/ChartBlock.vue';
export { default as InputBlock } from './components/blocks/InputBlock.vue';
export { default as TextBlock } from './components/blocks/TextBlock.vue';

// Composables
export { useReport } from './composables/useReport';
export type { UseReportOptions, UseReportReturn } from './composables/useReport';

export { usePageNavigation } from './composables/usePageNavigation';
export type { UsePageNavigationReturn } from './composables/usePageNavigation';

export { usePdfGenerator } from './composables/usePdfGenerator';
export type { UsePdfGeneratorReturn, PdfGenerateOptions } from './composables/usePdfGenerator';
