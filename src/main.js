import "./index.css";
import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader.js';
import gsap  from "gsap";

import LocomotiveScroll from 'locomotive-scroll';

const locomotiveScroll = new LocomotiveScroll();

//scene 
const scene = new Three.Scene();

//camera 
const camera = new Three.PerspectiveCamera(40, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.z = 3.5;

//HDRI loader
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
    'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', // Replace with your HDRI path
    function (texture) {
        texture.mapping = Three.EquirectangularReflectionMapping;
        scene.environment = texture;
        // scene.background = texture;  
    },
    undefined,
    function (error) {
        console.error('An error occurred loading the HDRI:', error);
    }
);

//GLTF loader
const loader = new GLTFLoader();
const mesh = new Three.Object3D(); // Create empty container for the model

let model; // Create a global variable to store the model

loader.load(
    'public/DamagedHelmet.gltf', // Replace with your model path
    function (gltf) {
        model = gltf.scene;
        mesh.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);
scene.add(mesh);

//renderer
const renderer = new Three.WebGLRenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
    alpha: true
}); 
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);

// Tone mapping and exposure
renderer.toneMapping = Three.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.outputEncoding = Three.sRGBEncoding;
const pmremGenerator = new Three.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

// //orbit controls
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true; // optional, for smoother controls

//postprocessing
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0015; // Adjust the amount of RGB shift
composer.addPass(rgbShiftPass);

window.addEventListener('resize', () => {
    // responsive canvas    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('mousemove', (e) => {
    if(model){
        const rotationX = (e.clientX / window.innerWidth - 0.5)  * (Math.PI*0.11);
        const rotationY = (e.clientY / window.innerHeight - 0.5) * (Math.PI*0.11);
        gsap.to(model.rotation, {
            x: rotationY,
            y: rotationX,
            duration: 0.9,
            ease: "power2.out"
        });
    }
});

//render
function animate(){
    window.requestAnimationFrame(animate);
    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.01;
    // controls.update(); // only required if enableDamping is true
    composer.render();
}
animate();

// 3d models from threejs and sktechfab website 
// background from polyhaven website
// postprocessing from threejs examples
// locomotive scroll from locomotive scroll website