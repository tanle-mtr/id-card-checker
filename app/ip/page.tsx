'use client';

import { useState, useEffect } from 'react';

interface IpData {
  ip?: string;
  country?: string;
  countryCode?: string;
  regionName?: string;
  region?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
}

export default function IpPage() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myIp, setMyIp] = useState<IpData | null>(null);

  useEffect(() => {
    fetchMyIp();
  }, []);

  const fetchMyIp = async () => {
    try {
      const res = await fetch('/api/ip');
      const data = await res.json();
      if (data.data) {
        setMyIp(data.data);
      }
    } catch {
      // ignore
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ip.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/ip?ip=${encodeURIComponent(ip.trim())}`);
      const data = await res.json();
      if (data.data) {
        setResult(data.data);
      } else {
        setError(data.error || '查询失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const getFlag = (code?: string) => {
    if (!code) return null;
    const upper = code.toUpperCase();
    const codePoints = upper
      .split('')
      .map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <span className="inline-block rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
          IP 查询
        </span>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          IP 地址查询工具
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          查询 IP 地址的地理位置、ISP、组织等详细信息
        </p>
      </header>

      <form onSubmit={handleQuery} className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="输入 IP 地址，如 8.8.8.8 或 baidu.com"
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-lg text-slate-900 outline-none transition-colors focus:border-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-8 py-3 font-medium text-white transition-colors hover:bg-blue-500 disabled:opacity-50"
          >
            {loading ? '查询中…' : '查询'}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          支持 IPv4 和域名查询
        </p>
      </form>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </div>
      )}

      {myIp && !result && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
          <h2 className="mb-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            您的 IP 地址信息
          </h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-emerald-600/70 dark:text-emerald-400/70">IP:</span>
              <span className="ml-2 font-mono font-medium text-emerald-700 dark:text-emerald-200">{myIp.ip}</span>
            </div>
            <div>
              <span className="text-emerald-600/70 dark:text-emerald-400/70">国家:</span>
              <span className="ml-2 text-emerald-700 dark:text-emerald-200">{myIp.country} {getFlag(myIp.countryCode)}</span>
            </div>
            <div>
              <span className="text-emerald-600/70 dark:text-emerald-400/70">城市:</span>
              <span className="ml-2 text-emerald-700 dark:text-emerald-200">{myIp.city}</span>
            </div>
            <div>
              <span className="text-emerald-600/70 dark:text-emerald-400/70">ISP:</span>
              <span className="ml-2 text-emerald-700 dark:text-emerald-200">{myIp.isp}</span>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-4 flex items-center gap-3">
            <span className="text-2xl font-semibold">{result.ip}</span>
            {result.countryCode && (
              <span className="text-2xl">{getFlag(result.countryCode)}</span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard label="国家/地区" value={`${result.country} ${getFlag(result.countryCode)}`} />
            <InfoCard label="省份/地区" value={result.regionName} />
            <InfoCard label="城市" value={result.city} />
            <InfoCard label="邮编" value={result.zip} />
            <InfoCard label="经纬度" value={result.lat && result.lon ? `${result.lat.toFixed(4)}, ${result.lon.toFixed(4)}` : undefined} />
            <InfoCard label="时区" value={result.timezone} />
            <InfoCard label="ISP" value={result.isp} />
            <InfoCard label="组织" value={result.org} />
            <InfoCard label="ASN" value={result.as} />
          </div>

          {result.lat && result.lon && (
            <div className="mt-4 rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <span className="text-xs text-slate-500 dark:text-slate-400">地理位置</span>
              <div className="mt-2 h-40 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm text-slate-400">
                纬度: {result.lat.toFixed(4)} | 经度: {result.lon.toFixed(4)}
              </div>
            </div>
          )}
        </div>
      )}

      <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>IP 数据来源于 ip-api.com，仅供学习参考</p>
      </footer>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
