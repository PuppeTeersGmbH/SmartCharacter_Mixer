import * as UTILITY from './utils.js';

// Exception list containing bones that should not be added to any cluster
const exceptionList = ['Jaw_bind_01', 'UpperEyelid_bind_L', 'UpperEyelid_bind_R'];

export function clusterBones() {
    const skeleton = UTILITY.getSkeleton(); 
    // Create cluster sets for each cluster
    const clusters = {
        [UTILITY.CLUSTER_KEYWORDS.globalCluster]: new Set(),
        [UTILITY.CLUSTER_KEYWORDS.headCluster]: new Set(),
        [UTILITY.CLUSTER_KEYWORDS.upperBodyCluster]: new Set(),
        [UTILITY.CLUSTER_KEYWORDS.lowerBodyCluster]: new Set(),
    };

    // Helper function to recursively add bones to clusters
    function traverseBone(bone, clusterName) {
        if (!bone || isInExceptionList(bone)) return;

        // Add the current bone to the specified cluster
        if (clusters[clusterName] instanceof Set) {
            clusters[clusterName].add(bone.name);
        } else {
            console.error('The value is not a Set');
        }

        // Traverse children
        if (bone.children) {
            bone.children.forEach(childBone => traverseBone(childBone, clusterName));
        }
    }

    // Function to check if the bone is in the exception list
    function isInExceptionList(bone) {
        return exceptionList.includes(bone.name);
    }

    // Function to check if the bone is already in any cluster (excluding globalCluster and upperBodyCluster)
    function isInAnyOtherCluster(bone) {
        return Object.keys(clusters).some(clusterKey => {
            return clusterKey !== UTILITY.CLUSTER_KEYWORDS.globalCluster && clusterKey !== CLUSTER_KEYWORDS.upperBodyCluster && clusters[clusterKey].has(bone.name);
        });
    }

    // Start by clustering the entire skeleton into the global cluster
    function traverseSkeleton(bone) {
        if (!bone || isInExceptionList(bone)) {
            const clips = UTILITY.getAnimationClips();
            clips.forEach((clip) => {
                const boneKeys = clip.tracks.find((track) => track.name === bone.name);
                console.log(boneKeys);
                if (boneKeys) {
                  console.log(`Keys on bone ${bone.name} for clip ${clip.name}:`);
                  console.log(`  Times: ${boneKeys.times}`);
                  console.log(`  Values: ${boneKeys.values}`);
                  boneKeys.times = [];
                  boneKeys.values = [];
                }
            });
        }

        // Add all bones to global cluster
        if (clusters[UTILITY.CLUSTER_KEYWORDS.globalCluster] instanceof Set) {
            clusters[UTILITY.CLUSTER_KEYWORDS.globalCluster].add(bone.name);
        } else {
            console.error('The value is not a Set');
        }

        // Specific clustering based on bone name
        if (bone.name.includes('Head')) {
            traverseBone(bone, UTILITY.CLUSTER_KEYWORDS.headCluster);
        } else if (bone.name.includes('UpperLeg')) {
            traverseBone(bone, UTILITY.CLUSTER_KEYWORDS.lowerBodyCluster);
        } else if (/root|Spine|Clavicle|Shoulder|Elbow|Wrist|Hand|finger|Pinky|Thumb/i.test(bone.name)) {
            traverseBone(bone, UTILITY.CLUSTER_KEYWORDS.upperBodyCluster);
        }

        // Traverse all children
        if (bone.children) {
            bone.children.forEach(childBone => traverseSkeleton(childBone));
        }
    }

    // Traverse all bones in the skeleton
    skeleton.bones.forEach(bone => traverseSkeleton(bone));
    console.log('Final Clusters:', clusters);
    return clusters;
}

// currentClip.tracks.forEach((track) => {
//     var times = track.times;
//     console.log(`Track ${track.name} has ${times.length} keys at frames:`);

//     console.log(times.map((time, index) => `  Frame ${index}: ${time} sec`));

//     console.log(times[0]);
//     times = [];
//     console.log(times[0]);

//     console.log(`Track ${track.name} has ${times.length} keys at frames:`);

//   });
