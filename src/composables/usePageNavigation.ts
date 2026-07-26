import { ref, computed, watch, type ComputedRef, type Ref } from 'vue';
import type { Page } from '@a4-pagination-print/core';
import { PageNavigator } from '@a4-pagination-print/core';

// ============================================================
// usePageNavigation — Vue 3 Composable
// ============================================================

export interface UsePageNavigationReturn {
  /** 当前全局页索引 */
  currentIndex: Ref<number>;
  /** 当前日期 */
  currentDate: ComputedRef<string>;
  /** 当天页码 */
  currentPageNumber: ComputedRef<number>;
  /** 总页数 */
  totalPages: ComputedRef<number>;
  /** 是否在第一页 */
  isFirst: ComputedRef<boolean>;
  /** 是否在最后一页 */
  isLast: ComputedRef<boolean>;
  /** 导航方法 */
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  goToDate: (date: string) => void;
}

/**
 * 页面导航 Composable
 *
 * @param pages - 分页后的 Page 数组（可以是 ref 或普通数组）
 */
export function usePageNavigation(
  pages: Page[] | Ref<Page[]>
): UsePageNavigationReturn {
  const pagesRef = ref<Page[]>(Array.isArray(pages) ? pages : pages.value ?? []);

  // 如果传入的是 ref，保持同步
  if (!Array.isArray(pages)) {
    watch(pages, (val) => {
      pagesRef.value = val ?? [];
    }, { immediate: true });
  }

  const navigator = computed(() => new PageNavigator(pagesRef.value));

  const currentIndex = ref(0);
  const currentDate = computed(() => navigator.value.getCurrentState().date);
  const currentPageNumber = computed(() => navigator.value.getCurrentState().pageNumber);
  const totalPages = computed(() => navigator.value.totalPages);
  const isFirst = computed(() => currentIndex.value === 0);
  const isLast = computed(() => currentIndex.value >= totalPages.value - 1);

  function goNext() {
    const nav = navigator.value;
    // 先同步到当前状态
    nav.goTo(currentIndex.value);
    const result = nav.next();
    if (result.success) {
      currentIndex.value = result.globalIndex;
    }
  }

  function goPrev() {
    const nav = navigator.value;
    nav.goTo(currentIndex.value);
    const result = nav.prev();
    if (result.success) {
      currentIndex.value = result.globalIndex;
    }
  }

  function goTo(index: number) {
    const nav = navigator.value;
    const result = nav.goTo(index);
    if (result.success) {
      currentIndex.value = result.globalIndex;
    }
  }

  function goToDate(date: string) {
    const nav = navigator.value;
    const result = nav.goToDate(date);
    if (result.success) {
      currentIndex.value = result.globalIndex;
    }
  }

  return {
    currentIndex,
    currentDate,
    currentPageNumber,
    totalPages,
    isFirst,
    isLast,
    goNext,
    goPrev,
    goTo,
    goToDate,
  };
}
