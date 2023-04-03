import { formatNumber } from "./number";

const BASE_URL = "https://api.coingecko.com/api/v3";
export type CoingeckoObject = {
  valid: boolean;
  message?: string;
  result?: {
    price_usd: number;
    vol: number;
    change: number;
    symbol: string;
    mcap: number;
    gecko_id: string;
  };
};
export const getPriceWithId = async (
  coinId: string,
  symbol?: string
): Promise<CoingeckoObject> => {
  const res = await fetch(
    `${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd%2Cbtc%2Ceth&include_24hr_vol=true&include_24hr_change=true&precision=2&include_market_cap=true`
  ).then((r) => r.json());
  if (!Object.keys(res).length)
    return { valid: false, message: "Invalid id/symbol" };
  const result = {
    price_usd: res[coinId].usd as number,
    vol: parseFloat((res[coinId].usd_24h_vol as number).toFixed(2)),
    change: parseFloat((res[coinId].usd_24h_change as number).toFixed(2)),
    symbol: symbol ?? coinId.toUpperCase(),
    mcap: res[coinId].usd_market_cap,
    gecko_id: coinId,
  };
  return { valid: true, result: result };
};

export const preparePriceMessage = (
  content: CoingeckoObject["result"]
): string => {
  const { price_usd, vol, change, symbol, mcap, gecko_id } = content!;
  const htmlMsg = `<b>${symbol.toUpperCase()}</b>:%0APrice: $${price_usd}%0A24h: ${
    change >= 0 ? "+" : ""
  }${change}%%0AVol: $${formatNumber(vol)}%0AMcap: ${formatNumber(
    mcap
  )}%0A%0ACoinId: <i>${gecko_id}</i>%0A%0ASource: <a href="https://www.coingecko.com/en/coins/${gecko_id}">Coingecko</a>`;
  return htmlMsg;
};
