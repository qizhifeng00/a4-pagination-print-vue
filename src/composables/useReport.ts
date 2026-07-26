import { ref, computed, type ComputedRef, type Ref } from 'vue';
import type { Page, DateGroup, PaginatorConfig, DatePaginationMeta } from '@a4-pagination-print/core';
import { datePaginate, getPaginationMeta, PageNavigator } from '@a4-pagination-print/core';

// ============================================================
// useReport — Vue 3 Composable
// 数据 + 分页 + 导航 一站式管理
// ============================================================

export interface UseReportOptions extends PaginatorConfig {
  /** 初始日期分组 */
  groups?: DateGroup[];
}

export interface UseReportReturn {
  /** 分页后的 Page 列表 */
  pages: ComputedRef<Page[]>;
  /** 当前页数据 */
  currentPage: ComputedRef<Page | null>;
  /** 分页元数据 */
  meta: ComputedRef<DatePaginationMeta>;
  /** 当前全局页索引 */
  currentIndex: Ref<number>;
  /** 当前日期 */
  currentDate: ComputedRef<string>;
  /** 当天页码 */
  currentPageNumber: ComputedRef<number>;
  /** 总页数 */
  totalPages: ComputedRef<number>;
  /** 是否在第一页/最后一页 */
  isFirst: ComputedRef<boolean>;
  isLast: ComputedRef<boolean>;
  /** 更新数据 */
  setGroups: (groups: DateGroup[]) => void;
  /** 导航方法 */
  goNext: () => void;
  goPrev: () => void;
  goToDate: (date: string) => void;
  goToPage: (globalIndex: number) => void;
}

export function useReport(options: UseReportOptions = {}): UseReportReturn {
  const { groups: initialGroups = [], ...config } = options;

  const groups = ref<DateGroup[]>(initialGroups);
  const currentIndex = ref(0);

  // 分页
  const pages = computed(() => datePaginate(groups.value, config));

  // 导航
  const navigator = computed(() => new PageNavigator(pages.value));

  // 当前页
  const currentPage = computed(() => pages.value[currentIndex.value] ?? null);

  // 元数据
  const meta = computed(() => getPaginationMeta(pages.value));

  // 便捷属性
  const currentDate = computed(() => currentPage.value?.date ?? '');
  const currentPageNumber = computed(() => currentPage.value?.pageNumber ?? 0);
  const totalPages = computed(() => pages.value.length);
  const isFirst = computed(() => currentIndex.value === 0);
  const isLast = computed(() => currentIndex.value >= totalPages.value - 1);

  // 操作
  function setGroups(newGroups: DateGroup[]) {
    groups.value = newGroups;
    currentIndex.value = 0; // 重置到第一页
  }

  function goNext() {
    const nav = navigator.value;
    nav.goTo(currentIndex.value);
    const result = nav.next();
    if (result.success) currentIndex.value = result.globalIndex;
  }

  function goPrev() {
    const nav = navigator.value;
    nav.goTo(currentIndex.value);
    const result = nav.prev();
    if (result.success) currentIndex.value = result.globalIndex;
  }

  function goToDate(date: string) {
    const nav = navigator.value;
    const result = nav.goToDate(date);
    if (result.success) currentIndex.value = result.globalIndex;
  }

  function goToPage(globalIndex: number) {
    const nav = navigator.value;
    const result = nav.goTo(globalIndex);
    if (result.success) currentIndex.value = result.globalIndex;
  }

  return {
    pages,
    currentPage,
    meta,
    currentIndex,
    currentDate,
    currentPageNumber,
    totalPages,
    isFirst,
    isLast,
    setGroups,
    goNext,
    goPrev,
    goToDate,
    goToPage,
  };
}
