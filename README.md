# BLDR-SFMC

BLDR is a CLI application for Salesforce Marketing Cloud (SFMC). BLDR brings working with SFMC a bit closer to a GIT development workflow, while also incorporating the ability to use any GIT provider for version control.

<br>

In addition to a workflow tool, BLDR allows users to package assets to be stored in a single JSON file. This JSON file can be stored directly in your GIT repository, shared with a teammate or community member, who can then install/download your package. For more details on packaging/deploying BLDR packages [see the documentation](https://bldr.io/documentation/sfmc/v1/package/).

<br>

# Full Documentation

To view full BLDR documentation, visit [getting-started](https://bldr.io/documentation/sfmc/v1/getting-started/).

<br />

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

## Troubleshooting installation

### Permission Issues

If you run into permissions issues while installing bldr, you can run the install command as `sudo npm install -g @basetime/bldr-sfmc`.

### Libsecret Issue

BLDRs enhanced secrity to handle the storing of your API Credentials is handled through the [keytar library](https://www.npmjs.com/package/keytar). As such, the keytar library uses a library called `libsecret` to access the systems credential manager. Libsecret cannot be included as a dependency so you may need to install it prior to installing BLDR. Follow the instructions on the keytar npm page or try the below instructions to install the libsecret library.

**MacOs**

1. [Install Homebrew](https://brew.sh/)
2. [Install Libsecret](https://formulae.brew.sh/formula/libsecret#default)

## Setup

BLDR is configured so you can use it across as many SFMC instances as you require. The interactions with SFMC are completed using a Server-to-Server API Package set up within each SFMC Instance. It's recommended that you create an Installed Package specifically for the CLI that can be shared between you and your team members.

<br>

### SFMC Installed Package

1. In SFMC, navigate to `Settings > Setup > Platform Tools > Apps > Installed Packages`
2. Click on `New` to create a new Package and name it `bldr-cli`
3. Click on `Add Component` to add a new API Component and select `API Integration` and then `Server-to-Server` or `Web App`
    1. For `Web App` configurations, include `https://bldr.io/cli/sfmc/authenticate/` as the Redirect URI
4. Navigate to `Access` and ensure that the Installed Package is provisioned for all desired Business Units
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

**Web App Installed Packages**

Web App Configurations will use the [oAuth 2 authentication flow](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/integration-app-auth-code.html) which adds an extra layer of security for your organization and the instance you are connecting with. When using the Web App configuration, BLDR will still need to encrypt and store the credentials in your default credential vault as they are needed to initiate the oAuth process.

To facilitate this flow, BLDR will:

-   Use a localhost NodeJS server to open your web browser to the [SFMC Authorization URL](https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/authorization-code.html)
-   Once logged in, SFMC will send the challenge code to `https://bldr.io/cli/sfmc/authenticate/` which points to a Google Cloud function
-   The Google Cloud function will serve a basic HTML page which passes the challenge code back to the localhost server to validate and receive the access token
-   Once the process is complete, the server will close

<br>

**Why do we need the Cloud Function**

SFMC Web and Public App Installed Packages enforce that all Redirect URIs use the https protocol rather than http. This is to ensure that the connection with the Redirect URI is a trusted source. BLDR, being a CLI application, requires the use of a temporary localhost server to receive the oAuth challenge code; by nature a localhost server cannot have the required certificates to enforce https so the function simply passes it along.

[View the Cloud Function code here.](https://github.com/basetime/bldr-sfmc/blob/main/lib/_utils/oAuth_CloudFunction.js)

<br>

### BLDR Configuration

1. In your terminal, run `bldr config -n`
2. Follow the prompts and input the following from the Installed Package:
    - Name the configuration
    - Select `Server-to-Server` or `Web App` integration
    - Parent MID
    - Client ID
    - Client Secret
    - Auth URI

<br>

# Security

You and your organizations security are important. We've taken steps to ensure that the credentials you use for configurations are encrypted and stored securely. Credentials are stored using your machines default password storage (OSX Keychain Access or Windows Credential Manager).

For more information, visit [security](https://bldr.io/documentation/sfmc/v1/security/).

<br>

# Analytics

The goal of BLDR is to put effort and focus into the most used features and areas of SFMC that users are working in. CLI applications are a black-hole regarding understanding it's users and use-cases. We have implemented a basic analytics functionality that simply increments counts as various actions are taken. This functionality does not record any PII, User Data, or Configuration Data of any kind; it is simply a way to understand what parts of BLDR are being leveraged.

If you do not wish to have these metrics gathered as you use BLDR please run `bldr config --analytics` to turn this functionality off. It can be toggled on/off at any time.

Analytics Gathered:

-   Initial Download
-   New Configuration
-   Push To SFMC
-   Package
-   Package Deploy
-   Content Builder Project Initiate
-   Data Extension Initiate
-   Content Builder Search Folders
-   Content Builder Search Assets
-   Data Extension Search Folders
-   Data Extension Search Assets
-   Content Builder Clone Folders
-   Content Builder Clone Assets
-   Data Extension Clone Folders
-   Data Extension Clone Assets
    <br>
