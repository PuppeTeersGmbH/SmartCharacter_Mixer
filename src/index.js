import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
//import { animate } from "motion";

let scene, renderer, camera, model, clock, controls, mixer, skeleton;
let idleAction, stanceAction, waitingAction;
let actions = [];
let settings;

//let animate = require('motion');

const clusters = {
    headCluster: [],
    bodyCluster: [],
};

//nicht als Variable speichern, sondern als string by name 
//Change to KeyValue like in constants script? 
const animationConfig = [
    { action: idleAction, applyTo: 'global' },
    { action: stanceAction, applyTo: 'headCluster' },
    { action: waitingAction, applyTo: 'bodyCluster' }
];





// *************************
// * Viseme Code von Niklas :)  *
// *************************


let leftEye;
let rightEye;
let jaw;
let jawStartRotationZ = 0;

// FPS
let currentAudioFrame = 0;
let iteratorForVisemes = 0;
let iteratorForGestures = 0;
let iteratorForActions = 0;
let iteratorForExpressions = 0;

let answerQueue = [];


let NEW_VISEME_TABLE = {
    "E":    [ -8.0, 0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0],
    "FV":   [ -0.5, -0.1, 0.1, 1.9, 0.0, 0.4, 0.9, 0.05, 0.0, 0.1, 0.0],
    "AI":   [ -7.5, 0.0, 0.2, 0.55, 0.1, 0.15, 0.4, 0.2, 0.0, 0.1, 0.0],
    "L":    [ -7.5, 0.0, 0.0, 0.55, 0.1, 0.15, 0.4, 0.2, 0.0, 0.0, 0.0],
    "O":    [ -5.0, 0.1, 1.5, 0.2, 0.0, 0.0, 0.15, 0.0, -0.25, 0.0, 0.0],
    "etc":  [ -2.0, -0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0],
    "U":    [ -1.0, -0.1, 2.0, 0.0, 0.5, 0.25, 0.0, 0.0, -0.2, 0.0, 0.0],
    "WQ":   [ -1.5, -0.2, 0.3, 1.9, 0.0, 0.2, 0.0, 0.0, -0.1, 0.0, 0.0],
    "MBP":  [ -0.5, 0.15, 0.2, 1.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.1],
    "rest": [ 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
};

let NEW_SORTED_LIST_VISEME_TARGETS = []

let characterInfluences;
//////////



init();
customAnimate();
createPanel();

console.log("Hello from Three.js!");

function init() {
    const container = document.getElementById('container');

    // Set up the scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    // Set up the camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(1, 2, -3);
    camera.lookAt(0, 1, 0);

    // Set up lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2);
    dirLight.position.set(-3, 10, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3); // Lower intensity to avoid washing out the scene
    scene.add(ambientLight);

    // Ground
    const groundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Set up OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    // Grid Helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Initialize clock
    clock = new THREE.Clock();

    // Load GLTF model
    const loader = new GLTFLoader();
    loader.load(
        '../models/SC_F_Demo_V04_220524.glb',
        (gltf) => {
            console.log('Model loaded successfully:', gltf);

            // Add the loaded model to the scene
            model = gltf.scene;
            scene.add(model);

            // Initialize skeleton variable
            skeleton = null;
            let skeletonFound = false; 

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
                // Check for SkinnedMesh and skeleton
                if (child.isSkinnedMesh && child.skeleton) {
                    console.log('Found SkinnedMesh:', child);
                    if (!skeletonFound) {
                        skeleton = child.skeleton;
                        console.log('Skeleton found:', skeleton);
                        skeletonFound = true; // Set flag to true after finding the first skeleton
                    }
                }


                // Überprüfen, ob das Mesh Morph-Targets hat
                if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
                    characterInfluences = child.morphTargetInfluences;
                }
            });
            const animations = gltf.animations;

            // Ensure animations are loaded
            if (animations.length === 0) {
                console.error('No animations found in the GLTF model.');
                return;
            }

            // Set up animation mixer
            mixer = new THREE.AnimationMixer(model);

            // Retrieve animations by name
            const idleActionClip = getAnimationByName(animations, 'Cha_SmartCharacter|Idle_AnimClip|BaseLayer');
            const stanceActionClip = getAnimationByName(animations, 'Cha_SmartCharacter|T_Stance_AnimClip|BaseLayer');
            const waitingActionClip = getAnimationByName(animations, 'Cha_SmartCharacter|Waiting_AnimClip_hold|BaseLayer');

            // Check if actions were found
            if (!idleActionClip || !stanceActionClip || !waitingActionClip) {
                console.error('Animation actions not found.');
                return;
            }

            // Create actions
            idleAction = mixer.clipAction(idleActionClip);
            stanceAction = mixer.clipAction(stanceActionClip);
            waitingAction = mixer.clipAction(waitingActionClip);

            actions = [idleAction, stanceAction, waitingAction];

            // Activate all actions
            activateAllActions();

            // Start rendering loop
            renderer.setAnimationLoop(customAnimate);

            // If a skeleton was found, categorize its bones
            if (skeleton) {
                const bones = skeleton.bones;
                categorizeBones(bones, clusters.headCluster, clusters.bodyCluster);

                // Log the clusters to check
                console.log('Head Cluster:', clusters.headCluster);
                console.log('Body Cluster:', clusters.bodyCluster);

                setupClusterBlending();
            } else {
                console.error('No skeleton found in the model.');
            }

            jaw = gltf.scene.getObjectByName("Jaw_bind_01"); // getObjectByName("Jaw");
            if (jaw != null) {
                jawStartRotationZ = jaw.rotation.z;
            } else {
                console.log("Could not find a Jaw joint.");
            }
            NEW_SORTED_LIST_VISEME_TARGETS = [
                jaw,
                0,  // mouth_wide_BS
                1,  // mouth-kiss
                2,  // mouth_bootomLip_up
                3,  // mouth-bottomLip-down
                4,  // mouth-topLip-up
                5,  // mouth-topLip-down
                6,  // cheeck-forehead  // could be seperated
                7,  // puff-out-cheeks
                8,  // mouth-smile
                9   // mouth-pout
            ];

        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the model:', error);
        }
    );
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

// *************************
// * Traverse Rig and add to Clusters   *
// *************************

function categorizeBones(bones, headCluster, bodyCluster) {
    let headBone = null;

    // First, find the head bone
    bones.forEach(bone => {
        if (bone.name.includes('Head')) {
            headBone = bone;
        }
    });
     // If head bone is found, add its children to the head cluster
     if (headBone) {
        headCluster.push(headBone); // Add the head bone itself if needed
        headBone.children.forEach(child => {
            addBoneAndChildrenToCluster(child, headCluster);
        });
    }
     // Add all other bones to the body cluster
     bones.forEach(bone => {
        if (!headCluster.includes(bone)) {
            bodyCluster.push(bone);
        }
    });
}

// Recursive function to add bone and its children to a cluster
function addBoneAndChildrenToCluster(bone, cluster) {
    cluster.push(bone);
    bone.children.forEach(child => {
        addBoneAndChildrenToCluster(child, cluster);
    });
}

// *************************
// * Set up blending based on clusters  *
// *************************

function setupClusterBlending() {
    // Ensure idleAction and stanceAction are available
    if (!idleAction || !stanceAction || !waitingAction) return;

    // Update the mixer to handle blending
    mixer.addEventListener('update', (event) => {
        const delta = clock.getDelta();

        // Update the actions
        updateClusterWeights(idleAction, delta, clusters.bodyCluster);
        updateClusterWeights(stanceAction, delta, clusters.headCluster);
        updateClusterWeights(waitingAction, delta, clusters.headCluster);
    });
}

// Function to update weights for a specific action based on cluster
function updateClusterWeights(action, delta, cluster) {
    if (!action || !cluster || cluster.length === 0) return;

    cluster.forEach(bone => {
        const trackName = `${bone.name}.position`;
        const track = action.getMixer()._bindings.find(binding => binding.binding.targetNode.name === bone.name);

        if (track) {
            track.weight = 1.0;  // or another logic for blending
        }
    });

    mixer.update(delta);
}


function customAnimate() {
    const delta = clock.getDelta();

    if (mixer) mixer.update(delta);

    controls.update();

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createPanel() {
    const panel = new GUI({ width: 310 });

    const folder1 = panel.addFolder('Visibility');
    const folder2 = panel.addFolder('Activation/Deactivation');
    const folder3 = panel.addFolder('Pausing');
    const folder4 = panel.addFolder('Crossfading');
    const folder5 = panel.addFolder('Global Animation Blending');
    const folder6 = panel.addFolder('General Speed');

    settings = {
        'show model': true,
        'show skeleton': true,
        'deactivate all': deactivateAllActions,
        'activate all': activateAllActions,
        'pause/continue': pauseContinue,
        'transition to random animation': () => {
            //TODO: currentAnim wird nicht grundsätzlich Idle Anim sein
            const currentAnim = idleAction;
            const targetAnim = waitingAction; 
            transitionToAnim(currentAnim, targetAnim, setCrossFadeDuration(settings['set custom duration']));
        },
        'animate to viseme': () => {
            animateToViseme("O", 1, false);
        },
        'use default duration': true,
        'set custom duration': 3.5,
        'modify idle weight': 1.0,
        'modify stance weight': 0.0,
        'modify waiting weight': 0.0,
        'modify time scale': 1.0
    };

    folder1.add(settings, 'show model').onChange(showModel);
    folder1.add(settings, 'show skeleton').onChange(toggleSkeletonVisibility);
    folder2.add(settings, 'deactivate all');
    folder2.add(settings, 'activate all');
    folder3.add(settings, 'pause/continue');
    folder4.add(settings, 'transition to random animation');
    folder4.add(settings, 'animate to viseme');
    folder4.add(settings, 'use default duration');
    folder4.add(settings, 'set custom duration', 0, 10, 0.01);
    folder5.add(settings, 'modify idle weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
        setWeight(idleAction, weight);
    });
    folder5.add(settings, 'modify stance weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
        setWeight(stanceAction, weight);
    });
    folder5.add(settings, 'modify waiting weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
        setWeight(waitingAction, weight);
    });
    folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
    folder6.open();
}


function getCurrentAnim() {
    // return the currently playing Animation Actions 
    // Check which clusters will be affected by the new target anim
    // for the affected clusters, transition from currentAnim(affectClusters) to targetAnim(affectedClusters)
}

function getTargetAnim() {
    //return a random target anim from the list 
}
function setCrossFadeDuration(defaultDuration) {
    return settings['use default duration']
        ? defaultDuration
        : settings['set custom duration'];
}

function showModel(visibility) {
    if (model) {
        model.visible = visibility;
    }
}

function deactivateAllActions() {
    actions.forEach(action => action.stop());
}

function activateAllActions() {
    if (idleAction) setWeight(idleAction, settings['modify idle weight']);
    if (stanceAction) setWeight(stanceAction, settings['modify stance weight']);
    if (waitingAction) setWeight(waitingAction, settings['modify waiting weight']);
    actions.forEach(action => action.play());
}

function pauseContinue() {
    if (actions.every(action => action.paused)) {
        unPauseAllActions();
    } else {
        pauseAllActions();
    }
}

function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );
}

function modifyTimeScale(value) {
    actions.forEach(action => action.timeScale = value);
}

function pauseAllActions() {
    actions.forEach(action => action.paused = true);
}

function unPauseAllActions() {
    actions.forEach(action => action.paused = false);
}

function getAnimationByName(animations, name) {
    return animations.find(animation => animation.name === name);
}

//Diese oder getTarget Anim??? 
function getRandomAnimation() {
    const randomIndex = Math.floor(Math.random() * animationConfig.length);
    return animationConfig[randomIndex];
}


function transitionToAnim(currentAnim, targetAnim, duration, blendMode, timestamp) {
    const randomAnimConfig = getRandomAnimation();
    blendMode = randomAnimConfig.applyTo;
    console.log('duration is: ' + duration);

    unPauseAllActions();

    // Determine when to start the transition
    const startTime = timestamp || clock.getElapsedTime(); 
    console.log('Blend Mode set to: ' + blendMode);
    // Execute crossfade based on blend mode
    if (blendMode === 'global') {
        executeGlobalCrossFade(currentAnim, targetAnim, duration, 0);
    } else if (blendMode === 'headCluster' || blendMode === 'bodyCluster') {
        executeClusterCrossFade(currentAnim, targetAnim, duration, 0, blendMode);
    } else {
        console.warn('Unknown blend mode:', blendMode);
    }
}

function executeGlobalCrossFade(currentAnim, targetAnim, duration, startTime) {
    setWeight(currentAnim, 0); 
    setWeight(targetAnim, 1);  
    startTime = 0;

    if (currentAnim && targetAnim) {
        currentAnim.crossFadeTo(targetAnim, duration, true);
    } else {
        console.warn('One or both actions are not defined.');
    }
}

function executeClusterCrossFade(currentAnim, targetAnim, duration, startTime, blendMode) {
    console.log('Current Animation:', currentAnim);
    console.log('Target Animation:', targetAnim);

    if (!currentAnim || !targetAnim) {
        console.error('Current or target animation is not defined.');
        return;
    }

    const cluster = blendMode === 'headCluster' ? clusters.headCluster : clusters.bodyCluster;

    // Get tracks from the current animation clip
    const currentClip = currentAnim.getClip();
    const tracks = currentClip.tracks;

    // Ensure tracks are available
    if (!tracks || tracks.length === 0) {
        console.error('No tracks found in the current animation clip:', currentClip);
        return;
    }

    // Update weights based on cluster
    cluster.forEach(bone => {
        const trackName = `${bone.name}.position`;
   
        // Find the track that matches the bone name
        const track = tracks.find(track => track.name === trackName);

        if (track) {
            // Here you can modify track properties as needed
        } else {
            console.warn('Track not found for bone:', bone);
        }
    });

    if (currentAnim instanceof THREE.AnimationAction) {
        console.log('currentAnim is a valid AnimationAction.');
    } else {
        console.error('currentAnim is not an AnimationAction:', currentAnim);
        console.log('Constructor name of currentAnim:', currentAnim.constructor.name);
    }


    // Perform crossfade
    if (currentAnim && targetAnim) {
        currentAnim.crossFadeTo(targetAnim, duration, true);
    } else {
        console.warn('One or both actions are not defined.');
    }
}
function toggleSkeletonVisibility(visibility) {
    if (skeleton) {
        skeleton.bones.forEach(bone => {
            bone.visible = visibility;
            console.log(`Bone ${bone.name} visibility: ${visibility}`);
        });
    } else {
        console.warn('No skeleton found to toggle visibility.');
    }
}


// *************************
// * Viseme Code von Niklas :)  *
// *************************


function animateToViseme(viseme, timeVal, isLastViseme, visemeToInterpolateWith) {

    // console.log("Viseme: " + viseme);

    let startValues = [];
    let visemeToAnimateTo = [];

    timeVal = timeVal / 1;

    let valueScaleFactor = 0.5; // Value to scale the new viseme parameter

    let maxValueDifference; // Difference between two viseme parameters
    let startValueToCompare, endValueToCompare, valueDifference;

    // console.log("animateToViseme: iterator = " + iteratorForVisemes);

    // if (visemeToInterpolateWith && viseme !== visemeToInterpolateWith) {
    //     visemeToAnimateTo = averageOfTwoVisemes(viseme, visemeToInterpolateWith);
    //     // console.log("viseme to animate to (average): " + visemeToAnimateTo);
    // } else {
        visemeToAnimateTo = NEW_VISEME_TABLE[viseme];
        // console.log("viseme to animate to (single): " + visemeToAnimateTo);
    //}

    // TODO: Check if can be optimized
    console.log(viseme);

    console.log(NEW_VISEME_TABLE[viseme]);

    console.log(visemeToAnimateTo);
    for (let i = 0; i < visemeToAnimateTo.length; i++) {
        // console.log("I: " + i);
        let visemeTarget = NEW_SORTED_LIST_VISEME_TARGETS[i];
        // console.log("Viseme Target: " + visemeTarget);
        endValueToCompare = visemeToAnimateTo[i];

        if (typeof visemeTarget === 'number') {
            startValueToCompare = characterInfluences[visemeTarget];
            startValues.push(startValueToCompare);

            valueDifference = Math.abs(startValueToCompare - endValueToCompare);
            maxValueDifference = 0.5; // TODO: Check if value is nice

        } else { // for non-morph targets (jaw)
            startValueToCompare = visemeTarget.rotation.z - jawStartRotationZ;
            startValues.push(startValueToCompare);

            valueDifference = Math.abs(startValueToCompare - endValueToCompare);
            maxValueDifference = 5.0; // TODO: Check if value is nice
        }
        
        if (valueDifference > maxValueDifference) {
            visemeToAnimateTo[i] *= valueScaleFactor;
            // console.log("value difference: " + valueDifference);
        }
    }
    
    for (let i = 0; i < visemeToAnimateTo.length; i++) {
        let valueToSet = visemeToAnimateTo[i];
        let visemeTarget = NEW_SORTED_LIST_VISEME_TARGETS[i];
    
        if (typeof visemeTarget === 'number') {
            // Update character influences
            characterInfluences[visemeTarget] = startValues[i] + (valueToSet - startValues[i]) * 1;
        } else {
            // Update rotation for non-morph targets (jaw)
            visemeTarget.rotation.z = jawStartRotationZ + startValues[i] * (1 - 1) + valueToSet * Math.PI / 180 * 1;
        }
    }


    if (isLastViseme && isEndOfAnswer) {
        answerQueue.pop();
        // console.log("CURRENT ROW: " + answerQueue.length);
        if (answerQueue.length > 0) {
            // TODO: Answer rows do not need a break between?!
            setTimeout(() => { startNextAnswerOfQueue(); }, 1000);
        }
    }


    // animate(
    //     (1) => {
    //         for (let i = 0; i < visemeToAnimateTo.length; i++) {
    //             let valueToSet = visemeToAnimateTo[i];
    //             let visemeTarget = Constants.NEW_SORTED_LIST_VISEME_TARGETS[i];
                
    //             if (typeof visemeTarget === 'number') {
    //                 // Update character influences
    //                 characterInfluences[visemeTarget] = startValues[i] + (valueToSet - startValues[i]) * 1;
    //             } else {
    //                 // Update rotation for non-morph targets (jaw)
    //                 visemeTarget.rotation.z = jawStartRotationZ + startValues[i] * (1 - 1) + valueToSet * Constants.RAD * 1;
    //             }
    //         }
    //     },
    //     { duration: timeVal, easing: "ease-in-out" }
    // ).finished.then(() => {
    //     if (isLastViseme && isEndOfAnswer) {
    //         answerQueue.pop();
    //         // console.log("CURRENT ROW: " + answerQueue.length);
    //         if (answerQueue.length > 0) {
    //             // TODO: Answer rows do not need a break between?!
    //             setTimeout(() => { startNextAnswerOfQueue(); }, 1000);
    //         }
    //     }
    // });
}

// Starts the next answer of the queue
function startNextAnswerOfQueue() {
    resetAnswer();
    // audioHandler.pauseAudio();
    // if (answerQueue.length > 0) {
    //     audioHandler.loadAndPlay(Constants.MAIN_BACKEND_URL + "/" + answerQueue[answerQueue.length - 1]!.answerAudioUri);
    //     isEndOfAnswer = false;
    // }    
}

// Resets the answer action to get a clean start for the next answer
function resetAnswer() {
    currentAudioFrame = 0;
    iteratorForVisemes = 0;
    iteratorForGestures = 0;
    iteratorForActions = 0;
    iteratorForExpressions = 0;        
}

// Returns the avarage values of two visemes
function averageOfTwoVisemes(viseme1, viseme2) {
    let array1 = NEW_VISEME_TABLE[viseme1];
    let array2 = NEW_VISEME_TABLE[viseme2];
    let newVisemeTable = [array1.length];

    for (let i = 0; i < array1.length; i++) {
        newVisemeTable[i] = (array1[i] + array2[i]) * 0.5;
    }

    return newVisemeTable;
}