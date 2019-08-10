var ttl = "common_iPack_srcTimer - ";

var common_iPack_srcTimer = {};  // a common JavaScript technique to name-scope shared functions

/*
Called by timers (e.g. Rally iPack Timer) to wake up and scan the Resource definitions,
finding those that have an ExtendedProperty SynchronizeToTargetResource,
where the underlying Data Source is as designated (TBD).

It executes the Resource, with a filter to find rows that have been changed since the last run.
    TODO: consider user change rapidly updated by iFramework change, prior to timer exec... change lost?

It then compares these current values to the last-sync values in the SyncMap.
The ones that are changed are put into ChangedAttrs[],
and POSTed to iQ along with the URL of the Target Resource.

TODO
    Transactions - the timer updates need to be part of a transaction.  TimerUtil.restPut is not. 
        Maybe we need to Post a timer-wakeup, and all this is a event on that, using logicContext.
        Eg, we update SyncMap, but not the Q.

*/

/*  FIXME - fails with com.kahuna.server.KahunaException: An error occurred while loading JavaScript library common_iPack_srcTimer : ReferenceError: "moment" is not defined in LI2002-common_iPack_srcTime at line number 62
var minute = moment().minute();
var eachInterval = 1; // 10;

if ( (minute % eachInterval) === 0  && moment().seconds() < 5) {
    print("\n\n" + ttl + "Still alive @: " + moment().format() + ".... minute % eachInterval: " + minute % eachInterval);
}
*/


common_iPack_srcTimer.timerFindProcessChanges = function timerFindProcessChanges (aMsg) {
    var ttlSub = ttl + "timerFindProcessChanges[" + aMsg + "] - ";
    var theDate = new Date();
    var minute = theDate.getMinutes();
    var eachInterval = 1; // 10;
    var doLogHeartbeat = (minute % eachInterval) === 0  && theDate.getSeconds() < 5;
    var rowsProcessed = 0;
    
    if ( doLogHeartbeat ) {
        print("\n\n" + ttlSub + "Still alive @: " + theDate + ".... minute % eachInterval: " + minute % eachInterval);
    }

    var sourceTimerString = timerUtil.restGet(settings.svrURL + "/v1/SourceTimer", {sysfilter: "equal(ident: 1)"}, settings.intToken);
    var sourceTimer = JSON.parse(sourceTimerString)[0];

    try {
        var sourceResourcesToProcess = findSourceResources();
        
        for (var i = 0 ; i < sourceResourcesToProcess.length ; i++) {    // read rows, determine changed, post to Q
            var eachSourceResourceToProcess = sourceResourcesToProcess[i];
            // print(ttlSub + "eachSourceResourceToProcess: " + JSON.stringify(eachSourceResourceToProcess));
            result=[]; 
            
            var sourceResourceParams = {    // TODO - throttling, etc etc (lots)
                sysfilter: 'greater(last_changed: timestamp(' + sourceTimer.last_run + '))',  // timestamp function from LAC (not JS, DB)
                nometa: true
            };
            var resourceRowsString = timerUtil.restGet(  // read the changed rows
                    settings.svrURL + "/v1/" + eachSourceResourceToProcess.name, sourceResourceParams, settings.intToken);
            var resourceRows = JSON.parse(resourceRowsString);
            // print(ttlSub + "Processing sync'd eachSourceResourceToProcess.name: " + eachSourceResourceToProcess.name +
            //     "\n....found resourceRows: " + JSON.stringify(resourceRows));
            for (var j = 0 ; j < resourceRows.length ; j++) {
                var syncMapRow = null;  // see schema page for definition
                var eachResourceRow = resourceRows[j];
                if (eachResourceRow[settings.webhookUserPropName] == settings.webhookUserPropValue) {
                    print(ttlSub + "Skipping iFramework (feedback) sync'd eachSourceResourceToProcess.name: " + eachSourceResourceToProcess.name +
                        ", eachResourceRow: " + JSON.stringify(eachResourceRow));
                } else {
                    rowsProcessed += 1;
                    if (rowsProcessed == 1)
                        print("\n\n" + ttlSub + "Started. SourceTimer: " + JSON.stringify(JSON.parse(sourceTimerString)));
                    syncMapRow = common_iPack_util.get_or_create_SyncMapRow(eachSourceResourceToProcess, eachResourceRow);
                    // var unchangedAttrs = removeUnchangedAttrs(eachResourceRow);  // TODO - we need to update srcRow with iFrameUser, no??
                    var targetResourceName = eachSourceResourceToProcess.extendedProperties[settings.sourceResourceExtPropName].TargetResourceName;
                    common_iPack_util.postChangedAttrsToQueue(syncMapRow, targetResourceName, aMsg);
                }
            }
        }
        if (rowsProcessed > 0) {
            sourceTimer.notes = "previous run: " + sourceTimer.last_run;    // update SourceTimer.last_run, *only* if error-free run.
            var putResponseString = timerUtil.restPut(settings.svrURL + "/v1/SourceTimer", {sysfilter: "equal(ident: 1)"}, settings.adminToken, sourceTimer);
            var putResponse = JSON.parse(putResponseString);
            if (putResponse.statusCode != 200)
                common_iPack_util.throwError(ttl + " SourceTimer Update Failed: " + e);
            delete sourceTimer["@metadata"];
        }
        if (doLogHeartbeat || rowsProcessed > 0) {
            print(ttlSub + "** Completed[" + doLogHeartbeat + ", " + rowsProcessed + "].  SourceTimer updated ** at "+ JSON.stringify(sourceTimer));
        }
    } catch (e) {
        common_iPack_util.throwError(ttl + " Exception: " + e);         // no SourceTimer update..
    }
};


/**
 * returns array of resource definitions that have extProp: settings.sourceResourceExtPropName
 */
function findSourceResources() {
    result=[];
    //print(ttl + "..findSourceResources() " + "from settings.svrURL: " + settings.svrURL + "/@resources\n" +
    //     "...using settings.intToken: " + JSON.stringify(settings.intToken));
    var resourceNamesString = listenerUtil.restGet(
            settings.svrURL + "/v1/@resources", null, settings.intToken);
    var resourceNames = JSON.parse(resourceNamesString);
    // print(ttl + "..resourceNames[]: " + JSON.stringify(resourceNames));
    for (var i = 0 ; i < resourceNames.length ; i++) {
        var eachResourceSummary = resourceNames[i];
        var eachResourceDef = common_iPack_util.getResourceNamed(eachResourceSummary.name);
        var extProps = eachResourceDef.extendedProperties;
        var hasExtProps = extProps && 'object' === typeof extProps && ! Array.isArray(extProps);
        var syncProps = null;
        if (hasExtProps) {
            syncProps = extProps[settings.sourceResourceExtPropName];
        }
        // on post to ProcessRequestResource, store json into SystemQueue, for async processing via timer
        if (syncProps !== null && typeof syncProps !== 'undefined') {
            if (eachResourceDef.name.contains("Rally")) { // TODO - ignore if not "for Rally" - inspect root Tbls' DataSource
                // print(ttl + " ** Rally SourceResource **  " + JSON.stringify(eachResourceDef));
                result.push(eachResourceDef);
            }
        } else {
            // print(ttl + " not processed: " + JSON.stringify(eachResourceDef));
        }
    }
    return result;
}
