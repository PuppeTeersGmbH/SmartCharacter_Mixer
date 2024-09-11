import * as THREE from 'three';
import * as SCENE_HANDLER from './scene-handler.js';
import * as CHARACTER_HANDLER from './character-handler.js';
import * as UTILITY from './utils.js';
import * as DEBUG_GUI from './debug-gui.js';
import { AnimationClip } from 'three';

export let mixer;
let jaw;
let NEW_SORTED_LIST_VISEME_TARGETS = []
let actions = UTILITY.getAnimationActions(); 
let targetAnim, currentAnim

init();

function init() {
    SCENE_HANDLER.drawScene(); 
    CHARACTER_HANDLER.initCharacter();
    DEBUG_GUI.createPanel();

   
    // Debug weil die anderen Sachen nicht fertig waren bevor playAnim gecallt wurde
    setTimeout(() => {
        //DEBUG_GUI.activateAllActions();
        initAnim();
        jaw = SCENE_HANDLER.scene.getObjectByName("Jaw_bind_01"); // getObjectByName("Jaw");
        if (jaw != null) {
            jawStartRotationZ = jaw.rotation.z;
            
            
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
            
        } else {
            console.log("Could not find a Jaw joint.");
        }
    }, 2000); // Delay in milliseconds (e.g., 2000 ms = 2 seconds)

    // Handle window resize
    window.addEventListener('resize', SCENE_HANDLER.onWindowResize);

}


export function initializeActions() {
    const mixer = UTILITY.getMixer();
    const clips = getAnimationClips(); 
    const animationActions = UTILITY.getAnimationActions(); 

    if (!mixer) {
        console.error('Mixer not found');
        return;
    }

    clips.forEach(clip => {
        if (clip instanceof AnimationClip) {
            try {
                // Create an AnimationAction from the mixer and the current clip
                const action = mixer.clipAction(clip);

                // Add the created action to the array
                animationActions.push(action);
            } catch (error) {
                console.error(`Error creating AnimationAction for clip ${clip.name}:`, error);
            }
        } else {
            console.error('Clip is not an instance of AnimationClip:', clip);
        }
    });

     UTILITY.setAnimationActions(animationActions);
     console.log('AnimationActions stored in UTILITY.AnimationActions:', UTILITY.getAnimationActions());
}

function getAnimationClips() {
    // Get all animation names from the Map (keys)
    const animationClips = Array.from(UTILITY.ANIMATION_TABLE.keys());
    UTILITY.setAnimationClips(animationClips);
    console.log('AnimationClips set in UTILITY.AnimationClips:', UTILITY.getAnimationClips());
    return UTILITY.getAnimationClips(); 
    
}

function getRandomAnimation(actions) {
    return actions[Math.floor(Math.random() * actions.length)];
}

function initAnim() {
    currentAnim = actions[0];
    UTILITY.setCurrentAnim(currentAnim);
    targetAnim = getRandomAnimation(actions);
    UTILITY.setTargetAnim(targetAnim);
    console.log("CURRENT ANIM INITIALIZED WITH: ", UTILITY.getCurrentAnim());
    console.log("TARGET ANIM INITIALIZED WITH: ", UTILITY.getTargetAnim())
    currentAnim.play();
}


export function transitionToAnim(currentAnim, targetAnim, duration) {
    let currentAction;
    let targetAction;
    duration = 1; 


    if(currentAnim === targetAnim) {
        console.log("CURRENT ANIM IS THE SAME AS TARGET ANIM... REQUESTING NEW TARGET ANIM....")
        while (currentAnim === targetAnim) {
            targetAnim = getRandomAnimation(actions)
            UTILITY.setTargetAnim(targetAnim);
        }
    }

    // Iterate through the animActions array to find the corresponding AnimationAction objects
    actions.forEach((action) => {
        console.log(action);

        if (action === currentAnim) {
            currentAction = action;
          } 
        if (action === targetAnim) {
            targetAction = action;
          }
    });
  
    if (!currentAction || !targetAction) {
      console.error("Error: Could not find corresponding AnimationAction objects");
      return;
    }
  
    // Set the target action to play
    targetAction.play();

    // Transition from the current action to the target action over the specified duration
    currentAction.crossFadeTo(targetAction, duration, true);

    currentAnim = currentAction;
    targetAnim = getRandomAnimation(actions);
    UTILITY.setTargetAnim(targetAnim);

    UTILITY.setCurrentAnim(currentAnim);
    console.log("CURRENT ANIM IS NOW: ", UTILITY.getCurrentAnim());
    console.log("NEW TARGET ANIM IS NOW: ", UTILITY.getTargetAnim());

}

// *************************
// * Viseme Code von Niklas :)  *
// *************************


let leftEye;
let rightEye;
let jawStartRotationZ = 0;
const characterInfluences = UTILITY.getCharacterInfluences();

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




export function animateToViseme(viseme, timeVal, isLastViseme, visemeToInterpolateWith) {
    let startValues = [];
    let visemeToAnimateTo = [];

    timeVal = timeVal / 1;

    let valueScaleFactor = 0.5; // Value to scale the new viseme parameter

    let maxValueDifference; // Difference between two viseme parameters
    let startValueToCompare, endValueToCompare, valueDifference;
    visemeToAnimateTo = NEW_VISEME_TABLE[viseme];

    // TODO: Check if can be optimized
    console.log(viseme);

    console.log(NEW_VISEME_TABLE[viseme]);

    console.log(visemeToAnimateTo);
    for (let i = 0; i < visemeToAnimateTo.length; i++) {
        console.log(NEW_SORTED_LIST_VISEME_TARGETS);
        let visemeTarget = NEW_SORTED_LIST_VISEME_TARGETS[i];
        console.log("viseme target is" + visemeTarget);
        endValueToCompare = visemeToAnimateTo[i];

        if (typeof visemeTarget === 'number') {
            console.log(characterInfluences);
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

}

// Starts the next answer of the queue
function startNextAnswerOfQueue() {
    resetAnswer();
   
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