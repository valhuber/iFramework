var testName = "Function purgeSyncMap: ";

/*
Overview
========
    Deletes *all* the rows in the SyncMap.
    Don't run this unless you know what you are doing!
    
*/

// delete test rows in jira/rally stories, and *all* the rows in the q.

db("Cleanup");
var url = req.localFullBaseURL;
var storyGetURL = settings.svrURL + "/v1/main:SyncMap";
var resultString = SysUtility.restGet(storyGetURL, null, settings.adminToken);  // see API Properties > Libraries
var resultObj = JSON.parse(resultString);
var eachRow;
var deleteURL;

if (! Array.isArray(resultObj))
    throw "getJiraStory result not array";
for (var i = 0; i < resultObj.length; i++) {
    eachRow = resultObj[i];
    deleteURL = storyGetURL + "/" + eachRow.ident + "?checksum=override";
    resultString = SysUtility.restDelete(storyGetURL + "/" + eachRow.ident + "?checksum=override", null, settings.adminToken);
}
return {statusCode: 201, message: "ok - purgeTestData completed"};
   


// debug prints to log and console
function db(aString) {
    var printString = testName + aString;
    log.debug(printString);
    print("");
    print(printString);
    return printString;
}
