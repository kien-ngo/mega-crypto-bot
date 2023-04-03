export const getCommandStrAndChatId = (
  body: any
): { commandStr: string | undefined; chatId: string | undefined } => {
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
  return { chatId, commandStr };
};
