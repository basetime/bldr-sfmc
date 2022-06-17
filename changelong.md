**2022-06-12**

-   Fixed a bug where correct configurations were throwing errors despite them being copied correctly. We were able to reproduce this issue and it seems to be something that gets caught while capturing an Instance Business Unit details. We've added a `--ignoreError` flag to the new config command - `bldr config -n --ignoreError`. If you run into this error when configuring a new instance, try again with this flag and test your configuration.
-   Fixed a bug where the encryption key was resetting for each newly added SFMC configuration, making previously configured/encrypted configurations invalid/unable to be decrypted/used.

**2022-06-13**

-   Moved location of encryption key due to NPM update removing `.env` file. All existing configurations will need to be reconfigured; you can use the same Instance Name as your existing configuration and it will update that configuration object using the newly created encryption key.
