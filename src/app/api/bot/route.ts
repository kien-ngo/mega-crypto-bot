import { NextApiRequest, NextApiResponse } from "next";
const BOT_TOKEN = process.env.BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const {
    query: { token },
    body: {message},
  } = req;
  if (token !== BOT_TOKEN) {
    return res.status(500).end("Invalid Auth");
  }
  if (req.body.message.text === "/start") {
    const response =
      "Welcome to <i>NextJS News Channel</i> <b>" +
      req.body.message.from.first_name +
      "</b>.%0ATo get a list of commands sends /help";
    const ret = await fetch(
      `${BASE_URL}/sendMessage?chat_id=${message.chat.id}&text=${response}&parse_mode=HTML`
    );
  }
  if (req.body.message.text === "/help") {
    const response =
      "Help for <i>NextJS News Channel</i>.%0AUse /search <i>keyword</i> to search for <i>keyword</i> in my Medium publication";
    const ret = await fetch(
      `${BASE_URL}/sendMessage?chat_id=${message.chat.id}&text=${response}&parse_mode=HTML`
    );
  }
  res.status(200).send("OK");
  return new Response("Hello, Next.js!");
};
