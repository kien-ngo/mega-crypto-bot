export const processCommand = (
  commandStr: string
): { valid: boolean; message?: string; result?: any } => {
  if (process.env.NODE_ENV === "production") {
    if (!commandStr.startsWith("/k "))
      return {
        valid: false,
        message: 'Invalid command - Must start with "/k "',
      };
  }
  const arr = commandStr.split(" ");
  if (arr.length < 2)
    return { valid: false, message: "Command missing parameter" };
  if (arr.length === 3) {
    const command = arr[1];
    if (command === "price")
      return {
        valid: true,
        message: "Get price command",
        result: { symbol: arr[2] },
      };
  } else {
    return { valid: false, message: "Unsupported command" };
  }
  return { valid: true };
};
