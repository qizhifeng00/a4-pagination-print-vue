<script setup lang="ts">
import { ref } from 'vue';
import * as echartsLib from 'echarts';
import { A4Report, usePdfGenerator } from '../src/index';
import type { DateGroup, Page, TextBlock, TableBlock, InputBlock, ChartBlock } from '@a4-pagination-print/core';

// ---- 类型辅助：构建 Block 对象 ----
function textBlock(id: string, content: string, height = 8, breakable = false): TextBlock {
  return { id, type: 'text', height, breakable, content };
}
function inputBlock(id: string, label: string, height = 35, breakable = false): InputBlock {
  return { id, type: 'input', height, breakable, label, value: '', placeholder: `请输入${label}...` };
}
function tableBlock(id: string, columns: TableBlock['columns'], rows: TableBlock['rows'], breakable = true): TableBlock {
  return { id, type: 'table', height: 0, breakable, columns, rows };
}
function chartBlock(id: string, option: Record<string, unknown>, height = 100, breakable = false): ChartBlock {
  return { id, type: 'chart', height, breakable, option };
}

// ---- 图表数据 ----
function buildVitalsChartOption() {
  const hours = Array.from({ length: 48 }, (_, i) => {
    const h = 8 + Math.floor(i / 4);
    const m = (i % 4) * 15;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });
  const systolic = Array.from({ length: 48 }, () => 118 + Math.floor(Math.random() * 22));
  const diastolic = Array.from({ length: 48 }, () => 68 + Math.floor(Math.random() * 18));
  const heartRate = Array.from({ length: 48 }, () => 65 + Math.floor(Math.random() * 28));
  const temperature = Array.from({ length: 48 }, () => parseFloat((36.0 + Math.random() * 1.5).toFixed(1)));

  return {
    title: { text: '生命体征趋势', left: 'center', textStyle: { fontSize: 12 } },
    tooltip: { trigger: 'axis' },
    legend: { bottom: 0, data: ['收缩压', '舒张压', '心率', '体温'], textStyle: { fontSize: 9 } },
    grid: { left: 10, right: 15, top: 30, bottom: 30 },
    xAxis: { type: 'category', data: hours, axisLabel: { interval: 3, fontSize: 7, rotate: 45 } },
    yAxis: [
      { type: 'value', name: 'mmHg / bpm', min: 40, max: 160, axisLabel: { fontSize: 7 } },
      { type: 'value', name: '°C', min: 35, max: 39, axisLabel: { fontSize: 7 } },
    ],
    series: [
      { name: '收缩压', type: 'line', data: systolic, smooth: true, symbol: 'none', lineStyle: { width: 1.5 } },
      { name: '舒张压', type: 'line', data: diastolic, smooth: true, symbol: 'none', lineStyle: { width: 1.5 } },
      { name: '心率', type: 'line', data: heartRate, smooth: true, symbol: 'none', lineStyle: { width: 1.5 } },
      { name: '体温', type: 'line', yAxisIndex: 1, data: temperature, smooth: true, symbol: 'none', lineStyle: { width: 1.5 } },
    ],
  };
}

// ---- Demo 数据 ----
function buildLabResults() {
  const items: [string, string, string, string, string][] = [
    ['白细胞计数', '6.8', '×10⁹/L', '3.5-9.5', ''],
    ['红细胞计数', '4.5', '×10¹²/L', '4.3-5.8', ''],
    ['血红蛋白', '135', 'g/L', '130-175', ''],
    ['血小板计数', '210', '×10⁹/L', '125-350', ''],
    ['空腹血糖', '6.9', 'mmol/L', '3.9-6.1', '↑'],
    ['餐后2h血糖', '9.8', 'mmol/L', '<7.8', '↑'],
    ['糖化血红蛋白', '6.5', '%', '4.0-6.0', '↑'],
    ['总胆固醇', '5.2', 'mmol/L', '2.8-5.2', ''],
    ['甘油三酯', '2.1', 'mmol/L', '0.56-1.7', '↑'],
    ['HDL-C', '1.15', 'mmol/L', '1.16-1.42', '↓'],
    ['LDL-C', '3.4', 'mmol/L', '<3.4', ''],
    ['谷丙转氨酶', '28', 'U/L', '9-50', ''],
    ['谷草转氨酶', '22', 'U/L', '15-40', ''],
    ['总胆红素', '15', 'μmol/L', '5-21', ''],
    ['肌酐', '78', 'μmol/L', '59-104', ''],
    ['尿素氮', '5.3', 'mmol/L', '2.9-8.2', ''],
    ['尿酸', '356', 'μmol/L', '208-428', ''],
    ['钾', '4.1', 'mmol/L', '3.5-5.3', ''],
    ['钠', '140', 'mmol/L', '137-147', ''],
    ['C反应蛋白', '8.5', 'mg/L', '<5', '↑'],
    ['D-二聚体', '0.32', 'mg/L', '<0.5', ''],
    ['肌钙蛋白I', '0.012', 'ng/mL', '<0.04', ''],
    ['BNP', '85', 'pg/mL', '<100', ''],
    ['TSH', '2.3', 'mIU/L', '0.35-4.94', ''],
  ];
  return items.map(([test, result, unit, range, flag]) => ({ test, result, unit, range, flag }));
}

// 带长文本的护理记录 — 含行合并（时间按小时合并4行）
function buildNursingRecordsWithNotes() {
  const longNote = '患者意识清楚，自主体位。心电图示窦性心律，心率72次/分，律齐，各导联ST-T未见明显改变。' +
    '双肺呼吸音清，未闻及干湿啰音。腹部平软，无压痛及反跳痛。双下肢无水肿。' +
    '今日已给予阿司匹林100mg qd、阿托伐他汀20mg qn口服，嘱患者低盐低脂饮食，注意休息。' +
    '明日计划复查血常规、肝肾功能、电解质，继续目前治疗方案。';
  return Array.from({ length: 48 }, (_, i) => {
    const hour = 8 + Math.floor(i / 4);
    const min = (i % 4) * 15;
    const isFirstInHour = i % 4 === 0;
    const hasNote = i % 3 === 0;
    const row: any = {
      time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
      bp: `${118 + Math.floor(Math.random() * 22)}/${68 + Math.floor(Math.random() * 18)}`,
      hr: `${65 + Math.floor(Math.random() * 28)}`,
      temp: (36.0 + Math.random() * 1.5).toFixed(1),
      spo2: `${95 + Math.floor(Math.random() * 5)}`,
      note: hasNote ? ('【护理记录】' + longNote) : '生命体征平稳。',
    };
    // 每小时的第1条合并后面3条的时间单元格
    if (isFirstInHour) {
      row._rowspan = { time: 4 };
    }
    return row;
  });
}

// 医嘱数据 — 长文本
function buildDoctorOrders() {
  return [
    { time: '08:00', order: '阿司匹林肠溶片 100mg po qd', doctor: '王主任', note: '早餐后服用' },
    { time: '08:00', order: '阿托伐他汀钙片 20mg po qn', doctor: '王主任', note: '睡前服用，注意肝功能监测' },
    { time: '09:00', order: '0.9%氯化钠注射液 250ml + 头孢呋辛 1.5g ivgtt bid', doctor: '李主治', note: '皮试阴性，滴速40滴/分' },
    { time: '09:30', order: '呋塞米注射液 20mg iv st', doctor: '李主治', note: '利尿减轻心脏负荷，注意监测尿量及电解质' },
    { time: '10:00', order: '氯化钾缓释片 1.0g po tid', doctor: '王主任', note: '补钾，注意监测血钾水平，目标4.0-5.0mmol/L' },
    { time: '12:00', order: '酒石酸美托洛尔片 25mg po bid', doctor: '李主治', note: '控制心率，目标静息心率60-70次/分' },
    { time: '14:00', order: '心电监护 q1h 记录', doctor: '值班医生', note: '持续监测心率、血压、血氧饱和度，如有异常及时报告' },
    { time: '16:00', order: '低分子肝素钙注射液 5000IU ih qd', doctor: '王主任', note: '预防深静脉血栓，注意注射部位有无瘀斑' },
    { time: '18:00', order: '记录24小时出入量', doctor: '值班医生', note: '每日总结出入量平衡情况，如正平衡超过500ml需报告' },
    { time: '20:00', order: '硝苯地平控释片 30mg po qd', doctor: '李主治', note: '控制血压，如SBP>160或<100mmHg需调整' },
    { time: '06:00', order: '空腹血糖监测 qd', doctor: '内分泌科会诊', note: '如空腹血糖持续>7.0mmol/L，需考虑调整降糖方案' },
    { time: '06:30', order: '留取晨尿常规及24h尿蛋白定量', doctor: '李主治', note: '评估肾脏功能，注意留取方法是否正确' },
  ];
}

// 查房记录 — 多个长文本块混合
const dutyNotes = [
  '患者神志清楚，精神可，自主体位。饮食、睡眠尚可，二便正常。查体：T36.5℃ P72次/分 R18次/分 BP128/76mmHg。双肺呼吸音清，未闻及干湿啰音。心率72次/分，律齐，各瓣膜听诊区未闻及病理性杂音。腹平软，无压痛、反跳痛及肌紧张。双下肢无水肿。',
  '今日调整用药方案：停用呋塞米，加用螺内酯20mg qd口服。原因：患者近3天尿量正常，下肢水肿已消退，但血钾偏低（3.6mmol/L）。螺内酯为保钾利尿剂，可同时维持电解质平衡。嘱继续低盐低脂饮食，每日限盐<3g。',
  '心内科大查房意见：患者冠心病诊断明确，目前药物治疗效果可。建议：1）继续目前抗血小板、调脂、控制心率方案；2）完善心脏彩超+颈动脉彩超评估；3）如病情稳定，考虑3-5天后行冠状动脉CTA检查，评估是否需要介入治疗。已向患者及家属告知病情及后续诊疗计划，表示理解并配合治疗。',
];

const groups = ref<DateGroup[]>([
  {
    date: '2026-07-24',
    blocks: [
      textBlock('title-1', '━━━ 每日查房记录 ━━━', 10),
      textBlock('info-1', '患者：张三 | 性别：男 | 年龄：58岁 | 科室：心内科 | 床号：12\n入院日期：2026-07-20 | 住院号：ZY20260720003', 18),
      textBlock('section-vs', '【生命体征监测（含护理备注）48条记录，跨多页】', 8),
      tableBlock('table-vitals',
        [
          { key: 'time', title: '时间' }, { key: 'bp', title: '血压(mmHg)' },
          { key: 'hr', title: '心率(bpm)' }, { key: 'temp', title: '体温(°C)' },
          { key: 'spo2', title: '血氧(%)' }, { key: 'note', title: '护理备注' },
        ],
        buildNursingRecordsWithNotes(),
      ),
      chartBlock('chart-vitals', buildVitalsChartOption(), 100),
      textBlock('note-1', dutyNotes[0], 0),
      inputBlock('input-1', '医生评估意见', 35),
    ],
  },
  {
    date: '2026-07-25',
    blocks: [
      textBlock('title-2', '━━━ 实验室检验报告 ━━━', 10),
      textBlock('info-2', '患者：张三 | 性别：男 | 年龄：58岁 | 科室：心内科\n采样时间：2026-07-25 06:30 | 报告时间：2026-07-25 10:15 | 检验师：李明', 18),
      textBlock('section-lab', '【生化全套 + 心肌标志物】', 8),
      tableBlock('table-labs',
        [
          { key: 'test', title: '检验项目' }, { key: 'result', title: '结果' },
          { key: 'unit', title: '单位' }, { key: 'range', title: '参考范围' }, { key: 'flag', title: '标志' },
        ],
        buildLabResults(),
      ),
      textBlock('note-lab', '【检验科意见】\n1. 空腹血糖及餐后血糖偏高，建议内分泌科会诊。\n2. 血脂异常（甘油三酯↑），建议低脂饮食。\n3. C反应蛋白轻度升高，结合临床判断。\n4. 其余项目未见明显异常。', 0),
      textBlock('note-dose', dutyNotes[1], 0),
      inputBlock('input-2', '主治医师查房记录', 35),
    ],
  },
  {
    date: '2026-07-26',
    blocks: [
      textBlock('title-3', '━━━ 医嘱单 + 大查房 ━━━', 10),
      textBlock('info-3', '患者：张三 | 性别：男 | 年龄：58岁 | 科室：心内科 | 床号：12\n查房日期：2026-07-26 | 查房医师：王主任、李主治', 15),
      textBlock('section-order', '【长期医嘱】', 8),
      tableBlock('table-orders',
        [
          { key: 'time', title: '时间' }, { key: 'order', title: '医嘱内容', width: 60 },
          { key: 'doctor', title: '开嘱医师' }, { key: 'note', title: '备注说明' },
        ],
        buildDoctorOrders(),
      ),
      textBlock('note-chief', dutyNotes[2], 0),
      inputBlock('input-3', '大查房意见及诊疗计划', 35),
    ],
  },
]);

const { generate, loading, error } = usePdfGenerator();

// ---- 打印辅助 ----
function injectStyle(id: string, css: string) {
  removeStyle(id);
  const s = document.createElement('style');
  s.id = id;
  s.textContent = css;
  document.head.appendChild(s);
}
function removeStyle(id: string) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function handlePrintCurrent() {
  removeStyle('ps-all');
  setTimeout(() => window.print(), 100);
}

async function handlePrintAll() {
  const { generatePrintAllCSS } = await import('@a4-pagination-print/core');
  const css = `@media print{#app .a4-page{display:block!important;page-break-after:always!important}#app .a4-page:last-child{page-break-after:auto!important}${generatePrintAllCSS()}}`;
  injectStyle('ps-all', css);
  setTimeout(() => {
    window.print();
    setTimeout(() => removeStyle('ps-all'), 500);
  }, 100);
}

async function handleExportCurrentPdf(page: Page) {
  await generate([page], {
    title: '医疗报表',
    filename: `医疗报表-${page.date}-第${page.pageNumber}页.pdf`,
  });
}

async function handleExportDateRangePdf(pages: Page[], startDate: string, endDate: string) {
  const filtered = pages.filter((p) => p.date >= startDate && p.date <= endDate);
  if (filtered.length === 0) {
    alert(`日期 ${startDate} ~ ${endDate} 范围内没有页面`);
    return;
  }
  await generate(filtered, {
    title: '医疗报表',
    filename: `医疗报表-${startDate}至${endDate}.pdf`,
  });
}

async function handleExportAllPdf(pages: Page[]) {
  await generate(pages, {
    title: '医疗报表',
    filename: `医疗报表-全部-${new Date().toISOString().slice(0, 10)}.pdf`,
  });
}
</script>

<template>
  <div class="app-root" style="background:#e8ecf1;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,sans-serif;">
    <div class="app-header" style="background:#1a1a2e;color:#fff;padding:14px 24px;display:flex;align-items:center;justify-content:space-between;">
      <h1 style="font-size:18px;font-weight:600;margin:0;">📄 A4 Pagination Engine — Vue 3</h1>
      <span style="font-size:11px;background:#e94560;padding:3px 8px;border-radius:4px;">v0.1.0</span>
    </div>

    <A4Report
      :groups="groups"
      title="医疗报表 Demo（Vue 3）"
      :scale="3.78"
      :echarts="echartsLib"
      @print-current-page="handlePrintCurrent"
      @print-all-pages="handlePrintAll"
      @export-current-pdf="handleExportCurrentPdf"
      @export-date-range-pdf="handleExportDateRangePdf"
      @export-all-pdf="handleExportAllPdf"
    />

    <!-- 生成状态提示 -->
    <div v-if="loading" style="position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#1890ff;color:#fff;padding:10px 24px;border-radius:8px;z-index:100;font-size:14px;box-shadow:0 4px 12px rgba(24,144,255,0.4);">
      ⏳ PDF 生成中，请稍候...
    </div>
    <div v-else-if="error" style="position:fixed;top:12px;left:50%;transform:translateX(-50%);background:#e94560;color:#fff;padding:10px 24px;border-radius:8px;z-index:100;font-size:14px;box-shadow:0 4px 12px rgba(233,69,96,0.4);">
      ❌ {{ error }}
    </div>

    <div class="app-footer" style="text-align:center;padding:16px;color:#999;font-size:12px;">
      Vue 3 版本 · 组件：A4Report / A4Page / TableBlock / ChartBlock / InputBlock / TextBlock
    </div>
  </div>
</template>
