/*
var Config = {  // TODO move into settings
    created: new Date(),
    settings: {
        loadedBy: "ConfLib default settings",
        resourceURL: "http://localhost:8080/rest/iFramework/iRefRJdb/v1",
        authHeader: {
            'headers': {
                'Authorization': 'CALiveAPICreator intToken:1'
            }
        }
    }
};
*/
var settings = {   // FIXME timers don't have access to req.localFullBaseURL, so....?
    useDirectUpdate: true,  // FIXME DE423915 runtime failing for direct updates.
    svrURL: "http://localhost:8080/rest/iFramework/iRefRJdb",
    sourceResourceExtPropName: "Synchronize",
    webhookUserPropName: "iFramework_change_user",
    webhookUserPropValue: "iFramework_user",
    ignoreUnused: {
        resourceURL: "http://localhost:8080/rest/iFramework/iRefRJdb/v1",
        authHeader: {
            'headers': {
                'Authorization': 'CALiveAPICreator intToken:1'
            }
        }
    },
    intToken: {
        'headers': {
            'Authorization': 'CALiveAPICreator intToken:1'
        }
    },
    adminToken: {
        'headers': {
            'Authorization': 'CALiveAPICreator AdminKey:1'
        }
    },
    iQurl: "http://localhost:8080/rest/iFramework/iQ",
    iQToken: {
        'headers': {
            'Authorization': 'CALiveAPICreator iQ:1'
        }
    }
};


print("\SysConfLib loaded: " + ".. settings: " + JSON.stringify(settings));
