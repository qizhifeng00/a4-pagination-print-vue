<script setup lang="ts">
import type { ChartBlock as ChartBlockType } from '@a4-pagination-print/core';
import { DEFAULT_USABLE_WIDTH } from '@a4-pagination-print/core';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps<{
  block: ChartBlockType;
  scale?: number;
  echarts?: any;
}>();

const s = computed(() => props.scale ?? 3.78);
const containerRef = ref<HTMLDivElement>();
let chartInstance: any = null;

const echartsLib = computed(() => {
  if (props.echarts) return props.echarts;
  if (typeof window !== 'undefined') return (window as any).echarts;
  return null;
});

const chartHeight = computed(() =>
  (props.block.height > 0 ? props.block.height : 100) * s.value
);

const GAP = 2; // mm

const wrapperStyle = computed(() => ({
  marginBottom: `${GAP * s.value}px`,
  width: '100%',
}));

const chartWidth = computed(() => DEFAULT_USABLE_WIDTH * s.value);

const canvasStyle = computed(() => ({
  width: `${chartWidth.value}px`,
  height: `${chartHeight.value}px`,
}));

const placeholderStyle = computed(() => ({
  width: `${chartWidth.value}px`,
  height: `${chartHeight.value}px`,
  background: '#fafafa',
  border: '1px dashed #ddd',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#999',
  fontSize: `${3 * s.value}px`,
}));

function initChart() {
  if (!echartsLib.value || !containerRef.value) return;
  if (chartInstance) chartInstance.dispose();
  chartInstance = echartsLib.value.init(containerRef.value);
  chartInstance.setOption(props.block.option);
}

function handleResize() {
  chartInstance?.resize();
}

onMounted(async () => {
  await nextTick();
  // 确保容器已获得实际尺寸再初始化
  requestAnimationFrame(() => {
    initChart();
  });
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  chartInstance?.dispose();
  chartInstance = null;
});

watch(() => props.block.option, () => {
  if (chartInstance) {
    chartInstance.setOption(props.block.option);
  } else {
    initChart();
  }
});
</script>

<template>
  <div class="a4-block a4-block--chart" :style="wrapperStyle">
    <div v-if="echartsLib" ref="containerRef" :style="canvasStyle" />
    <div v-else :style="placeholderStyle">
      📊 图表: {{ (block.option as any)?.title?.text || block.id }}
    </div>
  </div>
</template>
