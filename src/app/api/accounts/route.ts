import { NextResponse } from "next/server";
import { getAccountsForSelect } from "@/actions/accounts";

export async function GET() {
  const accounts = await getAccountsForSelect();
  return NextResponse.json(accounts);
}
