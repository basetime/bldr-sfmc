Dependency List for SFMC

# Order of Operations for Deploy

1. Folders
    1. Email Studio
    2. Content Builder
    3. Automations
    4. Queries
    5. Scripts
2. DataExtensions
3. ContentBlocks
    1. can have dependancies

-   Content Scrub

    -   Links with subdomain
        -   Replace link with `#`
    -   Excludes list
        -   Things user doesn't want to package
        -   Encrypted: API Keys, etc.

-   Folders
    -   Parent Folders
-   Data Extension Dependencies
-   Folders
-   Content Block Dependencies
    -   Folders
    -   Data Extensions
    -   Content Blocks
    -   CloudPagesURL
-   Email Dependencies
    -   Folders
    -   Data Extensions
    -   Content Blocks
    -   CloudPagesURL

## Ampscript

-   Data Extensions

    -   ClaimRow
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/claimrow.html](Row)
            -   Name
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/claimrowvalue.html](value)
            -   Name
    -   DataExtensionRowCount
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/dataextensionrowcount.html](row count)
        -   Name
    -   DeleteData
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/deletedata.html]()
            -   Name
    -   DeleteDE
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/deletede.html]()
            -   Name
    -   InsertDE
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/insertde.html]()
            -   Name
    -   UpdateData
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/updatedata.html]()
            -   Name
    -   UpdateDE
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/updatede.html]()
            -   Name
    -   UpsertData
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/upsertdata.html]()
            -   Name
    -   UpsertDE
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/upsertde.html]()
            -   Name
    -   Lookup
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/lookup.html]()
            -   Name
    -   LookupOrderedRows
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/lookuporderedrows.html]()
        -   Name
    -   LookupOrderedRowsCS
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/lookuporderedrowscs.html]()
    -   LookupRows
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/lookuprows.html]()
            -   Name
    -   LookupRowsCS
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/lookuprowscs.html]()
            -   Name

-   Filters
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/executefilter.html](ExecuteFilter)
        -   External Key
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/executefilterorderedrows.html](ExecuteFilterOrderedRows)
        -   External Key
-   Content Blocks
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/contentblockbyid.html](by id)
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/contentblockbykey.html](by key)
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/contentblockbyname.html](by name)
-   Images
    -   Image Blocks
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/contentimagebyid.html](by id)
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/contentimagebykey.html](by key)
    -   URL

## SSJS

-   Data Extensions
    -   DataExtension.Init
        -   External Key
    -   DataExtension.Add
        -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_dataExtensionAdd.html]()
            -   CustomerKey in object
-   Email
    -   Email.Init
        -   External Key
-   Filters
    -   FilterDefinition.Init
        -   External Key
-   Queries
    -   QueryDefinition.Init
        -   External Key
-   Folders
    -   Folder.Init
        -   External Key
    -   [https://developer.salesforce.com/docs/marketing/marketing-cloud/guide/ssjs_emailAdd.html](Email.Add)
