---
title: Twenty-one cards and a shrinking mystery
description: Play a three-round card trick, then unpack the small recurrence that makes it work.
format: exploration
category: experiments
tags: [combinatorics, algorithms, magic]
widgets: [card-trick]
math: true
sample: true
---

A trick can feel like mind reading even when nobody knows the card you chose. Here is a version with numbered cards: you reveal only a column, three times. Try it before reading the explanation.

{% include widgets/card-trick.html %}

## What the magician actually knows

Deal 21 cards **across** three columns, one row at a time. Ask which column contains the chosen card. Collect the columns from top to bottom, placing the chosen column between the other two. Deal again in the same way.

The numbers are just labels. The trick would work with drawings, names, or ordinary playing cards. What matters is a card’s **position in the stack**.

If its old position is $$p$$, counting from 1 at the top, its row is $$\lceil p/3\rceil$$. Putting its seven-card column in the middle gives the new position

$$
p' = 7 + \left\lceil\frac{p}{3}\right\rceil.
$$

Now track the possibilities instead of the particular card:

| After collecting | Possible positions |
| --- | --- |
| Once | 8 through 14 |
| Twice | 10 through 12 |
| Three times | 11 only |

That last row is the reveal. The card is always the eleventh card of the final stack.

## Check every starting position

This tiny Python experiment checks all 21 possibilities without simulating a spectator:

```python
def collect(position):
    return 7 + (position + 2) // 3  # Integer ceiling of position / 3.

for start in range(1, 22):
    position = start
    for _ in range(3):
        position = collect(position)
    assert position == 11
```

Try tracking card 1 by hand: its positions after collecting are 8, 10, and 11. Card 21 follows 14, 12, and 11. Very different beginnings end at the same place.

## Break the trick on purpose

The collection order is part of the algorithm. Turning a column upside down while gathering it changes the recurrence; placing the chosen column on top changes it too. The browser activity always collects top to bottom and keeps the chosen column in the middle.

For a paper experiment, use nine cards in three columns. What happens after two collections? Then try 15 cards. Does the same number of rounds suffice for every possible starting position?

This is one small example of a useful habit: when a process is complicated, look for a simpler quantity that records what changes. Here, a whole shuffled deck became a single integer.
