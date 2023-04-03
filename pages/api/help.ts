import { NextRequest, NextResponse } from "next/server";
import { getCommandStrAndChatId } from "../../telegram";
import { sendMessage } from "../../telegram/sendMessage";

export const config = {
  runtime: "edge",
};
export default async (req: NextRequest) => {
  try {
    const body = await new Response(req.body).json();
    const { chatId, commandStr } = getCommandStrAndChatId(body);
    const msg =
      'All commands start is "/k ":%0ATo fetch the price of a coin:%0A"/k price btc"%0Aor%0A"/k p btc"%0ATo compare the stats of 2 coins (separated by a comma and no space):%0A/k compare btc,eth%0Aor%0A/k c btc,eth';
    await sendMessage(msg, chatId!);
    NextResponse.next();
  } catch (err) {
    console.error(err as string);
  }
};
