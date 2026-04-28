import { stateConn } from "../context";

const keys = {
  forward:  false,
  backward: false,
  left:     false,
  right:    false,
  // jump:  false,   ← add later when you need it
};


function updateMovement() {
  const dx = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  const dy = (keys.forward ? 1 : 0) - (keys.backward ? 1 : 0);
  const conn = stateConn.val;
  conn.reducers.updateUserInput({
    directionX: dx,
    directionY: -dy,
    // jump: false   // ← change when you add jump
  });
}


export function setupInput(){

  window.addEventListener('keydown', e => {
    // Prevent repeating keys from browser (very important!)
    if (e.repeat) return;

    switch (e.code) {
      case 'KeyW': keys.forward  = true; break;
      case 'KeyS': keys.backward = true; break;
      case 'KeyA': keys.left     = true; break;
      case 'KeyD': keys.right    = true; break;
      case 'KeyR':
        console.log('reset');
        const conn = stateConn.val;
        conn.reducers.setPlayerPosition({ x: 0, y: 0 });
        return; // no need to update movement
    }

    updateMovement();
  });

  window.addEventListener('keyup', e => {
    switch (e.code) {
      case 'KeyW': keys.forward  = false; break;
      case 'KeyS': keys.backward = false; break;
      case 'KeyA': keys.left     = false; break;
      case 'KeyD': keys.right    = false; break;
      // KeyR doesn't affect movement → ignore
    }
    updateMovement();
  });

  // Optional: also handle lost focus (very common bug source)
  window.addEventListener('blur', () => {
    // Reset all keys when tab/window loses focus
    Object.keys(keys).forEach(k => keys[k] = false);
    updateMovement();
  });

}
