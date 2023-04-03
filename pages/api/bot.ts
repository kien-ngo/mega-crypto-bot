import { NextApiRequest, NextApiResponse } from "next";
import { NextRequest, NextResponse } from "next/server";
import { formatNumber } from "../../scripts/number";
import { getPriceWithId, getPriceWithSymbol } from "../../scripts/coingecko";
import { getTvlOfAllChains } from "../../scripts/defillama";

const BOT_TOKEN = process.env.BOT_TOKEN!;
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

const setWebhook = async (url: string) => {
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/setWebhook?url=${url}`
  ).then((r) => r.json());
};

export const sendMessage = async (message: string, chatId: string) => {
  const rest = await fetch(
    `${BASE_URL}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML`
  ).then((r) => r.json());
  console.log({ rest });
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const body = req.body;
  const chatId = body.message?.chat?.id
    ? body.message.chat.id
    : body.channel_post?.chat?.id
    ? body.channel_post.chat.id
    : "";
  const commandStr = body.message?.text
    ? body.message.text
    : body.channel_post?.text
    ? body.channel_post.text
    : "";
  // EXECUTE
  try {
    if (!commandStr || !chatId) return res.send("ok");
    if (!commandStr.startsWith("/k ")) return res.send("ok");
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
          "Welcome. This bot does some crypto related tasks such as fetching price and comparing stats between 2 coins.%0AGet started by typing:%0A/k help%0Aor%0A/k h";
        await sendMessage(msg, chatId);
      } else if (["h", "help"].includes(command)) {
        const msg =
          'All commands start is "/k ":%0ATo fetch the price of a coin:%0A"/k price btc"%0Aor%0A"/k p btc"%0ATo compare the stats of 2 coins (separated by a comma and no space):%0A/k compare btc,eth%0Aor%0A/k c btc,eth';
        await sendMessage(msg, chatId);
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
          const _symbol = arr[2];
          const result = await getPriceWithSymbol(_symbol);
          if (!result.valid || !result.result) {
            await sendMessage(
              result.message ?? "Oops, something went wrong",
              chatId
            );
          } else {
            content = result.result!;
          }
        }
        if (content) {
          const { price_usd, vol, change, symbol, mcap } = content;
          const htmlMsg = `<b>${symbol.toUpperCase()}</b>:%0APrice: $${price_usd}%0A24h: ${
            change >= 0 ? "+" : ""
          }${change}%%0AVol: $${formatNumber(vol)}%0AMcap:${formatNumber(
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
        const { default: data } = await import("../../minified.json", {
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
