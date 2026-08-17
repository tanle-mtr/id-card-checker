import { NextResponse } from "next/server";

export const runtime = "edge";

interface IpInfo {
  ip?: string;
  status?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionName?: string;
  city?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
  isp?: string;
  org?: string;
  as?: string;
  query?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ip = searchParams.get("ip");

  try {
    const targetIp = ip || "";
    const url = targetIp
      ? `http://ip-api.com/json/${targetIp}?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,org,as`
      : `http://ip-api.com/json/?fields=status,country,regionName,city,zip,lat,lon,timezone,isp,org,as`;

    const res = await fetch(url, {
      headers: {
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: "IP 查询失败，请稍后重试" },
        { status: 502 }
      );
    }

    const data: IpInfo = await res.json();

    if (data.status !== "success") {
      return NextResponse.json(
        { error: "无效的 IP 地址或查询失败" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      data: {
        ip: data.query || data.ip,
        country: data.country,
        countryCode: data.countryCode,
        regionName: data.regionName,
        region: data.region,
        city: data.city,
        zip: data.zip,
        lat: data.lat,
        lon: data.lon,
        timezone: data.timezone,
        isp: data.isp,
        org: data.org,
        as: data.as,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "查询超时，请稍后重试" },
      { status: 504 }
    );
  }
}
