import { eq } from "drizzle-orm";
import { db } from "@/db";
import { howls, howlThreads} from "@/db/schema";

export const getHowls = async () => {
  const howls = await db.query.howls.findMany({
    with: {
      user: {
        columns: {
          id: true,
        },
      },
    },
  });
  return howls;
};

export const createHowl = async (content: string, userId: string) => {
  const howl = await db.insert(howls).values({ content, userId }).returning();
  return howl;
};

export const getHowlsForUser = async (userId: string) => {
  const howlsForUser = await db.query.howls.findMany({
    where: eq(howls.userId, userId),
  });
  return howlsForUser;
};

export const getHowlById = async (id: string) => {
  const howl = await db.query.howls.findFirst({
    where: eq(howls.id, id),
    with: {
      user: {
        columns: {
          id: true,
          username: true,
          bio: true,
        },
      },
    },
  });
  return howl;
};

export const createHowlThread = async (content: string, userId: string) => {
  const insertedThread = await db.insert(howlThreads).values({ userId }).returning({id: howlThreads.id});
  await db.insert(howls).values({ content, userId, threadId: insertedThread[0].id });
  const threadWithHowls = await db.query.howlThreads.findFirst({
    where: eq(howlThreads.id, insertedThread[0].id),
    with: {
      howls: true,
    },
  });
  return threadWithHowls;
};

export const getHowlThreads = async () => {
  const threads = await db.query.howlThreads.findMany({
    with: {
      howls: true,
    },
  });
  return threads;
};