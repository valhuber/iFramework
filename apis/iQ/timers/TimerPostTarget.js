var ttl = "iQ Timer_PostTarget - ";

function db(aMsg) {
    print(ttl + ": " + aMsg);
}


/*
The iQ (System Queue) timer wakes up and finds Q entries that are ready.
It posts them to the targetURL, and marks the Q done/error.
If done, it updates SyncState data to reflect current sync'd values.

TBD: consider a name change... how is that matched to target?
Perhaps Rally/Jira extended attributes, or an integration tables, or both....

*/




/****************************
   Execution begins here
*****************************/

var minute = moment().minute();
var eachInterval = 1; // 10;

if ( (minute % eachInterval) === 0  && moment().seconds() < 5) {
    print("\n\n" + ttl + "** Still alive @: " + moment().format() + ".... minute % eachInterval: " + minute % eachInterval);
}

// print ("\n\n" + ttl + "noisy wakeup at " + new Date());

result=[];   // TODO add filter for "since last run", throttling, etc etc (lots)
var rowsProcessed = 0;
var qRowsString = timerUtil.restGet(
        settings.iQurl + "/v1/iQready", {nometa: true}, settings.iQToken);
var qRows = JSON.parse(qRowsString);
for (var i = 0 ; i < qRows.length ; i++) {
    var eachQrow = qRows[i];
    // print(ttl + ".. eachQrow: " + JSON.stringify(eachQrow));
    if (eachQrow.status == "Ready") {  // FIXME - make the filter work!
        rowsProcessed += 1;
        var id = eachQrow.ident;  // designed as a *function*, for error retry
        var invokeUrl = settings.iQurl + "/v1/main:iQ/" + eachQrow.ident + "/process";
        print(ttl + ".... postUnchangedAttrs: " + // JSON.stringify(anUnchangedAttrs) +
            "\n.... url: " + invokeUrl +
            "\n.... eachQrow: " + JSON.stringify(eachQrow));
        var postResponse = timerUtil.restGet(invokeUrl, null, settings.iQToken);
    }
}
if (rowsProcessed > 0)
    print("\n" + ttl + "** Timer Complete at " + moment().format() +
        ", " + rowsProcessed + " queue rows processed");
