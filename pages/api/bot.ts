import { NextApiRequest, NextApiResponse } from "next";
import { formatNumber } from "../../number";
import { getSimplePrice } from "../../scripts/coingecko";
// `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
// export const config = {
//   runtime: "edge",
// };
const BOT_TOKEN = process.env.BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const sendMessage = async (message: string, chatId: string) => {
  const res = await fetch(
    `${BASE_URL}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`
  ).then((r) => r.json());
  // console.log({ res });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  try {
    if (!body.message && !body.channel_post)
      throw Error("Missing body.message || body.channel_post");

    const commandStr = body.message?.text
      ? body.message.text
      : body.channel_post?.text
      ? body.channel_post.text
      : "";

    const chatId = body.message?.chat?.id
      ? body.message.chat.id
      : body.channel_post?.chat?.id
      ? body.channel_post.chat.id
      : "";
    if (!commandStr || !chatId) throw Error("Missing commandStr || chatId");
    if (!commandStr.startsWith("/k "))
      throw Error('Command must start with "/k "');
    const arr = commandStr.split(" ");
    if (arr.length < 3) throw Error("Command length must be > 3");

    if (arr.length === 3) {
      const command = arr[1];
      if (command === "price") {
        const _symbol = arr[2];
        const result = await getSimplePrice(_symbol);
        if (!result.valid || !result.result) {
          sendMessage(result.message ?? "Oops, something went wrong", chatId);
          return res.status(200).send("ok");
        }
        const { price_usd, vol, change, symbol } = result.result!;
        const msg = `<b>${symbol}:</b>%0AChange: ${
          change >= 0 ? "+" : "-"
        }${change}%%0APrice: $${price_usd}%0AVolumn: $${formatNumber(vol)}%0A`;
        sendMessage(msg, chatId);
        return res.status(200).send("ok");
      }
    }
    return res.status(200).send("ok");
  } catch (err) {
    return res.status(200).send("ok");
  }
};
