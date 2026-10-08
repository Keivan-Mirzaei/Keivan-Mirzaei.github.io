// Unit sphere centred at (0, 0, 1); tangent plane z = 0.
export const NORTH = [0, 0, 2];
// A Schlegel drawing of the cube. The last face is the outside face.
export const GRAPH_VERTICES = [[-1.5,-1.5],[1.5,-1.5],[1.5,1.5],[-1.5,1.5],[-.55,-.55],[.55,-.55],[.55,.55],[-.55,.55]];
export const GRAPH_EDGES = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
export const GRAPH_FACES = [[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[3,2,1,0]];
export const INITIAL_POINT = [.15, -1.1];

export function toSphere([x, y]) {
  if (!Number.isFinite(x) || !Number.isFinite(y)) throw new RangeError('Use finite plane coordinates.');
  // Scaling avoids overflow even for very distant finite points.
  const scale = Math.max(2, Math.abs(x), Math.abs(y));
  const a = x / scale, b = y / scale, c = 2 / scale, d = a*a + b*b + c*c;
  return [2*c*a/d, 2*c*b/d, 2*(a*a+b*b)/d];
}
export function toPlane([x, y, z]) {
  return z === 2 ? null : [2*x/(2-z), 2*y/(2-z)];
}
export function edgePoint(edge, t) {
  const [i,j] = GRAPH_EDGES[edge], a = GRAPH_VERTICES[i], b = GRAPH_VERTICES[j];
  return a.map((x,k) => x + t*(b[k]-x));
}
export function sampleEdge(edge, steps = 96) {
  return Array.from({length: steps+1}, (_,i) => toSphere(edgePoint(edge,i/steps)));
}
export function nearestGraphPoint([x,y]) {
  let best;
  GRAPH_EDGES.forEach(([i,j],edge) => {
    const a=GRAPH_VERTICES[i], b=GRAPH_VERTICES[j], dx=b[0]-a[0], dy=b[1]-a[1];
    const t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));
    const point=edgePoint(edge,t), distance=Math.hypot(point[0]-x,point[1]-y);
    if (!best || distance<best.distance) best={point,distance,edge};
  });
  return best;
}
export function nearestVertex(point) {
  let best=0, distance=Infinity;
  GRAPH_VERTICES.forEach((p,i) => {
    const d=Math.hypot(p[0]-point[0],p[1]-point[1]);
    if(d<distance) { best=i; distance=d; }
  });
  return best;
}
export function faceAt([x,y]) {
  for(let face=0;face<GRAPH_FACES.length-1;face++) {
    const polygon=GRAPH_FACES[face].map(i=>GRAPH_VERTICES[i]);
    if(polygon.every((a,i)=> {
      const b=polygon[(i+1)%polygon.length];
      return (b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0])>=-1e-12;
    })) return face;
  }
  return GRAPH_FACES.length-1;
}

// Tessellate each face in the plane BEFORE projecting. The exterior face has
// radial rings ending at N, so it closes the sphere without inventing a face.
export function faceTriangles(face, spherical = false, steps = 32) {
  const points=[], map=p=>spherical?toSphere(p):[...p,.001];
  const triangle=(a,b,c)=>points.push(...a,...b,...c);
  if(face<5) {
    const [a,b,c,d]=GRAPH_FACES[face].map(i=>GRAPH_VERTICES[i]);
    const point=(u,v)=>map(a.map((x,k)=>(1-v)*((1-u)*x+u*b[k])+v*((1-u)*d[k]+u*c[k])));
    for(let i=0;i<steps;i++) for(let j=0;j<steps;j++) {
      const p=point(i/steps,j/steps), q=point((i+1)/steps,j/steps);
      const r=point((i+1)/steps,(j+1)/steps), s=point(i/steps,(j+1)/steps);
      triangle(p,q,r); triangle(p,r,s);
    }
  } else {
    const boundary=Array.from({length:steps*4},(_,i)=>edgePoint(Math.floor(i/steps),(i%steps)/steps));
    const ring=(i,t)=> {
      const [x,y]=boundary[i%boundary.length], radius=Math.hypot(x,y);
      if(spherical) {
        if(t===1) return [...NORTH];
        const angle=Math.atan(radius/2)*(1-t)+Math.PI/2*t;
        return [Math.sin(2*angle)*x/radius,Math.sin(2*angle)*y/radius,1-Math.cos(2*angle)];
      }
      const r=radius+(3-radius)*t;
      return [x*r/radius,y*r/radius,.001];
    };
    for(let i=0;i<boundary.length;i++) for(let j=0;j<steps;j++) {
      const a=ring(i,j/steps), b=ring(i+1,j/steps), c=ring(i+1,(j+1)/steps), d=ring(i,(j+1)/steps);
      triangle(a,b,c); if(!spherical || j<steps-1) triangle(a,c,d);
    }
  }
  return points;
}
