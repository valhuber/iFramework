common_iPack_srcTimer.timerFindProcessChanges("Rally Timer", function(aResourceDef) {
    // choose which resources will be processed (e.g., by DSP, or here, just the name)
    return aResourceDef.name.contains("Rally") && aResourceDef.name.contains("Source");
});    
