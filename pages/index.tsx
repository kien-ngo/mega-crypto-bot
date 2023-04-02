import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <div className="mx-auto mt-9 lg:max-w-[800px] md:max-w-[600px] px-3">
        <h1 className=" text-4xl">Mega Crypto Bot</h1>
        <div className="mt-8">
          Add to Telegram:{" "}
          <a
            href="https://t.me/xava_coin_bot"
            target="_blank"
            className="underline"
          >
            t.me/xava_coin_bot
          </a>
          <br />
          Author: <a href="https://kienngo.me" target="_blank" className="underline">kienngo.me</a><br/><br/>
          Description: This bot utilizes the Congecko API and does a couple of
          things related to crypto such as:
          <br />
          - Get price of a coin
          <br />- Compare the stats of 2 coins
        </div>
        <details
          className="mt-4 md:max-w-[600px] lg:max-w-[600px] w-[98vw]"
          open
        >
          <summary className="bg-indigo-400 cursor-pointer pl-2 py-1 text-black">
            Commands
          </summary>
          <div className="flex flex-col border px-2 md:max-w-[600px] lg:max-w-[600px] w-[98vw] pb-2">
            <div>
              All commands start with{" "}
              <b>
                <i>&quot;/k&quot;</i>
              </b>
            </div>
            <ul className="list-disc ml-4">
              <li className="border-b border-gray-400 pb-4">
                <div className="flex flex-col">
                  <div>
                    <b>[D]escription:</b> Get the bot&apos;s description
                  </div>
                  <div>
                    Example:
                    <br />
                    /k desc
                    <br />
                    /k description
                  </div>
                </div>
              </li>
              <li className="border-b border-gray-400 pb-4 mt-2">
                <div className="flex flex-col">
                  <div>
                    <b>[H]elp:</b> Get helppp
                  </div>
                  <div>
                    Example:
                    <br />
                    /k h
                    <br />
                    /k help
                  </div>
                </div>
              </li>
              <li className="border-b border-gray-400 pb-4 mt-2">
                <div className="flex flex-col">
                  <div>
                    <b>[P]rice:</b> Get the price of a coin based on symbol/id
                  </div>
                  <div>
                    Example:
                    <br />
                    /k price btc
                    <br />
                    /k p btc
                    <br />
                    /k p id=bitcoin (&quot;bitcoin&quot; is the Coingecko ID of BTC)
                  </div>
                </div>
              </li>
              <li className="mt-2">
                <div className="flex flex-col">
                  <div>
                    <b>[C]ompare:</b> compare 2 coins&apos;s general stats. The
                    symbols should be separated by commas. Maximum 2 symbols
                    supported
                  </div>
                  <div>
                    Example:
                    <br />
                    /k compare btc,eth
                    <br />
                    /k c btc,eth
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </details>
      </div>
    </div>
  );
};

export default Home;
