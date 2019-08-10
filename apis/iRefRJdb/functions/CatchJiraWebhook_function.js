var ttl = "CatchJiraWebhook_function - ";

print(ttl + "Caught webhook, req.json: " + JSON.stringify(JSON.parse(req.json)));

common_iPack_srcWebhook.handleWebhook(req.json, "JiraWebhookResource", "JiraSourceResource", ttl);
