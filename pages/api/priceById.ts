import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { getPriceWithId, preparePriceMessage } from "../../scripts/coingecko";
import { getCommandStrAndChatId } from "../../telegram";
import { sendMessage } from "../../telegram/sendMessage";

export const config = {
  runtime: "edge",
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId, commandStr } = getCommandStrAndChatId(req.body);
  const arr = commandStr!.split(" ").map((item) => item.trim());
  try {
    const coinId = arr[2].split("=")[1];
    const result = await getPriceWithId(coinId);
    if (!result.valid || !result.result)
      throw Error("Could not fetch the price for ID:" + coinId);
    const htmlMsg = preparePriceMessage(result.result);
    await sendMessage(htmlMsg, chatId!);
  } catch (err) {
    sendMessage(err as string, chatId!);
  }
  return res.status(200).send("ok");
};
