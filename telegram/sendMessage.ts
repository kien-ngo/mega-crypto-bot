const BOT_TOKEN =
  process.env.NODE_ENV === "development"
    ? process.env.BOT_TEST_TOKEN!
    : process.env.BOT_TOKEN!;

const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const sendMessage = async (
  message: string,
  chatId: string,
  disableLinkThumbnail: boolean = true
) => {
  const rest = await fetch(
    `${BASE_URL}/sendMessage?chat_id=${chatId}&text=${message}&parse_mode=HTML&disable_web_page_preview=${
      disableLinkThumbnail ? "True" : "False"
    }`
  ).then((r) => r.json());
  console.log({ sendMessage: rest });
};

export type TCmdString = `/k ${string}`;
export type TKeyboardOption = {
  label: string;
  value: TCmdString;
};

export const sendMessageWithOptions = async (
  message: string,
  chatId: string,
  options: TKeyboardOption[]
) => {
  // Create the reply markup object with the options stacked up vertically
  const inline_keyboard: Array<
    Array<{ text: string; callback_data: TCmdString }>
  > = [];
  options.forEach((item) =>
    inline_keyboard.push([{ text: item.label, callback_data: item.value }])
  );
  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        reply_markup: {
          inline_keyboard: inline_keyboard,
          one_time_keyboard: true,
        },
      }),
    }
  )
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error(error));
  console.log({ sendMessageWithOptions: res });
};
