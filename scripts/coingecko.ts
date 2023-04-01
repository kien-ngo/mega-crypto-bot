const BASE_URL = "https://api.coingecko.com/api/v3";
export const getSimplePrice = async (
  coinId: string
): Promise<{
  valid: boolean;
  message?: string;
  result?: {
    price_usd: number;
    vol: number;
    change: number;
    symbol: string;
  };
}> => {
  if (!coinId) return { valid: false };
  const data: { i: string; s: string }[] = require("../coin_ids.json");
  const searchRes = data.find((item) => item.i === coinId);
  if (!searchRes) return { valid: false, message: "Invalid ticker" };
  const res = await fetch(
    `${BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd%2Cbtc%2Ceth&include_24hr_vol=true&include_24hr_change=true&precision=3`
  ).then((r) => r.json());
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
  const result = {
    price_usd: res[coinId].usd as number,
    vol: res[coinId].vol as number,
    change: res[coinId].usd_24h_change as number,
    symbol: searchRes.s.toUpperCase(),
  };
  return { valid: true, result: result };
};
