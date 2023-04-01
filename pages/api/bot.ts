import { NextRequest, NextResponse } from "next/server";
import { formatNumber } from "../../number";
import { getSimplePrice } from "../../scripts/coingecko";
// `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
export const config = {
  runtime: "edge",
};
const BOT_TOKEN = process.env.BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const sendMessage = async (message: string, chatId: string) => {
  const res = await fetch(
    `${BASE_URL}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`
  );
};

export default async (req: NextRequest) => {
  const body = await new Response(req.body).json();
  if (!body.message && !body.channel_post) return NextResponse.next();
  const commandStr = body.message?.text || body.channel_post?.text;
  const chatId = body.message?.chat?.id || body.channel_post?.chat?.id;
  if (!commandStr || !chatId) return NextResponse.next();
  // Commands always start with "/k "
  if (!commandStr.startsWith("/k ")) return NextResponse.next();
  const arr = commandStr.split(" ");
  if (arr.length < 3) return NextResponse.next();

  if (arr.length === 3) {
    const command = arr[1];
    if (command === "price") {
      const coinId = arr[2];
      const res = await getSimplePrice(coinId);
      if (!res.valid || !res.result) {
        sendMessage(res.message ?? "Oops, something went wrong", chatId);
        return NextResponse.next();
      }
      const { price_usd, vol, change, symbol } = res.result;
      const msg = `
        <b>${symbol}:</b>%0A
        Change: <span style="color:${
          change >= 0 ? "green" : "red"
        }">${change}%</span>%0A
        Price: $${price_usd}%0A
        Volumn: $${formatNumber(vol)}%0A
      `;
      sendMessage(msg, chatId);
      return NextResponse.next();
    }
  }
  return NextResponse.next();
};
