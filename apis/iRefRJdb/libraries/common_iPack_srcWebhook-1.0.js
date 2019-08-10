var ttl = "common_iPack_srcWebhook - ";

var common_iPack_srcWebhook = {};  // a common JavaScript technique to name-scope shared functions

/****************************************
 * called by functions to handle webhooks
 * 
 * if (user was iFramework)  // NB - avoid feedback
 *    exit
 * 
 * For each aWebHookResource.attributes where attributes.column_name in aSourceResource.attributes.column_name
 *    attrsOfInterest.push(each); 
 * removeUnchanged();
 * post to Q;
 *  
 ****************************************
*/

common_iPack_srcWebhook.handleWebhook = function handleWebhook(aPayload, aWebhookResource, aSourceResource, aMsg) {
    var payloadObj = JSON.parse(aPayload);
    var ttlSub = ttl + "handleWebhook - ";
    if (payloadObj[settings.webhookUserPropName] == settings.webhookUserPropValue) {
        print(ttlSub + "skipping iFramework user (avoid feedback), aPayload: " + JSON.stringify(payloadObj));
    } else {
        print(ttlSub + "running, aPayload: " + JSON.stringify(payloadObj));
        var webhookResource = common_iPack_util.getResourceNamed(aWebhookResource);
        var sourceResource = common_iPack_util.getResourceNamed(aSourceResource);
        var webhookResourceAttrs = webhookResource.attributes;
        var interestPayload = {};
        var notOfInterest = [];
        for (var i = 0 ; i < webhookResourceAttrs.length ; i++) {
            var eachWebhookAttr = webhookResourceAttrs[i];
            var sourceAttr = searchSourceResourceForWebhookAttr(sourceResource, eachWebhookAttr);
            if (sourceAttr === null) {
                notOfInterest.push(eachWebhookAttr);
            } else {
                var interestAttr = {};
                interestPayload[sourceAttr.name] = payloadObj[eachWebhookAttr.name];
            }
        }
        print(ttlSub + "interestPayload: " + JSON.stringify(interestPayload) +
            "\n... notOfInterest: " + JSON.stringify(notOfInterest) +
            "\n... aSourceResource: " + JSON.stringify(sourceResource));
        var syncMapRow = common_iPack_util.get_or_create_SyncMapRow(sourceResource, interestPayload);
        var targetResourceName = sourceResource.extendedProperties[settings.sourceResourceExtPropName].TargetResourceName;
        common_iPack_util.postChangedAttrsToQueue(syncMapRow, targetResourceName, aMsg);
    }
};


function searchSourceResourceForWebhookAttr(aSourceResource, aWebhookAttr) {
    var attrResult = null;
    var sourceResourceAttrs = aSourceResource.attributes;
    for (var i = 0 ; i < sourceResourceAttrs.length ; i++) {
        var eachSourceAttr = sourceResourceAttrs[i];
        if (eachSourceAttr.column_name == aWebhookAttr.column_name) {
            attrResult = eachSourceAttr;
            break;
        }
    }
    return attrResult;
}

function getSyncProps(aResourceName) {
    try {
        extProps = SysUtility.getExtendedPropertiesFor("v1", aResourceName);
    } catch(e) {
        // occurs for non-resources, etc...
    }
    var hasExtProps = extProps && 'object' === typeof extProps && ! Array.isArray(extProps);
    var syncProps = null;
    if (hasExtProps) {
        // print(ttl + "  ..resourceName: " + eachResourceName + " has extProps: " + JSON.stringify(extProps));
        // print(ttl + ".... check for sync with settings: " + JSON.stringify(settings));
        syncProps = extProps[settings.sourceResourceExtPropName];
        common_iPack_util.throwError("Unable to obtain syncProps");
    } else
        common_iPack_util.throwError("'Synchronize' Extended Property missing for resource: " + aResourceName);
}
