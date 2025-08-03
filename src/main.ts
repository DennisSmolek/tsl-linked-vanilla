import './style.css'
import * as THREE from 'three/webgpu'
import { color, positionLocal, select, uniform } from 'three/tsl'
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


//* Planes ================================
// Materials ---
const asColorMaterial = new THREE.NodeMaterial();
asColorMaterial.colorNode = positionLocal;
const asFragMaterial = new THREE.NodeMaterial();
asFragMaterial.fragmentNode = positionLocal;


const colorPlane = new THREE.Mesh(new THREE.PlaneGeometry(), asColorMaterial)
const fragPlane = new THREE.Mesh(new THREE.PlaneGeometry(), asFragMaterial)
colorPlane.position.y = 0.5
fragPlane.position.y = -0.5
scene.add(colorPlane)
scene.add(fragPlane)


//* Boxes ================================

class Box {

  uniforms = {
    colorA: uniform(color('orange')),
    colorB: uniform(color('blue')),
    hovered: uniform(false),
  }

  mesh: THREE.Mesh;
  material = new THREE.MeshStandardNodeMaterial();

  setHovered(hovered: boolean) {
    this.uniforms.hovered.value = hovered;
    console.log(`mesh ${this.mesh.uuid} hovered: ${this.uniforms.hovered.value}`)
  }

  constructor(scene: THREE.Scene) {
    this.material.colorNode = select(this.uniforms.hovered, this.uniforms.colorA, this.uniforms.colorB);
    this.mesh = new THREE.Mesh(new THREE.BoxGeometry(), this.material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    scene.add(this.mesh);
  }
}

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 3, 1);
scene.add(directionalLight);

const leftBox = new Box(scene);
const rightBox = new Box(scene);

// Position the boxes so they're visible and separated
leftBox.mesh.position.x = -1;
rightBox.mesh.position.x = 1;

//* Raycaster Setup ================================
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const boxMeshes = [leftBox.mesh, rightBox.mesh]; // Array of box meshes for raycasting
let currentlyHovered: Box | null = null; // Track which box is currently hovered

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
    const hoveredBox = intersectedMesh === leftBox.mesh ? leftBox : rightBox;

    // Only update if we're hovering a different box
    if (currentlyHovered !== hoveredBox) {
      // Clear previous hover state
      if (currentlyHovered) {
        currentlyHovered.setHovered(false);
      }

      // Set new hover state
      hoveredBox.setHovered(true);
      currentlyHovered = hoveredBox;
    }
  } else {
    // No intersection, clear any hover state
    if (currentlyHovered) {
      currentlyHovered.setHovered(false);
      currentlyHovered = null;
    }
  }
}

// Add the mouse move event listener
window.addEventListener('mousemove', onMouseMove);

renderer.debug.getShaderAsync(scene, camera, colorPlane).then((e) => {
  //console.log(e.vertexShader)
  console.log(e.fragmentShader)
})

function animate() {
  controls.update()

  renderer.render(scene, camera)
}
