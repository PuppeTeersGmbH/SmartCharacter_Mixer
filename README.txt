// Call the PrepareCrossfade method parsing the corresponding start- and end-animations + duration of 1

CHARACTER HANDLER: 
    - Loads Model, Skeleton, Skin

ANIMATION HANDLER: 
    - Updates Current and Target Animations 
    - Does not include the Visemes as they are Mixer-independent (?)

DEBUG GUI: 
    - Will eventually be removed 
    - For debugging, testing, handles the control window and corresponding logic 
    - Logic should be decoupled so the GUI can later simply be removed 

SCENE HANDLER: 
    - Sets up the Scene, Light, Camera, etc. 

UTILS: 
    - Script for Global Constants that need to be accessed from several scripts 

