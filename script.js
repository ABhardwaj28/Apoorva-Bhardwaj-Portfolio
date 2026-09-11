import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x050505, 0.045);

const camera = new THREE.PerspectiveCamera(55, innerWidth/innerHeight, .1, 100);
camera.position.set(0,0,7);

const renderer = new THREE.WebGLRenderer({canvas:document.querySelector("#scene"),antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
composer.addPass(new UnrealBloomPass(new THREE.Vector2(innerWidth,innerHeight),.55,.7,.2));

const group = new THREE.Group();
scene.add(group);

// Central wireframe "digital planet"
const geo = new THREE.IcosahedronGeometry(1.65,4);
const mat = new THREE.MeshBasicMaterial({color:0xdedbd1,wireframe:true,transparent:true,opacity:.12});
const wire = new THREE.Mesh(geo,mat);
group.add(wire);

const core = new THREE.Mesh(
  new THREE.IcosahedronGeometry(1.15,3),
  new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.035})
);
group.add(core);

const ringMat = new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.18,side:THREE.DoubleSide});
for(let i=0;i<3;i++){
  const r = new THREE.Mesh(new THREE.TorusGeometry(2.1+i*.35,.008,8,160),ringMat);
  r.rotation.set(.6+i*.45,.2+i*.5,i*.7);
  group.add(r);
}

// particle field
const count=1800, positions=new Float32Array(count*3);
for(let i=0;i<count;i++){
  const radius=4+Math.random()*8, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1);
  positions[i*3]=radius*Math.sin(b)*Math.cos(a);
  positions[i*3+1]=radius*Math.cos(b);
  positions[i*3+2]=radius*Math.sin(b)*Math.sin(a);
}
const pg=new THREE.BufferGeometry();
pg.setAttribute("position",new THREE.BufferAttribute(positions,3));
const particles=new THREE.Points(pg,new THREE.PointsMaterial({color:0xaaaaaa,size:.018,transparent:true,opacity:.5}));
scene.add(particles);

const mouse={x:0,y:0};
addEventListener("pointermove",e=>{
  mouse.x=(e.clientX/innerWidth-.5);
  mouse.y=(e.clientY/innerHeight-.5);
});

let scroll=0;
addEventListener("scroll",()=>scroll=scrollY);

function animate(t){
  requestAnimationFrame(animate);
  const time=t*.0003;
  group.rotation.y += .0018;
  group.rotation.x = Math.sin(time)*.08 + mouse.y*.15;
  group.position.x += ((mouse.x*.5)-group.position.x)*.025;
  group.position.y += ((-mouse.y*.35 + Math.min(scroll/900,1)*.7)-group.position.y)*.02;
  group.scale.setScalar(1 + Math.sin(time*2)*.025);
  particles.rotation.y += .00015;
  particles.rotation.x = mouse.y*.03;
  composer.render();
}
animate(0);

addEventListener("resize",()=>{
  camera.aspect=innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth,innerHeight);
  composer.setSize(innerWidth,innerHeight);
});
