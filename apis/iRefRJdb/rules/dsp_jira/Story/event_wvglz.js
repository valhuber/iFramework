var ttl = "Throw Jira Webhook (row event) - ";

var webhookData = logicContext.transformCurrentRow("JiraWebhookResource");
var webhookDataObj = JSON.parse(webhookData);
var webhookRow = webhookDataObj[0];

// FIXME - DE425587: transformCurrentRow failing for updates
// following covers up the bug, remove when fixed.
webhookRow.wh_name = row.name;
webhookRow.wh_days = row.days;
webhookRow.wh_description = row.description;

// FIXME DE426427: Code helper wrong for req.getApiKey (needs to be getApiKey()
webhookRow[settings.webhookUserPropName] = req.getApiKey().getUserIdentifier();  // assumption: webhook makes user visible (to avoid feedback)
var postWebhookData = JSON.stringify(webhookRow);

var catcherURL = settings.svrURL + "/v1/CatchJiraWebhook_function";
print(ttl + "req.getApiKey().getUserIdentifier(): " + req.getApiKey().getUserIdentifier() + ", catcherURL: " + catcherURL + 
    "\n...row data: " + JSON.stringify(JSON.parse(logicContext.rowToJSON(row))) +
    "\n...throwing webhookData: " + postWebhookData); // );
SysUtility.restPost(catcherURL, {}, settings.intToken, postWebhookData);
