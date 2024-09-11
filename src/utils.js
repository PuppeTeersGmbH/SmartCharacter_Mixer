import * as THREE from 'three';
import { SkeletonHelper } from 'three';


let _model = null; 
let _skeleton = null; 
let _skeletonHelper; 
let _mixer = null; 
let _animationClips = []; 
let animationActions = [];
let _currentAnim = null; 
let _targetAnim = null; 


export const ANIMATION_TABLE = new Map();
let _characterInfluences = [];

export const CLUSTER_KEYWORDS = {
    globalCluster: 'GLOBAL',
    headCluster: 'HEAD',
    upperBodyCluster: 'UPPERBODY',
    lowerBodyCluster: 'LOWERBODY'
};

export function getModel() {
    return _model;
}

export function setModel(model) {
    _model = model;
}


export function getSkeleton() {
    return _skeleton;
}

export function setSkeleton(skeleton) {
    _skeleton = skeleton;
}

export function createSkeletonHelper(model) {
    _skeletonHelper = new THREE.SkeletonHelper(model);
}


// Function to create a new mixer
export function createMixer(model) {
    if (_mixer === null) {
        _mixer = new THREE.AnimationMixer(model);
    }
}

export function getMixer() {
    return _mixer;
}

export function setMixer(mixer, model) {
    _mixer = mixer;
    
}

export function getAnimations() {
    return animations; 
}

export function getAnimationClips() {
    return _animationClips;
}

export function setAnimationClips(animationClips) {
    _animationClips = animationClips;    
}

export function getAnimationActions() {
    return animationActions;
}

export function setAnimationActions(animationActions) {
    animationActions = animationActions;
}

export function getCharacterInfluences() {
    return _characterInfluences;
}
export function setCharacterInfluences(characterInfluences) {
    _characterInfluences = characterInfluences; 
}

export function getCurrentAnim() {
    return _currentAnim; 
}

export function setCurrentAnim(currentAnim) {
    _currentAnim = currentAnim; 
}

export function getTargetAnim() {
    return _targetAnim; 
}

export function setTargetAnim(targettAnim) {
    _targetAnim = targettAnim; 
}