import { db } from "@/db";
import { howls } from "@/db/schema";

export const getHowls = async () => {
  const howls = await db.query.howls.findMany();
  return howls;
};

export const createHowl = async (content: string, userId: string) => {
  const howl = await db.insert(howls).values({ content, userId }).returning();
  return howl;
};