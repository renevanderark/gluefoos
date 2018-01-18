/* @flow */
import cast from "flo-cast";
import { getResizeListeners, initViewPort, getEventListeners } from "resizable-canvas";
import MusicalScore from "musical-score";

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Geometry,
  MeshLambertMaterial,
  Mesh,
  SpotLight,
  TextureLoader,
  Vector3,
  Vector2,
  Face3
} from "three";

const VIRT_WIDTH = 1000;
const VIRT_HEIGHT = 1000;

const eventListeners = getEventListeners();
const music = new MusicalScore("https://renevanderark.github.io/arkaic/out/");
const fooLayer = cast(HTMLCanvasElement, document.getElementById("foo-layer"));
const renderer = new WebGLRenderer( { canvas: fooLayer } );
const scene = new Scene();
const camera = new PerspectiveCamera(
  70 /* = field of view (FOV) expressed in deg */,
  1.0 /* = aspect ratio */,
  0.1 /* = near of clipping plane*/,
  5 /* = far of clipping plane*/
);



const material = new MeshLambertMaterial({
  map: new TextureLoader().load('test.png')
});

const light = new SpotLight( 0xffffff );
light.position.set( 0, 10, 10 );
light.castShadow = true;            // default false

//Set up shadow properties for the light
light.shadow.mapSize.width = 512;  // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = camera.near;       // default
light.shadow.camera.far = camera.far;      // default

camera.position.y = 0.1;
camera.position.z = 0;


scene.add( light );

const mkTriangle = (deg = 0) => {
  const geometry = new Geometry();
  geometry.vertices.push(new Vector3(0,0,0));
  geometry.vertices.push(new Vector3(0.58,1,0));
  geometry.vertices.push(new Vector3(-0.58,1,0));

  geometry.faces.push( new Face3( 0, 1, 2 ));
  geometry.faceVertexUvs[0].push([
    new Vector2(0.5, 1),
    new Vector2(0, 0),
    new Vector2(1, 0)
  ]);

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  const triangle = new Mesh( geometry, material );
  triangle.receiveShadow = true;
  triangle.rotation.z = deg * (Math.PI / 180);
  triangle.rotation.x = 270 * (Math.PI / 180);
  return triangle;
}

const triangles = [];
for (let i = 0; i < 6; i++) {
  const triangle = mkTriangle(i * 60);
  triangles.push(triangle);
  scene.add(triangle);
}

initViewPort(VIRT_WIDTH, VIRT_HEIGHT, getResizeListeners([],
  eventListeners.onResize,
  (scale, width, height) => renderer.setSize(width, height)
));

music.addTrack("bass", "C2q B2q C2q B2q C2q B2q C2q B2q D2q E2q D2q E2q D2q E2q");
music.addTrack("string", "C6w B6w E6w");
//music.play(true)

let landRot = 270;
let camRot = 0;
let shiftDown = false;
eventListeners.add("keydown", (ev, scale) =>  {
  const key = cast(KeyboardEvent, ev).key;
  if (key === "ArrowUp") {
    if (shiftDown) {
      landRot -= 6;
      triangles.forEach(t =>  t.rotation.x = landRot * (Math.PI / 180));
    } else {
      camera.position.x -= Math.sin(camRot * (Math.PI / 180)) * 0.1;
      camera.position.z -= Math.cos(camRot * (Math.PI / 180)) * 0.1;
    }
  } else if (key === "ArrowDown") {
    if (shiftDown) {
      landRot += 6;
      triangles.forEach(t => t.rotation.x = landRot * (Math.PI / 180));
    } else {
      camera.position.z += Math.cos(camRot * (Math.PI / 180)) * 0.1;
      camera.position.x += Math.sin(camRot * (Math.PI / 180)) * 0.1;
    }
  } else if (key ==="ArrowRight") {
    camRot -= 6;
    camera.rotation.y =  camRot * (Math.PI / 180);
  } else if (key === "ArrowLeft") {
    camRot += 6;
    camera.rotation.y =  camRot * (Math.PI / 180);
  } else if (key === "a") {
    music.playNote("piano", "C4h");
  } else if (key === "s") {
    music.playNote("piano", "D4h");
  } else if (key === "d") {
    music.playNote("piano", "E4h");
  } else if (key === "Shift") {
    shiftDown = true;
  }
});

eventListeners.add("keyup", (ev, scale) =>  {
  const key = cast(KeyboardEvent, ev).key;
  if (key === "Shift") {
   shiftDown = false;
 }
})

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();
