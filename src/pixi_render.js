
import { Application, Graphics, Container } from 'pixi.js';

import * as PIXI from 'pixi.js';

import { dbTransform2Ds, objTransform2Ds, stateEntityId, stateMarker, statePixi, stateWorld, stateZoomLevel } from './context';

let zoomLevel = 1;
const zoomSpeed = 0.1;   // adjust for sensitivity
const minZoom = 0.2;
const maxZoom = 5.0;

export async function initPixi() {
  // 1. Create and initialize a PixiJS application
  const app = new Application();
  await app.init({ 
    backgroundColor: 0x1099bb,
    // width: 800, 
    // height: 600,  
    resizeTo: window
  });
  // Caps the frame rate so it never exceeds 60 FPS
  app.ticker.maxFPS = 60; 
  statePixi.val = app;

  document.body.appendChild(app.canvas);

  const world = new Container(); //camera
  app.stage.addChild(world);
  stateWorld.val = world;


  const marker = new Graphics()
    .rect(0, 0, 48, 48) // Create a 100x100 square at (0,0)
    .stroke({ width: 2, color: 0x1f6e00 }); // Draw white lines with 2px thickness
  marker.pivot.set(24, 24);
  stateMarker.val = marker;
  // app.stage.addChild(square);
  world.addChild(marker);


  // Mouse wheel zoom (centered on screen, not mouse)
  app.canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); // prevent page scroll
    let zoomLevel = stateZoomLevel.val;
    console.log(zoomLevel);

    const delta = e.deltaY > 0 ? -zoomSpeed : zoomSpeed; // scroll down = zoom out

    zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel + delta));

    stateZoomLevel.val = zoomLevel;

    // Apply zoom to the world container (your "camera")
    stateWorld.val.scale.set(zoomLevel, zoomLevel);
  });


  // 2. Create a Graphics object
  // const rectangle = new Graphics()
  //   .rect(0, 0, 50, 50) // x, y, width, height
  //   .fill(0xDE3249)         // Set fill color
  //   .stroke({ width: 2, color: 0xffffff }); // Optional border
  // rectangle.pivot.set(25, 25);
  // console.log(rectangle);

  // 3. Add it to the stage
  // app.stage.addChild(rectangle);
  // world.addChild(rectangle);
  // let target = rectangle;

  // const rectangle2 = new Graphics()
  //   .rect(0, 0, 50, 50) // x, y, width, height
  //   .fill(0xDE3249)         // Set fill color
  //   .stroke({ width: 2, color: 0xffffff }); // Optional border
  // world.addChild(rectangle2);

  // 3. To "move the camera" right, move the world left
  //world.x -= 2; 

  // Alternatively: Follow a target by moving the world's pivot
  // world.pivot.set(target.x, target.y);
  // world.position.set(app.screen.width / 2, app.screen.height / 2);

  world.position.set(app.screen.width / 2, app.screen.height / 2);

  const fpsText = new PIXI.Text({text:'FPS: 0', fontSize: 24, fill: 0xffffff });
  fpsText.position.set(0, 28);
  app.stage.addChild(fpsText);

  const yText = new PIXI.Text({text:'y is down (base old screen (x,y))', fontSize: 24, fill: 0xffffff });
  app.stage.addChild(yText);

  function update_marker(){
    if(stateMarker.val){
      if(stateEntityId.val != ""){
        const gmesh = objTransform2Ds.val.get(stateEntityId.val);

        stateMarker.val.position.x = gmesh.position.x;
        stateMarker.val.position.y = gmesh.position.y;
      }
    }
  }

  // Listen for animate update
  app.ticker.add((time) => {
    fpsText.text = `FPS: ${Math.round(app.ticker.FPS)}`;
    // rectangle.rotation += 0.01;
    // console.log("update...");
    update_marker();
  });


}