//-----------------------------------------------
// REDUCER ENTITY
//-----------------------------------------------
import { t, SenderError } from 'spacetimedb/server';
import spacetimedb from '../module';
//-----------------------------------------------
// reducer: create_player
//-----------------------------------------------

export const create_player = spacetimedb.reducer((ctx)=>{
  const player = ctx.db.players.identity.find(ctx.sender);
  if(!player){
    let nameId = ctx.newUuidV7().toString();
    ctx.db.players.insert({
      identity: ctx.sender,
      entityId: nameId
    });
    ctx.db.entity.insert({
      id: nameId,
      // created_at: ctx.timestamp
    });
    ctx.db.transform2d.insert({
      entityId: nameId,
      position: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
      scale: { x: 1, y: 1, },
      rotation: 0,
      parentId: undefined,
      isDirty: false,
      localMatrix: [
        1, 0, 0, // Column 1 (X-axis)
        0, 1, 0, // Column 2 (Y-axis)
        0, 0, 1  // Column 3 (Translation/Homogeneous)
      ],
      worldMatrix: [
        1, 0, 0, // Column 1 (X-axis)
        0, 1, 0, // Column 2 (Y-axis)
        0, 0, 1  // Column 3 (Translation/Homogeneous)
      ],
    });
  }
});

export const create_box_transform2d_test = spacetimedb.reducer((ctx)=>{

});

export const create_sphere_transform2d_test = spacetimedb.reducer((ctx)=>{

});