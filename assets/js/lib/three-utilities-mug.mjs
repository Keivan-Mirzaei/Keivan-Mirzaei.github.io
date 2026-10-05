const TAU=2*Math.PI;
const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{const t=clamp(x);return t*t*(3-2*t);};
const mix=(a,b,t)=>a+(b-a)*t;
const blend=(a,b,t)=>a.map((x,k)=>mix(x,b[k],t));
const A=Math.sqrt(.75),B=.5,CAP=.18;
const CENTRE=-.7,RADIUS=.72,HEIGHT=.975;
const HANDLE_RADIUS=.13;
function profileSegment(a,b,da,db,t,length){
  const t2=t*t,t3=t2*t;
  return (2*t3-3*t2+1)*a+(t3-2*t2+t)*length*da+(-2*t3+3*t2)*b+(t3-t2)*length*db;
}

// A turned cup profile: flat inner floor, inner wall, rolled level rim,
// straight outer wall, rounded base and flat underside. Revolving this simple
// meridian produces the entire boundary of a bottomed ceramic cup.
export function cupProfile(beta){
  if(beta<.35)return [profileSegment(0,.5,.5/.35,.08*Math.PI/.3,beta/.35,.35),.68];
  if(beta<.5){const t=(beta-.35)/.15*Math.PI/2;return [.5+.08*Math.sin(t),.6+.08*Math.cos(t)];}
  if(beta<.69)return [.58,profileSegment(.6,-.905,-.08*Math.PI/.3,-.07*Math.PI/.16,(beta-.5)/.19,.19)];
  if(beta<.85){const t=(beta-.69)/.16*Math.PI;return [.65-.07*Math.cos(t),-.905-.07*Math.sin(t)];}
  const base=Math.PI-.85;
  if(beta<base)return [.72,profileSegment(-.905,.905,.07*Math.PI/.16,.07*Math.PI/(2*(2.4-base)),(beta-.85)/(base-.85),base-.85)];
  if(beta<2.4){const t=(beta-base)/(2.4-base)*Math.PI/2;return [.65+.07*Math.cos(t),.905+.07*Math.sin(t)];}
  return [profileSegment(.65,0,-.07*Math.PI/(2*(2.4-base)),-.65/(Math.PI-2.4),(beta-2.4)/(Math.PI-2.4),Math.PI-2.4),.975];
}

// Circular sections of a sphere with two disks removed. Both disks lie on
// the right wall after turning the cup profile; the handle joins their rims.
// These material coordinates stay fixed as the annulus bends into a half-ring.
function sphereSection(u,v){
  const beta=CAP+(Math.PI-2*CAP)*2*u,phi=TAU*(v-.5);
  const sin=Math.sin(beta),cos=Math.cos(beta),D=Math.hypot(A*cos,B),d=cos/D;
  const centre=[d*A*cos/D,d*B/D,0],radius=B*sin/D;
  const axis=[-B/D,A*cos/D,0];
  const q=[centre[0]+radius*axis[0]*Math.cos(phi),centre[1]+radius*axis[1]*Math.cos(phi),radius*Math.sin(phi)];
  return {q,centre,radius,axis,phi};
}
const cupAttachments=[0,.5].map(u=>(cupProfile(Math.acos(sphereSection(u,0).q[1]))[1]+cupProfile(Math.acos(sphereSection(u,.5).q[1]))[1])/2);
function bodyPoint(u,v,lift,round){
  const {q,centre,radius,axis,phi}=sphereSection(u,v);
  if(round===0){
    const beta=Math.acos(Math.max(-1,Math.min(1,q[1]))),rho=Math.hypot(q[0],q[2]);
    const [r,y]=cupProfile(beta),scale=rho>1e-10?r/rho:0;
    const cup=[CENTRE+scale*q[0],y,scale*q[2]];
    // Round the two attachment openings on the cylindrical wall. The grip can
    // then keep one diameter instead of inheriting oval, flared ends. This is
    // a local change of material coordinates; the wall remains a cylinder.
    const end=u<.25?0:.5,fromEnd=Math.abs(u-end);
    if(fromEnd<.025){
      const boundary=sphereSection(end,v).q;
      const betaEnd=Math.acos(Math.max(-1,Math.min(1,boundary[1])));
      const [rEnd,yEnd]=cupProfile(betaEnd),rhoEnd=Math.hypot(boundary[0],boundary[2]);
      const zEnd=rEnd*boundary[2]/rhoEnd,weight=1-fromEnd/.025;
      const yTarget=cupAttachments[end===0?0:1]+(end===0?-1:1)*HANDLE_RADIUS*Math.cos(phi);
      cup[1]+=weight*(yTarget-yEnd);
      cup[2]+=weight*(HANDLE_RADIUS*Math.sin(phi)-zEnd);
      cup[0]=CENTRE+Math.sqrt(RADIUS*RADIUS-cup[2]*cup[2]);
    }
    const sphere=[CENTRE+RADIUS*q[0],-HEIGHT*q[1],RADIUS*q[2]];
    return blend(cup,sphere,lift);
  }
  const alpha=TAU*u,angle=phi;
  const cx=mix(CENTRE+RADIUS*centre[0],-1.25*Math.sin(alpha),round);
  const cy=mix(-HEIGHT*centre[1],-1.25*Math.cos(alpha),round);
  const ex=mix(RADIUS*radius*axis[0],-.48*Math.sin(alpha),round);
  const ey=mix(-HEIGHT*radius*axis[1],-.48*Math.cos(alpha),round);
  const ez=mix(RADIUS*radius,.48,round);
  return [cx+ex*Math.cos(angle),cy+ey*Math.cos(angle),ez*Math.sin(angle)];
}
function derivative(fn,t){const e=.00001,a=fn(t+e),b=fn(t-e);return a.map((x,k)=>(x-b[k])/(2*e));}
function hermite(a,b,da,db,t,length){
  const t2=t*t,t3=t2*t;
  return a.map((x,k)=>(2*t3-3*t2+1)*x+(t3-2*t2+t)*length*da[k]+(-2*t3+3*t2)*b[k]+(t3-t2)*length*db[k]);
}
let cached=null;
function configuration(phase){
  if(cached?.phase===phase)return cached;
  const lift=ease(phase/.36),round=ease((phase-.36)/.64);
  const body=(u,v)=>bodyPoint(u,v,lift,round);
  const bottom=blend(body(.5,0),body(.5,.5),.5),top=blend(body(0,0),body(0,.5),.5);
  cached={phase,lift,round,body,bottom,top,reach:mix(.67,1.25,round),tubeRadius:mix(HANDLE_RADIUS,.48,round),collar:.12*lift*(1-round)};
  return cached;
}
function handlePoint(s,v,config){
  const {body,bottom,top,reach,tubeRadius,collar,round}=config;
  const a=body(.5,v),b=body(0,v);
  const phi=TAU*(v-.5);
  const baseline=t=>{
    const angle=Math.PI*t,sin=Math.sin(angle),cos=Math.cos(angle);
    const H=(bottom[1]-top[1])/2,normalLength=Math.hypot(H*sin,reach*cos);
    const nx=H*sin/normalLength,ny=reach*cos/normalLength;
    // The initial attachment circles and grip have the same diameter. During
    // deformation this grip follows their changing shape into the torus.
    const grip=ease(Math.min(t,1-t)/.18)*(1-round);
    const radial=mix(mix(a[1]-bottom[1],top[1]-b[1],t),tubeRadius*Math.cos(phi),grip);
    const z=mix(mix(a[2],b[2],t),tubeRadius*Math.sin(phi),grip);
    const correction=mix(a[0]-bottom[0],b[0]-top[0],t)*(1-ease(Math.min(t,1-t)/.04));
    return [mix(bottom[0],top[0],t)+reach*sin+radial*nx+correction,
      (bottom[1]+top[1])/2+H*cos+radial*ny,z];
  };
  if(collar>1e-5&&s<collar){
    const da=derivative(u=>body(u,v),.5).map(x=>x/2);
    return hermite(a,baseline(collar),da,derivative(baseline,collar),s/collar,collar);
  }
  if(collar>1e-5&&s>1-collar){
    const db=derivative(u=>body(u,v),0).map(x=>x/2);
    return hermite(baseline(1-collar),b,derivative(baseline,1-collar),db,(s-1+collar)/collar,collar);
  }
  return baseline(s);
}
export function mugRounding(phase){return ease((phase-.36)/.64);}
export function mugPoint(u,v,phase=0){
  u=((u%1)+1)%1;
  const config=configuration(phase),p=u<=.5?config.body(u,v):handlePoint(2*u-1,v,config);
  const angle=-Math.PI/2*config.round,c=Math.cos(angle),s=Math.sin(angle);
  return [p[0],c*p[1]-s*p[2],s*p[1]+c*p[2]];
}
export function surfaceNormal(point,u,v,phase){
 const e=.00002,a=point(u+e,v,phase),b=point(u-e,v,phase),c=point(u,v+e,phase),d=point(u,v-e,phase);
 const du=a.map((x,k)=>x-b[k]),dv=c.map((x,k)=>x-d[k]);
 const n=[dv[1]*du[2]-dv[2]*du[1],dv[2]*du[0]-dv[0]*du[2],dv[0]*du[1]-dv[1]*du[0]],length=Math.hypot(...n);
 return n.map(x=>x/length);
}
export function mugMesh(phase,resolution=96,withNormals=true){
 const cols=resolution,rows=Math.round(resolution*.75),vertices=[],normals=[],triangles=[];
 const id=(i,j)=>((i+cols)%cols)*rows+(j+rows)%rows;
 for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
 vertices.push(mugPoint(i/cols,j/rows,phase));if(withNormals)normals.push(surfaceNormal(mugPoint,i/cols,j/rows,phase));
 const a=id(i,j),b=id(i+1,j),c=id(i,j+1),d=id(i+1,j+1);triangles.push([a,c,b],[c,d,b]);
 }
 return {vertices,normals,triangles};
}

// Refine curved rim, base and attachment regions once in material coordinates.
// Every frame then uses this SAME triangulation; refinement does not remesh a
// moving shape. Shared edge midpoints prevent cracks at refinement boundaries.
export function surfaceMaterialMesh(cols=160,rows=112){
 const uvs=[],indices=[];
 for(let i=0;i<=cols;i++)for(let j=0;j<=rows;j++){
  const a=i*(rows+1)+j;uvs.push([i/cols,j/rows]);
  if(i<cols&&j<rows){const b=a+rows+1;indices.push([a,a+1,b],[a+1,b+1,b]);}
 }
 let triangles=indices,points=uvs.map(([u,v])=>mugPoint(u,v,0));
 for(let pass=0;pass<3;pass++){
  const midpoints=new Map();
  const midpoint=(a,b)=>{
   if(a>b)[a,b]=[b,a];const key=`${a},${b}`;
   if(midpoints.has(key))return midpoints.get(key);
   const uv=uvs[a].map((x,k)=>(x+uvs[b][k])/2),p=mugPoint(...uv,0);
   const error=Math.hypot(...p.map((x,k)=>x-(points[a][k]+points[b][k])/2));
   if(error<.0009){midpoints.set(key,null);return null;}
   const id=uvs.length;uvs.push(uv);points.push(p);midpoints.set(key,id);return id;
  };
  const next=[];
  for(const [a,b,c] of triangles){
   const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a),mask=(ab!==null?1:0)+(bc!==null?2:0)+(ca!==null?4:0);
   if(mask===0)next.push([a,b,c]);
   if(mask===1)next.push([a,ab,c],[ab,b,c]);
   if(mask===2)next.push([b,bc,a],[bc,c,a]);
   if(mask===4)next.push([c,ca,b],[ca,a,b]);
   if(mask===3)next.push([b,bc,ab],[ab,bc,c],[a,ab,c]);
   if(mask===5)next.push([a,ab,ca],[ab,b,c],[ca,ab,c]);
   if(mask===6)next.push([c,ca,bc],[a,b,ca],[ca,b,bc]);
   if(mask===7)next.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);
  }
  triangles=next;
 }
 return {uvs,triangles,vertices:points};
}
