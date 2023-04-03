import { NextApiRequest, NextApiResponse } from "next";
import { getPriceWithId } from "../../scripts/coingecko";
import { getTvlOfAllChains } from "../../scripts/defillama";
import { formatNumber } from "../../scripts/number";
import { getCommandStrAndChatId } from "../../telegram";
import { sendMessage } from "../../telegram/sendMessage";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { chatId, commandStr } = getCommandStrAndChatId(req.body);
  const arr = commandStr!.split(" ").map((item) => item.trim());
  try {
    const symbols: string[] = arr[2].split(",").map((symbol) => symbol.trim());
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
      const found = data.find((item) => item.s === symbols[i].toLowerCase());
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
    await sendMessage(msg, chatId!);
  } catch (err) {
    sendMessage(err as string, chatId!);
  }
  res.send("ok");
};
