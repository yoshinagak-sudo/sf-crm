"use server";

import { prisma } from "@/lib/prisma";

export type AccountOption = {
  id: string;
  name: string;
};

/**
 * セレクトボックス用の取引先リストを取得
 */
export async function getAccountsForSelect(): Promise<AccountOption[]> {
  try {
    const accounts = await prisma.account.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return accounts;
  } catch (error) {
    console.error("取引先取得エラー:", error);
    return [];
  }
}
