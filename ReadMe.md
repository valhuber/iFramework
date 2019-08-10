# iFramework
This is the LAC-based integration framework, G2, based on G1 by Kristy.

[Background information here](https://drive.google.com/open?id=1k-iijwPwvdyfW91vohbYvEAYdhq0ULOq-Np9oOoxIDo)

## Install Instructions:
1. Login in as sa, and create a teamspace called iFramework.  Use that same name for url and default user.
2. Shut down LAC
3. Install:
```
cd /%lac-install%/CALiveAPICreator/jetty.repository/teamspaces/iFramework  
git clone https://github.com/valhuber/iFramework.git  
```
4. Initialize your databases (this presumes default jetty.repository install location)
```
cd apis/iRefRJdb/UserFiles  
sh copyDBs.sh
```
