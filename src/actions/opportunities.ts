"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// バリデーションスキーマ
const OpportunitySchema = z.object({
  name: z.string().min(1, "商談名は必須です"),
  accountId: z.string().min(1, "取引先を選択してください"),
  stageName: z.string().min(1, "ステージを選択してください"),
  amount: z.coerce.number().optional().nullable(),
  closeDate: z.string().min(1, "完了予定日は必須です"),
  description: z.string().optional().nullable(),
});

const StageSchema = z.object({
  id: z.string().min(1, "IDは必須です"),
  stageName: z.string().min(1, "ステージは必須です"),
});

export type ActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: { id: string };
};

/**
 * 商談を新規作成する
 */
export async function createOpportunity(
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get("name") as string,
    accountId: formData.get("accountId") as string,
    stageName: formData.get("stageName") as string,
    amount: formData.get("amount") as string,
    closeDate: formData.get("closeDate") as string,
    description: formData.get("description") as string,
  };

  const validated = OpportunitySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const opportunity = await prisma.opportunity.create({
      data: {
        name: validated.data.name,
        accountId: validated.data.accountId,
        stageName: validated.data.stageName,
        amount: validated.data.amount || null,
        closeDate: new Date(validated.data.closeDate),
        description: validated.data.description || null,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${opportunity.id}`);

    return {
      success: true,
      message: "商談を作成しました",
      data: { id: opportunity.id },
    };
  } catch (error) {
    console.error("商談作成エラー:", error);
    return {
      success: false,
      message: "商談の作成に失敗しました",
    };
  }
}

/**
 * 商談を更新する
 */
export async function updateOpportunity(
  id: string,
  formData: FormData
): Promise<ActionState> {
  if (!id) {
    return {
      success: false,
      message: "商談IDが指定されていません",
    };
  }

  const rawData = {
    name: formData.get("name") as string,
    accountId: formData.get("accountId") as string,
    stageName: formData.get("stageName") as string,
    amount: formData.get("amount") as string,
    closeDate: formData.get("closeDate") as string,
    description: formData.get("description") as string,
  };

  const validated = OpportunitySchema.safeParse(rawData);

  if (!validated.success) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // 商談の存在確認
    const existing = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "商談が見つかりません",
      };
    }

    await prisma.opportunity.update({
      where: { id },
      data: {
        name: validated.data.name,
        accountId: validated.data.accountId,
        stageName: validated.data.stageName,
        amount: validated.data.amount || null,
        closeDate: new Date(validated.data.closeDate),
        description: validated.data.description || null,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${id}`);

    return {
      success: true,
      message: "商談を更新しました",
      data: { id },
    };
  } catch (error) {
    console.error("商談更新エラー:", error);
    return {
      success: false,
      message: "商談の更新に失敗しました",
    };
  }
}

/**
 * 担当者別の商談統計を取得
 */
export async function getOpportunityStatsByOwner(
  startDate?: Date,
  endDate?: Date
): Promise<{
  id: string;
  name: string;
  totalCount: number;
  wonCount: number;
  winRate: number;
  totalAmount: number;
}[]> {
  try {
    // 担当者（ownerName）でグループ化
    const whereClause: { ownerName?: { not: null }; closeDate?: { gte?: Date; lte?: Date } } = {
      ownerName: { not: null },
    };

    if (startDate || endDate) {
      whereClause.closeDate = {};
      if (startDate) whereClause.closeDate.gte = startDate;
      if (endDate) whereClause.closeDate.lte = endDate;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      select: {
        ownerId: true,
        ownerName: true,
        isWon: true,
        amount: true,
      },
    });

    // 担当者別に集計
    const statsMap = new Map<
      string,
      {
        id: string;
        name: string;
        totalCount: number;
        wonCount: number;
        totalAmount: number;
      }
    >();

    for (const opp of opportunities) {
      if (!opp.ownerName) continue;

      const existing = statsMap.get(opp.ownerId || opp.ownerName);
      if (existing) {
        existing.totalCount += 1;
        existing.wonCount += opp.isWon ? 1 : 0;
        existing.totalAmount += opp.amount || 0;
      } else {
        statsMap.set(opp.ownerId || opp.ownerName, {
          id: opp.ownerId || opp.ownerName,
          name: opp.ownerName,
          totalCount: 1,
          wonCount: opp.isWon ? 1 : 0,
          totalAmount: opp.amount || 0,
        });
      }
    }

    // winRateを計算して配列に変換、商談数降順でソート
    return Array.from(statsMap.values())
      .map((stat) => ({
        ...stat,
        winRate:
          stat.totalCount > 0
            ? Math.round((stat.wonCount / stat.totalCount) * 100)
            : 0,
      }))
      .sort((a, b) => b.totalCount - a.totalCount);
  } catch (error) {
    console.error("統計データ取得エラー:", error);
    return [];
  }
}

/**
 * 商談のステージを更新する（カンバンボード用）
 */
export async function updateStage(
  id: string,
  stageName: string
): Promise<ActionState> {
  const validated = StageSchema.safeParse({ id, stageName });

  if (!validated.success) {
    return {
      success: false,
      message: "入力内容にエラーがあります",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // 商談の存在確認
    const existing = await prisma.opportunity.findUnique({
      where: { id },
    });

    if (!existing) {
      return {
        success: false,
        message: "商談が見つかりません",
      };
    }

    // ステージに応じてisClosed, isWonを更新
    const isClosed =
      stageName.includes("Closed") ||
      stageName.includes("成立") ||
      stageName.includes("不成立");
    const isWon =
      stageName.includes("Closed Won") || stageName.includes("成立");

    await prisma.opportunity.update({
      where: { id },
      data: {
        stageName,
        isClosed,
        isWon,
      },
    });

    revalidatePath("/opportunities");
    revalidatePath(`/opportunities/${id}`);

    return {
      success: true,
      message: "ステージを更新しました",
      data: { id },
    };
  } catch (error) {
    console.error("ステージ更新エラー:", error);
    return {
      success: false,
      message: "ステージの更新に失敗しました",
    };
  }
}
