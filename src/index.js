/* @flow */
import cast from "flo-cast";
import { getResizeListeners, initViewPort, getEventListeners } from "resizable-canvas";
import MusicalScore from "musical-score";

import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  BoxGeometry,
  MeshLambertMaterial,
  Mesh,
  SpotLight
} from "three";

const VIRT_WIDTH = 1000;
const VIRT_HEIGHT = 1000;

const eventListeners = getEventListeners();
const music = new MusicalScore("https://renevanderark.github.io/arkaic/out/");
const fooLayer = cast(HTMLCanvasElement, document.getElementById("foo-layer"));
const renderer = new WebGLRenderer( { canvas: fooLayer } );
const scene = new Scene();
const camera = new PerspectiveCamera(
  75 /* = field of view (FOV) expressed in deg */,
  1.0 /* = aspect ratio */,
  0.1 /* = near of clipping plane*/,
  50 /* = far of clipping plane*/
);

const geometry = new BoxGeometry( 1, 1, 0.5 );
const material = new MeshLambertMaterial( { color: 0x00ff00 } );
const cube = new Mesh( geometry, material );
cube.receiveShadow = true;

const light = new SpotLight( 0xffffff );
light.position.set( 0, 0, 10 );
light.castShadow = true;            // default false


scene.add( light );
scene.add(cube);


//Set up shadow properties for the light
light.shadow.mapSize.width = 512;  // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = camera.near;       // default
light.shadow.camera.far = camera.far;      // default

camera.position.z = 5;

initViewPort(VIRT_WIDTH, VIRT_HEIGHT, getResizeListeners([],
  eventListeners.onResize,
  (scale, width, height) => renderer.setSize(width, height)
));

eventListeners.add("keydown", (ev, scale) =>  {
  const key = cast(KeyboardEvent, ev).key;
  if (key === "ArrowUp") {
    camera.position.z -= 1;
  } else if (key === "ArrowDown") {
    camera.position.z += 1;
  } else if (key === "a") {
    music.playNote("piano", "C4h");
  } else if (key === "s") {
    music.playNote("piano", "D4h");
  } else if (key === "d") {
    music.playNote("piano", "E4h");
  }
});
window.setInterval(() => {   cube.rotation.x += 0.1; cube.rotation.y += 0.01; }, 25)

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();
