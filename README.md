# BLDR-SFMC

BLDR is a CLI application for Salesforce Marketing Cloud (SFMC). BLDR brings working with SFMC a bit closer to a GIT development workflow while also incorporating the ability to use any GIT provider for version control.

## Installation

1. Opening the terminal and check if you have the following:
    - Ensure you have Node.js installed by typing `node --version`
        - If you do not have Node.js installed visit [nodejs.org]() and follow the instructions for installation
    - Ensure you have GIT installed by typing `git version`
        - If you do not have GIT installed go to [git-scm.com/downloads]() and follow the instructions for installation
    - Install BLDR-SFMC CLI
    - In your termainal run `npm install -g @basetime/bldr-sfmc`
        - NOTE: You must include the `-g` flag to be able to use this across multiple projects

## Updating to @latest Release

1. Open your terminal and run `npm update -g @basetime/bldr-sfmc`

## Setup

BLDR is configured so you can use it across as many SFMC instances as you require. The interactions with SFMC are completed using a Server-to-Server API Package set up within each SFMC Instance. It's recommended that you create an Installed Package specifically for the CLI.

### SFMC Setup

1. In SFMC, navigate to `Settings > Setup > Platform Tools > Apps > Installed Packages`
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

# CLI Scope & Support

BLDR is scoped to Content Builder and Automation Studio assets. Due to some of the API limitations and data structures there are a few important callouts to keep in mind. Across the various types of assets within SFMC, there will be various levels of support and user experiences:

## Content Builder
### Fully Supported Assets

Fully supported assets are asset types that when cloned from SFMC are created as fully editable `.html` files.
Asset types that are **fully supported** are `html emails, code snippet content blocks, and html content blocks`.

### Partially Supported Assets

Partially supported assets are asset types that when cloned from SFMC are created as `.json` files. These files can still be updated/edited directly in the JSON structure and updated within SFMC. Asset types that are partially supported are any not listed in the **Fully Supported Assets** section above.

### CloudPages and Code Resource Pages

Support for CloudPages and Code Resource Pages falls between _fully supported_ and _partially supported_.
Both of these asset types will not show up or be cloned down when running the clone command for a folder Id. Both of these assets will need to be cloned down using the `bldr clone --cb -a <assetId>` command.

They will be created win the root `Content Builder` folder as that is where they appear in the backend of SFMC.

Updating these assets in SFMC will be successful up until the point of `publish`. There is currently no API support for publishing CloudPages or Code Resource pages via API, however the code in the resource will be updated.

Creating these assets in SFMC from new local files is currently not supported. When creating these asset types via API, you will not receive any errors, and the code will be saved within SFMC; however it will not create the shell for the asset, so it will not be accessible.

### New Assets

In the current iteration of BLDR there is support for creating new folders and assets. These new assets currently need to be created within an initial cloned folder from SFMC as this feature uses the auto-generated configuration files to identify what is new.

During the `bldr add` command folders and files will be checked against the `.local.manifest.json` file; folders in the path that do not currently exist there will be created. In addition, files that do not exist will prompt you to select a supported asset type `htmlblock, codesnippetblock, or htmlemail`.


## Automation Studio
### Fully Supported Assets

Fully supported assets are asset types that when cloned from SFMC are created as fully editable `.html/.sql` files.
Asset types that are **fully supported** are `query activities, script activities`.

### Partially Supported Assets

Partially supported assets are asset types that when cloned from SFMC are created as `.json` files. These files can still be updated/edited directly in the JSON structure and updated within SFMC. Asset types that are partially supported are any not listed in the **Fully Supported Assets** section above.

### New Assets

Creation of new assets within Automation Studio is currently not supported. Support for this is in current development.


# Usage

```
Command         | Flag                           | Description
--------------- | ------------------------------ | --------------------------------------------------------------------------------
config          |                                |
                | -n, --new                      | Create New Configuration
                | <instance name>                | Get Configuration for an instance
                | -l, --list                     | List All Configurations
                |   >>  -d, --details            | Show Configuration Details optional
                | -s, --set <instance name>      | Set a Configuration to Use
                |   >>  -m, --mid <mid id>       | Set Target MID optional
                | -r, --remove <instance name>   | Remove a Stored Configuration
--------------- | ------------------------------ | --------------------------------------------------------------------------------
status          |                                |
                |                                | Show Current State and Staged Files
--------------- | ------------------------------ | --------------------------------------------------------------------------------
stash           |                                |
                | -c, --clear                    | Clear Staged Files
--------------- | ------------------------------ | --------------------------------------------------------------------------------
add             |                                |
                | .                              | Add All Assets to the Stash to be Pushed into SFMC
                | <folder path>                  | Add One or Multiple Assets to the Stash to be Pushed into SFMC
--------------- | ------------------------------ | --------------------------------------------------------------------------------
push            |                                |
                |                                | Update or Create files in SFMC
                |                                |  >> Files that are created locally will prompt the selection of Asset Type
                |                                | before being created in SFMC
--------------- | ------------------------------ | --------------------------------------------------------------------------------
                |
                | The following commands require one of the following context flags.
                |
                | --cb, --content-builder        |
                | --as, --automation-studio      |
--------------- | ------------------------------ | --------------------------------------------------------------------------------
search          |                                |
                | --cb, --as                     |
                |   -f, --folder                 | Search for a Folder by Name
                |   -a, --asset                  | Search for an Asset by Name
                | --as                           |
                |   --sql, --query               | Search for a SQL Query by Name
                |   --ssjs, --script             | Search for a Script Activity by Name
--------------- | ------------------------------ | --------------------------------------------------------------------------------
clone           |                                |
                | --cb, --as                     |
                |   -f, --folder <folder id>     | Clone All Folders/Subfolders and Assets Starting at Identified Folder
                |   -a, --asset <asset id>       | Clone a Single Asset
                | --as                           |
                |   --sql, --query <query id>    | Clone a Single Asset
                |   --ssjs, --script <script id> | Clone a Single Asset
```


# TODO/Roadmap
Items listed below identify the projected roadmap for the BLDR project. Implementation of these items are not set in stone or promised.

- Support for creating new sql and script activities for Automation Studio
- Project initiation command so bldr projects do not need to start with cloned assets
- Initial package command
  - Gather all cloned assets into a serialized JSON object with valid API paylaods
- Identify dependancies across all asset types and add dependancy definitions to serialized JSON
- Deploy all dependancies and assets to SFMC
- User Interface/Web Application
  - Database of community packages
    - Register packages to be searchable
    - Add tags, description, link, author info, etc
  - User profiles
    - Search all registered packages
    - SFMC connector for direct deployment of packages
    - Create package and download zipfile


