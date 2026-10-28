import assert from "node:assert/strict";
import { test } from "node:test";
import { mirrorPoint, sideText, solvePose, type Pose } from "./pose";

test("a left working leg mirrors the studio points across the 1–5 line", () => {
  const left = [1, 2, 3, 4, 5, 6, 7, 8].map((p) => mirrorPoint(p, "L"));
  assert.deepEqual(left, [1, 8, 7, 6, 5, 4, 3, 2]);
  assert.equal(mirrorPoint(2, "R"), 2);
});

test("side tokens name the working and standing sides and mirror points", () => {
  const text = "{W} leg to point {p2}, standing on the {s} leg; {w} arm up, {S} arm down.";
  assert.equal(sideText(text, "R"), "Right leg to point 2, standing on the left leg; right arm up, Left arm down.");
  assert.equal(sideText(text, "L"), "Left leg to point 8, standing on the right leg; left arm up, Right arm down.");
});

test("the left-leg figure is the right-leg figure mirrored, as the audience sees it", () => {
  // Asymmetric poses facing a corner, so a wrong mirror (of the facing, the limbs or the axis) shows up.
  const poses: Pose[] = [
    { facing: 8, legs: { W: "tendu-front", S: "5th-back" }, arms: { W: "2nd", S: "3rd" }, head: "W" },
    { facing: 2, legs: { W: { raise: "back", height: 90 }, S: "5th-back" }, arms: { W: "forward", S: "side" }, lean: 10 },
    { facing: 3, legs: { W: "retire", S: "5th-back" }, arms: { W: "1st", S: "low" }, plie: "demi", twist: 20 },
  ];
  for (const pose of poses) {
    const right = solvePose(pose, "R").screen;
    const left = solvePose(pose, "L").screen;
    for (const joint of Object.keys(right) as (keyof typeof right)[]) {
      const r = right[joint];
      const l = left[joint];
      // Coordinates are rounded to 0.01, so allow one rounding step.
      assert.ok(Math.abs(l.x + r.x) <= 0.011, `${joint} x: ${l.x} should be ${-r.x}`);
      assert.ok(Math.abs(l.y - r.y) <= 0.011, `${joint} y: ${l.y} should be ${r.y}`);
      assert.ok(Math.abs(l.depth - r.depth) <= 0.011, `${joint} depth: ${l.depth} should be ${r.depth}`);
    }
  }
});

test("facing the audience, the right working leg is on the audience's left", () => {
  // From the audience, the dancer's right side is on the viewer's left (negative screen x).
  const pose: Pose = { facing: 1, legs: { W: "tendu-side", S: "1st" }, arms: { W: "low", S: "low" } };
  const { screen } = solvePose(pose, "R");
  assert.ok(screen.WToe.x < -40, `WToe x was ${screen.WToe.x}`);
  assert.ok(screen.SToe.x > -5, `SToe x was ${screen.SToe.x}`);
});
