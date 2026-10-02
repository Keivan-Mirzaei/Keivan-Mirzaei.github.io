const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { const t=clamp(x); return t*t*(3-2*t); };
function union(a,b,k) {
  if(!k)return Math.min(a,b);
  const h=Math.max(k-Math.abs(a-b),0)/k;
  return Math.min(a,b)-h*h*k/4;
}
function cylinder(x,y,z,cx,r,h,rounding=0) {
  const a=Math.hypot(x-cx,z)-(r-rounding),b=Math.abs(y)-(h-rounding);
  return Math.hypot(Math.max(a,0),Math.max(b,0))+Math.min(Math.max(a,b),0)-rounding;
}

// The ceramic is a capped cylinder with an open, bottomed bowl and a small
// curved handle. A continuous signed field rounds the body into the left half
// of a torus while widening the handle into its right half. The bowl shrinks
// away as an indentation; the handle's through-hole stays open throughout.
export function mugDistance(x,y,z,phase=0) {
  const t=ease(phase),cx=-.1*(1-t),R=.7+.55*t;
  const ring=Math.hypot(Math.hypot(x-cx,y)-R,z);
  const bodyCylinder=cylinder(x,y,z,-.7-.55*t,.72-.24*t,.975+.275*t,.045*(1-t));
  const bodyArc=Math.max(ring-(.72-.24*t),x-cx-.4);
  const body=bodyCylinder*(1-t)+bodyArc*t;
  const handle=Math.max(ring-(.13+.35*t),cx-x-.4);
  const ceramic=union(body,handle,.1*(1-t));
  const bowl=ease(t/.65);
  if(bowl>=1)return ceramic;
  const cavity=Math.max(Math.hypot(x+.7+.55*t,z)-.56*(1-bowl),y-(.68-1.8*bowl));
  return -union(-ceramic,cavity,.035*(1-bowl));
}

// Marching tetrahedra shares every edge intersection. Unlike overlapping
// cup/handle primitives, this gives one watertight boundary, including the
// inside and underside of the mug. Its surface remains genus one as it rounds.
export function mugMesh(phase,resolution=52,withNormals=true) {
  const nx=resolution,ny=resolution,nz=Math.round(resolution*.6);
  const sx=nx+1,sy=ny+1,sz=nz+1,count=sx*sy*sz;
  const values=new Float32Array(count),points=new Array(count);
  const id=(i,j,k)=>(i*sy+j)*sz+k;
  for(let i=0;i<=nx;i++)for(let j=0;j<=ny;j++)for(let k=0;k<=nz;k++){
    const index=id(i,j,k),p=[-2.1+4.2*i/nx,-2.1+4.2*j/ny,-.9+1.8*k/nz];
    points[index]=p;values[index]=mugDistance(...p,phase);
  }
  const vertices=[],triangles=[],edges=new Map();
  const crossing=(a,b)=>{
    if(a>b)[a,b]=[b,a];
    const key=a*count+b;
    if(edges.has(key))return edges.get(key);
    const t=values[a]/(values[a]-values[b]),p=points[a].map((x,k)=>x+(points[b][k]-x)*t);
    const index=vertices.length;vertices.push(p);edges.set(key,index);return index;
  };
  const triangle=(indices,out)=>{
    const [a,b,c]=indices.map(i=>vertices[i]);
    const u=b.map((x,k)=>x-a[k]),v=c.map((x,k)=>x-a[k]);
    const normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    if(normal.reduce((sum,x,k)=>sum+x*out[k],0)<0)[indices[1],indices[2]]=[indices[2],indices[1]];
    triangles.push(indices);
  };
  const tetrahedra=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++)for(let k=0;k<nz;k++){
    const cube=[id(i,j,k),id(i+1,j,k),id(i+1,j+1,k),id(i,j+1,k),id(i,j,k+1),id(i+1,j,k+1),id(i+1,j+1,k+1),id(i,j+1,k+1)];
    if(cube.every(c=>values[c]>=0)||cube.every(c=>values[c]<0))continue;
    for(const tet of tetrahedra){
      const inside=tet.map(c=>cube[c]).filter(c=>values[c]<0),outside=tet.map(c=>cube[c]).filter(c=>values[c]>=0);
      if(!inside.length||!outside.length)continue;
      const out=[0,1,2].map(k=>outside.reduce((s,c)=>s+points[c][k],0)/outside.length-inside.reduce((s,c)=>s+points[c][k],0)/inside.length);
      if(inside.length===1)triangle(outside.map(c=>crossing(inside[0],c)),out);
      else if(outside.length===1)triangle(inside.map(c=>crossing(outside[0],c)),out);
      else {
        const [a,b]=inside,[c,d]=outside,ac=crossing(a,c),ad=crossing(a,d),bc=crossing(b,c),bd=crossing(b,d);
        triangle([ac,ad,bc],out);triangle([ad,bd,bc],out);
      }
    }
  }
  const angle=-Math.PI/2*ease(phase),c=Math.cos(angle),s=Math.sin(angle);
  const normals=withNormals?vertices.map(p=>{
    const e=.002,gradient=[0,1,2].map(k=>{const a=[...p],b=[...p];a[k]+=e;b[k]-=e;return mugDistance(...a,phase)-mugDistance(...b,phase);});
    const length=Math.hypot(...gradient)||1,[x,y,z]=gradient.map(n=>n/length);
    return [x,c*y-s*z,s*y+c*z];
  }):[];
  return {vertices:vertices.map(([x,y,z])=>[x,c*y-s*z,s*y+c*z]),normals,triangles};
}
