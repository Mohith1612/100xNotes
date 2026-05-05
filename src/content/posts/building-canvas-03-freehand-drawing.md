---
title: "Why Freehand Drawing Becomes a Bottleneck"
description: "Freehand input looks simple, but the amount of data it generates can quickly overwhelm your rendering system."
date: 2026-05-05
tags: ["frontend", "performance", "canvas"]
series:
  name: "What It Takes to Build a Canvas App"
  order: 3
---

In the last post I talked about controlling the cost of each frame in a canvas app.

That notion is put to the test in freehand drawing.

It looks easy at first sight: follow the pointer, store points and draw a path.

```ts
points.push({ x, y })
```

But this approach takes a nose-dive quicker than expected.

## The problem with raw input

When a user draws, the system records every pointer movement with one stroke.

This means:
- Dozens of points for strokes short
- Hundreds (or more) for longer ones 

Each one of these becomes part of the shape.

When rendering

- More points = more complex path
- More data = more compute.
- More work done per frame

Most of these points don’t really alter the shape in a useful way.

They exist because input events are captured frequently, not because they are visually necessary.

## Why this becomes a bottleneck

Rendering a path is not free.

Every additional point:
- Adds to path construction  
- Increases memory usage  
- Affects how long each frame takes  

As more strokes are added, this cost accumulates.

The system slows down not because of one expensive operation, but because of many small ones.

## Reducing the data

The goal isn’t to make rendering faster.

It’s to reduce the amount of data being processed.

That means simplifying the path while keeping its visual shape intact.

One common approach is to remove points that don’t significantly affect the curve.

```ts
function simplify(points, epsilon) {
  // remove points that don’t meaningfully change the path
  return reducedPoints
}
```

Instead of rendering the raw input:

```ts
const simplified = simplify(points, epsilon)
drawPath(ctx, simplified)
```

Fewer points means:
- Simpler paths  
- Less computation  
- More predictable rendering cost  

## The tradeoff

Simplification introduces a tradeoff.

If you remove too many points:
- The curve loses detail  
- The stroke looks inaccurate  

If you remove too few:
- You keep unnecessary complexity  

The key is choosing a threshold that balances visual fidelity and performance.

This doesn’t need to be perfect — just consistent.

## Thinking differently about input

One useful shift here is to stop treating input as something that must be preserved exactly.

Instead, think of it as something that can be *interpreted*.

The user doesn’t care about every recorded point.  
They care about how the final stroke looks.

That distinction makes simplification possible.

## Closing thoughts

Freehand drawing isn’t difficult because of rendering alone.

It’s difficult because of the amount of data it produces.

Once that’s reduced, the rest of the system becomes easier to manage.

Performance improves not when you draw faster,  
but when you draw less.

In the next post, I’ll look at how real-time collaboration fits into this system, and why keeping multiple clients in sync is a different kind of challenge.

