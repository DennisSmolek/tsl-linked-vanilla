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


//* Boxes ================================
// box A
const boxAUniforms = {
  colorA: uniform(color('orange')),
  colorB: uniform(color('blue')),
  hovered: uniform(false),
}
const boxAMaterial = new THREE.NodeMaterial();
boxAMaterial.colorNode = select(boxAUniforms.hovered, boxAUniforms.colorA, boxAUniforms.colorB);
const boxAMesh = new THREE.Mesh( new THREE.BoxGeometry(), boxAMaterial);
scene.add(boxAMesh);

// box B

const boxBUniforms = {
  colorA: uniform(color('orange')),
  colorB: uniform(color('blue')),
  hovered: uniform(false),
}
const boxBMaterial = new THREE.NodeMaterial();
boxBMaterial.colorNode = select(boxBUniforms.hovered, boxBUniforms.colorA, boxBUniforms.colorB);
const boxBMesh = new THREE.Mesh( new THREE.BoxGeometry(), boxBMaterial);
scene.add(boxBMesh);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 3, 1);
scene.add(directionalLight);

// Position the boxes so they're visible and separated
boxAMesh.position.x = -1;
boxBMesh.position.x = 1;

//* Raycaster Setup ================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const boxMeshes = [boxAMesh, boxBMesh]; 

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
    if (intersectedMesh === boxAMesh) {
        boxAUniforms.hovered.value = true;
        boxBUniforms.hovered.value = false;
    }

    if (intersectedMesh === boxBMesh) {
      boxBUniforms.hovered.value = true;
      boxAUniforms.hovered.value = false;
    }
  } else {
    boxAUniforms.hovered.value = false;
    boxBUniforms.hovered.value = false;
  }
}

// Add the mouse move event listener
window.addEventListener('mousemove', onMouseMove);



function animate() {
  controls.update()

  renderer.render(scene, camera)
}
