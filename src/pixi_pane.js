
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import { dbEntities, dbTransform2Ds, stateConn, stateEntityId, stateMaxZoom, stateMinZoom, stateWorld, stateZoomLevel, stateZoomSpeed } from './context';
import van from "vanjs-core";
import { getRotationFromMatrix, getScaleFromMatrix, transformPoint } from './helper_transform2d';

//-----------------------------------------------
// 
//-----------------------------------------------

let deleteEntityBinding;
let addTransform2DBinding;
let removeTransform2DBinding;
let hierarchyParentBinding;
let position2DBinding;
let rotation2DBinding;
let scale2DBinding;
let selectEntityBinding;
let transform2DPropsFolder;

const PARAMS = {
  entityId:'',
  entities:[],
  transform2d:[],
  t2_position:{x:0,y:0},
  t2_rotation:0,
  t2_scale:{x:1,y:1},
}




export function setupPane(){
  const pane = new Pane();

  const zoomFolder = pane.addFolder({
    title:"Zoom"
  })
  zoomFolder.addBinding(stateZoomLevel, 'val',{
    label:"Level",
    readonly:true,
  })
  zoomFolder.addBinding(stateZoomLevel, 'val',{
    label:"Level",
    min:0.1,
    max:5,
  }).on('change',()=>{
    let zoomLevel = stateZoomLevel.val;
    // zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));
    zoomLevel = Math.max(stateMinZoom.val, Math.min(stateMaxZoom.val, zoomLevel ));
    stateZoomLevel.val = zoomLevel;
    // Apply zoom to the world container (your "camera")
    stateWorld.val.scale.set(zoomLevel, zoomLevel);
  });
  zoomFolder.addBinding(stateZoomSpeed, 'val',{
    label:"Speed",
  })
  zoomFolder.addBinding(stateMinZoom, 'val',{
    label:"Min",
  })
  zoomFolder.addBinding(stateMaxZoom, 'val',{
    label:"Max",
  })
//-----------------------------------------------
// ENTITY
//-----------------------------------------------
const entityFolder = pane.addFolder({
  title: 'Entity',
});
entityFolder.addButton({title: 'Create'}).on('click',()=>{
  const conn = stateConn.val;
  conn.reducers.createEntity({})
});
deleteEntityBinding = entityFolder.addButton({title: 'Delete Entity'}).on('click',()=>{
  try {
    if(PARAMS.entityId !== "" ){
      const conn = stateConn.val;
      conn.reducers.deleteEntity({
        entityId:PARAMS.entityId
      });
    }
  } catch (error) {
    console.log("delete entity error!");
  }
})
entityFolder.addButton({title: 'Entities Logs'}).on('click',()=>{
  console.log(PARAMS.entities);
});
deleteEntityBinding.disabled = true;

  let selectEntityBinding;
  let selectId='';
  van.derive(()=>{

    if (stateEntityId.val != selectId) return;
    selectId = stateEntityId.val;
    if(selectEntityBinding) selectEntityBinding.dispose();

    const entities = dbEntities.val;
    // console.log(entities);
    // console.log(entities.size);
    // if(!entities) return;
    const entitiesOptions = Array.from(entities.keys()).map(id => ({
        text: id,
        value: id,
    }));
    // console.log(entitiesOptions);
    selectEntityBinding = entityFolder.addBlade({
      view: 'list',
      label: 'Select Entity:',
      options: entitiesOptions,
      value: '',
    }).on('change',(event)=>{
      selectEntity(event.value)
      // console.log(event.value);
      
    });
  });

function selectEntity(id){
  stateEntityId.val = id;
  console.log(id);
  const entity = dbEntities.val.get(id);
  if(!entity) return;
  console.log(entity);
  // PARAMS.entityId = id;
  // entityLogBinding.disabled = false;
  deleteEntityBinding.disabled = false;

  // console.log(entity);

  // const _transform2d = PARAMS.transform2d.find(e => e.entityId === id);
  console.log(dbTransform2Ds);
  const _transform2d = dbTransform2Ds.val.get(id);
  console.log(_transform2d);
  if(_transform2d){
    const worldPos = transformPoint(_transform2d.localMatrix, 0, 0);
    let worldRotation = getRotationFromMatrix(_transform2d.localMatrix)
    let worldScale = getScaleFromMatrix(_transform2d.localMatrix)

    PARAMS.t2_position.x = worldPos.x;
    PARAMS.t2_position.y = worldPos.y;
    // PARAMS.t2_rotation = radiansToDegree(worldRotation);
    console.log("worldRotation:", worldRotation);
    PARAMS.t2_rotation = worldRotation;
    PARAMS.t2_scale.x = worldScale.x;
    PARAMS.t2_scale.y = worldScale.y;

    if(transform2DPropsFolder) transform2DPropsFolder.refresh();
    if(addTransform2DBinding)addTransform2DBinding.disabled = true;
    if(removeTransform2DBinding)removeTransform2DBinding.disabled = false;

  }else{
    if(addTransform2DBinding)addTransform2DBinding.disabled = false;
    if(removeTransform2DBinding)removeTransform2DBinding.disabled = true;
  }
  if(update_transform2d_parent) update_transform2d_parent();
}

//-----------------------------------------------
// TRANSFORM 2D
//-----------------------------------------------
let transform2DFolder = pane.addFolder({
  title: 'Transform 2D',
});
addTransform2DBinding = transform2DFolder.addButton({title:'Add Transform 2D'}).on('click',()=>{
  const conn = stateConn.val;
  conn.reducers.addEntityTransform2D({
    entityId:stateEntityId.val
  });
})
removeTransform2DBinding = transform2DFolder.addButton({title:'Remove Transform 2D'}).on('click',()=>{
  const conn = stateConn.val;
  conn.reducers.removeEntityTransform2D({
    entityId:stateEntityId.val
  });
})
transform2DFolder.addButton({title:'Transform 2D Log'})

let t2dhierarchyFolder = pane.addFolder({
  title: 'Transform 2D Hierarchy',
});

t2dhierarchyFolder.addButton({title:'Refresh'}).on('click',()=>{
  update_transform2d_parent();
})

hierarchyParentBinding = t2dhierarchyFolder.addBlade({
  view: 'list',
  label: 'Parent:',
  options: [
    {text:"None", value:""}
  ],
  value: '',
}).on('change',(event)=>{
  // selectEntity2D(event.value)
  console.log(event.value);
  // PARAMS.entityId = event.value;
});

function update_transform2d_parent(){
  if(hierarchyParentBinding) hierarchyParentBinding.dispose();

  let parentOptions = [];
  parentOptions.push({
    text:"None", value:""
  });
  for(const _transform2d of PARAMS.transform2d){
    if(_transform2d.entityId != PARAMS.entityId){
      parentOptions.push({text:_transform2d.entityId, value:_transform2d.entityId
    });
    }
  }
  let _parent = "";
  const _transform = PARAMS.transform2d.find(r=>r.entityId == PARAMS.entityId)
  if(_transform && _transform.parentId != ""){
    _parent = _transform.parentId;
  }
  // console.log(parentOptions);
  hierarchyParentBinding = t2dhierarchyFolder.addBlade({
  view: 'list',
  label: 'Parent:',
  options: parentOptions,
  value: _parent,
  }).on('change',(event)=>{
    // selectEntity2D(event.value)
    console.log(event.value);
    // PARAMS.entityId = event.value;
    set_transform2d_parent(event.value);
  });
}

function set_transform2d_parent(id){
  const conn = stateConn.val;
  conn.reducers.setTransform2DParent({
    entityId:stateEntityId.val,
    parentId:id // parentId
  })
}

transform2DPropsFolder = pane.addFolder({
  title: 'Transform 2D Props',
});

position2DBinding = transform2DPropsFolder.addBinding(PARAMS, 't2_position').on('change',()=>{
  // console.log("change position")
  // conn.reducers.setTransform2DPosition({
  //   entityId:stateEntityId.val,
  //   x:PARAMS.t2_position.x,
  //   y:PARAMS.t2_position.y
  // });

  const conn = stateConn.val;
  conn.reducers.setTransform2D({
    entityId:stateEntityId.val,
    position:PARAMS.t2_position,
    rotation:PARAMS.t2_rotation,
    scale:PARAMS.t2_scale,
  });
  // conn.reducers.updateAllTransform2D();
})
rotation2DBinding = transform2DPropsFolder.addBinding(PARAMS, 't2_rotation').on('change',()=>{
  // conn.reducers.setTransform2DRotation({
  //   entityId:stateEntityId.val,
  //   rotation: PARAMS.t2_rotation
  // });
  const conn = stateConn.val;
  conn.reducers.setTransform2D({
    entityId:stateEntityId.val,
    position:PARAMS.t2_position,
    rotation:PARAMS.t2_rotation,
    scale:PARAMS.t2_scale,
  });
  // conn.reducers.updateAllTransform2D();
})
scale2DBinding = transform2DPropsFolder.addBinding(PARAMS, 't2_scale').on('change',()=>{
  // conn.reducers.setTransform2DScale({
  //   entityId:stateEntityId.val,
  //   x:PARAMS.t2_scale.x,
  //   y:PARAMS.t2_scale.y
  // })
  // conn.reducers.updateAllTransform2D();
  const conn = stateConn.val;
  conn.reducers.setTransform2D({
    entityId:stateEntityId.val,
    position:PARAMS.t2_position,
    rotation:PARAMS.t2_rotation,
    scale:PARAMS.t2_scale,
  });
})

const debugFolder = pane.addFolder({
  title: 'Debug',
});

debugFolder.addButton({title:'Clear Transform2Ds'}).on('click',()=>{
  const conn = stateConn.val;
  conn.reducers.clearAllTransforms();
})

}