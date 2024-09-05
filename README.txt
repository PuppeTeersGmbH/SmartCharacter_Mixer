// Call the PrepareCrossfade method parsing the corresponding start- and end-animations + duration of 1
// Is it possible to address only particular bone hierarchies? 

CHARACTER HANDLER: 
    - Loads Model, Skeleton, Skin

ANIMATION HANDLER: 
    - Animation Mixer logic: Global or Cluster-Based? Blending-Duration? 
    - Updates Current and Target Animations 
    - Does not include the Visemes as they are Mixer-independent (?)

BONE-CLUSTERS: 
    - Defines Clusters
    - Traverses the skeleton and assigns the bones to corresponding Clusters
    - Excludes: Bones that are needed for Procedural Animation ( JAW, UpperEyelid_bind_L, UpperEyelid_bind_R)

DEBUG GUI: 
    - Will eventually be removed 
    - For debugging, testing, handles the control window and corresponding logic 
    - Logic should be decoupled so the GUI can later simply be removed 

SCENE HANDLER: 
    - Sets up the Scene, Light, Camera, etc. 

UTILS: 
    - Script for Global Constants that need to be accessed from several scripts 

******************************************************************************
******************************************************************************
FIX: Upperbody Cluster gets all the bones because child bones are included

