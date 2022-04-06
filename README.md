# BLDR-SFMC

BLDR is a CLI application for Salesforce Marketing Cloud (SFMC). BLDR brings working with SFMC a bit closer to a GIT development workflow while also incorporating the ability to use any GIT provider for version controll.

## Installation
1. Opening the terminal and check if you have the following:
    - Ensure you have Node.js installed by typing `node --version`
      - If you do not have Node.js installed visit [nodejs.org]() and follow the instructions for installation
    - Ensure you have GIT installed by typing `git version`
      - If you do not have GIT installed go to [git-scm.com/downloads]() and follow the instructions for installation
    - Install BLDR-SFMC CLI
    - In your termainal run `npm install -g bldr-sfmc`

## Setup
BLDR is configured so you can use it across as many SFMC instances as you require. The interactions with SFMC are completed using a Server-to-Server API Package set up within each SFMC Instance. It's recommended that you create an Installed Package specifically for the CLI. 

### SFMC Setup
1. In SFMC, navigate to `Settings > Setup >  Platform Tools > Apps > Installed Packages`
2. Click on `New` to create a new Package and name it `bldr-cli`
3. Click on `Add Component` to add a new API Component and select `API Integration` and then `Server-to-Server`
4. Navigate to `Access` and ensure that the Installed Package is provisioned for all Business Units.
5. Update the scope of the Installed Package to match the following:
   
| Scope                | Access      |
| -------------------- | ----------- |
| Email                | Read, Write |
| Web                  | Read, Write |
| Documents and Images | Read, Write |
| Saved Content        | Read, Write |
| Automations          | Read, Write |
| Journeys             | Read, Write |
| List and Subscribers | Read        |
| Data Extensions      | Read, Write |
| File Locations       | Read, Write |
| Accounts             | Read        |


### CLI Setup
1. In your terminal, run `bldr config -n`
2. Follow the prompts and input the following from the Installed Package: 
   - Parent BU MID
   - Client Id
   - Client Secret
   - Auth URI


---

## Usage
```
Command         | Flag                           | Description                                                                     
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Config          |                                |                                                                                 
                | -n, --new                      | Create New Configuration                                                        
                | <instance name>                | Get Configuration for an instance                                               
                | -l, --list                     | List All Configurations                                                         
                |   >>  -d, --details            | Show Configuration Details optional                                             
                | -s, --set <instance name>      | Set a Configuration to Use                                                      
                |   >>  -m, --mid <mid id>       | Set Target MID optional                                                         
                | -r, --remove <instance name>   | Remove a Stored Configuration                                                   
--------------- | ------------------------------ | --------------------------------------------------------------------------------
                |                                                                                                                  
                | The following commands require one of the following context flags.                                               
                |                                                                                                                  
                | --cb, --content-builder        |                                                                                 
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Search          |                                |                                                                                 
                | -f, --folder                   | Search for a Folder by Name                                                     
                | -a, --asset                    | Search for an Asset by Name                                                     
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Clone           |                                |                                                                                 
                | -f, --folder <folder id>       | Clone All Folders/Subfolders and Assets Starting at Identified Folder           
                | -a, --asset <asset id>         | Clone a Single Asset Along With Its Full Folder Path                            
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Add             |                                |                                                                                 
                | .                              | Add All Assets to the Stash to be Pushed into SFMC                              
                | <folder path>                  | Add One or Multiple Assets to the Stash to be Pushed into SFMC                  
--------------- | ------------------------------ | --------------------------------------------------------------------------------
Push            |                                |                                                                                 
                |                                | Update or Create files in SFMC                                                  
                |                                |  >> Files that are created locally
```