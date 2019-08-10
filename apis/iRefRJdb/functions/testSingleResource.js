// Test to resource parameters.ResourceName returns at least 1 row

var resourceName = parameters.ResourceName;
if (resourceName === null || resourceName == "string")  // default arg value for Test button
    resourceName = "SyncJiraStories";
    
var testURL = req.localFullBaseURL + resourceName;
var db = "testResource: " + parameters.ResourceName + "{" + parameters.ResourceName + ") - ";

var getSettings = { headers: { Authorization: "CALiveAPICreator intToken:1" }};  // created on Auth Tokens screen
var getResponseString = SysUtility.restGet(testURL, null, getSettings);

var getResponse = JSON.parse(getResponseString);
var theRow = getResponse[0];
// print(db + "returning first row: " + JSON.stringify(theRow));

return theRow;
