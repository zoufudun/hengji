import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';
// Compare-and-swap revision protects all allocation caps in one atomic update.
export const workspace = sqliteTable('merit_workspace', {
  id: integer('id').primaryKey(), revision: integer('revision').notNull().default(0), payload: text('payload').notNull(),
});
