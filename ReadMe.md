# iFramework
This is the LAC-based integration framework, G2, based on G1 by Kristy.

[Background information here](https://drive.google.com/open?id=1k-iijwPwvdyfW91vohbYvEAYdhq0ULOq-Np9oOoxIDo)

## Install Instructions:
1. Shut down LAC
2. Install (this will create a teamspace and user called iFramework:
```
cd /%lac-install%/CALiveAPICreator/jetty.repository/teamspaces  
git clone https://github.com/valhuber/iFramework.git  
```
4. Initialize your databases (this presumes default jetty.repository install location)
```
cd apis/iRefRJdb/UserFiles  
sh copyDBs.sh
```

## Verify
1. Start LAC
2. Login as iFramework, Password1
3. Open the API ``iReference Jira to Rally (DBs)``
4. Open the Function ``testEndToEnd``
5. Follow the directions there
