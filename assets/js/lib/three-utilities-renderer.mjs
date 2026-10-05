import { surfacePoint } from './three-utilities-math.mjs';
import { surfaceNormal, surfaceMaterialMesh } from './three-utilities-mug.mjs';

const renderers=new WeakMap();
export const BOUNDARY_STYLE={width:6,dash:14,gap:9};

// Use the same dash positions on both members of an edge pair. Their shared
// pattern follows the surface through the unfolding, including around curves.
export function boundaryHighlights(phase,project,pixelPoint) {
  return [
    {horizontal:true,color:'#285b46',rgb:[40/255,91/255,70/255]},
    {horizontal:false,color:'#8769a2',rgb:[135/255,105/255,162/255]},
  ].map(pair=>{
    const at=(t,side)=>project(surfacePoint(...(pair.horizontal?[t,side]:[side,t]),phase));
    const length=[0,1].reduce((sum,side)=>{
      let previous=pixelPoint(at(0,side)),total=0;
      for(let i=1;i<=120;i++){
        const next=pixelPoint(at(i/120,side));total+=Math.hypot(next[0]-previous[0],next[1]-previous[1]);previous=next;
      }
      return sum+total/2;
    },0);
    const period=BOUNDARY_STYLE.dash+BOUNDARY_STYLE.gap;
    const count=Math.max(4,Math.round(length/period)),fraction=BOUNDARY_STYLE.dash/period;
    const steps=Math.max(2,Math.ceil(120*fraction/count));
    const parts=[0,1].flatMap(side=>Array.from({length:count},(_,dash)=>
      Array.from({length:steps+1},(_,i)=>at((dash+fraction*i/steps)/count,side))));
    return {...pair,width:BOUNDARY_STYLE.width,parts};
  });
}
function makeRenderer(canvas) {
  const gl=canvas.getContext('webgl',{alpha:true,antialias:true});
  if(!gl)return null;
  const shader=(type,source)=>{
    const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);
    if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));
    return s;
  };
  const program=gl.createProgram();
  gl.attachShader(program,shader(gl.VERTEX_SHADER,`
    attribute vec3 position; attribute vec3 normal; attribute vec2 uv;
    varying vec3 surfaceNormal; varying vec2 surfaceUV;
    void main(){gl_Position=vec4(position,1.0);surfaceNormal=normal;surfaceUV=uv;}
  `));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
    precision mediump float;
    varying vec3 surfaceNormal; varying vec2 surfaceUV;
    uniform vec3 color; uniform float line; uniform float twoSided; uniform float gridVisible;
    void main(){
      if(line>0.5){gl_FragColor=vec4(color,1.0);return;}
      vec3 n=normalize(surfaceNormal),light=normalize(vec3(-0.35,-0.55,0.76));
      if(twoSided>0.5&&n.z<0.0)n=-n;
      float diffuse=max(dot(n,light),0.0);
      float shine=pow(max(dot(n,normalize(light+vec3(0.0,0.0,1.0))),0.0),32.0)*0.13;
      vec2 grid=abs(sin(3.14159265*surfaceUV*vec2(12.0,8.0)));
      float ink=1.0-smoothstep(0.035,0.09,min(grid.x,grid.y));
      vec3 ceramic=mix(color,vec3(0.86,0.95,0.87),0.35*ink*gridVisible);
      gl_FragColor=vec4(ceramic*(0.42+0.58*diffuse)+vec3(shine),1.0);
    }
  `));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  return {gl,program,position:gl.getAttribLocation(program,'position'),normal:gl.getAttribLocation(program,'normal'),
    uv:gl.getAttribLocation(program,'uv'),
    color:gl.getUniformLocation(program,'color'),line:gl.getUniformLocation(program,'line'),twoSided:gl.getUniformLocation(program,'twoSided'),
    gridVisible:gl.getUniformLocation(program,'gridVisible'),
    positions:gl.createBuffer(),normals:gl.createBuffer(),coordinates:gl.createBuffer(),indices:gl.createBuffer(),phase:null,mesh:null};
}

const material=surfaceMaterialMesh();
const meshUVs=new Float32Array(material.uvs.flat()),indexData=new Uint16Array(material.triangles.flat());
function normalGroups(joinU,joinV){
  const groups=new Map();
  return material.uvs.map(([u,v],i)=>{
    const key=`${joinU&&u===1?0:u},${joinV&&v===1?0:v}`;
    if(!groups.has(key))groups.set(key,i);return groups.get(key);
  });
}
const closedGroups=normalGroups(true,true),tubeGroups=normalGroups(false,true);
function transformationMesh(phase) {
  const vertices=phase===0?material.vertices:material.uvs.map(([u,v])=>surfacePoint(u,v,phase));
  let normals;
  if(phase===0)normals=material.uvs.map(([u,v])=>surfaceNormal(surfacePoint,u,v,phase));
  else{
    const groups=phase<=1?closedGroups:phase<=2?tubeGroups:null;
    const sums=vertices.map(()=>[0,0,0]);
    for(const [a,b,c] of material.triangles){
      const p=vertices[a],du=vertices[b].map((x,k)=>x-p[k]),dv=vertices[c].map((x,k)=>x-p[k]);
      const n=[du[1]*dv[2]-du[2]*dv[1],du[2]*dv[0]-du[0]*dv[2],du[0]*dv[1]-du[1]*dv[0]];
      for(const i of [a,b,c])for(let k=0;k<3;k++)sums[groups?groups[i]:i][k]+=n[k];
    }
    normals=sums.map((_,i)=>{const n=sums[groups?groups[i]:i],length=Math.hypot(...n)||1;return n.map(x=>x/length);});
  }
  return {vertices,normals};
}

export function draw3DSurface(canvas,phase,project,showGrid=false) {
  if(!renderers.has(canvas))renderers.set(canvas,makeRenderer(canvas));
  const r=renderers.get(canvas);if(!r)return false;
  // The same parameter grid carries the bowl, rim, base and handle into the
  // torus. The two duplicated seams only separate after the explicit cuts.
  if(r.phase!==phase){r.phase=phase;r.mesh=transformationMesh(phase);}
  const {gl,mesh}=r,width=canvas.clientWidth,height=canvas.clientHeight;
  const projected=mesh.vertices.map(project),normals=mesh.normals.map(project);
  let extentX=0,extentY=0,extentZ=0;
  for(const p of projected){extentX=Math.max(extentX,Math.abs(p[0]));extentY=Math.max(extentY,Math.abs(p[1]));extentZ=Math.max(extentZ,Math.abs(p[2]));}
  if(phase<=1){extentX=Math.max(extentX,1.8);extentY=Math.max(extentY,1.45);}
  const scale=Math.min((width-44)/(extentX*2),(height-48)/(extentY*2));
  const clip=p=>[p[0]*scale*2/width,-p[1]*scale*2/height,-p[2]/(extentZ+.3)];
  const ratio=Math.min(window.devicePixelRatio||1,2),w=Math.round(width*ratio),h=Math.round(height*ratio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const attribute=(buffer,index,data)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0);
  };
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.useProgram(r.program);
  attribute(r.positions,r.position,projected.flatMap(clip));attribute(r.normals,r.normal,normals.flat());
  gl.bindBuffer(gl.ARRAY_BUFFER,r.coordinates);
  if(!r.layoutUploaded){
    gl.bufferData(gl.ARRAY_BUFFER,meshUVs,gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,r.indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indexData,gl.STATIC_DRAW);
    r.layoutUploaded=true;
  }
  gl.enableVertexAttribArray(r.uv);gl.vertexAttribPointer(r.uv,2,gl.FLOAT,false,0,0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,r.indices);
  gl.uniform3f(r.color,120/255,185/255,149/255);gl.uniform1f(r.line,0);gl.uniform1f(r.twoSided,phase>1?1:0);gl.uniform1f(r.gridVisible,showGrid?1:0);
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
  gl.drawElements(gl.TRIANGLES,indexData.length,gl.UNSIGNED_SHORT,0);gl.disable(gl.POLYGON_OFFSET_FILL);
  if(phase>=1){
    gl.uniform1f(r.line,1);gl.disableVertexAttribArray(r.uv);gl.vertexAttrib2f(r.uv,0,0);gl.disableVertexAttribArray(r.normal);gl.vertexAttrib3f(r.normal,0,0,1);
    for(const highlight of boundaryHighlights(phase,project,p=>[p[0]*scale,p[1]*scale])){
      const line=[];
      for(const part of highlight.parts)for(let i=1;i<part.length;i++){
        const [a,b]=[part[i-1],part[i]].map(clip);
        const dx=(b[0]-a[0])*width,dy=(b[1]-a[1])*height,length=Math.hypot(dx,dy);
        if(length<.0001)continue;
        const offset=[-dy/length*highlight.width/width,dx/length*highlight.width/height,0];
        const am=a.map((x,k)=>x-offset[k]),ap=a.map((x,k)=>x+offset[k]);
        const bm=b.map((x,k)=>x-offset[k]),bp=b.map((x,k)=>x+offset[k]);
        line.push(...am,...bm,...ap,...ap,...bm,...bp);
      }
      attribute(r.positions,r.position,line);gl.uniform3f(r.color,...highlight.rgb);gl.drawArrays(gl.TRIANGLES,0,line.length/3);
    }
  }
  return true;
}
