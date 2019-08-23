ttl = "Process - Post to iRefRJdb/processCallFromQueue (update target [and SyncMap])";

log.debug(ttl + "running (from either TimerPostTarget, or retry DataExplorer via process function");
if (row.status == "Processing") {
    logicContext.logDebug("Post to target_url");
    logicContext.logDebug('Verify row.changed_columns -->' + row.changed_columns + "<--");
    var payload = {};
    payload.target_url = row.target_url;
    payload.sync_map_row = row.sync_map_row;
    var postResponse = SysUtility.restPost(row.process_call_from_queue_url,  // iRefRJdb/processCallFromQueue (set by caller - see common_iPack_util)
        {IgnoreExtraAttributes: true}, settings.intToken, payload);   // FIXME DE423914 IgnoreExtraAttributes did not seem to work
    logicContext.logDebug("postResponse: " + JSON.stringify(postResponse));
    // TODO - check for errors
    row.response = JSON.stringify(postResponse);
    row.processed_date = new Date();
    row.status = "Processed";
}
