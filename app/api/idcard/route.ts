import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 15;

export async function POST(req: Request) {
  let body: { idcard?: string; name?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "请求体格式错误" }, { status: 400 });
  }

  const idcard = (body.idcard ?? "").trim().toUpperCase();
  const name = (body.name ?? "").trim();

  if (!idcard) {
    return NextResponse.json({ error: "请输入身份证号码" }, { status: 400 });
  }

  if (!/^\d{15}(\d{2}[\dXx])?$/.test(idcard)) {
    return NextResponse.json(
      { error: "身份证号码格式不正确，请输入15位或18位号码" },
      { status: 400 }
    );
  }

  try {
    const targetUrl =
      idcard.length === 18
        ? "https://id.lanyul.com/back/idcard/simple"
        : "https://id.lanyul.com/back/idcard/simple";

    const formBody = new URLSearchParams({ idcard });
    const res = await fetch(targetUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formBody.toString(),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `外部服务响应异常（${res.status}）` },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (data.code !== 200 || !data.data) {
      return NextResponse.json(
        { error: data.error || "查询失败，请稍后重试" },
        { status: 200 }
      );
    }

    // 本地校验校验码（仅18位）
    let checksumValid = true;
    let checksumExpected = "";
    if (idcard.length === 18) {
      const CHECK_SUM_MAP = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];
      const WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
      let sum = 0;
      for (let i = 0; i < 17; i++) {
        sum += parseInt(idcard[i], 10) * WEIGHTS[i];
      }
      checksumExpected = CHECK_SUM_MAP[sum % 11];
      checksumValid = checksumExpected === idcard[17].toUpperCase();
    }

    return NextResponse.json({
      success: true,
      data: data.data,
      checksumValid,
      checksumExpected,
      idcardLength: idcard.length,
      verifyUrl: name
        ? `https://lanyul.com/idcard?name=${encodeURIComponent(name)}&idcard=${encodeURIComponent(idcard)}`
        : null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "查询超时，请稍后重试" },
      { status: 504 }
    );
  }
}
