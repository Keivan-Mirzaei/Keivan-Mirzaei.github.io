---
title: When addition forgets a one
description: A short numerical experiment about rounding, grouping, and the gap between real arithmetic and floating-point arithmetic.
format: exploration
category: code
tags: [Python, numerical analysis, floating point]
sample: true
---

Real-number addition is associative. Floating-point addition can give different answers when you change the grouping.

Try this in Python with its usual binary64 floats:

```python
a = float(2**53)
b = 1.0
c = -a

print((a + b) + c)  # 0.0
print(a + (b + c))  # 1.0
```

At this size, adjacent representable floats above a are two units apart. The exact value a + 1 lies halfway between them; rounding to nearest with ties to even rounds it back to a. Subtracting a then gives zero.

In the other grouping, 1 − a is exactly representable. Adding a gives one. The order changes where information is lost.

## A practical follow-up

```python
from math import fsum

values = [1e16, 1.0, -1e16]
print(fsum(values))  # 1.0
```

`math.fsum` tracks partial sums to reduce this kind of loss. It does not make every floating-point operation exact, but it is useful when small contributions would otherwise disappear in a sum.

Before increasing precision, decide what accuracy the problem requires. A numerical result is more informative when accompanied by a scale, an error tolerance, or a comparison with a known answer.

For a longer explanation with worked examples, see the [Python tutorial on floating-point arithmetic](https://docs.python.org/3/tutorial/floatingpoint.html).
