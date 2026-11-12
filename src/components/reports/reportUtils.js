import { useEffect, useState } from 'react';

export const inputClass = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/25 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100';
export const buttonClass = 'rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800';
export const primaryButtonClass = 'rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50';

export const banglaNumber = (value) => String(value ?? '').replace(/\d/g, (digit) => '০১২৩৪৫৬৭৮৯'[Number(digit)]);

export const todayText = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

export const WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
export const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

const readStored = (key, fallback) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value && typeof value === 'object' ? { ...fallback, ...value } : fallback;
  } catch {
    return fallback;
  }
};

/** Paper size / orientation choice, remembered per report. */
export function usePageSetup(reportKey, fallback) {
  const storageKey = `report-page-setup:${reportKey}`;
  const [setup, setSetup] = useState(() => readStored(storageKey, fallback));
  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(setup)); } catch { /* storage unavailable */ }
  }, [storageKey, setup]);
  return [setup, setSetup];
}

const PAPER_MM = { A4: [210, 297], A5: [148, 210] };
const MARGIN_MM = 10;
const FONT_PX = { 'A4-portrait': 11, 'A4-landscape': 11, 'A5-portrait': 8.5, 'A5-landscape': 9.5 };

export const sheetCss = (paper, orientation) => {
  const [w, h] = PAPER_MM[paper];
  const width = orientation === 'landscape' ? h : w;
  return `
@page { size: ${paper} ${orientation}; margin: ${MARGIN_MM}mm; }
.rp-sheet { --rp-fs: ${FONT_PX[`${paper}-${orientation}`]}px; font-family: Kalpurush, 'Noto Sans Bengali', 'SolaimanLipi', 'Nirmala UI', sans-serif; font-size: var(--rp-fs); line-height: 1.35; color: #111; background: #fff; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.rp-screen .rp-sheet { width: ${width}mm; min-height: ${orientation === 'landscape' ? w : h}mm; padding: ${MARGIN_MM}mm; margin: 0 auto; box-shadow: 0 1px 3px rgba(0,0,0,.15), 0 8px 24px rgba(0,0,0,.08); }
.rp-sheet * { box-sizing: border-box; }
.rp-head { display: flex; align-items: center; justify-content: center; gap: 10px; text-align: center; margin-bottom: 6px; }
.rp-head img { height: 4.2em; width: auto; object-fit: contain; }
.rp-head .rp-inst { font-size: 1.6em; font-weight: 700; margin: 0; }
.rp-head .rp-addr { margin: 0; color: #444; }
.rp-title { text-align: center; margin: 4px 0 2px; font-size: 1.25em; font-weight: 700; text-decoration: underline; text-underline-offset: 3px; }
.rp-meta { text-align: center; margin: 0 0 6px; color: #333; }
.rp-summary { display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 16px; margin: 4px 0 8px; font-weight: 600; }
.rp-table { width: 100%; border-collapse: collapse; }
.rp-table th, .rp-table td { border: 1px solid #555; padding: .3em .45em; vertical-align: middle; }
.rp-table th { background: #e5e9f0; font-weight: 700; }
.rp-table thead { display: table-header-group; }
.rp-table tr { break-inside: avoid; page-break-inside: avoid; }
.rp-c { text-align: center; }
.rp-num { text-align: center; font-variant-numeric: tabular-nums; }
.rp-muted { color: #555; font-size: .9em; }
.rp-register { font-size: ${orientation === 'portrait' ? '.68em' : '.82em'}; }
.rp-register th, .rp-register td { padding: .2em .12em; text-align: center; }
.rp-register .rp-name { text-align: left; padding-left: .35em; min-width: 9em; }
.rp-off { background: #eef1f5; }
.rp-A { color: #b91c1c; font-weight: 700; }
.rp-L { color: #b45309; font-weight: 700; }
.rp-low { background: #fdecec; }
.rp-legend { margin-top: 6px; color: #333; }
.rp-sign { display: flex; justify-content: space-between; margin-top: 3.5em; break-inside: avoid; }
.rp-sign span { border-top: 1px solid #333; padding-top: 2px; min-width: 12em; text-align: center; }
.rp-foot { margin-top: 8px; font-size: .85em; color: #666; text-align: right; }
.rp-empty { text-align: center; padding: 2em; color: #666; }
`;
};

const fontFaceCss = () => {
  const rules = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) if (rule.type === CSSRule.FONT_FACE_RULE) rules.push(rule.cssText);
    } catch { /* cross-origin stylesheet */ }
  }
  return rules.join('\n');
};

/** Prints the sheet through a hidden iframe so only the report reaches the printer / PDF. */
export function printSheet(element, { paper, orientation, title }) {
  if (!element) return;
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  Object.assign(iframe.style, { position: 'fixed', right: '0', bottom: '0', width: '0', height: '0', border: '0' });
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument;
  doc.open();
  doc.write(`<!doctype html><html lang="bn"><head><meta charset="utf-8"><title>${title || 'Report'}</title><style>${fontFaceCss()}\nhtml,body{margin:0;background:#fff}${sheetCss(paper, orientation)}</style></head><body>${element.outerHTML}</body></html>`);
  doc.close();
  const images = [...doc.images].map((img) => (img.complete ? null : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })));
  const ready = Promise.all([doc.fonts?.ready, ...images].filter(Boolean));
  const timeout = new Promise((resolve) => setTimeout(resolve, 3000));
  Promise.race([ready, timeout]).then(() => {
    const cleanup = () => setTimeout(() => iframe.remove(), 500);
    iframe.contentWindow.addEventListener('afterprint', cleanup);
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    setTimeout(cleanup, 60_000);
  });
}

export const filterLabel = (filters) => [filters?.userType, filters?.className, filters?.sessionName].filter(Boolean).join(' · ');

