import { NextResponse } from "next/server";
import { getTVSeason } from "@/lib/tmdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const season = Number(searchParams.get("season") ?? 1);

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const data = await getTVSeason(id, season);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
