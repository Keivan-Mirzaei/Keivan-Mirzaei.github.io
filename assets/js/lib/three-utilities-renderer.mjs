import { surfacePoint } from './three-utilities-math.mjs';
import { mugMesh } from './three-utilities-mug.mjs';

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
    attribute vec3 position; attribute vec3 normal;
    varying vec3 surfaceNormal;
    void main(){gl_Position=vec4(position,1.0);surfaceNormal=normal;}
  `));
  gl.attachShader(program,shader(gl.FRAGMENT_SHADER,`
    precision mediump float;
    varying vec3 surfaceNormal;
    uniform vec3 color; uniform float line; uniform float twoSided;
    void main(){
      if(line>0.5){gl_FragColor=vec4(color,1.0);return;}
      vec3 n=normalize(surfaceNormal),light=normalize(vec3(-0.35,-0.55,0.76));
      if(twoSided>0.5&&n.z<0.0)n=-n;
      float diffuse=max(dot(n,light),0.0);
      float shine=pow(max(dot(n,normalize(light+vec3(0.0,0.0,1.0))),0.0),32.0)*0.13;
      gl_FragColor=vec4(color*(0.42+0.58*diffuse)+vec3(shine),1.0);
    }
  `));
  gl.linkProgram(program);
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
  const rayProgram=gl.createProgram();
  gl.attachShader(rayProgram,shader(gl.VERTEX_SHADER,`
    attribute vec3 position; varying vec2 clip;
    void main(){gl_Position=vec4(position,1.0);clip=position.xy;}
  `));
  gl.attachShader(rayProgram,shader(gl.FRAGMENT_SHADER,`
    precision highp float;
    varying vec2 clip;
    uniform float phase; uniform vec2 extent;
    uniform mat3 toWorld; uniform mat3 toCamera;
    float smoothUnion(float a,float b,float k){
      if(k<0.00001)return min(a,b);
      float h=max(k-abs(a-b),0.0)/k;return min(a,b)-h*h*k*0.25;
    }
    float ease(float x){float t=clamp(x,0.0,1.0);return t*t*(3.0-2.0*t);}
    float field(vec3 p){
      float t=ease(phase),cx=-0.1*(1.0-t),R=0.7+0.55*t;
      float ring=length(vec2(length(p.xy-vec2(cx,0.0))-R,p.z));
      float rounding=0.045*(1.0-t);
      vec2 d=vec2(length(p.xz-vec2(-0.7-0.55*t,0.0))-(0.72-0.24*t-rounding),abs(p.y)-(0.975+0.275*t-rounding));
      float cylinder=length(max(d,0.0))+min(max(d.x,d.y),0.0)-rounding;
      float body=mix(cylinder,max(ring-(0.72-0.24*t),p.x-cx-0.4),t);
      float handle=max(ring-(0.13+0.35*t),cx-p.x-0.4);
      float ceramic=smoothUnion(body,handle,0.1*(1.0-t)),bowl=ease(t/0.65);
      if(bowl>=1.0)return ceramic;
      float cavity=max(length(p.xz-vec2(-0.7-0.55*t,0.0))-0.56*(1.0-bowl),p.y-(0.68-1.8*bowl));
      return -smoothUnion(-ceramic,cavity,0.035*(1.0-bowl));
    }
    void main(){
      vec3 origin=toWorld*vec3(clip.x*extent.x,-clip.y*extent.y,3.0);
      vec3 direction=toWorld*vec3(0.0,0.0,-1.0),p=origin;
      float travel=0.0;bool hit=false;
      for(int i=0;i<110;i++){
        p=origin+direction*travel;float d=field(p);
        if(d<0.0007){hit=true;break;}
        travel+=max(d*0.9,0.0007);if(travel>6.0)break;
      }
      if(!hit)discard;
      vec3 e=vec3(0.001,0.0,0.0);
      vec3 n=normalize(toCamera*vec3(field(p+e.xyy)-field(p-e.xyy),field(p+e.yxy)-field(p-e.yxy),field(p+e.yyx)-field(p-e.yyx)));
      vec3 light=normalize(vec3(-0.35,-0.55,0.76));
      float diffuse=max(dot(n,light),0.0),shine=pow(max(dot(n,normalize(light+vec3(0.0,0.0,1.0))),0.0),32.0)*0.13;
      gl_FragColor=vec4(vec3(0.76,0.82,0.67)*(0.42+0.58*diffuse)+vec3(shine),1.0);
    }
  `));
  gl.linkProgram(rayProgram);
  if(!gl.getProgramParameter(rayProgram,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(rayProgram));
  return {gl,program,position:gl.getAttribLocation(program,'position'),normal:gl.getAttribLocation(program,'normal'),
    color:gl.getUniformLocation(program,'color'),line:gl.getUniformLocation(program,'line'),twoSided:gl.getUniformLocation(program,'twoSided'),
    positions:gl.createBuffer(),normals:gl.createBuffer(),indices:gl.createBuffer(),phase:null,mesh:null,
    rayProgram,rayPosition:gl.getAttribLocation(rayProgram,'position'),rayPhase:gl.getUniformLocation(rayProgram,'phase'),
    rayExtent:gl.getUniformLocation(rayProgram,'extent'),toWorld:gl.getUniformLocation(rayProgram,'toWorld'),toCamera:gl.getUniformLocation(rayProgram,'toCamera')};
}

function torusMesh(phase) {
  const cols=84,rows=56,vertices=[],normals=[],triangles=[],e=.00001;
  for(let i=0;i<=cols;i++)for(let j=0;j<=rows;j++){
    const u=i/cols,v=j/rows,p=surfacePoint(u,v,phase),a=surfacePoint(u+e,v,phase),b=surfacePoint(u,v+e,phase);
    const du=a.map((x,k)=>x-p[k]),dv=b.map((x,k)=>x-p[k]);
    const n=[dv[1]*du[2]-dv[2]*du[1],dv[2]*du[0]-dv[0]*du[2],dv[0]*du[1]-dv[1]*du[0]],length=Math.hypot(...n)||1;
    vertices.push(p);normals.push(n.map(x=>x/length));
  }
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
    const a=i*(rows+1)+j,b=a+rows+1;
    triangles.push([a,b,a+1],[a+1,b,b+1]);
  }
  return {vertices,normals,triangles};
}

export function draw3DSurface(canvas,phase,project) {
  if(!renderers.has(canvas))renderers.set(canvas,makeRenderer(canvas));
  const r=renderers.get(canvas);if(!r)return false;
  // The mug is rendered directly from its smooth boundary field on the GPU.
  // A coarse mesh only measures its bounds; it never supplies the visible rim.
  if(r.phase!==phase){r.phase=phase;r.mesh=phase<1?mugMesh(phase,24,false):torusMesh(phase);}
  const {gl,mesh}=r,width=canvas.clientWidth,height=canvas.clientHeight;
  const projected=mesh.vertices.map(project),normals=mesh.normals.map(project);
  let extentX=0,extentY=0,extentZ=0;
  for(const p of projected){extentX=Math.max(extentX,Math.abs(p[0]));extentY=Math.max(extentY,Math.abs(p[1]));extentZ=Math.max(extentZ,Math.abs(p[2]));}
  const scale=Math.min((width-44)/(extentX*2),(height-48)/(extentY*2));
  const clip=p=>[p[0]*scale*2/width,-p[1]*scale*2/height,-p[2]/(extentZ+.3)];
  const ratio=Math.min(window.devicePixelRatio||1,2),w=Math.round(width*ratio),h=Math.round(height*ratio);
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  const attribute=(buffer,index,data)=>{
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(index);gl.vertexAttribPointer(index,3,gl.FLOAT,false,0,0);
  };
  if(phase<1){
    gl.disable(gl.DEPTH_TEST);gl.useProgram(r.rayProgram);
    gl.disableVertexAttribArray(r.normal);
    attribute(r.positions,r.rayPosition,[-1,-1,0,3,-1,0,-1,3,0]);
    const t=phase*phase*(3-2*phase),angle=-Math.PI/2*t,c=Math.cos(angle),s=Math.sin(angle);
    const axes=[[1,0,0],[0,c,s],[0,-s,c]].map(project);
    gl.uniformMatrix3fv(r.toCamera,false,new Float32Array(axes.flat()));
    gl.uniformMatrix3fv(r.toWorld,false,new Float32Array([0,1,2].flatMap(k=>axes.map(a=>a[k]))));
    gl.uniform1f(r.rayPhase,phase);gl.uniform2f(r.rayExtent,width/(2*scale),height/(2*scale));
    gl.drawArrays(gl.TRIANGLES,0,3);return true;
  }
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.useProgram(r.program);
  attribute(r.positions,r.position,projected.flatMap(clip));attribute(r.normals,r.normal,normals.flat());
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,r.indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(mesh.triangles.flat()),gl.DYNAMIC_DRAW);
  gl.uniform3f(r.color,.76,.82,.67);gl.uniform1f(r.line,0);gl.uniform1f(r.twoSided,phase>1?1:0);
  gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1,1);
  gl.drawElements(gl.TRIANGLES,mesh.triangles.length*3,gl.UNSIGNED_SHORT,0);gl.disable(gl.POLYGON_OFFSET_FILL);
  if(phase>=1){
    gl.uniform1f(r.line,1);gl.disableVertexAttribArray(r.normal);gl.vertexAttrib3f(r.normal,0,0,1);
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
