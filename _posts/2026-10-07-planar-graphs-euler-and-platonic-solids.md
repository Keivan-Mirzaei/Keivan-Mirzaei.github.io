---
layout: post
title: "From planar graphs to the five Platonic solids"
description: "Count vertices, edges, and faces; add a point at infinity; then discover why there are exactly five regular convex polyhedra."
date: 2026-10-07 12:00:00 -0600
permalink: /notes/planar-graphs-euler-and-platonic-solids/
format: exploration
image: /assets/images/exploration-thumbnails/planar-graphs-euler-and-platonic-solids.svg
image_alt: A tetrahedron's triangular faces divide a sphere into four faces.
tags: [geometry, graph theory, topology]
math: true
widgets: [stereographic-projection]
---

**How can a drawing of dots and lines tell us every possible regular convex polyhedron?** The connection passes through a sphere—and through the idea that a sphere is a plane with one extra point, at infinity.

We will begin with a finite, connected graph drawn in the plane. Its **vertices** are dots and its **edges** are curves joining them. Edges meet only at their endpoints: there are no crossings, overlaps, or edges passing through other vertices. A graph that admits such a drawing is **planar**; a particular drawing is a **plane graph**.

Write $$V$$ for the number of vertices, $$E$$ for the number of edges, and $$F$$ for the number of **faces**: the connected parts of the plane left after removing the drawing. **The outside face counts too.**

## A count that survives changing the drawing

Draw a square, then add a diagonal. The square has $$V=4$$, $$E=4$$, and $$F=2$$: its inside and outside faces. The diagonal leaves the vertices alone, adds one edge, and splits one face into two. Now $$E=5$$ and $$F=3$$. In both drawings,

$$
V-E+F=2.
$$

Is that an accident of the square, or does every connected plane graph have this balance?

<figure id="tree-and-faces" class="problem-figure problem-figure-wide">
  <img src="{{ '/assets/figures/euler-tree-and-regions.svg' | relative_url }}" alt="Three drawings on the same four vertices: a tree with three edges and one face; a square with four edges and two faces; a square with a diagonal, five edges, and three faces. The outside face is included in every count." loading="lazy">
  <figcaption>One face, two faces, three faces. Each restored edge splits a face in two; the outside face is included throughout.</figcaption>
</figure>

To examine the balance, keep all the vertices but choose just enough edges to connect them without a cycle. Such a **spanning tree** always exists: repeatedly delete an edge from a cycle, which preserves connectivity, until no cycles remain.

A tree with $$V$$ vertices has $$V-1$$ edges. One way to see this is to remove an endpoint and its single incident edge repeatedly, until only one vertex remains. Its complement is connected, so it has exactly one face. Its count is

$$
V-(V-1)+1=2.
$$

Now restore the deleted edges in their original positions. Each edge has both endpoints already connected. It completes a cycle and splits one existing face into two. Thus $$E$$ and $$F$$ both increase by one, leaving the balance unchanged. This proves **Euler's formula for connected plane graphs**:

<div id="planar-euler" markdown="1">

$$
V-E+F=2.
\tag{1}
$$

</div>

The connectedness assumption matters. For $$C$$ connected components, a spanning forest has $$V-C$$ edges and one face. Restoring the other edges gives $$V-E+F=1+C$$.

## Which space has this Euler characteristic?

The **Euler characteristic** is an alternating count of cells. For a finite subdivision of a surface into vertices, edges, and disk-shaped faces, it is

$$
\chi=V-E+F.
$$

Subdividing an edge adds one vertex and one edge. Dividing a face adds one edge and one face. Neither operation changes the count. More generally, the Euler characteristic depends on the topology of the space, rather than on a particular subdivision.

The plane contracts continuously to a point: move every $$(x,y)$$ to $$((1-t)x,(1-t)y)$$ as $$t$$ runs from zero to one. Euler characteristic is preserved by such a contraction, so **$$\chi(\mathbb R^2)=1$$**. A closed disk also contracts to a point; a triangular disk has $$3-3+1=1$$.

Why does [the plane graph formula (1)](#planar-euler) give two? Its outside face is counted once, but it is not a disk-shaped cell of the plane. Outside a square, for example, the face surrounds a hole. The drawing and all its faces therefore do not give a finite cell subdivision of the plane. The sphere will show which space this count describes.

## The sphere is the plane with one point at infinity

Choose a point $$N$$ on a sphere. **Stereographic projection** identifies every other point $$P$$ of the sphere with a point of a plane: continue the line from $$N$$ through $$P$$ until it reaches the plane tangent to the sphere at the opposite pole.

This is a continuous correspondence with a continuous inverse. As a point travels farther and farther away in the plane, its corresponding point on the sphere approaches $$N$$. Every direction of escape approaches that same missing point. In this precise sense,

$$
S^2\cong\mathbb R^2\cup\{\infty\}.
$$

The symbol $$\cong$$ here means *homeomorphic*: the spaces have the same topology. We are adding one point, rather than a circle of different directions at infinity. This construction is the **one-point compactification** of the plane.

Explore **From the plane to the sphere** below. Drag the orange point $$Q$$ freely on the plane and watch its image $$P$$ move on the sphere. Settings lets you show either graph and highlight matching vertices, edges, or faces. The drawing is the graph of a cube: $$8-12+6=2$$ in both views.

{% include widgets/stereographic-projection.html id='point-at-infinity' %}

The orange points $$Q$$ and $$P$$ lie on the same straight line through $$N$$. When $$Q$$ moves farther from the point of tangency, $$P$$ approaches $$N$$. Every finite $$Q$$ corresponds to a point other than $$N$$; $$N$$ itself represents infinity.

Carry the plane graph onto the sphere. Its vertices, edges, and faces remain distinct, and there are no new crossings. The outside face acquires $$N$$ and becomes a disk-shaped face on the sphere. **No face is added:** the six faces of the cube graph become six spherical faces. The face containing $$N$$ has the same status as every other face.

Thus a connected graph on the sphere satisfies

<div id="spherical-euler" markdown="1">

$$
\begin{gathered}
V-E+F=2,\\
\chi(S^2)=2.
\end{gathered}
\tag{2}
$$

</div>

We can also go backwards: choose $$N$$ inside any spherical face, away from the graph, and project onto the plane. The chosen face becomes the outside face, and [the plane graph formula (1)](#planar-euler) applies. This proves the spherical formula for every connected graph drawn on the sphere.

For the sphere, the graph and its disk-shaped faces give a finite cell subdivision, so the count is its Euler characteristic. Adding infinity fills the outside face's puncture without changing $$V$$, $$E$$, or $$F$$. This explains why the plane graph formula gives the sphere's Euler characteristic, two, while the plane itself has Euler characteristic one.

## Put a polyhedron on the sphere

Take a **convex polyhedron** and choose a point inside it. Project its boundary radially onto a surrounding sphere centred at that point. Convexity ensures that every ray meets the boundary exactly once, so the projection preserves the vertices, edges, and faces. The boundary is a subdivided sphere, and [equation (2)](#spherical-euler) gives

$$
V-E+F=2.
$$

Here we count the **surface** of the polyhedron. Its filled three-dimensional interior is a different space, with Euler characteristic one.

For a **regular convex polyhedron**, all faces are congruent regular polygons and the same number of faces meet at every vertex. These are the **Platonic solids**. Let

- $$p\geq3$$ be the number of sides of each face;
- $$q\geq3$$ be the number of faces meeting at each vertex.

Count the edges from the faces. Each face contributes $$p$$ edge incidences, and every edge belongs to exactly two faces. Count them again from the vertices: $$q$$ edges meet at each vertex, and every edge has two endpoints. Therefore

$$
pF=2E,\qquad qV=2E.
$$

Substitute $$F=2E/p$$ and $$V=2E/q$$ into Euler's formula:

$$
\frac{2E}{q}-E+\frac{2E}{p}=2.
$$

Since $$E>0$$, this forces

<div id="platonic-inequality" markdown="1">

$$
\frac1p+\frac1q>\frac12,
\tag{3}
$$

</div>

or, equivalently,

$$
(p-2)(q-2)<4.
$$

The two factors are positive integers. Their product can only be one, two, or three. The complete list of ordered pairs is therefore

$$
\begin{gathered}
(p,q)=(3,3),(4,3),(3,4),\\
(5,3),(3,5).
\end{gathered}
$$

This is the decisive restriction: there can be only five types of regular convex polyhedron.

## The five possibilities, and why they exist

The same equations determine all their counts:

$$
\begin{gathered}
E=\frac{2pq}{2p+2q-pq},\\
V=\frac{2E}{q},\qquad F=\frac{2E}{p}.
\end{gathered}
$$

<div id="five-solids" markdown="1">

| Solid | $$(p,q)$$ | $$V$$ | $$E$$ | $$F$$ |
| --- | --- | ---: | ---: | ---: |
| Tetrahedron | $$(3,3)$$ | 4 | 6 | 4 |
| Cube | $$(4,3)$$ | 8 | 12 | 6 |
| Octahedron | $$(3,4)$$ | 6 | 12 | 8 |
| Dodecahedron | $$(5,3)$$ | 20 | 30 | 12 |
| Icosahedron | $$(3,5)$$ | 12 | 30 | 20 |

</div>

<figure id="platonic-solids" class="problem-figure problem-figure-wide">
  <img src="{{ '/assets/figures/euler-platonic-solids.svg' | relative_url }}" alt="The five regular convex polyhedra: tetrahedron, cube, octahedron, dodecahedron, and icosahedron. Visible faces are shaded and hidden edges are dashed." loading="lazy">
  <figcaption>The five Platonic solids. Dashed edges lie behind the visible surface.</figcaption>
</figure>

An allowed pair is a necessary condition; we should also know that each candidate can be built. A cube supplies two immediate constructions. Four alternate cube corners form a regular tetrahedron: all six distances are equal. The six face centres of a cube form a regular octahedron.

For the icosahedron, a concrete construction uses the golden ratio $$\varphi=(1+\sqrt5)/2$$. Take the twelve points

$$
\begin{gathered}
(0,\pm1,\pm\varphi),\\
(\pm1,\pm\varphi,0),\\
(\pm\varphi,0,\pm1),
\end{gathered}
$$

with the signs chosen independently in each row. Their convex hull has twenty equilateral triangular faces of edge length two, with five triangles meeting at every vertex. This realizes $$(p,q)=(3,5)$$.

Finally, join the centres of adjacent icosahedron faces. The five centres surrounding each old vertex form a regular pentagon; the resulting **dual polyhedron** is a regular dodecahedron. Duality exchanges vertices with faces and swaps $$p$$ with $$q$$. It also pairs the cube with the octahedron, while the tetrahedron is its own dual.

All five possibilities exist. Euler's formula excludes every other pair, completing the classification of the regular convex polyhedra.

## What happens at the boundary of the inequality?

Suppose equality held in [the restriction (3)](#platonic-inequality): $$1/p+1/q=1/2$$. The integer possibilities would be $$(3,6)$$, $$(4,4)$$, and $$(6,3)$$. They describe the familiar regular tilings of the plane by triangles, squares, and hexagons.

There is a geometric reason for the same boundary. A regular $$p$$-gon has interior angle $$\pi(1-2/p)$$. At a vertex of a convex solid, the $$q$$ face angles must total less than $$2\pi$$, leaving room for the surface to bend. This is exactly

$$
q\pi\left(1-\frac2p\right)<2\pi,
$$

which rearranges to [the Euler restriction (3)](#platonic-inequality). At equality the polygons fit flat. Beyond it they cannot meet at a convex vertex. The global count on the sphere has recovered the local condition for a corner.

For further reading, Linda Green's [notes on Euler characteristic](https://lindagreen.web.unc.edu/wp-content/uploads/sites/5262/2020/12/Section5_EulerCharacteristic.pdf) explore planar and spherical drawings, while the University of British Columbia's [lecture on Euler's formula and the Platonic solids](https://www.cs.ubc.ca/~will/516/notes/lec22.pdf) develops the polyhedral connection.
