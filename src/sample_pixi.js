import { stateConn, networkStatus, userIdentity, dbTransform2Ds, stateWorld, statePixi, objTransform2Ds, stateZoomLevel, stateZoomSpeed, stateMinZoom, stateMaxZoom } from './context';
import { DbConnection, tables } from './module_bindings';
import { Pane } from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.5/dist/tweakpane.min.js';
import van from "vanjs-core";
import { Modal, MessageBoard } from "vanjs-ui";

// import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import { ViewportGizmo } from "three-viewport-gizmo";
import { initPixi } from './pixi_render';
import { setupDBEntity } from './db/db_entity';
import { Graphics } from 'pixi.js';
import { setupPane } from './pixi_pane';
import { transformPoint } from './helper_transform2d';
import { setupDBTransform2Ds } from './pixi/transform2d';
import { setupInput } from './pixi/input';
// import { setupInput } from './pixi/input';

const {style, div, input, textarea, button, span, img, label, p, table, tr, td, tbody } = van.tags;
const HOST = 'ws://localhost:3000';
const DB_NAME = 'spacetimedb-app-twodbox';
const TOKEN_KEY = `${HOST}/${DB_NAME}/auth_token`;

const my_css = style(`
body{
  margin: 0;
  overflow: hidden;
  background-color:gray;
}  
`);
van.add(document.head, my_css);
const loadingscreen = div({style:`
  display: flex; 
  flex-direction: column;
  justify-content: center; 
  align-items: center;
  height: 100vh;
  `},
  div(
    label("Loading")
  ),
  div(
    label(()=>networkStatus.val),
  )
);
van.add(document.body, loadingscreen);

networkStatus.val = 'Initial connection...';

//-----------------------------------------------
// 
//-----------------------------------------------
function setupNetwork(){
  const conn = DbConnection.builder()
    .withUri(HOST)
    .withDatabaseName(DB_NAME)
    .withToken(localStorage.getItem(TOKEN_KEY) || undefined)
    .onConnect(async (conn, identity, token) => {
      localStorage.setItem(TOKEN_KEY, token);
      console.log('connnect');
      networkStatus.val = 'Connected';
      stateConn.val = conn;
      // console.log("identity: ", identity);
      console.log("identity: ", identity.toHexString());
      // console.log("conn: ", conn);
      userIdentity.val = identity;
      setup();
      document.body.removeChild(loadingscreen);
    })
    .onDisconnect(() => {
      console.log('Disconnected from SpacetimeDB');
      networkStatus.val = 'Disconnected';
    })
    .onConnectError((_ctx, error) => {
      console.error('Connection error:', error);
      networkStatus.val = 'Connection error!';
      // statusEl.textContent = 'Error: ' + error.message;
      // statusEl.style.color = 'red';
    })
    .build();
}
//-----------------------------------------------
// 
//-----------------------------------------------

function create_box_test(){
  const world = stateWorld.val;
  const app = statePixi.val;
  // console.log(world);
  // 2. Create a Graphics object
  const rectangle = new Graphics()
    .rect(0, 0, 32, 32) // x, y, width, height
    .fill(0xDE3249)         // Set fill color
    .stroke({ width: 2, color: 0xffffff }); // Optional border
  rectangle.pivot.set(16, 16);
  console.log(rectangle);
  world.addChild(rectangle);
}

export function create_box(row){
  console.log(row);
  const world = stateWorld.val;
  const app = statePixi.val;
  // console.log(world);
  // 2. Create a Graphics object

  const worldPos = transformPoint(row.worldMatrix, 0, 0);
  console.log(worldPos);

  const rectangle = new Graphics()
    .rect(0, 0, 32, 32) // x, y, width, height
    .fill(0xDE3249)         // Set fill color
    .stroke({ width: 2, color: 0xffffff }); // Optional border
  rectangle.pivot.set(16, 16);
  rectangle.position.set(
      worldPos.x,
      worldPos.y
    );
  // console.log(rectangle);
  world.addChild(rectangle);

  objTransform2Ds.val.set( row.entityId, rectangle)
}

export function update_box(row){
  console.log("update_box: ",row);
  const t2 = objTransform2Ds.val.get(row.entityId);
  if(t2){
    const worldPos = transformPoint(row.worldMatrix, 0, 0);
    t2.position.set(
      worldPos.x,
      worldPos.y
    );
  }
}

//-----------------------------------------------
// SETUP
//-----------------------------------------------
async function setup(){
  await initPixi();
  setupDBEntity();
  setupDBTransform2Ds();
  // create_box_test();
  setupPane();
  setupInput();
}

setupNetwork();