var ttl = "common_iPack_util - ";

var common_iPack_util = {};  // a common JavaScript technique to name-scope shared functions

/***********************************
 * Contents:
 * 
 * postChangedAttrsToQueue - POSTs row to Q with target resource, and the set of changedAttrs
 * get_or_create_SyncMapRow - gets or creates SyncMapRow, from a changed row for aResourceToProcess (assumes ident)
 * computeChangedAttrs - compute actually changed attrs per SyncMap
 * computeLeft_Right_AttrName
 * throwError
 * removeAttr
 * 
 ************************************/

common_iPack_util.printSyncMapRow = function printSyncMapRow(aMsg, aSyncMapRow) {
    print (aMsg + "SyncMapRow[" + aSyncMapRow.ident + "]: sync_entity: " + aSyncMapRow.sync_entity + ", last_from: " + aSyncMapRow.sync_last_from +
        ", sync_left_ident: " + aSyncMapRow.sync_left_ident + ", sync_right_ident: " + aSyncMapRow.sync_right_ident +
        "\n...left_curr_values:    " + aSyncMapRow.sync_left_curr_values + 
        "\n...left_changed_values: " + aSyncMapRow.sync_left_changed_values +
        "\n...right_curr_values:    " + aSyncMapRow.sync_right_curr_values + 
        "\n...right_changed_values: " + aSyncMapRow.sync_right_changed_values 
        );  // add changed_values
};

common_iPack_util.computeLeft_Right_AttrName = function computeLeft_Right_AttrName(aTemplate, aLeftRight) {
    var returnAttrName = "xx";
    if (aLeftRight == "Left")
        returnAttrName = aTemplate.replace("?", "left");
    else if (aLeftRight == "Right")
        returnAttrName = aTemplate.replace("?", "right");
    else {
        throwError("computeLeft_Right_AttrName, bad ExtProp.Synchronize.EntityMapAttr, " + aLeftRight + " is not 'Left' or 'Right");
    }
    return returnAttrName;
};


common_iPack_util.throwError = function throwError(aMsg) {
    var Thread = Java.type('java.lang.Thread');
    Thread.sleep(1000);  // wait for the log messages to print
    print("\n\n*************\n" + aMsg + "\n*************");
    throw aMsg;    // FIXME how do I find LAC logs in localDev?
};

common_iPack_util.removeAttr = function removeAttr(anObject, anAttrName) {  // simple objects only
    var rtnObj = {};
    for (var key in anObject) {
        if (key !== anAttrName)
            rtnObj[key] = anObject[key];
    }
    return rtnObj;
};



/**
 * POSTs row to Q with target resource, and the set of changedAttrs
 */
common_iPack_util.postChangedAttrsToQueue = function PostChangedAttrsToQueue(aSyncMapRow, aTargetResourceName, aPostedBy) {
    var ttlSub = ttl + "- postChangedAttrsToQ: ";
    var changedValuesAttrName = common_iPack_util.computeLeft_Right_AttrName("sync_?_changed_values", aSyncMapRow.sync_last_from);

    var qRow = {};
    qRow.changed_columns = aSyncMapRow[changedValuesAttrName]; // JSON.stringify(anUnchangedAttrs);
    qRow.sync_map_row = JSON.stringify(aSyncMapRow);
    qRow.target_url = settings.svrURL + "/v1/" + aTargetResourceName;
    qRow.process_call_from_queue_url = settings.svrURL + "/v1/processCallFromQueue";
    qRow.status = "Ready";
    qRow.posted_by = aPostedBy;
    print(ttlSub + "url: " + settings.iQurl + "/v1/PostChangedAttrs" +
        "\n.... settings.iQToken: " + JSON.stringify(settings.iQToken) +
        "\n.... qRow: " + JSON.stringify(qRow));
    var postResponseString = "tbd";
    try {
        postResponseString = timerUtil.restPost(
            settings.iQurl + "/v1/PostChangedAttrs", null, settings.iQToken, qRow);
    } catch(e) {
        common_iPack_util.throwError(ttlSub + "Post fails with: " + e);
    }
    // print(ttlSub +"postResponseString: " + postResponseString);
    var postResponse = JSON.parse(postResponseString);
    if (postResponse.statusCode != 201) {
        common_iPack_util.throwError(ttlSub + "postResponse, " + JSON.stringify(postResponse));
    }
};


/**
 * gets or creates SyncMapRow, from a changed row for aResourceToProcess (assumes ident)
 * 
 * Important - requirements issue.  TODO
 *    Does G1 contain a date for each attr?  How is that used??
 */
common_iPack_util.get_or_create_SyncMapRow = function get_or_create_SyncMapRow(aSourceResource, aResourceRow) {
    var ttlSub = ttl + "- get_or_create_SyncMapRow: ";
    var returnSyncMapRow = {hello: "stub"};
    var syncProps = aSourceResource.extendedProperties[settings.sourceResourceExtPropName];
    var identAttrName = common_iPack_util.computeLeft_Right_AttrName("sync_?_ident", syncProps.EntityMapAttr);
    var currValuesAttrName = common_iPack_util.computeLeft_Right_AttrName("sync_?_curr_values", syncProps.EntityMapAttr);
    var changedValuesAttrName = common_iPack_util.computeLeft_Right_AttrName("sync_?_changed_values", syncProps.EntityMapAttr);
    var url = settings.svrURL + "/v1/main:SyncMap";
    var params = {
        sysfilter: "equal(" + identAttrName + ":" + aResourceRow.ident + 
            ",sync_entity:'" + syncProps.EntityMapName + "'" +
            ")"
    };
    print("\n" + ttlSub + "getting syncMap[" + JSON.stringify(params) + "] for source aResourceRow:" + JSON.stringify(aResourceRow) );
    var responseString = "no response";
    var response = {};
    try {
        responseString = timerUtil.restGet(url, params, settings.intToken);
    } catch(e) {
        common_iPack_util.throwError(ttlSub + "get_or_create_SyncMapRow, get fails with: " + e);
    }
    // print(ttl + "get_or_create_SyncMapRow get response: " + response);
    var sampleRowResult = JSON.parse(responseString);
    if (sampleRowResult.length === 0) {
        try {
            returnSyncMapRow = {};
            returnSyncMapRow.sync_entity = syncProps.EntityMapName;
            returnSyncMapRow.sync_last_from = syncProps.EntityMapAttr;
            returnSyncMapRow[identAttrName] = aResourceRow.ident;
            returnSyncMapRow[currValuesAttrName] = JSON.stringify(aResourceRow);
            returnSyncMapRow[changedValuesAttrName] = JSON.stringify(aResourceRow);
            common_iPack_util.printSyncMapRow(ttlSub + "ID["+ aResourceRow.ident + "] not found, so INSERTING returnSyncMapRow: ", returnSyncMapRow);
            responseString = timerUtil.restPost(url, params, settings.intToken, returnSyncMapRow);
            response = JSON.parse(responseString);
            var createdRowTxsummary = response.txsummary;
            var createdRowMeta = createdRowTxsummary[0]["@metadata"];  // FIXME - is @meta always first?
            var createdRowURL = createdRowMeta.href;
            // print(ttl + "Posted target, createdRowURL: " + createdRowURL);
            var segment_array = createdRowURL.split( '/' );
            var createdRowID = segment_array.pop();
            returnSyncMapRow.ident = createdRowID;
        } catch(e) {
            common_iPack_util.throwError(ttlSub + "Post fails with: " + e);
        }
        
    } else if (sampleRowResult.length === 1) {
        try {
            returnSyncMapRow = sampleRowResult[0];
            common_iPack_util.computeChangedAttrs(changedValuesAttrName, currValuesAttrName, returnSyncMapRow, aResourceRow);
            returnSyncMapRow[currValuesAttrName] = JSON.stringify(aResourceRow);
            returnSyncMapRow.sync_last_from = syncProps.EntityMapAttr;
            if ( ! settings.useDirectUpdate ) {
                print(ttl + "Fetching freshSyncMapRow , url: " + url);
                // http://localhost:8080/rest/default/iRefRJdb/v1/main:SyncMap/7?checksum=override
                // {"sync_right_ident":722}
                // FIXME fails: No such object: main:SyncMap (main:SyncMap[{}]) in resource main:SyncMap
                responseString = SysUtility.restGet(url, {checkum: "override"}, settings.intToken);
                response = JSON.parse(responseString);
                var freshSyncMapRow = response[0];
                var freshSyncMapRow_Meta = freshSyncMapRow["@metadata"];
                returnSyncMapRow["@metadata"] = freshSyncMapRow_Meta;
            }
            responseString = timerUtil.restPut(url, params, settings.intToken, returnSyncMapRow);
            common_iPack_util.printSyncMapRow(ttlSub + "ID["+ aResourceRow.ident + "] found, so UPDATED returnSyncMapRow: ", returnSyncMapRow);
        } catch(e) {
            common_iPack_util.throwError(ttlSub + "Put fails with: " + e);
        }
    } else {
        common_iPack_util.throwError(ttlSub + "**ERROR** get returns multiple rows, sampleRowResult.length: " + sampleRowResult.length);
    }
    
    return returnSyncMapRow;
};


/**
 * compute actually changed attrs per SyncMap
 */
common_iPack_util.computeChangedAttrs = function computeChangedAttrs(aChangedValuesAttrName, aCurrValuesAttrName, aSyncMapRow, aResourceRow) {
    var ttlSub = ttl + "computeChangedAttrs - ";
    var changedAttrs = {};
    var lastSyncRow = JSON.parse(aSyncMapRow[aCurrValuesAttrName]);
    for (var eachAttr in lastSyncRow) {
        if (lastSyncRow.hasOwnProperty(eachAttr)) {
            // print(ttlSub + "compare[" + eachAttr + "], lastSyncRow: " + lastSyncRow[eachAttr] + ", newRow: " + aResourceRow[eachAttr]);
            if (lastSyncRow[eachAttr] !== aResourceRow[eachAttr]) {
                changedAttrs[eachAttr] = aResourceRow[eachAttr];
            }
        } else {
            common_iPack_util.throwError(ttlSub + "unable to find attr: " + eachAttr);
        }
    }
    aSyncMapRow[aChangedValuesAttrName] = JSON.stringify(changedAttrs);
    return (aSyncMapRow);
};

common_iPack_util.getResourceNamed = function getResourceNamed(aName) {
    //print(ttl + "..getResourceNamed() " + "from settings.svrURL: " + settings.svrURL + "/@resources\n" +
    //     "...using settings.intToken: " + JSON.stringify(settings.intToken));
    var resourceNamesString = listenerUtil.restGet(
            settings.svrURL + "/v1/@resources", null, settings.intToken);
    // print(ttl + "..resourceNamesString: " + resourceNamesString);
    resourceSummary = null;
    var resourceNames = JSON.parse(resourceNamesString);
    for (var i = 0 ; i < resourceNames.length ; i++) {
        var eachResourceDef = resourceNames[i];
        var eachResourceName = eachResourceDef.name;
        if (aName == eachResourceDef.name) {
            resourceSummary = eachResourceDef;
            break;
        }
    }
    if (resourceSummary === null)
        throw "getResourceNamed could not find name:" + aName;
    var resourceIdent = resourceSummary.ident;
    var resourceDefsString = listenerUtil.restGet(
            settings.svrURL + "/v1/@resources/" + resourceIdent, null, settings.intToken);
    var resourceDefResult = JSON.parse(resourceDefsString);
    // print(ttl + "..resourceDefResult: " + JSON.stringify(resourceDefResult));
    return resourceDefResult;
};
