import { NextRequest, NextResponse } from "next/server";
import { ENVIRONMENTS } from "@/lib/constants";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const env = searchParams.get("env") || "dev";

  const envConfig = ENVIRONMENTS.find((e) => e.key === env);
  if (!envConfig) {
    return NextResponse.json({ error: "Invalid environment" }, { status: 400 });
  }

  const apiUrl = `${envConfig.host}/mgt/silverain/chatbot/questions/log`;

  try {
    const res = await fetch(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
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
    console.error("API proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch from API" },
      { status: 502 }
    );
  }
}
