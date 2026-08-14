# ============================================
#  IP Proxy Changer - 代理IP选择器
# ============================================

# 强制启用 TLS 1.2+（解决 PowerShell 5.1 的 HTTPS 兼容问题）
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12 -bor [System.Net.SecurityProtocolType]::Tls13

$ErrorActionPreference = 'Continue'
$TempDir = Join-Path $env:TEMP 'ipchanger'
if (-not (Test-Path $TempDir)) { New-Item -ItemType Directory -Path $TempDir -Force | Out-Null }
$ProxyFile   = Join-Path $TempDir 'proxies.txt'
$SortedFile  = Join-Path $TempDir 'sorted.txt'
$ResultFile  = Join-Path $TempDir 'result.txt'
$OrigFile    = Join-Path $TempDir 'original.txt'
$FilteredFile = Join-Path $TempDir 'filtered.txt'

function Save-Original {
    $ps = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    @($ps.ProxyEnable, $ps.ProxyServer, $ps.ProxyOverride) | Set-Content -Path $OrigFile -Encoding UTF8
}

function Show-Menu {
    Clear-Host
    Write-Host "============================================"
    Write-Host "        IP Proxy Changer - 代理IP选择器"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "  [1] 获取所有可用代理并测试延迟"
    Write-Host "  [2] 按地区筛选代理"
    Write-Host "  [3] 查看当前代理设置"
    Write-Host "  [4] 清除代理设置"
    Write-Host "  [5] 恢复原始代理设置"
    Write-Host "  [6] 刷新代理列表（跳过延迟测试）"
    Write-Host "  [0] 退出"
    Write-Host ""
    Write-Host "============================================"
}

function Get-AllProxies {
    Write-Host ""
    Write-Host "正在获取全球代理列表..."
    $countries = @('US','JP','HK','TW','SG','KR','DE','GB','FR','CN','IN','BR','AU','CA','RU')
    $allProxies = @{}
    $apiBase = 'https://proxy.scdn.io/api/get_proxy.php'
    $failed = 0
    foreach ($c in $countries) {
        Write-Host "  获取 $c 地区..."
        try {
            $url = "$apiBase?protocol=all&count=20&country_code=$c"
            $resp = Invoke-RestMethod -Uri $url -TimeoutSec 15 -UserAgent 'Mozilla/5.0'
            if ($resp.code -eq 200) {
                foreach ($p in $resp.data.proxies) {
                    if (-not $allProxies.ContainsKey($p)) { $allProxies[$p] = $c }
                }
                Write-Host "    获取到 $($resp.data.proxies.Count) 个"
            } else {
                Write-Host "    API错误: $($resp.message)"
                $failed++
            }
        } catch {
            Write-Host "    请求失败: $($_.Exception.Message)"
            $failed++
        }
    }
    Write-Host ""
    $allProxies.GetEnumerator() | ForEach-Object { "$($_.Key)|$($_.Value)" } | Set-Content -Path $ProxyFile -Encoding UTF8
    if (-not (Test-Path $ProxyFile) -or $allProxies.Count -eq 0) {
        Write-Host "获取代理列表失败！（$failed 个地区请求失败）"
        Read-Host "按回车键继续"
        return $false
    }
    $total = $allProxies.Count
    Write-Host "共获取 $total 个唯一代理，开始测速..."
    $lines = Get-Content $ProxyFile
    $count = $lines.Count
    for ($i = 0; $i -lt $count; $i++) {
        $line = $lines[$i]
        $proxy = $line.Split('|')[0]
        $ip = $proxy.Split(':')[0]
        $port = $proxy.Split(':')[1]
        try {
            $sw = [System.Diagnostics.Stopwatch]::StartNew()
            $tcp = New-Object System.Net.Sockets.TcpClient
            $connect = $tcp.BeginConnect($ip, [int]$port, $null, $null)
            $wait = $connect.AsyncWaitHandle.WaitOne(3000, $false)
            if ($wait -and $tcp.Connected) {
                $sw.Stop()
                "$proxy|$($sw.ElapsedMilliseconds)|$($line.Split('|')[1])"
            }
            $tcp.Close()
        } catch {
            # 连接失败，不计入结果
        }
        if (($i + 1) % 10 -eq 0) { Write-Host "  测速进度: $($i+1)/$count" }
    }
    Write-Host "测速完成！正在排序..."
    $sorted = Get-Content $SortedFile -ErrorAction SilentlyContinue
    if ($sorted) {
        $sorted | Where-Object { $_ -match '^\S+\|\d+\|' } | Sort-Object { ($_ -split '\|')[1] -as [int] } | Set-Content -Path $SortedFile -Encoding UTF8
        Write-Host "排序完成！"
    }
    Read-Host "按回车键继续"
    return $true
}

function Filter-ByRegion {
    if (-not (Test-Path $SortedFile)) {
        Write-Host "请先获取代理列表！"
        Read-Host "按回车键继续"
        return
    }
    Clear-Host
    Write-Host "============================================"
    Write-Host "              选择地区筛选"
    Write-Host "============================================"
    Write-Host ""
    Write-Host "  [US] 美国   [JP] 日本   [HK] 香港"
    Write-Host "  [TW] 台湾   [SG] 新加坡 [KR] 韩国"
    Write-Host "  [DE] 德国   [GB] 英国   [FR] 法国"
    Write-Host "  [CN] 中国   [IN] 印度   [BR] 巴西"
    Write-Host "  [AU] 澳洲   [CA] 加拿大 [RU] 俄罗斯"
    Write-Host "  [ALL] 全部地区"
    Write-Host "  [B] 返回主菜单"
    Write-Host ""
    $region = Read-Host "请输入地区代码"
    if ($region -eq 'B' -or $region -eq 'b') { return }
    if (-not $region) { return }
    $region = $region.ToUpper()
    $allLines = Get-Content $SortedFile
    $filtered = @()
    foreach ($line in $allLines) {
        $parts = $line.Split('|')
        if ($parts.Count -ge 3 -and $parts[2].ToUpper() -eq $region) {
            $filtered += $line
        }
    }
    if ($filtered.Count -eq 0) {
        Write-Host ""
        Write-Host "该地区暂无可用代理！"
        Read-Host "按回车键继续"
        return
    }
    Write-Host ""
    Write-Host "--- $region 地区代理（按延迟排序）---"
    Write-Host ""
    Write-Host "共 $($filtered.Count) 个代理，显示前30个："
    Write-Host ""
    for ($i = 0; $i -lt [Math]::Min($filtered.Count, 30); $i++) {
        $p = $filtered[$i].Split('|')
        Write-Host ("  [{0,2}] {1,25}  延迟: {2,6}ms" -f ($i+1), $p[0].Trim(), $p[1].Trim())
    }
    if ($filtered.Count -gt 30) {
        Write-Host ("  ... 共 {0} 个，显示前30个" -f $filtered.Count)
    }
    Write-Host ""
    Write-Host "============================================"
    $select = Read-Host "输入编号选择代理，或按 B 返回"
    if ($select -eq 'B' -or $select -eq 'b') { return }
    if (-not $select) { return }
    $idx = [int]$select - 1
    if ($idx -ge 0 -and $idx -lt $filtered.Count) {
        $selectedProxy = $filtered[$idx].Split('|')[0].Trim()
        Write-Host ""
        Write-Host "============================================"
        Write-Host "        正在设置代理: $selectedProxy"
        Write-Host "============================================"
        Save-Original
        $selIp = $selectedProxy.Split(':')[0]
        $selPort = $selectedProxy.Split(':')[1]
        try {
            Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyEnable' -Value 1
            Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyServer' -Value "$selIp`:$selPort"
            Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyOverride' -Value '<local>'
            Write-Host ""
            Write-Host "[成功] 代理已设置: $selectedProxy"
            Write-Host ""
            Write-Host "提示: 此设置对 IE/Edge/Chrome 等使用系统代理的程序生效"
            Write-Host "      部分应用可能需要重启才能生效"
            Write-Host "      使用 [5] 可恢复原始设置"
        } catch {
            Write-Host ""
            Write-Host "[失败] 设置代理时出错，请尝试以管理员身份运行！"
        }
    } else {
        Write-Host "无效选择！"
    }
    Read-Host "按回车键继续"
}

function Show-Current {
    Clear-Host
    Write-Host "============================================"
    Write-Host "            当前代理设置"
    Write-Host "============================================"
    Write-Host ""
    $ps = Get-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -ErrorAction SilentlyContinue
    if ($ps.ProxyEnable -eq 1) {
        Write-Host "代理状态: 已启用"
        Write-Host "代理地址: $($ps.ProxyServer)"
    } else {
        Write-Host "代理状态: 未启用"
    }
    Write-Host ""
    Write-Host "Override: $($ps.ProxyOverride)"
    Write-Host ""
    Read-Host "按回车键继续"
}

function Clear-Proxy {
    Clear-Host
    Write-Host "============================================"
    Write-Host "            清除代理设置"
    Write-Host "============================================"
    Write-Host ""
    try {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyEnable' -Value 0
        Write-Host "[成功] 代理已清除"
    } catch {
        Write-Host "[失败] 请尝试以管理员身份运行！"
    }
    Write-Host ""
    Read-Host "按回车键继续"
}

function Restore-Original {
    Clear-Host
    Write-Host "============================================"
    Write-Host "          恢复原始代理设置"
    Write-Host "============================================"
    Write-Host ""
    if (-not (Test-Path $OrigFile)) {
        Write-Host "未保存原始设置，无法恢复！"
        Read-Host "按回车键继续"
        return
    }
    Write-Host "正在恢复原始代理设置..."
    $lines = Get-Content $OrigFile -Encoding UTF8
    $enable = $lines[0]
    $server = $lines[1]
    $override = $lines[2]
    try {
        Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyEnable' -Value $enable
        if ($server -ne '') { Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyServer' -Value $server }
        if ($override -ne '') { Set-ItemProperty -Path 'HKCU:\Software\Microsoft\Windows\CurrentVersion\Internet Settings' -Name 'ProxyOverride' -Value $override }
        Write-Host "[成功] 已恢复原始代理设置"
    } catch {
        Write-Host "[失败] 请尝试以管理员身份运行！"
    }
    Write-Host ""
    Read-Host "按回车键继续"
}

while ($true) {
    Show-Menu
    $choice = Read-Host "请选择操作"
    switch ($choice) {
        '1' { Get-AllProxies }
        '2' { Filter-ByRegion }
        '3' { Show-Current }
        '4' { Clear-Proxy }
        '5' { Restore-Original }
        '6' {
            if (Test-Path $SortedFile) { Filter-ByRegion }
            else { Write-Host "暂无缓存，请先获取代理列表！"; Read-Host "按回车键继续" }
        }
        '0' {
            Write-Host ""
            Write-Host "感谢使用 IP Proxy Changer！"
            Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
            exit
        }
        default { Write-Host "无效选项，请重新选择！"; Read-Host "按回车键继续" }
    }
}
