'use client';

import { useState, useCallback } from 'react';

interface IdResult {
  success: boolean;
  data?: {
    idcard: string;
    birth: string;
    sex: string;
    district: string;
  };
  checksumValid?: boolean;
  checksumExpected?: string;
  idcardLength?: number;
  verifyUrl?: string | null;
  error?: string;
}

const SEX_DISPLAY = (raw: string) => {
  const map: Record<string, string> = { '男': '男', '女': '女', 'M': '男', 'F': '女', '1': '男', '0': '女' };
  return map[raw] ?? raw;
};

const CHECK_SUM_MAP = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];
const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];

function calcChecksum(idcard: string): { valid: boolean; expected: string } {
  let sum = 0;
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idcard[i], 10) * WEIGHTS[i];
  }
  const expected = CHECK_SUM_MAP[sum % 11];
  return { valid: expected === idcard[17].toUpperCase(), expected };
}

export default function IdPage() {
  const [idcard, setIdcard] = useState('');
  const [name, setName] = useState('');
  const [result, setResult] = useState<IdResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleQuery = useCallback(async () => {
    const trimmed = idcard.trim().toUpperCase();
    if (!trimmed) {
      setError('请输入身份证号码');
      setResult(null);
      return;
    }
    if (!/^\d{15}(\d{2}[\dXx])?$/.test(trimmed)) {
      setError('身份证号码格式不正确，请输入15位或18位号码');
      setResult(null);
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const formBody = new URLSearchParams({ idcard: trimmed });
      const res = await fetch(`https://id.lanyul.com/back/idcard/simple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        signal: AbortSignal.timeout(10000),
      });

      if (!res.ok) {
        setError(`查询服务异常（${res.status}）`);
        setResult(null);
        return;
      }

      const data = await res.json();
      if (data.code !== 200 || !data.data) {
        setError(data.error || '查询失败，请稍后重试');
        setResult(null);
        return;
      }

      let checksumValid = true;
      let checksumExpected = '';
      if (trimmed.length === 18) {
        const { valid, expected } = calcChecksum(trimmed);
        checksumValid = valid;
        checksumExpected = expected;
      }

      setResult({
        success: true,
        data: data.data,
        checksumValid,
        checksumExpected,
        idcardLength: trimmed.length,
        verifyUrl: name.trim()
          ? `https://lanyul.com/idcard?name=${encodeURIComponent(name.trim())}&idcard=${encodeURIComponent(trimmed)}`
          : null,
      });
    } catch {
      setError('网络错误，请检查网络后重试');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [idcard, name]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleQuery();
  };

  const handleCopy = () => {
    if (!result?.data) return;
    const text = `身份证号：${result.data.idcard}\n归属地：${result.data.district}\n出生日期：${result.data.birth}\n性别：${SEX_DISPLAY(result.data.sex)}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const d = result?.data;
  const today = new Date();
  const age = d?.birth
    ? today.getFullYear() - parseInt(d.birth.substring(0, 4), 10) -
      (today.getMonth() + 1 < parseInt(d.birth.substring(5, 7), 10) ||
       (today.getMonth() + 1 === parseInt(d.birth.substring(5, 7), 10) && today.getDate() < parseInt(d.birth.substring(8, 10), 10))
       ? 1 : 0)
    : undefined;

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8 text-center">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          蓝玉科技数据源
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
          身份证号码查询
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          输入身份证号码，验证格式并解析归属地、出生日期、性别等信息
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              身份证号码 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={idcard}
              onChange={(e) => setIdcard(e.target.value.replace(/\s/g, '').toUpperCase())}
              onKeyDown={handleKeyDown}
              placeholder="请输入15位或18位身份证号码"
              maxLength={18}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-mono tracking-widest outline-none transition-colors placeholder:text-slate-300 focus:border-blue-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600 dark:text-slate-300">
              姓名 <span className="text-slate-400 font-normal">(用于核验链接，选填)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请输入姓名（如需要核验身份证与姓名一致性）"
              maxLength={20}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-300 focus:border-blue-400 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleQuery}
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                查询中…
              </span>
            ) : '查询'}
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {result?.success && d && (
          <div className="mt-6 space-y-4">
            <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${
              result.checksumValid
                ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-400'
                : result.checksumExpected
                ? 'border-red-200 bg-red-50 text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400'
                : 'border-blue-200 bg-blue-50 text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400'
            }`}>
              {result.checksumExpected
                ? result.checksumValid
                  ? '✓ 身份证号码格式校验通过'
                  : `✗ 校验码错误（应为 ${result.checksumExpected}）`
                : `✓ ${result.idcardLength === 15 ? '15位旧版' : '18位新版'}身份证号码格式有效`
              }
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '归属地', value: d.district },
                { label: '出生日期', value: d.birth },
                { label: '性别', value: SEX_DISPLAY(d.sex) },
                { label: '年龄', value: age !== undefined ? `${age} 岁` : '-' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="text-xs text-slate-400 dark:text-slate-500">{label}</div>
                  <div className="mt-1 text-base font-semibold text-slate-800 dark:text-slate-100">{value}</div>
                </div>
              ))}
            </div>

            {result.verifyUrl && (
              <a
                href={result.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                官方数据库核验（身份证+姓名一致性验证）
              </a>
            )}

            {!result.verifyUrl && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                输入姓名后可进行官方数据库一致性核验
              </p>
            )}

            <button
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              {copied ? (
                <>
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  已复制
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  复制结果
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <footer className="mt-8 space-y-2 text-center">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          数据来源：蓝玉科技 id.lanyul.com · 格式校验基于国标 GB 11643-1999 算法
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-600">
          如需核验身份证真实性及姓名一致性，请输入姓名后点击&#8220;官方数据库核验&#8221;跳转至蓝玉科技核验系统
        </p>
      </footer>
    </main>
  );
}
