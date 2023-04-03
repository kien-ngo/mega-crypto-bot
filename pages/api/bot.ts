import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { formatNumber } from "../../scripts/number";
import { getPriceWithId, getPriceWithSymbol } from "../../scripts/coingecko";
import { getTvlOfAllChains } from "../../scripts/defillama";
const util = require("util");
import {
  sendMessage,
  sendMessageWithOptions,
  TKeyboardOption,
} from "../../scripts/sendMessage";

// const setWebhook = async (url: string) => {
//   const res = await fetch(
//     `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
//   ).then((r) => r.json());
// };

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  // console.log(util.inspect(body, false, null, true /* enable colors */));
  let chatId: string = "";
  let commandStr: string = "";
  if (body.callback_query) {
    commandStr = body.callback_query.data;
    chatId = body.callback_query.message?.chat?.id;
  } else if (body.message) {
    commandStr = body.message?.text;
    chatId = body.message.chat.id;
  } else if (body.channel_post) {
    commandStr = body.channel_post.text;
    chatId = body.channel_post.chat.id;
  }
  if (!commandStr || !chatId) return res.send("ok");
  if (!commandStr.startsWith("/k ")) return res.send("ok");

  // EXECUTE
  try {
    const arr: string[] = commandStr.split(" ");
    /**
     * List of len===3 commands
     * 1. /k [p]rice <symbol> OR /k [p]rice id=<coingecko_id>
     * 2. /k [c]ompare <symbol1,symbol2>
     * 3.
     */
    if (arr.length === 2) {
      const command = arr[1];
      if (["d", "description"].includes(command)) {
        const msg =
          'Welcome. This bot does some crypto related tasks such as fetching price and comparing stats between 2 coins.%0AGet started by typing:%0A/k help%0Aor%0A/k h%0A%0ALink: <a href="http://github.com/kienngo98/mega-crypto-bot">Github</a>%0ALink: <a href="http://kienngo.me">Author</a>';
        await sendMessage(msg, chatId);
      } else if (["h", "help"].includes(command)) {
        const msg =
          'All commands start is "/k ":%0ATo fetch the price of a coin:%0A"/k price btc"%0Aor%0A"/k p btc"%0ATo compare the stats of 2 coins (separated by a comma and no space):%0A/k compare btc,eth%0Aor%0A/k c btc,eth';
        await sendMessage(msg, chatId);
      } else {
        throw Error("Invalid command");
      }
    } else if (arr.length === 3) {
      const command = arr[1];
      // Begin of price command
      if (["price", "p"].includes(command)) {
        let content;
        if (arr[2].startsWith("id=")) {
          const coinId = arr[2].split("=")[1];
          const result = await getPriceWithId(coinId);
          if (!result.valid || !result.result) {
            await sendMessage(
              result.message ?? "Oops, something went wrong",
              chatId
            );
          } else {
            content = result.result!;
          }
        } else {
          // Symbols are not unique. We need to search for all the records with the same symbols from minified.json
          // and then prompt back to users which option they wanna go with
          const _symbol = arr[2];
          const { default: data } = await import("../../raw_data.json", {
            assert: {
              type: "json",
            },
          });
          const records = data.filter(
            (item) =>
              item.s.toLowerCase() === _symbol.toLowerCase() ||
              item.i.toLowerCase() === _symbol.toLowerCase()
          );
          if (!records.length) {
            throw Error(
              `Error: symbol ${_symbol.toUpperCase()} is not supported`
            );
          }
          // If there's only one then proceed to fetch price
          if (records.length === 1) {
            const result = await getPriceWithId(records[0].i);
            if (!result.valid || !result.result) {
              await sendMessage(
                result.message ?? "Oops, something went wrong",
                chatId
              );
            } else {
              content = result.result!;
            }
          } else {
            const options: TKeyboardOption[] = records.map((item) => ({
              label: item.n,
              value: `/k p id=${item.i}`,
            }));
            await sendMessageWithOptions(
              `Which $${_symbol.toUpperCase()}?`,
              chatId,
              options
            );
            return res.status(200).send("ok");
          }
        }
        if (content) {
          const { price_usd, vol, change, symbol, mcap } = content;
          const htmlMsg = `<b>${symbol.toUpperCase()}</b>:%0APrice: $${price_usd}%0A24h: ${
            change >= 0 ? "+" : ""
          }${change}%%0AVol: $${formatNumber(vol)}%0AMcap: ${formatNumber(
            mcap
          )}`;
          await sendMessage(htmlMsg, chatId);
        } else {
          await sendMessage("Oops, something went wrong", chatId);
        }
      } // End of PRICE command
      else if (["compare", "c"].includes(command)) {
        const symbols: string[] = arr[2]
          .split(",")
          .map((symbol) => symbol.trim());
        if (symbols.length > 2)
          throw Error("Error: You can only compare 2 coins at once");
        // Check the symbols agains minified.json
        const { default: data } = await import("../../raw_data.json", {
          assert: {
            type: "json",
          },
        });
        const coinIds = [];
        for (let i = 0; i < symbols.length; i++) {
          const found = data.find(
            (item) => item.s === symbols[i].toLowerCase()
          );
          if (!found) {
            throw Error(
              `Error: symbol ${symbols[i].toUpperCase()} is not supported`
            );
          }
          coinIds.push(found);
        }
        const r = await Promise.all([
          getPriceWithId(coinIds[0].i, coinIds[0].s),
          getPriceWithId(coinIds[1].i, coinIds[1].s),
          getTvlOfAllChains(),
        ]);
        if ([r[0], r[1]].some((item) => !item.valid || !item.result)) {
          throw Error(`Oops, something went wrong when fetching price`);
        }
        const results = [r[0].result!, r[1].result!];
        const tvls: string[] = [
          formatNumber(
            r[2].find((o) => o.gecko_id === results[0].gecko_id)?.tvl ?? 0
          ) ?? "N/A",
          formatNumber(
            r[2].find((o) => o.gecko_id === results[1].gecko_id)?.tvl ?? 0
          ) ?? "N/A",
        ];
        const maxCol1 = Math.max(
          "|Price".length,
          "|24h".length,
          "|Vol".length,
          "|Mcap".length,
          "|TVL".length
        );
        const [maxCol2, maxCol3] = results.map((item, index) =>
          Math.max(
            `${item.symbol}`.length,
            `$${item.price_usd}`.length,
            `%${item.change}`.length,
            `$${formatNumber(item.vol)}`.length,
            `$${formatNumber(item.mcap)}`.length,
            `$${tvls[index]}`.length
          )
        );
        // Label
        const labelRow = `|${"".padEnd(maxCol1 - 1)}| ${results[0].symbol
          .toUpperCase()
          .padEnd(maxCol2)}| ${results[1].symbol.toUpperCase()}%0A`;

        // Price
        const priceRow = `${"|Price".padEnd(maxCol1)}| $${String(
          results[0].price_usd
        ).padEnd(maxCol2 - 1)}| $${String(results[1].price_usd)}%0A`;

        // Change
        const changeRow = `${"|24h".padEnd(maxCol1)}| ${
          results[0].change >= 0
            ? "+"
            : "" + String(results[0].change + "%").padEnd(maxCol2)
        }| ${String(results[1].change)}%%0A`;

        // Vol
        const volRow = `${"|Vol".padEnd(maxCol1)}| $${formatNumber(
          results[0].vol
        ).padEnd(maxCol2 - 1)}| $${formatNumber(results[1].vol)}%0A`;

        // Marketcap
        const mcapRow = `${"|Mcap".padEnd(maxCol1)}| $${formatNumber(
          results[0].mcap
        ).padEnd(maxCol2 - 1)}| $${formatNumber(results[1].mcap)}%0A`;

        // Total value locked
        const tvlRow = `${"|TVL".padEnd(maxCol1)}| $${tvls[0].padEnd(
          maxCol2 - 1
        )}| $${tvls[1]}`;

        const labelSeparator = `|${"-".padEnd(maxCol1 - 1, "-")}|${"-".padEnd(
          maxCol2 + 1,
          "-"
        )}|${"-".repeat(maxCol3 + 1)}%0A`;
        const header = `${results[0].symbol.toUpperCase()} vs ${results[1].symbol.toUpperCase()}${"".padEnd(
          labelSeparator.length
        )}%0A%0A`;
        const msg = `${header}<pre>${labelRow}${labelSeparator}${priceRow}${changeRow}${volRow}${mcapRow}${tvlRow}</pre>`;
        await sendMessage(msg, chatId);
      }
    } else {
      throw Error("Invalid command");
    }
    return res.status(200).send("ok");
  } catch (err) {
    sendMessage(err as string, chatId);
    return res.status(200).send("ok");
  }
};
