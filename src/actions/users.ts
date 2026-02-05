"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// バリデーションスキーマ
const registerSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上で入力してください"),
  name: z.string().min(1, "名前は必須です"),
});

const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(1, "パスワードを入力してください"),
});

export type UserActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  data?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
};

/**
 * ユーザー登録
 */
export async function registerUser(
  email: string,
  password: string,
  name: string
): Promise<UserActionState> {
  const validated = registerSchema.safeParse({ email, password, name });

  if (!validated.success) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // メールアドレスの重複確認
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (existingUser) {
      return {
        success: false,
        message: "このメールアドレスは既に登録されています",
        errors: { email: ["このメールアドレスは既に登録されています"] },
      };
    }

    // パスワードのハッシュ化
    const hashedPassword = await bcrypt.hash(validated.data.password, 12);

    // ユーザー作成
    const user = await prisma.user.create({
      data: {
        email: validated.data.email,
        password: hashedPassword,
        name: validated.data.name,
      },
    });

    return {
      success: true,
      message: "ユーザーを登録しました",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("ユーザー登録エラー:", error);
    return {
      success: false,
      message: "ユーザーの登録に失敗しました",
    };
  }
}

/**
 * ログイン認証
 */
export async function validateUser(
  email: string,
  password: string
): Promise<UserActionState> {
  const validated = loginSchema.safeParse({ email, password });

  if (!validated.success) {
    return {
      success: false,
      message: "入力内容を確認してください",
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    // ユーザー取得
    const user = await prisma.user.findUnique({
      where: { email: validated.data.email },
    });

    if (!user) {
      return {
        success: false,
        message: "メールアドレスまたはパスワードが正しくありません",
      };
    }

    // パスワード検証
    const isValid = await bcrypt.compare(validated.data.password, user.password);

    if (!isValid) {
      return {
        success: false,
        message: "メールアドレスまたはパスワードが正しくありません",
      };
    }

    return {
      success: true,
      message: "認証に成功しました",
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  } catch (error) {
    console.error("認証エラー:", error);
    return {
      success: false,
      message: "認証に失敗しました",
    };
  }
}

/**
 * メールアドレスでユーザーを取得
 */
export async function getUserByEmail(
  email: string
): Promise<{
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
} | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error("ユーザー取得エラー:", error);
    return null;
  }
}

/**
 * 全ユーザー一覧を取得（セレクトボックス用）
 */
export async function getUsersForSelect(): Promise<
  { id: string; name: string; email: string }[]
> {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return users;
  } catch (error) {
    console.error("ユーザー一覧取得エラー:", error);
    return [];
  }
}
