'use client';

import { useState, useEffect, useCallback } from 'react';

interface IpData {
  ip?: string;
  query?: string;
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

interface IcpInfo {
  domain?: string;
  beian?: string;
  company?: string;
  nature?: string;
  service?: string;
  recordNo?: string;
  site?: string;
}

interface PortProbe {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'timeout';
  banner?: string;
}

const COMMON_PORTS = [
  { port: 21, service: 'FTP' },
  { port: 22, service: 'SSH' },
  { port: 25, service: 'SMTP' },
  { port: 53, service: 'DNS' },
  { port: 80, service: 'HTTP' },
  { port: 443, service: 'HTTPS' },
  { port: 3306, service: 'MySQL' },
  { port: 5432, service: 'PostgreSQL' },
  { port: 6379, service: 'Redis' },
  { port: 8080, service: 'HTTP-Alt' },
  { port: 8443, service: 'HTTPS-Alt' },
  { port: 9090, service: 'Prometheus' },
  { port: 11434, service: 'Ollama' },
  { port: 27017, service: 'MongoDB' },
];

export default function IpPage() {
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<IpData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myIp, setMyIp] = useState<IpData | null>(null);
  const [icpInfo, setIcpInfo] = useState<IcpInfo | null>(null);
  const [icpLoading, setIcpLoading] = useState(false);
  const [ports, setPorts] = useState<PortProbe[]>([]);
  const [probing, setProbing] = useState(false);
  const [probedCount, setProbedCount] = useState(0);
  const [showPorts, setShowPorts] = useState(false);

  useEffect(() => {
    fetchMyIp();
  }, []);

  const fetchMyIp = async () => {
    try {
      const res = await fetch('https://ip-api.com/json/?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,org,as');
      const data = await res.json();
      if (data.status === 'success') {
        setMyIp(data);
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
    setIcpInfo(null);
    setPorts([]);
    setProbedCount(0);

    try {
      const target = ip.trim();
      const res = await fetch(`https://ip-api.com/json/${target}?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,org,as`);
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data);
        // Auto probe ports for IP addresses
        if (isValidIp(target)) {
          probePorts(target);
        }
      } else {
        setError(data.message || '查询失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  const isValidIp = (str: string): boolean => {
    const parts = str.split('.');
    return parts.length === 4 && parts.every(p => /^[0-9]+$/.test(p) && parseInt(p) <= 255);
  };

  const probePorts = useCallback(async (target: string) => {
    setProbing(true);
    setProbedCount(0);
    setPorts([]);

    const results: PortProbe[] = [];
    
    for (const { port, service } of COMMON_PORTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2000);
        
        const url = `https://${target}:${port}`;
        const res = await fetch(url, { 
          method: 'HEAD', 
          signal: controller.signal,
          mode: 'no-cors'
        });
        clearTimeout(timeout);
        
        results.push({ port, service, status: 'open', banner: 'responded' });
      } catch {
        results.push({ port, service, status: 'closed' });
      }
      
      setProbedCount(prev => prev + 1);
    }

    setPorts(results.sort((a, b) => a.port - b.port));
    setProbing(false);
  }, []);

  const queryIcp = async () => {
    if (!result?.query) return;
    const domain = result.query.includes('.') && !isValidIp(result.query) 
      ? result.query 
      : null;
    
    if (!domain) {
      setError('请输入域名格式（如 baidu.com）');
      return;
    }

    setIcpLoading(true);
    try {
      const res = await fetch(`https://api.iowen.cn/icp/?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.code === 200 && data.data) {
        setIcpInfo({
          domain: data.data.domain,
          beian: data.data.icp || data.data.site || '未备案',
          company: data.data.company || '—',
          nature: data.data.nature || '—',
          recordNo: data.data.recordNo || data.data.site || '—',
        });
      } else {
        setIcpInfo({ domain, beian: '未查询到备案信息', company: '—', nature: '—', recordNo: '—' });
      }
    } catch {
      setIcpInfo({ domain, beian: '查询失败，请稍后重试', company: '—', nature: '—', recordNo: '—' });
    } finally {
      setIcpLoading(false);
    }
  };

  const getFlag = (code?: string) => {
    if (!code) return null;
    const upper = code.toUpperCase();
    const codePoints = upper.split('').map((c) => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const openPorts = ports.filter(p => p.status === 'open');
  const totalPorts = ports.length;

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
          查询 IP 地理位置、ISP、备案信息、端口探测
        </p>
      </header>

      <form onSubmit={handleQuery} className="mb-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="输入 IP 或域名，如 8.8.8.8 或 baidu.com"
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
          支持 IPv4 / IPv6 地址和域名查询 · 自动探测常用端口
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
              <span className="ml-2 font-mono font-medium text-emerald-700 dark:text-emerald-200">{myIp.query}</span>
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
        <>
          {/* Basic Info */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center gap-3">
              <span className="text-2xl font-semibold font-mono">{result.query}</span>
              {result.countryCode && (
                <span className="text-2xl">{getFlag(result.countryCode)}</span>
              )}
              <span className="text-sm text-slate-400 dark:text-slate-500">
                {result.isp && ` · ${result.isp}`}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <InfoItem label="国家/地区" value={`${result.country} ${getFlag(result.countryCode)}`} />
              <InfoItem label="省份" value={result.regionName} />
              <InfoItem label="城市" value={result.city} />
              <InfoItem label="邮编" value={result.zip} />
              <InfoItem label="ISP" value={result.isp} />
              <InfoItem label="组织" value={result.org} />
              <InfoItem label="ASN" value={result.as} />
              <InfoItem label="时区" value={result.timezone} />
            </div>

            {result.lat && result.lon && (
              <div className="mt-4 text-xs text-slate-400 dark:text-slate-500">
                📍 {result.lat.toFixed(4)}, {result.lon.toFixed(4)}
              </div>
            )}
          </div>

          {/* ICP Query */}
          {!isValidIp(result.query) && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">ICP 备案查询</h3>
                <button
                  onClick={queryIcp}
                  disabled={icpLoading}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 disabled:opacity-50"
                >
                  {icpLoading ? '查询中…' : '查询备案'}
                </button>
              </div>
              {icpInfo && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoItem label="域名" value={icpInfo.domain} />
                    <InfoItem label="备案主体" value={icpInfo.company} />
                    <InfoItem label="备案类型" value={icpInfo.nature} />
                    <InfoItem label="备案编号" value={icpInfo.recordNo} />
                  </div>
                  <div className="mt-3 rounded bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-800 dark:text-emerald-300">
                    <span className="font-medium">备案信息：</span>{icpInfo.beian}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Port Scan */}
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                端口探测
                {totalPorts > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    {openPorts.length}/{totalPorts} 开放
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPorts(!showPorts)}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {showPorts ? '收起' : '展开'}
                </button>
                {totalPorts > 0 && (
                  <button
                    onClick={() => probePorts(result.query!)}
                    disabled={probing}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-500 disabled:opacity-50"
                  >
                    {probing ? '扫描中…' : '重新扫描'}
                  </button>
                )}
              </div>
            </div>

            {probing && (
              <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                正在扫描 {COMMON_PORTS.length} 个常用端口… ({probedCount}/{COMMON_PORTS.length})
              </div>
            )}

            {showPorts && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase text-slate-500 dark:border-slate-700">
                      <th className="pb-2 pr-4">端口</th>
                      <th className="pb-2 pr-4">服务</th>
                      <th className="pb-2">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ports.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-8 text-center text-slate-400">
                          点击"扫描"开始探测端口
                        </td>
                      </tr>
                    ) : (
                      ports.map((p) => (
                        <tr key={p.port} className="border-b border-slate-100 dark:border-slate-800">
                          <td className="py-2 pr-4 font-mono text-slate-600 dark:text-slate-300">{p.port}</td>
                          <td className="py-2 pr-4 text-slate-600 dark:text-slate-300">{p.service}</td>
                          <td className="py-2">
                            <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${
                              p.status === 'open'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                            }`}>
                              {p.status === 'open' ? '● 开放' : '○ 关闭'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <footer className="mt-12 text-center text-xs text-slate-400 dark:text-slate-600">
        <p>IP 数据来源于 ip-api.com · 备案查询来源于 iowen.cn · 端口探测仅供学习参考</p>
      </footer>
    </main>
  );
}

function InfoItem({ label, value }: { label: string; value?: string }) {
  if (!value || value === '—' || value === '-') return null;
  return (
    <div>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
      <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">{value}</p>
    </div>
  );
}
