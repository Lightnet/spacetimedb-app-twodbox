
import { schema, table, t, SenderError  } from 'spacetimedb/server';


// table: players
export const players = table(
  { name: 'players', public: true },
  {
    identity: t.identity().primaryKey(),
    entityId: t.string().optional(),
  }
);