var testName = "Function testWebhook: ";  // basically obsolete

/*
var db = "Throw Jira Webhook - ";

var webhookData = logicContext.transformCurrentRow("JiraWebhookResource");
var catcherURL = settings.svrURL + "/v1/CatchJiraWebhook";
print(db + "catcherURL: " + catcherURL + ", webhookData:\n" + webhookData);

SysUtility.restPost(catcherURL, {}, settings.intToken, webhookData);
*/

// get Jira Story row, JSON Object
function getJiraStory(aMsg) {
    var url = req.localFullBaseURL;
    var storyGetURL = settings.svrURL + "/v1/dsp_jira:Story";
    var key = 1 ;
    var getParams = {sysfilter: "equal(\"ident\":" + JSON.stringify( key ) + ")"};
    var eventString = SysUtility.restGet(storyGetURL, getParams, settings.intToken);  // see API Properties > Libraries
    db("getJiraStory[" + aMsg + "]: " + storyGetURL + ", getParams: " + JSON.stringify(getParams) +
        "\nget returns: " + eventString.substring(1,150) + "...");
    return JSON.parse(eventString)[0];
}

// put Conference Offer (JSON Object), returns putResponse
function putJiraStory(aStory, aDays, aTitle) {
    aStory.days = aDays;
    var storyPutURL = settings.svrURL + "/v1/dsp_jira:Story";
    var putParams = null;
    db("putJiraStory - " + aTitle + ", updating url: " + storyPutURL + 
        "\n... with request data: " + JSON.stringify(aStory).substring(1,96) +
        "\n... using Auth: " + JSON.stringify(settings.intToken));
    var putResponseString = SysUtility.restPut(storyPutURL, putParams, settings.intToken, aStory);

    var putResponse = JSON.parse(putResponseString);
    db(".. putJiraStory, put completed with statusCode: " + putResponse.statusCode + ", putResponse: " +
        JSON.stringify(putResponse).substring(1,96));
    if (putResponse.statusCode !== 200) {
        log.debug(testName + "ERROR: Post txSummary did not find expected 200...");
        log.debug(putResponse); //an object which will include a transaction summary and a summary of the rules fired during this request
        throw new Error(testName + "ERROR: Post txSummary did not find expected 201...");
    }
    return putResponse;
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


//   ******************* MAIN CODE STARTS HERE

var jiraStory = getJiraStory("Starting");
var moreDays = jiraStory.days + 1;


print("\n\n******************************");
var approveResponse = putJiraStory(jiraStory, moreDays, "PUT");
print("\n******************************\n\n");

return {statusCode: 201, message: "ok - JiraStory updated"};
