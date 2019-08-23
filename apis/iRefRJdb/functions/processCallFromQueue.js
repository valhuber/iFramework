var ttl = "processCallFromQueue - ";


/***************************************************************
 * Insert / update target resource, per call from Queue
 * For inserts, update SyncMap to establish source/target sync
 ***************************************************************/

var postInfo = {};
 
var functionRequest = JSON.parse(req.json);
var syncMapRow = JSON.parse(functionRequest.sync_map_row);
// common_iPack_util.printSyncMapRow("\n\n" + ttl + "called at: " + new Date() + "\n...syncMapRow: ", postInfo.syncMapRow);

postInfo.syncFrom = syncMapRow.sync_last_from;
postInfo.syncTo = ( (postInfo.syncFrom === "Left") ? "Right" : "Left" );
postInfo.toIdentAttrName = common_iPack_util.computeLeft_Right_AttrName("sync_?_ident", postInfo.syncTo);
postInfo.currValuesAttrNameFrom = common_iPack_util.computeLeft_Right_AttrName("sync_?_curr_values", postInfo.syncFrom);
postInfo.changedValuesAttrNameFrom = common_iPack_util.computeLeft_Right_AttrName("sync_?_changed_values", postInfo.syncFrom);
postInfo.toIdent = syncMapRow[postInfo.toIdentAttrName];
postInfo.url = functionRequest.target_url; 
var targetResourcePayloadString = syncMapRow[postInfo.changedValuesAttrNameFrom];
postInfo.targetResourcePayload = JSON.parse(targetResourcePayloadString);
// var toIdent = syncMapRow[postInfo.toIdentAttrName];
common_iPack_util.printSyncMapRow(ttl + "called at: " + new Date() +
    "\n..info:" + JSON.stringify(postInfo) + 
    "\n..", syncMapRow);
postInfo.syncMapRow = syncMapRow;

if (postInfo.toIdent === null || typeof postInfo.toIdent === "undefined") {
    insertNewTargetResource_updateSyncMap(postInfo);
} else {
    updateExistingTargetResource(postInfo);
}
return;


/*
* Inserts new target resource, and updates syncmap to establish sync between source/target rows
*/
function insertNewTargetResource_updateSyncMap(postInfo) {
    var ttlSub = ttl + "- insertNewTargetResource_updateSyncMap - ";
    var responseString = "";
    var response = {};
    try {
        delete postInfo.targetResourcePayload.ident;
        print(ttlSub + "Posting new targetResource with (ident-reduced) postInfo.targetResourcePayload: " + JSON.stringify(postInfo.targetResourcePayload));
        responseString = SysUtility.restPost(postInfo.url, {IgnoreExtraAttributes: true}, settings.intToken, postInfo.targetResourcePayload);
    } catch(e) {
        common_iPack_util.throwError(ttl + "targetResource post fails with: " + e);
    }
    response = JSON.parse(responseString);
    if (response.statusCode != 201) {
        common_iPack_util.throwError(ttl + "bad response Posting target postInfo.targetResourcePayload, " + JSON.stringify(response));
    }
    try {  // now update SyncMap to establish the sychronization
        // print(ttl + "Posted targetResource, response: " + JSON.stringify(response));
        var syncMapUrl = settings.svrURL + "/v1/main:SyncMap/" + syncMapRow.ident;
        var createdRowTxsummary = response.txsummary;
        var createdRowMeta = createdRowTxsummary[0]["@metadata"];  // FIXME - is @meta always first?
        var createdRowURL = createdRowMeta.href;
        // print(ttl + "Posted target, createdRowURL: " + createdRowURL);
        var segment_array = createdRowURL.split( '/' );
        var createdRowID = segment_array.pop();
        var updSyncMapPayload = JSON.parse( '{"' + postInfo.toIdentAttrName + '": ' + createdRowID + "}" );
        updSyncMapPayload.ident = syncMapRow.ident;
        print(ttlSub + "Posted targetResource, response: " + JSON.stringify(response) + 
            "\n...createdRowID: " + createdRowID +
            "\n...Updating SyncMap for new targetResource, url: " + syncMapUrl + ", updSyncMapPayload: " + JSON.stringify(updSyncMapPayload));
        responseString = SysUtility.restPut(syncMapUrl, {checksum: "override"}, settings.intToken, updSyncMapPayload);
        response = JSON.parse(responseString);
        if (response.statusCode != 201 && response.statusCode != 200) {
            common_iPack_util.throwError(ttlSub + "bad response updating SyncMap, " + JSON.stringify(response));
        }
        // print(ttlSub + "ID["+ syncMapRow.ident + "] found, so updated SyncMap: " + JSON.stringify(response));
    } catch(e) {
        common_iPack_util.throwError(ttlSub + "SyncMap Put fails with: " + e);
    }
    
} 

/*
* update existing target resource (throws error on failure)
*/
function updateExistingTargetResource(postInfo) {
    var ttlSub = ttl + "- updateExistingTargetResource - ";
    postInfo.url += "/" + postInfo.toIdent;  // target Row ID
    postInfo.targetResourcePayload.ident = postInfo.toIdent;
    try {
        var targetResourcePayload = postInfo.targetResourcePayload;
        print(ttlSub + "updating existing targetResource using postInfo.url: " + postInfo.url + ", with payload: " + JSON.stringify(targetResourcePayload));
        responseString = SysUtility.restPut(postInfo.url, {IgnoreUnused: true, checksum:"override"}, settings.intToken, targetResourcePayload);  // FIXME DE423914 - IgnoreExtraAttributes: true}
    } catch(e) {
        common_iPack_util.throwError(ttlSub + "targetResource update fails with: " + e);
    }
    var response = JSON.parse(responseString);
    if (response.statusCode != 201 && response.statusCode != 200) {
        common_iPack_util.throwError(ttlSub + "bad response from targetResource update, " + JSON.stringify(response));
    }
}
