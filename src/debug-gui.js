import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as UTILITY from './utils.js';
import { animateToViseme } from './animation-handler.js'
import * as SCENE_HANDLER from './scene-handler.js';
import { clusterBones } from './bone-clusters.js';

let settings;
const actions = UTILITY.getAnimationActions(); 

// *************************
// * DEBUG CONTROL WINDOW  *
// *************************

export function createPanel(bla) {
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
            const currentAnim = actions[0];
            const targetAnim = getRandomAnimation(actions); 
            transitionToAnim(currentAnim, targetAnim, setCrossFadeDuration(settings['set custom duration']));
        },
        'animate to viseme': () => {
            animateToViseme("O", 1, false);
        },
        'use default duration': true,
        'set custom duration': 3.5,
        'Default Anim Weight': 1.0,
        'Next Anim Weight': 0.0,
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
    folder5.add(settings, 'Default Anim Weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
        setWeight(actions[0], weight);
    });
    folder5.add(settings, 'Next Anim Weight', 0.0, 1.0, 0.01).listen().onChange((weight) => {
        setWeight(actions[2], weight);
    });

    folder6.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
    folder6.open();
}


// *************************
// * DEBUG LOGIC *
// *************************

function getRandomAnimation(actions) {
    return actions[Math.floor(Math.random() * actions.length)];
}

function serverSimulator() {
    // Returns Random Animation Name String 
    const animationClips = UTILITY.getAnimationClips();
    const randomClip = (animationClips[Math.floor(Math.random() * animationClips.length)]);
    return randomClip.name;
}

function transitionToAnim(currentAnim, targetAnim, duration, timestamp) {
    targetAnim = serverSimulator();
    duration = 1; 
    timestamp = 1; 
  
    // Create a THREE.js AnimationMixer
    const mixer = UTILITY.getMixer(); 
    // Create a clip for the current animation
    const currentClip = mixer.clipAction(currentAnim.clip);
    currentClip.weight = 1;
  
    // Create a clip for the target animation
    const targetClip = mixer.clipAction(targetAnim.clip);
    targetClip.weight = 0;
  
    // Create a transition action to fade out the current animation
    const transitionAction = mixer.clipAction(currentAnim.clip);
    transitionAction.weight = 1;
    transitionAction.time = 0;
    transitionAction.timeScale = 1;
    transitionAction.loop = THREE.LoopOnce;
    transitionAction.clampWhenFinished = true;
    transitionAction.enable = true;
  
    // Create a transition action to fade in the target animation
    const fadeInAction = mixer.clipAction(targetAnim.clip);
    fadeInAction.weight = 0;
    fadeInAction.time = 0;
    fadeInAction.timeScale = 1;
    fadeInAction.loop = THREE.LoopOnce;
    fadeInAction.clampWhenFinished = true;
    fadeInAction.enable = true;
  
    // Set up the transition
    transitionAction.play();
    fadeInAction.play();
  
    // Animate the transition
    function animate(timestamp) {
      mixer.update((timestamp - timestamp) * 0.001);
      transitionAction.time = (timestamp - timestamp) * 0.001;
      fadeInAction.time = (timestamp - timestamp) * 0.001;
      if (transitionAction.time >= duration) {
        transitionAction.enabled = false;
        fadeInAction.enabled = false;
      }
    }
  
    // Start the animation
    animate(timestamp);

        //const blendMode = getTargetAnimCluster(targetAnim);

    // Current Anim = get currently playing anim  
    // blend Mode = get from Animation Clip name corresponding sh. Animation Table 
    // Timestamp? 1 (instant) || 0 (verzögert)

  }

function getTargetAnimCluster(targetAnim) {
    //Receive Target Anim as String, compare with name of the Clips in ANIMATION_TABLE
    //Upon finding a match, pass value (Cluster String) to next Method
    for (const [key, value] of UTILITY.ANIMATION_TABLE) {
        if (key.name === targetAnim) {
            //GET THE CLIP??? 
            getBoneSet(targetAnim, value) 
        }
      }
    return null; 
}

function getBoneSet(targetAnim, blendMode) {
    const clusters = clusterBones();
    const clusterKey = Object.keys(UTILITY.CLUSTER_KEYWORDS).find(key => UTILITY.CLUSTER_KEYWORDS[key] === blendMode);
    const clusterPropertyName = UTILITY.CLUSTER_KEYWORDS[clusterKey];
    const boneSet = clusters[clusterPropertyName];

    if (clusterKey) {
        const targetBones = []; 
        Array.from(boneSet).forEach(boneName => {
            const bone = SCENE_HANDLER.scene.getObjectByName(boneName);
            if (bone) {
                targetBones.push(bone);
            }
        });
    console.log(targetBones);
    applyAnimToCluster(targetBones)
    }
}

function applyAnimToCluster(targetBones) {

    const globalAnimClip = null; 
    const clips = UTILITY.getAnimationClips(); 
    const headAnimClip = clips[2]; 
    const currentClip = clips[0];




    console.log(headAnimClip);
    const upperBodyAnimClip = null; 
    const lowerBodyAnimClip = null; 

    const mixer = UTILITY.getMixer(); 
    console.log(mixer);
    const oldAction = mixer.clipAction(currentClip);
    const dynamicAction = mixer.clipAction(headAnimClip);

    dynamicAction.weight = 0; 

    dynamicAction.crossFadeFrom(oldAction, 1);
    dynamicAction.crossFadeTo(dynamicAction, 1, true);

    targetBones.forEach((joint) => {
        dynamicAction.setBone(joint);
    });
    mixer.play(); 
}


function setCrossFadeDuration(defaultDuration) {
    return settings['use default duration']
        ? defaultDuration
        : settings['set custom duration'];
}

function showModel(visibility) {
    const model = UTILITY.getModel();
    if (model) {
        console.log(model);
        model.visible = visibility;
    }
}

function deactivateAllActions() {
    actions.forEach(action => action.stop());
}

export function activateAllActions() {
    actions.forEach((action, index) => {
        action.play(); 
        if (index === 0) {
            setWeight(action, 1);
        } else {
            setWeight(action, 0);
        }
    });
}

function pauseContinue() {
    if (actions.every(action => action.paused)) {
        unPauseAllActions();
    } else {
        pauseAllActions();
    }
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

function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale( 1 );
    action.setEffectiveWeight( weight );

}

// *************************
// * UNNÖTIG? *
// *************************

function toggleSkeletonVisibility(visibility) {
    const skeleton = UTILITY.getSkeleton(); 
    if (skeleton) {
        skeleton.bones.forEach(bone => {
            bone.visible = visibility;
            console.log(`Bone ${bone.name} visibility: ${visibility}`);
        });
    } else {
        console.warn('No skeleton found to toggle visibility.');
    }
}

