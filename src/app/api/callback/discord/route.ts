import { NextRequest, NextResponse } from "next/server";
import { discordService } from "@/server/services/application/discord.service";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state");
  const t = req.nextUrl.searchParams.get("t");

  if (!state || !t) {
    return corsResponse(NextResponse.json({ success: false, error: "Missing state or t" }, { status: 400 }));
  }

  try {
    const result = await discordService.registerByCallbackRedirect(state, t);
    return corsResponse(NextResponse.json({
      success: true,
      username: result.globalName || result.username,
      discordId: result.discordId,
      accountId: result.accountId,
    }));
  } catch (error: any) {
    return corsResponse(NextResponse.json(
      { success: false, error: error.message || "Callback failed" },
      { status: 400 }
    ));
  }
}

function corsResponse(res: NextResponse) {
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}

export async function OPTIONS() {
  return corsResponse(NextResponse.json({}, { status: 204 }));
}
