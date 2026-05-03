---
title: "Inside the Rendering Engine of a Canvas App"
description: "Rendering isn’t just about drawing shapes. It’s about controlling how much work happens per frame."
date: 2026-05-03
tags: ["frontend", "performance", "canvas"]
series:
  name: "What It Takes to Build a Canvas App"
  order: 2
---

In the previous post, I wrote about how performance issues started showing up as the canvas grew more complex.

The short version: doing more work every frame doesn’t scale.

This post is about what sits underneath that idea, the rendering layer, and how small decisions there affect everything else.

## What “rendering” actually means here

At a high level, rendering sounds simple: take some shapes and draw them on a canvas.

In practice, each frame involves:
- Iterating through all shapes  
- Computing how they should be drawn  
- Executing draw calls on the canvas  

```ts
for (const shape of shapes) {
  drawShape(ctx, shape)
}
```

This loop runs continuously. Even small inefficiencies get amplified quickly.

The goal isn’t just to make rendering fast.  
It’s to make sure each frame does as little work as possible.

## The naive approach

The simplest way to render looks something like this:

```ts
function render(ctx, shapes) {
  ctx.clearRect(0, 0, width, height)

  for (const shape of shapes) {
    const path = buildPath(shape)
    ctx.stroke(path)
  }
}
```

This works when the number of shapes is small.

As the scene grows:
- The loop gets longer  
- Computation per shape adds up  
- Frames start taking longer than they should  

At that point, the system is doing more work than necessary.

## Avoiding repeated computation

One of the first issues was recomputing drawing paths every frame.

For static shapes, this doesn’t change. Yet the system kept rebuilding the same paths repeatedly.

Instead, paths can be computed once and reused:

```ts
const pathCache = new Map()

function getPath(shape) {
  if (!pathCache.has(shape.id)) {
    pathCache.set(shape.id, buildPath(shape))
  }
  return pathCache.get(shape.id)
}
```

```ts
for (const shape of shapes) {
  const path = getPath(shape)
  ctx.stroke(path)
}
```

## Rendering only what’s visible

Another issue was drawing everything, regardless of whether it was visible.

If a shape is outside the viewport, drawing it has no effect but still consumes time.

A simple visibility check avoids that:

```ts
function isInViewport(shape, viewport) {
  return !(
    shape.x + shape.width < viewport.x ||
    shape.x > viewport.x + viewport.width ||
    shape.y + shape.height < viewport.y ||
    shape.y > viewport.y + viewport.height
  )
}
```

```ts
for (const shape of shapes) {
  if (!isInViewport(shape, viewport)) continue

  const path = getPath(shape)
  ctx.stroke(path)
}
```

## Thinking in terms of cost per frame

A useful way to think about rendering is:

Every frame has a cost.  
Your job is to keep that cost predictable.

Without constraints, that cost grows with:
- Number of shapes  
- Complexity of each shape  
- Amount of computation per frame  

The goal isn’t to eliminate work entirely.  
It’s to control how that work scales.

## Closing thoughts

Rendering is easy to get working, but harder to get right.

The difference comes from treating it as a system not just a loop that draws shapes.

Once that perspective changes, the optimizations become more obvious.

In the next post, I’ll look at a specific problem that shows up quickly in canvas apps:

Freehand drawing and why it becomes a bottleneck faster than expected.