import { ENVIRONMENTS, DEFAULT_ENV } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const env = searchParams.get("env") || DEFAULT_ENV;
  const indicatorId = searchParams.get("indicator_id");

  if (!indicatorId) {
    return NextResponse.json({ error: "indicator_id is required" }, { status: 400 });
  }

  const envConfig = ENVIRONMENTS.find((e) => e.key === env);
  if (!envConfig) {
    return NextResponse.json({ error: "Invalid environment" }, { status: 400 });
  }

  const apiUrl = `${envConfig.host}/mgt/silverain/indicators/log?indicator_id=${encodeURIComponent(indicatorId)}`;

  try {
    const res = await fetch(apiUrl, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `API responded with ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Indicator log API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from API" },
      { status: 502 }
    );
  }
}
