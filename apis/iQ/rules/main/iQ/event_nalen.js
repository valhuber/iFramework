ttl = "Process - Post to TargetUrl, update status and SyncMap";

log.debug(ttl + "running");
if (row.status == "Processing") {
    logicContext.logDebug("Post to target_url");   // FIXME IgnoreExtraAttributes did not seem to work
    logicContext.logDebug('Verify row.changed_columns -->' + row.changed_columns + "<--");
    var payload = {};
    payload.target_url = row.target_url;
    payload.sync_map_row = row.sync_map_row;
    var postResponse = SysUtility.restPost(row.process_call_from_queue_url,
        {IgnoreExtraAttributes: true}, settings.intToken, payload);
    logicContext.logDebug("postResponse: " + JSON.stringify(postResponse));
    // TODO - check for errors
    // TODO - Put vs Post (etc etc)
    row.response = JSON.stringify(postResponse);
    row.processed_date = new Date();
    row.status = "Processed";
}
