import { ScheduleAt } from "spacetimedb";
import spacetimedb from "./module";

//-----------------------------------------------
// init
//-----------------------------------------------
export const init = spacetimedb.init(ctx => {
  console.log("=============== INIT SPACETIMEDB APP NAME =========");
  ctx.db.simulationTicks.insert({
    scheduled_id: 0n,
    // scheduled_at: ScheduleAt.interval(5_000_000n),// Schedule to run every 5 seconds (5,000,000 microseconds)
    scheduled_at: ScheduleAt.interval(33_333n), // 30 tick sec???
    // lastTickTs: 0n,
    last_tick_timestamp: ctx.timestamp,       // start "now"
  });
});

//-----------------------------------------------
// onconnect
//-----------------------------------------------
export const onConnect = spacetimedb.clientConnected(ctx => {
  // const user = ctx.db.users.identity.find(ctx.sender);
  // console.log("SENDER: ",ctx.sender);
  // if (user) {
  //   ctx.db.users.identity.update({ ...user, online: true });
  // } else {
  //   console.log("test");
  //   // New user → generate a unique random name
  //   let name: string;
  //   // name = generateRandomString(ctx, 24);
  //   name = String( ctx.newUuidV7() ).replaceAll("-","");
  //   // let check = ctx.db.user.name.find(name);
  //   // console.log("check: ",check)
  //   // do {
  //   //   name = generateRandomString(ctx, 24);
  //   //   console.log("NAME:", name);
  //   // } while (ctx.db.user.name.find(name) !== null);   // Check if name exists
  //   ctx.db.users.insert({
  //     identity: ctx.sender,
  //     // name: generateRandomString(ctx, 24),
  //     name: name,
  //     online: true,
  //   });
  // }
});
//-----------------------------------------------
// onDisconnect
//-----------------------------------------------
export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  // const user = ctx.db.users.identity.find(ctx.sender);
  // if (user) {
  //   ctx.db.users.identity.update({ ...user, online: false });
  // } else {
  //   console.warn(
  //     `Disconnect event for unknown user with identity ${ctx.sender}`
  //   );
  // }
});