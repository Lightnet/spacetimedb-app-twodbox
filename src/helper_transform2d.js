

export function transformPoint(m, x, y) {
  return {
    x: m[0]*x + m[1]*y + m[2],
    y: m[3]*x + m[4]*y + m[5]
  };
}

export function getRotationFromMatrix(m) {
  // Linear part: [ m[0]  m[1] ]
  //               [ m[3]  m[4] ]

  // Use atan2 on the Y-axis vector after transform (more stable)
  const angleRad = Math.atan2(m[3], m[0]);   // sin / cos from first column

  return angleRad * (180 / Math.PI);
}

export function getScaleFromMatrix(m) {
  const scaleX = Math.hypot(m[0], m[3]);   // length of transformed X axis
  const scaleY = Math.hypot(m[1], m[4]);   // length of transformed Y axis

  return { x: scaleX, y: scaleY };
}