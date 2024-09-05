import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SCENE_HANDLER from './scene-handler.js';
import * as UTILITY from './utils.js';
import { clusterBones } from './bone-clusters.js';
import { initializeActions } from './animation-handler.js';
import { AnimationClip } from 'three';

//export let skeleton = null; 
let skeletonFound = false;

//////////

export function initCharacter() {
    loadModel(); 
}

export function loadModel() {
    const loader = new GLTFLoader();
    loader.load(
        '../models/SmartCharacter_2024.glb',
        (gltf) => {
            console.log('Model loaded successfully:', gltf);

            UTILITY.setModel(gltf.scene);
            SCENE_HANDLER.scene.add(gltf.scene);
            const model = UTILITY.getModel();
            UTILITY.createSkeletonHelper(gltf.scene);

            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }

                // Check for SkinnedMesh and skeleton
                if (child.isSkinnedMesh && child.skeleton) {
                    console.log('Found SkinnedMesh:', child);
                    if (!skeletonFound) {
                        UTILITY.setSkeleton(child.skeleton);
                        console.log('Skeleton found:', UTILITY.getSkeleton());
                        skeletonFound = true; 
                    }
                }

                // Check if the mesh has morph targets
                if (child.morphTargetInfluences && child.morphTargetInfluences.length > 0) {
                    UTILITY.setCharacterInfluences(child.morphTargetInfluences);
                }
            });

            extractAnimationData(gltf);
            clusterBones();
            UTILITY.createMixer(model);
            initializeActions(); 


        },
        undefined,
        (error) => {
            console.error('An error occurred while loading the model:', error);
        }
    );
    
}

function extractAnimationData(gltf) {
    // Returns the clips
    const animations = gltf.animations;
    animations.forEach((animationClip) => {
      animationClip.optimize = false;
    });

    if (animations.length === 0) {
        console.error('No animations found in the GLTF model.');
        return;
    }

    for (const clip of animations) {
        const cluster = getClusterFromName(clip.name);

        // Assuming AnimationClip is correctly imported or available globally
        if (clip.constructor.name === 'AnimationClip' || clip instanceof AnimationClip) {
            UTILITY.ANIMATION_TABLE.set(clip, cluster);
        } else {
            console.error(`Clip is not an instance of AnimationClip: ${clip}`);
        }
    }

    console.log('Animation Table:', UTILITY.ANIMATION_TABLE);
    //validateAnimationTable();
}


const getClusterFromName = (name) => {
    // Check each keyword and return the associated cluster if found in the name
    for (const [key, value] of Object.entries(UTILITY.CLUSTER_KEYWORDS)) {
        if (name.includes(value)) {
            return value;
        }
    }
    // Return 'undefined' if no keyword is found
    return 'UNKNOWN';
};

// *************************
// * DEBUGGING *
// *************************

// function validateAnimationTable() {
//     UTILITY.ANIMATION_TABLE.forEach((value, key) => {
//         // Check key
//         if (!(key instanceof AnimationClip)) {
//             console.error(`Key "${key}" is not an instance of AnimationClip. It is of type: ${key.constructor.name}`);
//         } else {
//             console.log(`Key "${key}" is a valid AnimationClip.`);
//         }

//         // Check value
//         if (typeof value !== 'string') {
//             console.error(`Value for key "${key}" is not a string. It is of type: ${value.constructor.name}`);
//         } else {
//             console.log(`Value for key "${key}" is a valid string.`);
//         }
//     });
// }