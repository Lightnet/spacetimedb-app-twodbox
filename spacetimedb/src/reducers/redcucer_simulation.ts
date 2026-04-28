//-----------------------------------------------
// REDUCER ENTITY
//-----------------------------------------------
import { t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
import { simulationTicks } from '../tables/table_simulationtick';
import { computeLocal2DMatrix } from '../helper';
//-----------------------------------------------
// reducer: simualtion
//-----------------------------------------------

//-----------------------------------------------
// UPDATE SIMULATION TICK COLLISION
//-----------------------------------------------
export const update_simulation_tick = spacetimedb.reducer({ arg: simulationTicks.rowType }, (ctx, { arg }) => {
  const now = ctx.timestamp;                    // current wall time
  let dt = 0;                       // we'll compute this
  if (arg.last_tick_timestamp) {        // not first tick
    const elapsed_ms = now.since(arg.last_tick_timestamp).millis;
    // console.log("elapsed_ms: ", elapsed_ms);
    dt = elapsed_ms / 1000.0;       // in seconds
  } else {
    dt = 0.033;                     // first tick guess / fallback
  }

  //---------------------------------------------
  // logic
  //---------------------------------------------
  //curent one player
  // console.log(player);
  // console.log(player.identity.toHexString(), " x:", player.directionX, " y:", player.directionY, " Jump:", player.jump);
  // console.log("player input >>", " x:", player.directionX, " y:", player.directionY, " Jump:", player.jump);
  // console.log(ctx.sender);
  // const input_player = ctx.db.PlayerInput.identity.find(ctx.identity);
  // ctx.db.PlayerInput.iter()
  // console.log("Input Count: ",  ctx.db.PlayerInput.count());
  for (const input_player of ctx.db.userInputs.iter()){
    // console.log(input_player);
    if(!input_player){
      continue;
    }
    const _player = ctx.db.players.identity.find(input_player.identity);
    if(!_player) continue
    if(!_player.entityId) continue;

    const _transform = ctx.db.transform2d.entityId.find(_player.entityId);
    if(!_transform) continue
    // console.log(entity);
    // console.log(entity?.x, " : ", entity?.y);
    
    if(_transform){

      const speed = 5.0; // units per second
      let isMove = false;
      // ── Apply input acceleration ───────────────────────────────────────
      if(input_player.directionX == 0){
        _transform.velocity.x = 0;
      }else{
        _transform.velocity.x += input_player.directionX * speed * dt;
        isMove=true;
      }
      if(input_player.directionY == 0){
        _transform.velocity.y = 0;
      }else{
        _transform.velocity.y += input_player.directionY * speed * dt;
        isMove=true;
      }
      
      // ── Movement prediction + collision ────────────────────────────────────────
      let newPos = {
        x: _transform.position.x + _transform.velocity.x * dt,
        y: _transform.position.y + _transform.velocity.y * dt
      };

      let collided = false;

      // ctx.db.Obstacle3D

      // console.log(ctx.newUuidV7());
      // console.log(ctx.newUuidV4());

      // for (const _body3d of ctx.db.body3d.iter()) {
      //   const otherTransform = ctx.db.transform3d.entityId.find(_body3d.entityId);
      //   if(!otherTransform) continue;
      //   let otherBox;
      //   let otherSphere;
      //   if(_body3d.params.tag == 'Box'){
      //     otherBox = _body3d.params;
      //   }
      //   if(_body3d.params.tag == 'Sphere'){
      //     otherSphere = _body3d.params;
      //   }
      //   if(!otherBox) continue;
      //   const hx = otherBox.value.width / 2;
      //   const hy = otherBox.value.height / 2;
      //   const hz = otherBox.value.depth / 2;
      //   if (!checkAABBOverlap3D(
      //     newPos.x, newPos.y, newPos.z,
      //     otherTransform.position.x, otherTransform.position.y, otherTransform.position.z,
      //     hx, hy, hz
      //   )) {
      //     continue;
      //   }
      //   collided = true;
      //   // ── Compute signed penetration on each axis ───────────────────────
      //   const penX = [
      //     (newPos.x + PLAYER_RADIUS_XZ) - (otherTransform.position.x - hx),   // left/negative x
      //     (otherTransform.position.x + hx) - (newPos.x - PLAYER_RADIUS_XZ),   // right/positive x
      //   ];
      //   const penY = [
      //     (newPos.y + PLAYER_RADIUS_Y)  - (otherTransform.position.y - hy),
      //     (otherTransform.position.y + hy)  - (newPos.y - PLAYER_RADIUS_Y),
      //   ];
      //   const penZ = [
      //     (newPos.z + PLAYER_RADIUS_XZ) - (otherTransform.position.z - hz),
      //     (otherTransform.position.z + hz) - (newPos.z - PLAYER_RADIUS_XZ),
      //   ];

      //   // Pick the smallest **positive** penetration
      //   let minPen = Infinity;
      //   let bestAxis: 'x' | 'y' | 'z' | null = null;
      //   let bestSign = 0; // which side

      //   // X
      //   if (penX[0] > 0 && penX[0] < minPen) { minPen = penX[0]; bestAxis = 'x'; bestSign = -1; }
      //   if (penX[1] > 0 && penX[1] < minPen) { minPen = penX[1]; bestAxis = 'x'; bestSign = +1; }
      //   // Y
      //   if (penY[0] > 0 && penY[0] < minPen) { minPen = penY[0]; bestAxis = 'y'; bestSign = -1; }
      //   if (penY[1] > 0 && penY[1] < minPen) { minPen = penY[1]; bestAxis = 'y'; bestSign = +1; }
      //   // Z
      //   if (penZ[0] > 0 && penZ[0] < minPen) { minPen = penZ[0]; bestAxis = 'z'; bestSign = -1; }
      //   if (penZ[1] > 0 && penZ[1] < minPen) { minPen = penZ[1]; bestAxis = 'z'; bestSign = +1; }

      //   if (bestAxis && minPen < Infinity) {
      //     // ── Correct only one axis (the one with least penetration) ─────
      //     if (bestAxis === 'x') {
      //       newPos.x = _transform.position.x;           // full revert, or: -= minPen * bestSign
      //       _transform.velocity.x *= 0.1;               // strong damping
      //     } else if (bestAxis === 'y') {
      //       newPos.y = _transform.position.y;
      //       _transform.velocity.y *= 0.1;
      //       // If you later add gravity: can set velocity.y = 0 when hitting floor (bestSign < 0)
      //     } else if (bestAxis === 'z') {
      //       newPos.z = _transform.position.z;
      //       _transform.velocity.z *= 0.1;
      //     }
      //   }
      //   // You can continue checking other obstacles (multi-collision)
      //   // or break; if you want to handle only first collision per tick
      // }

      // ── Commit new position ─────────────────────────────────────────────
      _transform.position.x = newPos.x;
      _transform.position.y = newPos.y;

      _transform.localMatrix = computeLocal2DMatrix(_transform);
      _transform.worldMatrix = computeLocal2DMatrix(_transform);




      // if controller is move than update.
      // if(isMove){
        // update player position
        ctx.db.transform2d.entityId.update({ ..._transform });
      // }

    }
  }
    
  // ── Save the time for next call ─────────────────────────────────────────
  ctx.db.simulationTicks.scheduled_id.update({
    ...arg,
    last_tick_timestamp: now,
    // accumulator: arg.accumulator   // if using fixed style
  });

})