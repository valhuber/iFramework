if (req.verb === 'POST' || req.verb ==="PUT") {
    var title = "iRefRJdb - iPack_common_ignoreUnused_reqEvt: ";
    var extProps = null;  // see resource Extended Properties: ProcessCharges
    try {
        extProps = SysUtility.getExtendedPropertiesFor(req.resourceName);
    } catch(e) {
        // occurs for non-resources, etc...
    }
    
    // ignore cols not in meta data (note: simpler approach is to use req.setUserProperty("IgnoreExtraAttributes", "NonNullValue");... this illustrates utilizing metadata)
    if (extProps && 'object' === typeof extProps && ! Array.isArray(extProps) && extProps.hasOwnProperty('IgnoreUnused') ) {  
        // print("...." + title + req.resourceName + " is designated (per extProps) - to ignore unused columns: " +
        //     "\n...Config (from library: " + JSON.stringify(Config) +
        //     "\n...payload: " + json);  
        var resourcesString = SysUtility.restGet(Config.settings.resourceURL + "/@resources",
                                            {}, Config.settings.authHeader);
        var resources = JSON.parse(resourcesString);
        var resourceID = 0;
        for each (var eachResource in resources) {  // find the ident of 'me'
            if (eachResource.name === req.resourceName) {
                resourceID = eachResource.ident;
                break;
            }
        }
        if (resourceID === 0)
            throw "unable to find metadata for resource: " + req.resourceName;
        var url = Config.settings.resourceURL + "/@resources/" + resourceID;
        var resourceDefAsString = SysUtility.restGet(Config.settings.resourceURL + "/@resources/" + resourceID, {}, Config.settings.authHeader);
        var resourceDef = JSON.parse(resourceDefAsString);
        var resourceAttributes = resourceDef.attributes;
        // print(title + "resourceAttributes: " + JSON.stringify(resourceAttributes));
        
        var debugMoved = [];
        var reqJsonObj = JSON.parse(json);  // TODO - should really deal with each obj, subObjs...
        // print(title + "reqJsonObjArray: " + JSON.stringify(reqJsonObj));
        for  (var eachProp in reqJsonObj) { 
            var isDefinedAttr = false;
            // print(title + "eachProp: " + eachProp);
            for each (var eachResourceAttribute in resourceAttributes) {
                if (eachProp == eachResourceAttribute.name) {
                    isDefinedAttr = true;
                    break;
                }
            }
            if ( isDefinedAttr ) { // wanted: resourceAttributes.findIndex(isAttribute) ) {
                debugMoved.push(eachProp);
            } else {
                // print(title + "deleting attribute: " + eachProp);
                if (eachProp !== "@metadata" )
                    delete reqJsonObj[eachProp];
            }
          }
        json = JSON.stringify(reqJsonObj);  // system will process this altered json  
        print("...." + title + "copyAttributes - moved: [" + debugMoved + "]" +
            ", revised json: " + json);
    } else {
        //print("...." + title + req.resourceName + " is *not* designated (per extProps) - to ignore unused columns: " +
        //    ", Config (from library: " + JSON.stringify(Config) +
        //    ", payload: " + JSON.stringify(JSON.parse(json)));  
    }
}
