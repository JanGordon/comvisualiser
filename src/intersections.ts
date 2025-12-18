import { Vector2 } from "./utils";

export function distanceFromCircleToLine(
  center: Vector2,
  radius: number,
  p1: Vector2,
  p2: Vector2
): number {
  const A = p2.y - p1.y;
  const B = p1.x - p2.x;
  const C = -(A * p1.x + B * p1.y);

  const distanceCenterToLine =
    Math.abs(A * center.x + B * center.y + C) /
    Math.sqrt(A * A + B * B);

  return Math.max(0, distanceCenterToLine - radius);
}