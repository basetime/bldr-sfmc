# BLDR-SFMC

BLDR is a CLI application for Salesforce Marketing Cloud (SFMC). BLDR brings working with SFMC a bit closer to a GIT development workflow, while also incorporating the ability to use any GIT provider for version control.

<br>

In addition to a workflow tool, BLDR allows users to package assets to be stored in a single JSON file. This JSON file can be stored directly in your GIT repository, shared with a teammate or community member, who can then install/download your package. For more details on packaging/deploying BLDR packages [see the documentation](#project-distribution).

<br>

# Getting Started

## Installation

1. Opening the terminal and check if you have the following:
    - Ensure you have Node.js installed by typing `node --version`
        - If you do not have Node.js installed visit [nodejs.org](https://www.nodejs.org) and follow the instructions for installation
    - Ensure you have GIT installed by typing `git version`
        - If you do not have GIT installed go to [git-scm.com/downloads](https://www.git-scm.com/downloads) and follow the instructions for installation
    - Install BLDR-SFMC CLI
    - In your terminal run `npm install -g @basetime/bldr-sfmc`
        - NOTE: You must include the `-g` flag to be able to use this across multiple projects

<br>

## Updating BLDR

1. Open your terminal and run `npm update -g @basetime/bldr-sfmc`

<br>

## Setup

BLDR is configured so you can use it across as many SFMC instances as you require. The interactions with SFMC are completed using a Server-to-Server API Package set up within each SFMC Instance. It's recommended that you create an Installed Package specifically for the CLI that can be shared between you and your team members.

<br>

### SFMC Installed Package

1. In SFMC, navigate to `Settings > Setup > Platform Tools > Apps > Installed Packages`
2. Click on `New` to create a new Package and name it `bldr-cli`
3. Click on `Add Component` to add a new API Component and select `API Integration` and then `Server-to-Server`
4. Navigate to `Access` and ensure that the Installed Package is provisioned for all Business Units.
5. Update the scope of the Installed Package to match the following:

<br>

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

<br>

### BLDR Configuration

1. In your terminal, run `bldr config -n`
2. Follow the prompts and input the following from the Installed Package:
    - Parent MID
    - Client ID
    - Client Secret
    - Auth URI

<br>


# Security

You and your organizations security are important. We've taken steps to ensure that the credentials you use for configurations are encrypted and stored securely.

Credentials are stored using your machines default password storage (OSX Keychain or Windows Credential Manager).

We have implemented `aes-256-ctr` encryption, which will encrypt your Installed Package `ClientId` and `ClientSecret` prior to being stored. A key specific to you will be created and stored separate from the stored credentials.


<!-- TODO migration notes -->
<br>


# Usage

```
Command         | Flag                           | Description
--------------- | ------------------------------ | --------------------------------------------------------------------------------
config          |                                |
                | -n, --new                      | Create New Configuration
                | <instance name>                | Get Configuration for an instance
                | -l, --list                     | List All Configurations
                | -d, --details                  | Show Configuration Details optional
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
init            |                                |
                | --cb                           | Initiate project folder for Content Builder
                | --config-only                  | Setup configuration file for project
                | --update-config-keys           | Update .sfmc.config.json keys found in content
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
package         |                                |
                |                                | Package project assets
--------------- | ------------------------------ | --------------------------------------------------------------------------------
install         |                                |
                | <GitHub Repository URL>        | Check for and download .package.manifest.json file
--------------- | ------------------------------ | --------------------------------------------------------------------------------
deploy          |                                |
                |                                | Deploy assets to current/set target instance
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

<br>


# BLDR Scope & Support

BLDR is currently scoped to Content Builder and Automation Studio assets.

Due to some of the API limitations and data structures there are a few important call-outs to keep in mind. Across the various types of assets within SFMC, there will be different levels of support and user experiences:

<br>

## Content Builder

### Fully Supported Assets

**Fully supported** assets are asset types that when cloned from SFMC are created as fully editable `.html` files.

-   html emails
-   code snippet content blocks
-   html content blocks

<br>

### Partially Supported Assets

**Partially supported** assets are asset types that when cloned from SFMC are created as `.json` files. These files can still be updated/edited directly in the JSON structure and updated within SFMC. Asset types that are partially supported are any not listed in the **Fully Supported Assets** section above.

<br>

### CloudPages and Code Resource Pages

Support for CloudPages and Code Resource Pages falls somewhere in-between _fully supported_ and _partially supported_.

<br>

Both of these asset types will not show up or be cloned down when running the clone command for a folder Id as these assets are stored under the root _Content Builder_ folder. Both of these assets do appear in `bldr search --cb` results and will need to be cloned down using the `bldr clone --cb -a <assetId>` command.

<br>

Once cloned, they will be created in the root `Content Builder` folder.

<br>

Updating these assets in SFMC will be successful up until the point of `publish`. There is currently no API support for publishing CloudPages or Code Resource pages via API, however the code in the resource will be updated.

<br>

## Automation Studio

### Fully Supported Assets

Fully supported assets are asset types that when cloned from SFMC are created as fully editable `.html/.sql` files.

-   query activities
-   script activities

<br>

### Partially Supported Assets

Partially supported assets are asset types that when cloned from SFMC are created as `.json` files. These files can still be updated/edited directly in the JSON structure and updated within SFMC. Asset types that are partially supported are any not listed in the **Fully Supported Assets** section above.

<br>

# Initiating a BLDR Project

When initiating a BLDR project there are currently two paths available for Content Builder and one path available for Automation Studio.

<br>

## Existing SFMC Assets

Content Builder and Automation Studio projects can both be initiated based on existing SFMC assets by using the `bldr clone` commands.

<br>

## Non-Existing SFMC Assets

**At the moment, locally scaffolded project initiation is only available for Content Builder projects.**

Projects can be initiated locally by running the `bldr init --cb` command.

The `init` command will prompt you to enter a _Project Name_ that will be used as your root folder and ask if you need to create a configuration file.

Required BLDR folders and files will be created, and you will be able to scaffold your Content Builder folders and assets so you can create them in bulk within SFMC.

Once you have your initial project set up, simply run `bldr add .` and `bldr push` to create your files in SFMC.

<br>

# Project API Keys/Secrets

If your project requires the use of API Keys, Secrets, or any value you might need to keep from version control, there is a configuration/credential system built into BLDR.

<br>

During initiation of a project via the BLDR CLI, select `Y` during the `bldr init` process.

<br>

If you have an existing project and need to leverage the configuration system, you can run `bldr init --config-only`.

<br>

Two configuration files will be created `.sfmc.config.json` and `template.sfmc.config.json`. These JSON files can be used for any values you do not want committed to your version control system and/or BLDR package.

<br>

Keys found in content will be replaced with the JSON keys in `.sfmc.config.json`. When files are created/updated within SFMC the values will be set so the assets within SFMC will be valid and working as expected.

<br>

## When do keys get updated
Your files will be updated when:
- you run `bldr init --update-config-keys`
- you run `bldr add ....` and `bldr push`
- you run `bldr package`

<br>

All found values will be replaced with the keys found in the `.sfmc.config.json` file.

```javascript
// .sfmc.config.json
{
    "client_id": "abc12345"
}

// Updated Asset Content
var apiConfig = {
    clientId: "{{client_id}}"
}
```

<br>

# Project Distribution

BLDR is not only a powerful SFMC workflow but a tool that is being developed with a larger initiative in sight. BLDR will be a full open-source platform that allow users/developers/admins/etc to create BLDR Packages, make them searchable, make them accessible.

<br>

Users will be able to _Search, Install, and Deploy_ recipes and packages that others in the community have shared.

<br>

The distribution scope of the project will be starting development soon, so check back for updates. If you are interested in contributing please reach out!

<br>

## Packaging

**At the moment, packaging is only available for Content Builder projects.**

Once you have your project tested and ready to share; run `bldr package`. This action will gather all of the required data from your project files that is needed to create the assets in a new SFMC instance.

<br>

If your assets have AMPscript or Sever-Side Javascript dependencies, bldr will identify the assets that are referenced and include them in your package.

<br>

Dependency support is growing and will continue to expand. Currently, most Data Extension based and ContentBlock functions are supported.

## Installing and Deploying

Packaged projects can then be committed to a _public_ repository.

<br>

BLDR projects can be shared by providing the repository URL `https://github.com/{{owner}}/{{repository}}` with the community member or team member.

<br>

Once they have the URL, they can run `bldr install https://github.com/{{owner}}/{{repository}}` which will download the `.package.manifest.json` file and create the sfmc configuration files if needed.

<br>

The `.package.manifest.json` file that is downloaded can be updated by the user if required. **It's recommended to only update names of folders** by using a **find/replace all** functionality in your text editor to ensure that all references are updated and nothing breaks. Names may need to be updated as trying to create folders/assets with existing names will cause errors.

<br>

Once ready, you can run `bldr deploy` to create the assets locally as well as within the currently targeted/set SFMC instance.

<br>
# ToDo/Roadmap

Items listed below identify the projected roadmap for the BLDR project. Implementation of these items are not set in stone or promised.

-   Support for creating new sql and script activities for Automation Studio
-   Expanding dependency support
-   User Interface/Web Application
    -   Database of community packages
        -   Register packages to be searchable
        -   Add tags, description, link, author info, etc
    -   User profiles
        -   Search all registered packages
        -   SFMC connector for direct deployment of packages
        -   Create package and download zipfile
