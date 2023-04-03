import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};
export default (req: NextRequest) => {
  console.log("Invalid command - aborting");
  NextResponse.next();
};
