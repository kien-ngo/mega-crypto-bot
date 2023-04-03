import { NextApiRequest, NextApiResponse } from "next";
import { getPriceWithId, preparePriceMessage } from "../../scripts/coingecko";
import { getCommandStrAndChatId } from "../../telegram";
import {
  sendMessage,
  sendMessageWithOptions,
  TKeyboardOption,
} from "../../telegram/sendMessage";
import coniList from "../../raw_data.json";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId, commandStr } = getCommandStrAndChatId(req.body);
  const arr = commandStr!.split(" ").map((item) => item.trim());
  try {
    let content;
    // Symbols are not unique. We need to search for all the records with the same symbols from minified.json
    // and then prompt back to users which option they wanna go with
    const _symbol = arr[2];
    const records = coniList.filter(
      (item) =>
        item.s.toLowerCase() === _symbol.toLowerCase() ||
        item.i.toLowerCase() === _symbol.toLowerCase()
    );
    if (!records.length) {
      throw Error(`Error: symbol ${_symbol.toUpperCase()} is not supported`);
    }
    // If there's only one then proceed to fetch price
    if (records.length === 1) {
      const result = await getPriceWithId(records[0].i);
      if (!result.valid || !result.result)
        throw Error("Could not get the price for $" + _symbol);
      const htmlMsg = preparePriceMessage(result.result);
      await sendMessage(htmlMsg, chatId!);
    } else {
      const options: TKeyboardOption[] = records.map((item) => ({
        label: item.n,
        value: `/k p id=${item.i}`,
      }));
      await sendMessageWithOptions(
        `Which $${_symbol.toUpperCase()}?`,
        chatId!,
        options
      );
      return res.status(200).send("ok");
    }
  } catch (err) {
    sendMessage(err as string, chatId!);
  }
  return res.status(200).send("ok");
};
