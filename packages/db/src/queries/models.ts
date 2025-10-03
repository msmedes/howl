import type { Database } from "@howl/db";

export async function getModels({ db }: { db: Database }) {
	return db.query.models.findMany();
}
