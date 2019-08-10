# iFramework
Install Instructions:
1. Login in as sa, and create a teamspace called iFramework.  Use that same name for url and default user.
2. Shut down LAC
3. Install:

cd /%lac-install%/CALiveAPICreator/jetty.repository/teamspaces/iFramework
git clone https://github.com/valhuber/iFramework.git

4. Initialize your databases (this presumes default jetty.repository install location)

cd apis/iRefRJdb/UserFiles

sh copyDBs.sh
