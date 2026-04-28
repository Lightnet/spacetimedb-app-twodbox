
import { table, t } from 'spacetimedb/server';
import { update_simulation_tick } from '../reducers/redcucer_simulation';

//===============================================
// this has be here due to circle deps
//===============================================
// table: simulationTicks
export const simulationTicks = table({ 
  name: 'simulation_tick',
  // scheduled: (): any => update_simulation_tick
  scheduled: (): any => update_simulation_tick
},{
  scheduled_id: t.u64().primaryKey().autoInc(),
  scheduled_at: t.scheduleAt(),
  // lastTickTs: t.u64(),                   // ctx.timestamp.millis of last tick ???
  last_tick_timestamp:t.timestamp()
});