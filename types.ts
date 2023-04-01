// Shared
interface IBotRequest {
  update_id: number;
}

interface IMessage {
  message_id: number;
  date: number;
  text: string;
  entities: Array<{
    offset: number;
    length: number;
    type: string;
  }>;
}

interface IChat {
  id: number;
  type: string;
}

// Personal
interface IChatPersonal extends IChat {
  username: string;
  first_name: string;
}
export interface IMessagePersonalRequest extends IMessage {
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    language_code: string;
  };
  chat: IChatPersonal;
}
// For sending the message directly with the bot
export interface IBotPersonalRequest extends IBotRequest {
  message: IMessagePersonalRequest;
}

// Personal request sample
const personalRequest: IBotPersonalRequest = {
  update_id: 617003641,
  message: {
    message_id: 11,
    from: {
      id: 1350264733,
      is_bot: false,
      first_name: "Ken",
      username: "kienngo_to",
      language_code: "en",
    },
    chat: {
      id: 1350264733,
      first_name: "Ken",
      username: "kienngo_to",
      type: "private",
    },
    date: 1680364695,
    text: "/help",
    entities: [
      {
        offset: 0,
        length: 5,
        type: "bot_command",
      },
    ],
  },
};

// Channel
interface IChatChannelRequest extends IChat {
  title: string;
}
interface IMessageChannelRequest extends IMessage {
  sender_chat: {
    id: number;
    title: string;
    type: string | "channel";
  };
  chat: IChatChannelRequest;
}
// For sending the message from the channel that has the bot
export interface IBotChannelRequest extends IBotRequest {
  channel_post: IMessageChannelRequest;
}

// Channel request sample
const channelRequest: IBotChannelRequest = {
  update_id: 617003654,
  channel_post: {
    message_id: 8,
    sender_chat: {
      id: -1001780851369,
      title: "Mega.nz",
      type: "channel",
    },
    chat: {
      id: -1001780851369,
      title: "Mega.nz",
      type: "channel",
    },
    date: 1680376808,
    text: "/start",
    entities: [
      {
        offset: 0,
        length: 6,
        type: "bot_command",
      },
    ],
  },
};
