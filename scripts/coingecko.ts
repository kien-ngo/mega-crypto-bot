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

export const getPriceWithSymbol = async (
  symbol: string
): Promise<CoingeckoObject> => {
  try {
    if (!symbol) return { valid: false };
    const { default: data } = await import("../raw_data.json", {
      assert: {
        type: "json",
      },
    });
    const searchRes = data.find((item) => item.s === symbol);
    if (!searchRes) return { valid: false, message: "Invalid ticker" };
    const coinId = searchRes.i;
    const result = await getPriceWithId(coinId, searchRes.s);
    return result;
  } catch (err) {
    console.error("Error in coingecko");
    return { valid: false };
  }
};
// Test data
//   {
//     "avalanche-2": {
//       "usd": 17.667,
//       "usd_24h_vol": 138131233.25548232,
//       "usd_24h_change": -0.4179592306764687,
//       "btc": 0.001,
//       "btc_24h_vol": 4860.470880322105,
//       "btc_24h_change": -0.11595644089366386,
//       "eth": 0.01,
//       "eth_24h_vol": 76009.61036956107,
//       "eth_24h_change": 0.4604088025951702
//     }
//   }
