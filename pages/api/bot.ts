import { NextApiRequest, NextApiResponse } from "next";
// `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
type TBotRequest = {
  update_id: number;
  message: {
    message_id: number;
    from: {
      id: number;
      is_bot: boolean;
      first_name: string;
      username: string;
      language_code: string;
    };
    chat: {
      id: number;
      first_name: string;
      username: string;
      type: string; // private | public
    };
    date: number;
    text: string;
    entities: Array<{
      offset: number;
      length: number;
      type: string;
    }>;
  };
};
const BOT_TOKEN = process.env.BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
export const sendMessage = async (message: string, chatId: string) => {
  const res = await fetch(
    `${BASE_URL}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`
  );
};
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body: TBotRequest = req.body;
  if (!body) return res.status(500).send("error");
  const message = body.message;
  if (req.body.message.text === "/start") {
    const response =
      "Welcome to <i>NextJS News Channel</i> <b>" +
      req.body.message.from.first_name +
      "</b>.%0ATo get a list of commands sends /help";
    sendMessage(response, String(message.chat.id));
  }
  if (req.body.message.text === "/help") {
    const response =
      "Help for <i>NextJS News Channel</i>.%0AUse /search <i>keyword</i> to search for <i>keyword</i> in my Medium publication";
    sendMessage(response, String(message.chat.id));
  }
  res.status(200).send("ok");
};
