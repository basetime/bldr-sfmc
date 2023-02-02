module.exports = [
    'ID',
    'CreatedDate',
    'ModifiedDate',
    'Client.ID',
    'AccountUserID',
    'UserID',
    'Name',
    'Email',
    'MustChangePassword',
    'ActiveFlag',
    'ChallengePhrase',
    'ChallengeAnswer',
    'IsAPIUser',
    'NotificationEmailAddress',
    'Client.PartnerClientKey',
    'Password',
    'IsSendable',
    'Locale.LocaleCode',
    'TimeZone.ID',
    'TimeZone.Name',
    'CustomerKey',
    'DefaultBusinessUnit',
    'LanguageLocale.LocaleCode',
    'Client.ModifiedBy',
];

/**
 * DESCRIBE Definition
 */
/*
 {
  "ObjectDefinition": {
    "ObjectType": "AccountUser",
    "Properties": [
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CreatedDate",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ModifiedDate",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.ID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AccountUserID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "UserID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 128,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Name",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 50,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Email",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 254,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "MustChangePassword",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ActiveFlag",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ChallengePhrase",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 128,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ChallengeAnswer",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsAPIUser",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "NotificationEmailAddress",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 254,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.PartnerClientKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Password",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 227,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsSendable",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Locale.LocaleCode",
        "DataType": "String",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "MaxLength": 5,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone.ID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone.Name",
        "DataType": "String",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "MaxLength": 128,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 36,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SalesForceID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false,
        "MaxLength": 18,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DefaultBusinessUnit",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "LanguageLocale.LocaleCode",
        "DataType": "String",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "MaxLength": 40,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client.ModifiedBy",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "UserPermissions",
        "DataType": "UserAccess[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Delete",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "LastSuccessfulLogin",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsLocked",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Unlock",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BusinessUnit",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DefaultApplication",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Locale",
        "DataType": "Locale",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TimeZone",
        "DataType": "TimeZone",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DefaultBusinessUnitObject",
        "DataType": "BusinessUnit",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AssociatedBusinessUnits",
        "DataType": "BusinessUnit[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Roles",
        "DataType": "Role[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "LanguageLocale",
        "DataType": "Locale",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Applications",
        "DataType": "Manage_Application[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ProvideIMHAccess",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FederationObject",
        "DataType": "Federation",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SsoIdentities",
        "DataType": "SsoIdentity[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BusinessUnitAssignmentConfiguration",
        "DataType": "BusinessUnitAssignmentConfiguration",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Client",
        "DataType": "ClientID",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PartnerProperties",
        "DataType": "APIProperty[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ObjectID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Owner",
        "DataType": "Owner",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CorrelationID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ObjectState",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsPlatformObject",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      }
    ]
  },
  "RequestID": "ed0d8366-1edc-4717-9957-b537baa768b7"
}
*/
