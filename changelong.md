**2022-07-13**

-   Added/Updated Features:
    -   BugFix: Fixed issue with new files breaking `bldr add` command (filepath issue)
    -   Update: Run `--update-config-keys` on package command
    -   BugFix/Update: Credentials are now scrubbed when editable files created from `bldr deploy`
    -   BugFix/Update: ManifestJSON is now scrubbed when created from `bldr deploy`
    -   Update: Prevent Deployment if `.sfmc.config.json` exists but has not been updated

**2022-06-21**

-   Added/Updated Features:
    -   Update: Require context flag `--cb` for `bldr init`
    -   Update: Updated help documentation and Readme
    -   New: Implemented Configuration system for API Keys on `add/push` and `bldr init --update-api-keys`
    -   New: Implemented `bldr package` for Content Builder packages
    -   New: Implemented `bldr install` to download public repository bldr packages
    -   New: Implemented `bldr deploy` to create local and SFMC files from downloaded bldr packages
-   Notes:
    -   Dependency gathering covers most AMPscript Data Extension functions and AMPscript/SSJS Content Block Functions

**2022-06-13**

-   Moved location of encryption key due to NPM update removing `.env` file. All existing configurations will need to be reconfigured; you can use the same Instance Name as your existing configuration and it will update that configuration object using the newly created encryption key.

**2022-06-12**

-   Fixed a bug where correct configurations were throwing errors despite them being copied correctly. We were able to reproduce this issue and it seems to be something that gets caught while capturing an Instance Business Unit details. We've added a `--ignoreError` flag to the new config command - `bldr config -n --ignoreError`. If you run into this error when configuring a new instance, try again with this flag and test your configuration.
-   Fixed a bug where the encryption key was resetting for each newly added SFMC configuration, making previously configured/encrypted configurations invalid/unable to be decrypted/used.
