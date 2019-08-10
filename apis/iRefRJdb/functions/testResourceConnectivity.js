/* 
Test driver, runs each test below.
  By convention, each test Function returns a response, or throws error.

Consider this (or analogous approach) as a way of install-testing your microservice, via API invocation.
You can explore a technique for do before/after transaction compares (see API Sample, function testAllocation -- jsonDiff).

For initial exploration, you might want to skip reviewing this... focus on the Resources, Topics, Data Explorer and other Functions.
*/

var tests = [
     {"TestName": "testQ",              "TestResult": "Not Run"}
    ,{"TestName": "SyncJiraStories",    "TestResult": "Not Run"}
    ,{"TestName": "SyncRallyStories",   "TestResult": "Not Run"}
];
var numFailures = 0;
print("\ntestConnectivity at " + new Date() );

tests.forEach(function(eachTest) {  // invoke testResource for each entry in tests, above
    try {
        var functionResponseObj = SysUtility.getFunction("testSingleResource", {ResourceName: eachTest.TestName});  // functions return objs
        print("testConnectivity[" + eachTest.TestName + "], functionResponseObj: " + functionResponseObj);
        eachTest.TestResult = JSON.stringify(functionResponseObj);  // collect responses
        var statusCode = eachTest.TestResult.statusCode;
        if (typeof statusCode !== "undefined") {
            if (statusCode !== 201) {
                numFailures ++;
            }
        }
    }
    catch(err) {
        eachTest.Failure = "Fail - Exception: " + err + ", eachTest.TestResult: " + eachTest.TestResult;
        numFailures ++;  // run all the tests, even if one fails
    }
});
if (numFailures === 0)
    return {"Result": "Success", "Tests": tests};  // return result, responses
else
    return {"Result": numFailures + " FAILURE(S)", "Tests": tests};  // hmm
