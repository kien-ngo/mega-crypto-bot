import { NextApiRequest, NextApiResponse } from "next";
import { formatNumber } from "../../../number";
import { getSimplePrice } from "../../../scripts/coingecko";
import { processCommand } from "../../../scripts/processCommand";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { command } = req.query;
  //   const arr = (command as string).split(" ");

  //   const r = await getSimplePrice(arr[2]);
  //   const { price_usd, vol, change, symbol } = r.result!;
  //   const msg = `
  //     <b>${symbol}:</b>%0A
  //     Change: <span style="color:${
  //       change >= 0 ? "green" : "red"
  //     }">${change}%</span>%0A
  //     Price: $${price_usd}%0A
  //     Volumn: $${formatNumber(vol)}%0A
  //   `;
  //   res.send(msg);

  // ---------------------------------------------------------------
  //
  const test1 = {
    update_id: 617003660,
    message: {
      message_id: 35,
      from: {
        id: 1350264733,
        is_bot: false,
        first_name: "Ken",
        username: "kienngo_to",
        language_code: "en",
      },
      chat: {
        id: 1350264733,
        first_name: "Ken",
        username: "kienngo_to",
        type: "private",
      },
      date: 1680383011,
      text: "/k price avax",
      entities: [
        {
          offset: 0,
          length: 2,
          type: "bot_command",
        },
      ],
    },
  };
  const test2 = {
    update_id: 617003657,
    channel_post: {
      message_id: 9,
      sender_chat: {
        id: -1001780851369,
        title: "Mega.nz",
        type: "channel",
      },
      chat: {
        id: -1001780851369,
        title: "Mega.nz",
        type: "channel",
      },
      date: 1680382448,
      text: "/k price btc",
      entities: [
        {
          offset: 0,
          length: 2,
          type: "bot_command",
        },
      ],
    },
  };
  const commandStr = (
    test1.message?.text
      ? test1.message.text
      : test2.channel_post?.text
      ? test2.channel_post.text
      : ""
  ).trim();

  const chatId = test1.message?.chat?.id
    ? test1.message.chat.id
    : test2.channel_post?.chat?.id
    ? test2.channel_post.chat.id
    : "";

  if (!commandStr || !chatId) return res.send("missing cmmmand | chatid");
  if (!commandStr.startsWith("/k "))
    return res.send("command must start with /k");
  const arr = (command as string)
    .split(" ")
    .map((item) => item.trim())
    .filter((item) => item);
  if (arr.length < 3) return res.send("command length < 3");
  return res.send({ arr, message: "pass" });
};
