module.exports = [
    'ObjectID',
    'PartnerKey',
    'CreatedDate',
    'ModifiedDate',
    'Client.ID',
    'CustomerKey',
    'Email.ID',
    'List.ID',
    'Name',
    'Description',
    'TriggeredSendType',
    'TriggeredSendStatus',
    'HeaderContentArea.ID',
    'FooterContentArea.ID',
    'SendClassification.ObjectID',
    'SendClassification.CustomerKey',
    'SenderProfile.CustomerKey',
    'SenderProfile.ObjectID',
    'DeliveryProfile.CustomerKey',
    'DeliveryProfile.ObjectID',
    'PrivateDomain.ObjectID',
    'PrivateIP.ID',
    'AutoAddSubscribers',
    'AutoUpdateSubscribers',
    'BatchInterval',
    'FromName',
    'FromAddress',
    'BccEmail',
    'EmailSubject',
    'DynamicEmailSubject',
    'IsMultipart',
    'IsWrapped',
    'TestEmailAddr',
    'AllowedSlots',
    'NewSlotTrigger',
    'SendLimit',
    'SendWindowOpen',
    'SendWindowClose',
    'SuppressTracking',
    'Keyword',
    'List.PartnerKey',
    'Email.PartnerKey',
    'SendClassification.PartnerKey',
    'PrivateDomain.PartnerKey',
    'PrivateIP.PartnerKey',
    'Client.PartnerClientKey',
    'IsPlatformObject',
    'CategoryID',
];

/**
 * DESCRIBE Definition
 */

/*
{
  "ObjectDefinition": {
    "ObjectType": "TriggeredSendDefinition",
    "Properties": [
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ObjectID",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
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
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
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
        "Name": "Email.ID",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "List.ID",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Name",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Description",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 2147483647,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TriggeredSendType",
        "DataType": "TriggeredSendTypeEnum",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TriggeredSendStatus",
        "DataType": "TriggeredSendStatusEnum",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "HeaderContentArea.ID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FooterContentArea.ID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendClassification.ObjectID",
        "DataType": "Guid",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendClassification.CustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 36,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SenderProfile.CustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 36,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SenderProfile.ObjectID",
        "DataType": "Guid",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DeliveryProfile.CustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 36,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DeliveryProfile.ObjectID",
        "DataType": "Guid",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateDomain.ObjectID",
        "DataType": "Guid",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateIP.ID",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AutoAddSubscribers",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AutoUpdateSubscribers",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BatchInterval",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FromName",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 130,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FromAddress",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 100,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "BccEmail",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 100,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "EmailSubject",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 200,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DynamicEmailSubject",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 2147483647,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsMultipart",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsWrapped",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TestEmailAddr",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 128,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "AllowedSlots",
        "DataType": "Int16",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "NewSlotTrigger",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendLimit",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendWindowOpen",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendWindowClose",
        "DataType": "DateTime",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SuppressTracking",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": true
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Keyword",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 255,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "List.PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Email.PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendClassification.PartnerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "MaxLength": 64,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateDomain.PartnerKey",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateIP.PartnerKey",
        "DataType": "Int32",
        "IsUpdatable": false,
        "IsRetrievable": true,
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
        "Name": "IsPlatformObject",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CategoryID",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": true,
        "IsRequired": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Email",
        "DataType": "Email",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "List",
        "DataType": "List",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendWindowDelete",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "RefreshContent",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ExclusionFilter",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "Priority",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendSourceCustomerKey",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ExclusionListCollection",
        "DataType": "TriggeredSendExclusionList[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "CCEmail",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendSourceDataExtension",
        "DataType": "DataExtension",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsAlwaysOn",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DisableOnEmailBuildError",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "KeepExistingEmailSubject",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PreHeader",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ReplyToAddress",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ReplyToDisplayName",
        "DataType": "String",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DataSchemas",
        "DataType": "APIProperty[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TriggeredSendClass",
        "DataType": "TriggeredSendClassEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TriggeredSendSubClass",
        "DataType": "TriggeredSendSubClassEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "TriggeredSendVersionID",
        "DataType": "Int16",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "RequestExpirationSeconds",
        "DataType": "Int32",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "OptionFlags",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "OptionFlagsUpdateMask",
        "DataType": "Int64",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "OptionVersion",
        "DataType": "Int16",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SendClassification",
        "DataType": "SendClassification",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SenderProfile",
        "DataType": "SenderProfile",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DeliveryProfile",
        "DataType": "DeliveryProfile",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "SourceAddressType",
        "DataType": "DeliveryProfileSourceAddressTypeEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateIP",
        "DataType": "PrivateIP",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "DomainType",
        "DataType": "DeliveryProfileDomainTypeEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "PrivateDomain",
        "DataType": "PrivateDomain",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "HeaderSalutationSource",
        "DataType": "SalutationSourceEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "HeaderContentArea",
        "DataType": "ContentArea",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FooterSalutationSource",
        "DataType": "SalutationSourceEnum",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "FooterContentArea",
        "DataType": "ContentArea",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "IsSendLogging",
        "DataType": "Boolean",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "InteractionObjectID",
        "DataType": "String",
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
        "Name": "PartnerProperties",
        "DataType": "APIProperty[]",
        "IsUpdatable": true,
        "IsRetrievable": false
      },
      {
        "PartnerKey": "",
        "ObjectID": "",
        "Name": "ID",
        "DataType": "Int32",
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
      }
    ]
  },
  "RequestID": "3180d628-1ef1-4dac-8282-5b5b234fa424"
}*/
