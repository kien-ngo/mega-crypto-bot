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
      'Welcome. This bot does some crypto related tasks such as fetching price and comparing stats between 2 coins.%0AGet started by typing:%0A/k help%0Aor%0A/k h%0A%0ALink: <a href="http://github.com/kienngo98/mega-crypto-bot">Github</a>%0ALink: <a href="http://kienngo.me">Author</a>';
    await sendMessage(msg, chatId!);
    NextResponse.next();
  } catch (err) {
    console.error(err as string);
  }
};
