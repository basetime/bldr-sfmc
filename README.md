# sfmc-builder-cli
CLI Development Tool for Salesforce Marketing Cloud
```
Command         | Flag                           | Description                                                                     
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Config          |                                |                                                                                 
                | <no flag, -n, --new            | Create New Configuration                                                        
                | -s, --set <instance name>      | Set a configuration to use                                                      
                | -l, --list                     | List All Configurations                                                         
                |   >>  -a                       | Show Configuration Details optional                                             
                |   >>  <instance name>          | Narrow configuration list to an instance optional                               
                | -d, --delete <instance name>   | Delete a Stored Configuration                                                   
--------------- | ------------------------------ | --------------------------------------------------------------------------------
                |                                                                                                                  
                | The following commands require one of the following context flags.                                               
                |                                                                                                                  
                | --cb, --content-builder        |                                                                                 
                | --as, --automation-studio      |                                                                                 
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Search          |                                |                                                                                 
                | -f, --folder                   | Search for a Folder by Name                                                     
                | -a, --asset                    | Search for an Asset by Name                                                     
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Clone           |                                |                                                                                 
```