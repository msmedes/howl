import type { Database } from "@howl/db";
import { models } from "@howl/db/schema";
import { eq } from "drizzle-orm";

export async function getModels({ db }: { db: Database }) {
	return db.query.models.findMany();
}

export async function getModelByName({
	db,
	name,
}: {
	db: Database;
	name: string;
}) {
	return db.query.models.findFirst({ where: eq(models.name, name) });
}

export async function createModel({
	db,
	model,
}: {
	db: Database;
	model: { name: string; provider: string };
}) {
	return db.insert(models).values(model).returning();
}
