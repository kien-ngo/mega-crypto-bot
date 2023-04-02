// @ts-nocheck
import { NextApiRequest, NextApiResponse } from "next";
import { chainBlacklist } from "../../blacklists/chains";
import { idBlacklist } from "../../blacklists/id";

const keywordBlackList: string[] = [
  "shiba",
  "inu",
  "saitama",
  "floki",
  "lambo",
  "kishu",
  "doge",
  "baby",
  "-fan-token",
  "-ape",
  "moon",
  "kitty",
  "lucky",
  "dog-",
  "doggy",
  "metaverse",
  "dog-",
  "-dog",
];
const startsWithBlackList: string[] = [
  "zombie-",
  "aave-",
  "counpound-",
  "aavegotchi-",
  "curve-fi-",
  "balancer-boosted-",
  "idle-", // Idle Finance
  "instadapp-",
  "iron-bank-",
  "jarvis-",
  "liquid-",
  "litecoin-",
  "mad-",
  "matic-aave",
  "maximus-",
  "meme-",
  "meta-",
  "metaverse-",
  "shib",
  "smart-",
  "wrapped-",
  "venus-",
  "orbit-bridge-klaytn-",
  "gravity-bridge",
  "oec-",
  "huobi-",
  "RealT",
];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = await fetch("https://api.coingecko.com/api/v3/coins/list").then(
    (r) => r.json()
  );
  const newData = data
    .filter(
      (item) =>
        // Exclude wormhole tokens
        !item.name.includes("(Wormhole)") &&
        // Exclude Bridge token
        !item.name.includes("(Plenty Bridge)") &&
        !item.name.includes("(Rainbow Bridge)") &&
        !item.name.includes("(Wormhole from Ethereum)") &&
        // Exclude Defi debt/load/liq tokens
        startsWithBlackList.every((word) => !item.id.startsWith(word)) &&
        // Exclude if contains blacklisted keywords
        (keywordBlackList.every(
          (word) =>
            !item.id.includes(word) && !item.name.toLowerCase().includes(word)
        ) ||
          item.id === "dogecoin") &&
        !idBlacklist.includes(item.id)
    )
    // Exclude tokens from ghost chains
    .filter((item) => {
      if (!item.platforms) return true;
      const platforms = Object.keys(item.platforms);
      if (platforms.length === 1) {
        return !chainBlacklist.includes(platforms[0]);
      }
      return true;
    })
    // Minify the content
    .map((item) => ({ i: item.id, s: item.symbol }));
  res.json(newData);
};
