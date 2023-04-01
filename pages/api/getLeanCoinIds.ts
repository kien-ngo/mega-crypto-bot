import { NextApiRequest, NextApiResponse } from "next";
import data from "../../coin_ids.json";
export default async (req: NextApiRequest, res: NextApiResponse) => {
  // Remove "name"
  // @ts-ignore
  const newData = data.map((item) => ({ i: item.id, s: item.symbol }));
  res.json(newData);
};
