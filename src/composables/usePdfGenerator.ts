import { ref, type Ref } from 'vue';
import type { Page } from '@a4-pagination-print/core';

// ============================================================
// usePdfGenerator — 调用 PDF Service 生成 PDF
//
// 用法：
//   const { generate, loading, error } = usePdfGenerator();
//   await generate(pages, { title: '我的报表' });
// ============================================================

export interface PdfGenerateOptions {
  /** PDF 服务地址，默认 http://localhost:3000 */
  baseUrl?: string;
  /** 报表标题 */
  title?: string;
  /** 是否逐页生成独立 PDF（默认 false，合并为单文件） */
  perPage?: boolean;
  /** 是否打印背景色（默认 true） */
  printBackground?: boolean;
  /** 下载文件名（不传则自动生成） */
  filename?: string;
  /** 是否自动下载（默认 true），false 则返回 Response */
  autoDownload?: boolean;
}

export interface UsePdfGeneratorReturn {
  /** 生成 PDF 并触发下载 */
  generate: (pages: Page[], options?: PdfGenerateOptions) => Promise<Response | void>;
  /** 是否正在生成 */
  loading: Ref<boolean>;
  /** 错误信息 */
  error: Ref<string | null>;
}

export function usePdfGenerator(): UsePdfGeneratorReturn {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function generate(
    pages: Page[],
    options: PdfGenerateOptions = {}
  ): Promise<Response | void> {
    const {
      baseUrl = 'http://localhost:3000',
      title,
      perPage = false,
      printBackground = true,
      filename,
      autoDownload = true,
    } = options;

    if (!pages || pages.length === 0) {
      error.value = 'pages 为空，无法生成 PDF';
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${baseUrl}/api/pdf/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages, title, perPage, printBackground }),
      });

      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        const message = (errBody as any).error || `HTTP ${response.status}`;
        throw new Error(message);
      }

      if (!autoDownload) {
        return response;
      }

      // 自动下载
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      error.value = err.message || 'PDF 生成失败';
      console.error('[usePdfGenerator] 生成失败:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return { generate, loading, error };
}
