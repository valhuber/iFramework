var testName = "Function testEndToEnd: ";

/*
Overview
========
   delete test rows in jira/rally stories, and *all* the rows in the q.  
*/

// delete test rows in jira/rally stories, and *all* the rows in the q.
db("Cleanup");
var url = req.localFullBaseURL;
var storyGetURL = settings.svrURL + "/v1/dsp_jira:Story";
var eachRow;
var deleteURL;

var resultString = SysUtility.restGet(storyGetURL, null, settings.adminToken);  // see API Properties > Libraries
var resultObj = JSON.parse(resultString);

if (! Array.isArray(resultObj))
    throw "getJiraStory result not array";
for (var i = 0; i < resultObj.length; i++) {
    eachRow = resultObj[i];
    if (eachRow.name === null || eachRow.name.startsWith("Test")  || eachRow.name.contains("Rally")) {
        deleteURL = storyGetURL + "/" + eachRow.ident + "?checksum=override";
        resultString = SysUtility.restDelete(storyGetURL + "/" + eachRow.ident + "?checksum=override", null, settings.adminToken);
    }
}

url = req.localFullBaseURL;
storyGetURL = settings.svrURL + "/v1/dsp_rally:Story";
resultString = SysUtility.restGet(storyGetURL, null, settings.adminToken);  // see API Properties > Libraries
resultObj = JSON.parse(resultString);
if (! Array.isArray(resultObj))
    throw "getRallyStory result not array";
for (var j = 0; j < resultObj.length; j++) {
    eachRow = resultObj[j];
    if (eachRow.story_name === null || eachRow.story_name.startsWith("Test")   || eachRow.story_name.contains("Jira")) {
        deleteURL = storyGetURL + "/" + eachRow.ident + "?checksum=override";
        db("deleting[" + deleteURL + "], row: " +  JSON.stringify(eachRow));
        resultString = SysUtility.restDelete(storyGetURL + "/" + eachRow.ident + "?checksum=override", null, settings.adminToken);
    }
}    

url = req.localFullBaseURL;
storyGetURL = settings.svrURL + "/v1/dsp_q:iQ";
resultString = SysUtility.restGet(storyGetURL, {pagesize: 1000}, settings.adminToken);  // see API Properties > Libraries
resultObj = JSON.parse(resultString);
if (! Array.isArray(resultObj))
    throw "getRallyStory result not array";
for (var k = 0; k < resultObj.length; k++) {
    eachRow = resultObj[k];
    db("deleting maybe: " +  JSON.stringify(eachRow));
    if (! eachRow.status.contains("heartBeat")) {
        deleteURL = storyGetURL + "/" + eachRow.ident + "?checksum=override";
        db("deleting[" + deleteURL + "], row: " +  JSON.stringify(eachRow));
        resultString = SysUtility.restDelete(storyGetURL + "/" + eachRow.ident + "?checksum=override", null, settings.adminToken);
        db("delete result: " + resultString);
    }
}

url = req.localFullBaseURL;
storyGetURL = settings.svrURL + "/v1/main:SourceTimer/1";
resultString = SysUtility.restGet(storyGetURL, null, settings.adminToken);
var timerRow = JSON.parse(resultString)[0];
timerRow.notes = "reset - " + timerRow.notes;
resultString = SysUtility.restPut(storyGetURL, null, settings.adminToken, timerRow);


return {statusCode: 201, message: "ok - purgeTestData completed"};



// debug prints to log and console
function db(aString) {
    var printString = testName + aString;
    log.debug(printString);
    print("");
    print(printString);
    return printString;
}

