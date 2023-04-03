import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { COMMANDS } from "./telegram/consts";

// Trigger this middleware to run on the `/secret-page` route
export const config = {
  matcher: "/api/bot",
};
export async function middleware(req: NextRequest) {
  const body = await new Response(req.body).json();
  //   console.log({ middlware: body });
  let chatId: string = "";
  let commandStr: string = "";
  if (body.callback_query) {
    commandStr = body.callback_query.data;
    chatId = body.callback_query.message?.chat?.id;
  } else if (body.message) {
    commandStr = body.message?.text;
    chatId = body.message.chat.id;
  } else if (body.channel_post) {
    commandStr = body.channel_post.text;
    chatId = body.channel_post.chat.id;
  }
  if (!commandStr || !chatId || !commandStr.toLowerCase().startsWith("/k ")) {
    return NextResponse.rewrite(new URL("/api/abort", req.url));
  }
  const arr: string[] = commandStr.split(" ").map((item) => item.trim());
  if (arr.length < 2)
    return NextResponse.rewrite(new URL("/api/abort", req.url));
  if (!COMMANDS.includes(arr[1]))
    return NextResponse.rewrite(new URL("/api/invalidCmd", req.url));
  switch (arr[1].toLowerCase()) {
    case "d":
      return NextResponse.rewrite(new URL("/api/description", req.url));
    case "description":
      return NextResponse.rewrite(new URL("/api/description", req.url));
    case "h":
      return NextResponse.rewrite(new URL("/api/help", req.url));
    case "help":
      return NextResponse.rewrite(new URL("/api/help", req.url));
    case "p": {
      const path = arr[2].startsWith("id=") ? "priceById" : "priceBySymbol";
      return NextResponse.rewrite(new URL(`/api/${path}`, req.url));
    }
    case "price": {
      const path = arr[2].startsWith("id=") ? "priceById" : "priceBySymbol";
      return NextResponse.rewrite(new URL(`/api/${path}`, req.url));
    }
    case "c":
      return NextResponse.rewrite(new URL("/api/compare", req.url));
    case "compare":
      return NextResponse.rewrite(new URL("/api/compare", req.url));
    default:
      return NextResponse.rewrite(new URL("/api/abort", req.url));
  }
}
