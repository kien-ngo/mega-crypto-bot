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
    await sendMessage(
      `Invalid command: <b>${commandStr?.split(" ")[1]}</b>`,
      chatId!
    );
    NextResponse.next();
  } catch (err) {
    console.error(err as string);
  }
};
