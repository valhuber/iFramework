var settings = {
    iQurl: "http://localhost:8080/iFramework/default/iQ",
    iQToken: {
        'headers': {
            'Authorization': 'CALiveAPICreator iQ:1'
        }
    },
    intToken: {
        'headers': {
            'Authorization': 'CALiveAPICreator intToken:1'
        }
    }
};

print("\settings loaded: " + JSON.stringify(settings));
