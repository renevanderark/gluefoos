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
  Face3,
  Matrix4
} from "three";

const VIRT_WIDTH = 1000;
const VIRT_HEIGHT = 1000;

const eventListeners = getEventListeners();
const music = new MusicalScore("https://renevanderark.github.io/arkaic/out/");
const fooLayer = cast(HTMLCanvasElement, document.getElementById("foo-layer"));
const renderer = new WebGLRenderer( { canvas: fooLayer } );
const scene = new Scene();
const camera = new PerspectiveCamera(
  60 /* = field of view (FOV) expressed in deg */,
  1.0 /* = aspect ratio */,
  0.1 /* = near of clipping plane*/,
  25 /* = far of clipping plane*/
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

camera.position.y = 0.0000001;
camera.position.z = 0.1;
camera.rotation.x = 90 * (Math.PI / 180);


scene.add( light );

const mkTriangle = (deg : number = 0) : Mesh => {
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
//  triangle.rotation.x = 270 * (Math.PI / 180);
  return triangle;
}

class Triangle {
  mesh : Mesh;
  x : number;
  y : number;
  z : number;

  constructor(deg : number = 0, material : MeshLambertMaterial) {
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
    this.mesh = new Mesh( geometry, material );
    this.mesh.receiveShadow = true;
    this.mesh.rotation.z = deg * (Math.PI / 180);
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  setPosition(x : number, y : number, z : number) {
    this.mesh.position.set(x, y, z);
  }
}

class Hexagon {
  triangles : Array<Triangle>;

  constructor() {
    this.triangles = [];
  }

  addTriangle(triangle : Triangle) {
    this.triangles.push(triangle);
  }

  draw(scene : Scene) {
    this.triangles.forEach(triangle => scene.add(triangle.mesh));
  }

  setPosition(x : number, y : number, z : number) {
    this.triangles.forEach(triangle => triangle.setPosition( x, y, z ));
  }
}

const mkHexagon = (scene : Scene) => {
  const hexagon = new Hexagon();

  for (let i = 0; i < 6; i++) {
    hexagon.addTriangle(new Triangle(i * 60, material));
  }
  hexagon.draw(scene);
  return hexagon;
}

initViewPort(VIRT_WIDTH, VIRT_HEIGHT, getResizeListeners([],
  eventListeners.onResize,
  (scale, width, height) => renderer.setSize(width, height)
));

music.addTrack("bass", "C2q B2q C2q B2q C2q B2q C2q B2q D2q E2q D2q E2q D2q E2q");
music.addTrack("string", "C6w B6w E6w");
//music.play(true)

const hexagon = mkHexagon(scene);
const hexagon2 = mkHexagon(scene);
const hexagon3 = mkHexagon(scene);
hexagon2.setPosition(0.58*3 - 0.02, 1, 0);
hexagon3.setPosition(0.58*6 - 0.04, 0, 0);


let landRot = 0;
let camRot = 0;
let shiftDown = false;
let acceleration = 0;
eventListeners.add("keydown", (ev, scale) =>  {
  const key = cast(KeyboardEvent, ev).key;
  if (key === "ArrowUp") {
    if (shiftDown) {
      camera.fov -= 1;
      console.log(camera.fov)
      camera.updateProjectionMatrix();
    } else {
      acceleration = 4;

    }
  } else if (key === "ArrowDown") {
    if (shiftDown) {
      camera.fov += 1;
      console.log(camera.fov)
      camera.updateProjectionMatrix();
    } else {
      acceleration = -4;


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
 } else if (key === "ArrowDown" || key === "ArrowUp") {
    if (shiftDown) {

    } else {
      acceleration = 0;
    }
  }
});

window.setInterval(() => {
  camera.position.y += Math.cos(camRot * (Math.PI / 180)) * (acceleration * 0.01);
  camera.position.x -= Math.sin(camRot * (Math.PI / 180)) * (acceleration * 0.01);
}, 50);

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
}
animate();
