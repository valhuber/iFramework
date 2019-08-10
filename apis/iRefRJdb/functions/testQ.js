var getResponseString = SysUtility.restGet(
        settings.iQurl + "/v1/PostChangedAttrs", null, settings.iQToken);

var getResponse = JSON.parse(getResponseString);
var theRows = getResponse;
return theRows;
