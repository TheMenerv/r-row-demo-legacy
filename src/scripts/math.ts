// Return distance between 2 points
export const dist = (
  point1: { x: number; y: number },
  point2: { x: number; y: number }
) => {
  return Math.abs(
    Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    )
  );
};
