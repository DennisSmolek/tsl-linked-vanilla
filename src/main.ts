import './style.css'
import * as THREE from 'three/webgpu'
import { color, select, uniform } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

//* Basic Scene Setup ================================
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10
)
camera.position.set(0, 1, 2)

const renderer = new THREE.WebGPURenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)
renderer.setAnimationLoop(animate)

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

class MyBox {
  uniforms= {
  colorA:uniform(color("red")),
  colorB:uniform(color("pink")),
  hovered:uniform(false)
  }
  setHovered(value: boolean) {
    this.uniforms.hovered.value = value;
  }

  name = "box";
  material = new THREE.NodeMaterial();
  mesh: THREE.Mesh;

  constructor(scene: THREE.Scene) {
    this.material.fragmentNode = select(this.uniforms.hovered, this.uniforms.colorA, this.uniforms.colorB);
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(), this.material);
    scene.add(this.mesh);

  }
}



//* Boxes ================================
// box A
const boxA = new MyBox(scene);
boxA.mesh.position.x = -1;

// box B

const boxB = new MyBox(scene);
boxB.mesh.position.x = 1;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 3, 1);
scene.add(directionalLight);


//* Raycaster Setup ================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const boxMeshes = [boxA.mesh, boxB.mesh]; 

// Mouse move event listener
function onMouseMove(event: MouseEvent) {
  // Calculate mouse position in normalized device coordinates (-1 to +1)
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // Update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(boxMeshes);

  if (intersects.length > 0) {
    // Found intersection with a box
    const intersectedMesh = intersects[0].object as THREE.Mesh;

    // Only update if we're hovering a different box
    if (intersectedMesh === boxA.mesh) {
        boxA.setHovered(true);
        boxB.setHovered(false);
    }

    if (intersectedMesh === boxB.mesh) {
      boxB.setHovered(true);
      boxA.setHovered(false);
    }
  } else {
    boxA.setHovered(false);
    boxB.setHovered(false);
  }
}

// Add the mouse move event listener
window.addEventListener('mousemove', onMouseMove);



function animate() {
  controls.update()

  renderer.render(scene, camera)
}
