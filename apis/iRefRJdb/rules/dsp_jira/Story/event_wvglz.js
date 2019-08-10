var ttl = "Throw Jira Webhook (row event) - ";

var webhookData = logicContext.transformCurrentRow("JiraWebhookResource");
var webhookDataObj = JSON.parse(webhookData);
var webhookRow = webhookDataObj[0];

// FIXME - transformCurrentRow is returning *old* values for updates (inserts might be ok)
// this covers up the bug, delete when fixed.
webhookRow.wh_name = row.name;
webhookRow.wh_days = row.days;
webhookRow.wh_description = row.description;

// try what is shown in the code helper: req.getApiKey.getUserIdentifier()
// FIXME fails with: TypeError: Cannot read property \"getUserIdentifier\" from undefined in RU2128-event_wvglz at line number 5
webhookRow[settings.webhookUserPropName] = req.getApiKey().getUserIdentifier();  // assumption: webhook makes user visible (to avoid feedback)
var postWebhookData = JSON.stringify(webhookRow);

var catcherURL = settings.svrURL + "/v1/CatchJiraWebhook_function";
print(ttl + "req.getApiKey().getUserIdentifier(): " + req.getApiKey().getUserIdentifier() + ", catcherURL: " + catcherURL + 
    "\n...row data: " + JSON.stringify(JSON.parse(logicContext.rowToJSON(row))) +
    "\n...throwing webhookData: " + postWebhookData); // );
SysUtility.restPost(catcherURL, {}, settings.intToken, postWebhookData);
