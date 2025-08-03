import '../style.css'
import * as THREE from 'three/webgpu'
import { abs, bool, color, If, or, positionLocal, rotateUV, select, time, vec2, vec3 } from 'three/tsl'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Fn } from 'three/src/nodes/TSL.js'

const scene = new THREE.Scene()
console.log('running')

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    10
)
camera.position.z = 1

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

const material = new THREE.NodeMaterial()
// material.fragmentNode = color('crimson')
// material.fragmentNode = convertColorSpace(
//   texture(new THREE.TextureLoader().load('https://sbcode.net/img/grid.png')),
//   THREE.SRGBColorSpace,
//   THREE.LinearSRGBColorSpace
// )
const blueBedge = Fn(() => {

    const p = positionLocal.toVar();
    p.assign(rotateUV(p.xy, time, vec2())) // rotate]

    const showBlue = or(abs(p.x).lessThan(0.1), abs(p.y).greaterThan(0.45))


    return select(showBlue, vec3(p.xy, 1), p);

})


material.fragmentNode = blueBedge();

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(), material)
scene.add(mesh)

renderer.debug.getShaderAsync(scene, camera, mesh).then((e) => {
    //console.log(e.vertexShader)
    console.log(e.fragmentShader)
})

function animate() {
    controls.update()

    renderer.render(scene, camera)
}
