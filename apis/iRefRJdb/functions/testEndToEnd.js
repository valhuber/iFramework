var testName = "Function testEndToEnd: ";

/*
Overview
========
    Creates new source rows, and updates existing source rows (for source=Rally, then Jira).  
        These test
            SyncMap paths: creation, update
            Timers and Functions
    
Instructions
============
    I. Setup
        1. Stop LAC and restore the databases from iProto zip
        2. Activate the 2 timers (here, iQ)
    II. Run this function
        1. It is re-runnable, by virtue of *serious* cleanup action - see cleanUp_deleteTestRows(), below.
*/

// print("\n\n******************************");
// print("\n******************************\n\n");


//   ******************* MAIN CODE STARTS HERE
var jiraStory;
var jiraStoryUpd;
var rallyStory;
var rallyStoryUpd;
var response;
var test;
var key;
var testDesc;
var testResults = [];
var testResultMsg;

var testRallySource = true;    // per timer delays, tests take 1 min... who's got that kind of time?
var testJiraSource = true;      // so, activate the tests you want
db("starting");
cleanUp_deleteTestRows();

if (testRallySource) {
    test = "New from Rally";
    key = "Test New Rally Story 1";
    print("\n\n**************** " + test + " Starting\n");
    rallyStory = addRallyStory(key, test);
    pausecomp(13000);  // long delay (2 timers)
    jiraStory = getJiraStory(key,  test);
    if (rallyStory === null) {
        testResults.push({testName: test, testResult: "failed - row not found: " + key});
        // throw test + " failed - row not found: " + key;
        }
    testResultMsg = "pass - found in Jira: " + jiraStory.name;
    testResults.push({testName: test, testResult: testResultMsg});
    print("\n\n**************** " + test + " passes" + " - " + testResultMsg);
    
    test = "Upd from Rally";
    key = "Test New Rally Story 1";
    print("\n\n**************** " + test + " Starting\n");
    rallyStory    = getRallyStory(key);
    rallyStoryUpd =  putRallyStory(rallyStory, test);  // upds days, description from value of test
    pausecomp(13000);  // long delay (2 timers)
    jiraStory = getJiraStory(key,  test);
    if (jiraStory === null) {
        testResults.push({testName: test, testResult: "failed - row not found: " + key});
        // throw test + " failed - row not found: " + key;
    }
    if (jiraStory.story_description !== rallyStoryUpd.description) {
        testResults.push({testName: test, testResult: " failed - description not found: " + JSON.stringify(rallyStory)});
        // throw test + " failed - description not found: " + JSON.stringify(rallyStory);
    }
    testResultMsg = "pass - found in Jira: " + jiraStory.name;
    testResults.push({testName: test, testResult: testResultMsg});
    print("\n\n**************** " + test + " passes" + " - " + testResultMsg);
}

if (testJiraSource) {
    test = "New from Jira";
    key = "Test New Jira Story 1";
    print("\n\n**************** " + test + " Starting\n");
    jiraStory = addJiraStory(key, test);
    pausecomp(6000);
    rallyStory = getRallyStory(key,  test);
    if (rallyStory === null) {
        testResults.push({testName: test, testResult: " failed - row not found: " + key});
        // throw test + " failed - row not found: " + key;
    }
    testResultMsg = "pass - found in Rally: " + rallyStory.story_name;
    testResults.push({testName: test, testResult: testResultMsg});
    print("\n\n**************** " + test + " passes" + " - " + testResultMsg);
    
    
    test = "Upd from Jira";
    key = "Test New Jira Story 1";
    print("\n\n**************** " + test + " Starting\n");
    jiraStory    = getJiraStory(key);
    jiraStoryUpd =  putJiraStory(jiraStory, test);  // upds days, description from value of test
    pausecomp(6000);
    rallyStory = getRallyStory(key,  test);
    if (rallyStory === null) {
        testResults.push({testName: test, testResult: " failed - row not found: " + key});
        // throw test + " failed - row not found: " + key;
    }
    if (rallyStory.story_description !== jiraStoryUpd.description) {
        testResults.push({testName: test, testResult: " failed - description not found: " + JSON.stringify(rallyStory)});
        // throw test + " failed - description not found: " + JSON.stringify(rallyStory);
    }
    testResultMsg = "pass - found in Rally: " + rallyStory.story_name;
    testResults.push({testName: test, testResult: testResultMsg});
    print("\n\n**************** " + test + " passes" + " - " + testResultMsg);
}

return {statusCode: 201, testResults: testResults};


// delete test rows in jira/rally stories, and *all* the rows in the q.
function cleanUp_deleteTestRows() {
    var url = req.localFullBaseURL;      // http://localhost:8080/rest/default/iRefRJdb/v1/purgeTestData
    var storyGetURL = settings.svrURL + "/v1/purgeTestData"; // it's a function, so you can run it directly
    var resultString = SysUtility.restGet(storyGetURL, null, settings.adminToken);
    var resultObj = JSON.parse(resultString);
}


// get Jira Story row, as JSON Object
function getRallyStory(aKey, aMsg) {
    var url = req.localFullBaseURL;
    var storyGetURL = settings.svrURL + "/v1/dsp_rally:Story";
    var getParams = {sysfilter: "equal(\"story_name\": \"" + aKey + "\")"};
    var resultString = SysUtility.restGet(storyGetURL, getParams, settings.adminToken);  // see API Properties > Libraries
    db("getRallyStory[" + aMsg + "]: " + storyGetURL + ", getParams: " + JSON.stringify(getParams) +
        "\nget returns: " + JSON.stringify(JSON.parse(resultString)));
    var resultObj = JSON.parse(resultString);
    if (! Array.isArray(resultObj))
        throw aMsg + " getRallyStory result not array";
    if (resultObj.length !== 1)
        common_iPack_util.throwError( aMsg + " getRallyStory - no (or too many) rows found: " + resultObj.length);
    return resultObj[0];
}


// put aStory (obj), returns putResponse
function putRallyStory(aStory, aTitle) {
    aStory.points += 1;
    var storyPutURL = settings.svrURL + "/v1/dsp_rally:Story";
    var putParams = null;
    db("putJiraStory - " + aTitle + ", updating url: " + storyPutURL + 
        "\n... with request data: " + JSON.stringify(aStory).substring(1,96) +
        "\n... using Auth: " + JSON.stringify(settings.adminToken));
    var putResponseString = SysUtility.restPut(storyPutURL, putParams, settings.adminToken, aStory);

    var putResponse = JSON.parse(putResponseString);
    db(".. putRallyStory, put completed with statusCode: " + putResponse.statusCode + ", putResponse: " +
        JSON.stringify(putResponse).substring(1,96));
    if (putResponse.statusCode !== 200) {
        log.debug(testName + "ERROR: Post txSummary did not find expected 200...");
        log.debug(putResponse); //an object which will include a transaction summary and a summary of the rules fired during this request
        common_iPack_util.throwError(testName + "ERROR: Post txSummary did not find expected 201...");
    }
    return putResponse;
}



// post aStory (JSON Object), returns created story (throws error on failure)
function addRallyStory(aKey, aMsg) {
    var story = {};
    story.story_name = aKey;
    story.points = 1;
    story.story_description = aKey + " points: " + story.points;
    story.feature_ident = 1;
    story.assigned_person_name = "Joe";
    var storyPostURL = settings.svrURL + "/v1/RallySourceResource";
    var putParams = null;
    // db("putRallyStory - " + aMsg + ", updating url: " + storyPutURL + 
    //    "\n... with request data: " + JSON.stringify(aStory) +
    //    "\n... using Auth: " + JSON.stringify(settings.adminToken));
    var postResponseString = SysUtility.restPost(storyPostURL, putParams, settings.adminToken, story);

    var postResponse = JSON.parse(postResponseString);
    db(".. postRallyStory, post completed with statusCode: " + postResponse.statusCode + ", postResponse: " +
        JSON.stringify(JSON.parse(postResponseString)));
    if (postResponse.statusCode !== 200 && postResponse.statusCode !== 201) {
        db(testName + "ERROR: Post txSummary did not find expected 200: " + JSON.stringify(postResponse));
        common_iPack_util.throwError(testName + "ERROR: Post txSummary did not find expected 201...");
    }
    return getRallyStory(aKey, aMsg);
}


// get Jira Story row, as JSON Object
function getJiraStory(aKey, aMsg) {
    var url = req.localFullBaseURL;
    var storyGetURL = settings.svrURL + "/v1/dsp_jira:Story";
    var getParams = {sysfilter: "equal(\"name\":\"" + aKey + "\")"};
    var resultString = SysUtility.restGet(storyGetURL, getParams, settings.adminToken);  // see API Properties > Libraries
    db("getJiraStory[" + aMsg + "]: " + storyGetURL + ", getParams: " + JSON.stringify(getParams) +
        "\n...get returns: " + JSON.stringify(JSON.parse(resultString)));
    var resultObj = JSON.parse(resultString);
    if (! Array.isArray(resultObj))
        common_iPack_util.throwError( aMsg + " getJiraStory result not array" + ", resultString: " + resultString);
    if (resultObj.length !== 1)
        common_iPack_util.throwError( aMsg + " getJiraStory - no (or too many) rows found: " + resultObj.length + ", resultString: " + resultString);
    return resultObj[0];
}


// put aStory (JSON Object), returns updated Jira story (throws error on failure)
function putJiraStory(aStory, aMsg) {
    aStory.days += 1;
    aStory.description = aMsg + " days: " + aStory.days;
    var storyPutURL = settings.svrURL + "/v1/dsp_jira:Story";
    var putParams = null;
    // db("putJiraStory - " + aMsg + ", updating url: " + storyPutURL + 
    //    "\n... with request data: " + JSON.stringify(aStory) +
    //    "\n... using Auth: " + JSON.stringify(settings.adminToken));
    var putResponseString = SysUtility.restPut(storyPutURL, putParams, settings.adminToken, aStory);

    var putResponse = JSON.parse(putResponseString);
    db(".. putJiraStory, put completed with statusCode: " + putResponse.statusCode + ", putResponse: " +
        JSON.stringify(putResponse).substring(1,96));
    if (putResponse.statusCode !== 200) {
        db(testName + "ERROR: Put txSummary did not find expected 200...");
        db(putResponse); //an object which will include a transaction summary and a summary of the rules fired during this request
        common_iPack_util.throwError(testName + "ERROR: Put txSummary did not find expected 201...");
    }
    return getJiraStory(aStory.name, aMsg);
}


// post aStory (JSON Object), returns created story (throws error on failure)
function addJiraStory(aKey, aMsg) {
    var story = {};
    story.src_name = aKey;
    story.src_days = 1;
    story.assigned_person_name = "Mary";
    story.src_description = aKey + " days: " + story.days;
    var storyPostURL = settings.svrURL + "/v1/JiraSourceResource";
    var putParams = null;
    // db("putJiraStory - " + aMsg + ", updating url: " + storyPutURL + 
    //    "\n... with request data: " + JSON.stringify(aStory) +
    //    "\n... using Auth: " + JSON.stringify(settings.adminToken));
    var postResponseString = SysUtility.restPost(storyPostURL, putParams, settings.adminToken, story);

    var postResponse = JSON.parse(postResponseString);
    db(".. postJiraStory, post completed with statusCode: " + postResponse.statusCode + ", postResponse: " +
        JSON.stringify(JSON.parse(postResponseString)));
    if (postResponse.statusCode !== 200 && postResponse.statusCode !== 201) {
        db(testName + "ERROR: Post txSummary did not find expected 200: " + JSON.stringify(postResponse));
        common_iPack_util.throwError(testName + "ERROR: Post txSummary did not find expected 200 or 201...");
    }
    return getJiraStory(aKey, aMsg);
}


// delay (e.g., allow aync message to complete processing)
function pausecomp(millis)
{
    var date = new Date();
    var curDate = null;
    do { curDate = new Date(); }
    while(curDate-date < millis);
}


// debug prints to log and console
function db(aString) {
    var printString = testName + aString;
    log.debug(printString);
    print("");
    print(printString);
    return printString;
}
