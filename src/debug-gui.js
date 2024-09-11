import * as THREE from 'three';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import * as UTILITY from './utils.js';
import { animateToViseme, transitionToAnim } from './animation-handler.js'
import * as SCENE_HANDLER from './scene-handler.js';

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
    const folder5 = panel.addFolder('General Speed');

    settings = {
        'show model': true,
        'show skeleton': true,
        'deactivate all': deactivateAllActions,
        'activate all': activateAllActions,
        'pause/continue': pauseContinue,
        'transition to random animation': () => {
            transitionToAnim(UTILITY.getCurrentAnim(), UTILITY.getTargetAnim(), setCrossFadeDuration(settings['set custom duration']));
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
    folder5.add(settings, 'modify time scale', 0.0, 1.5, 0.01).onChange(modifyTimeScale);

    folder1.open();
    folder2.open();
    folder3.open();
    folder4.open();
    folder5.open();
}


// *************************
// * DEBUG LOGIC *
// *************************

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
    console.log(action.weight);

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

