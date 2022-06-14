let logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "CityofLincoln";
  options.databaseAlias = "Main";
  options.userId = "Lincoln.dev.api";
  options.password = "UoNsd7esY7Z";
  options.clientId = "9c9fc654-5068-4e99-9f0c-da5258e5fd5f";
  options.clientSecret = "GBmuogNipLwWXea5dsXbYLRJ2yZETc8odeMZ5M8xmIA=";
  return options;
};

module.exports.main = async function (vvClient, response, token) {
  /*Script Name:    OpPermInvoiceRenewalSCH
    Customer:       City of Lincoln
    Purpose:        The purpose of this process is to generate yearly renewals for Operational Permits.
    Parameters:    
 
    Return Array:   1. 
 
    Date of Dev:    01/26/2022 
    Last Rev Date:  01/26/2022
    Revision Notes: 01/26/2022 -  Rocky Borg: Script created
     
    */

  logger.info(`Start of the process OpPermInvoiceRenewalSCH at ${Date()}`);
  response
    .status(200)
    .json(
      "Process started, please check back in this log for more information as the process completes."
    );

  /**********************
   Configurable Variables
  ***********************/
  // Year renewal is for
  let renewalYear = "2022";

  // Get Contact Info
  let onsiteBillingContactsQuery = "zWebSvc OpPerm Onsite Billing Contacts";
  let yearlyOpPermRenewalQuery = "zWebSvc Yearly OpPerm Renewal";

  // Template Names
  let opPermCertificateTemplateID = "OpPerm Certificate";
  let dropdownListTemplateID = "zDropDownListImport";

  // Email Variables
  let emailTemplateName = "OpPerm Yearly Renewal";

  let portalURL =
    ' <a href="https://cityoflincoln.visualvault.com/">City of Lincoln Portal</a>';

  let TokenFacilityName = "[Facility Name]";
  let TokenFacilityAddress = "[Facility Address]";
  let TokenInvoiceURL = "[Invoice URL]";

  // Array for capturing error messages that may occur.
  let errorLog = [];

  /****************
   Script Variables
  *****************/

  /*******************
   RECURSIVE FUNCTIONS
  ********************/
  async function generateRenewalInvoice(renewal) {
    return new Promise(async function (resolve) {
      try {
        // OpPerm Certificate Variables
        let permitType = renewal["permit Type"];
        let permitClassification = renewal["permit Classification"];
        let operationalPermitID = renewal["operational Permit ID"];
        let businessId = renewal["business ID"];
        let opPermCertificateRevisionId = renewal["dhid"];
        let facilityName = renewal["facility Name"];
        let facilityAddress = renewal["address"];

        // Calculate Permit Fee
        let permitFee = "";
        let displayValue = "";

        if (
          permitType === "Fraternities and Sororities" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType === "Hazardous Materials" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType ===
            "Health Care Facilities (Residential & Non-Residential)" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType === "Hospitals" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType === "Hotels and Motels" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType === "Mobile Home Court" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (
          permitType === "Places of Assembly" &&
          permitClassification &&
          permitClassification !== "Select Item"
        ) {
          displayValue = permitClassification;
        }

        //
        if (permitType === "Schools") {
          displayValue = permitType;
        }

        //
        if (permitType === "Storage of Scrap Tires and Tire Byproducts") {
          displayValue = permitType;
        }

        //
        if (permitType === "Spraying or Dipping") {
          displayValue = permitType;
        }

        //
        if (permitType === "Explosives and Blasting Agents") {
          displayValue = permitType;
        }

        //
        if (permitType === "Mobile Food Preparation Vehicles") {
          displayValue = permitType;
        }

        // Call getForms to get current fee matching the license type or permit classification.
        if (displayValue) {
          let queryParams = {
            q: `[Display Value] eq '${displayValue}' AND [Options Value] ne '${displayValue}' AND [Status] eq 'Enabled'`,
            fields: "instanceName, revisionId, Options Value",
          };

          let getFormsResp = await vvClient.forms.getForms(
            queryParams,
            dropdownListTemplateID
          );
          getFormsResp = JSON.parse(getFormsResp);
          let getFormsData = getFormsResp.hasOwnProperty("data")
            ? getFormsResp.data
            : null;
          let getFormsLength = Array.isArray(getFormsData)
            ? getFormsData.length
            : 0;

          if (getFormsResp.meta.status !== 200) {
            throw new Error(
              `Error encountered when calling getForms. ${getFormsResp.meta.statusMsg}.`
            );
          }
          if (!getFormsData || !Array.isArray(getFormsData)) {
            throw new Error(`Data was not returned when calling getForms.`);
          }

          if (getFormsLength > 0) {
            permitFee = getFormsData[0]["options Value"];
          }
        }

        // STEP 1 - Generate Invoice Line Item for renewal.
        if (parseInt(permitFee, 10) > 0) {
          let lineItemDescription = `${permitType} - ${facilityAddress}`;

          if (
            permitClassification &&
            permitClassification.trim() &&
            permitClassification !== "Select Item"
          ) {
            lineItemDescription = `${permitType} ( ${permitClassification} ) - ${facilityAddress}`;
          }

          let invoiceLineItemRequestArr = [
            { name: "Category", value: "Operational Permits" },
            { name: "Sub Category", value: "Renewal Fee" },
            { name: "Permit Type", value: permitType },
            { name: "Description", value: lineItemDescription },
            { name: "Amount", value: permitFee },
            { name: "Operational Permit ID", value: operationalPermitID },
            { name: "Business ID", value: businessId },
            { name: "OpPerm Certificate Year", value: renewalYear },
          ];

          let genInvoiceLineItemResp = await vvClient.scripts.runWebService(
            "LibGenerateInvoiceLineItem",
            invoiceLineItemRequestArr
          );
          let genInvoiceLineItemData = genInvoiceLineItemResp.hasOwnProperty(
            "data"
          )
            ? genInvoiceLineItemResp.data
            : null;

          if (genInvoiceLineItemResp.meta.status !== 200) {
            throw new Error(
              `There was an error when calling LibGenerateInvoiceLineItem.`
            );
          }
          if (
            !genInvoiceLineItemData ||
            !Array.isArray(genInvoiceLineItemData)
          ) {
            throw new Error(
              `Data was not returned when calling LibGenerateInvoiceLineItem.`
            );
          }
          if (genInvoiceLineItemData[0] === "Error") {
            errorLog.push(...genInvoiceLineItemData[2]);
            throw new Error(
              `The call to LibGenerateInvoiceLineItem returned with an error. ${genInvoiceLineItemData[1]}.`
            );
          }
          if (genInvoiceLineItemData[0] !== "Success") {
            throw new Error(
              `The call to LibGenerateInvoiceLineItem returned with an unhandled error.`
            );
          }

          // STEP 2 - Update Certificate to indicate renewal was sent.
          let formUpdateObj = {
            "Renewal Invoice Sent": "True",
          };

          let postFormResp = await vvClient.forms.postFormRevision(
            null,
            formUpdateObj,
            opPermCertificateTemplateID,
            opPermCertificateRevisionId
          );
          if (postFormResp.meta.status !== 201) {
            throw new Error(
              `An error was encountered when attempting to update the ${opPermCertificateTemplateID} form. ${
                postFormResp.hasOwnProperty("meta")
                  ? postFormResp.meta.statusMsg
                  : postFormResp.message
              }`
            );
          }

          // STEP 3 - Get onsite and billing contacts for Operational Permit.
          let queryParams = {
            filter: `[Operational Permit ID] = '${operationalPermitID}'`,
          };

          let customQueryResp =
            await vvClient.customQuery.getCustomQueryResultsByName(
              onsiteBillingContactsQuery,
              queryParams
            );
          customQueryResp = JSON.parse(customQueryResp);
          let customQueryData = customQueryResp.hasOwnProperty("data")
            ? customQueryResp.data
            : null;
          let customQueryLength = Array.isArray(customQueryData)
            ? customQueryData.length
            : 0;

          if (customQueryResp.meta.status !== 200) {
            throw new Error(
              `Error encountered when calling getCustomQueryResultsByName. ${customQueryResp.meta.statusMsg}.`
            );
          }
          if (!customQueryData || !Array.isArray(customQueryData)) {
            throw new Error(
              `Data was not returned when calling getCustomQueryResultsByName.`
            );
          }

          if (customQueryLength > 0) {
            let commLogUniqueEmailAddresses = [];

            for (const contact of customQueryData) {
              commLogUniqueEmailAddresses.push(contact["email Address"]);
            }

            // STEP 4 - Send Notification Email.
            commLogUniqueEmailAddresses = [
              ...new Set(commLogUniqueEmailAddresses),
            ];

            let tokenArr = [
              { name: TokenFacilityName, value: facilityName },
              { name: TokenFacilityAddress, value: facilityAddress },
              { name: TokenInvoiceURL, value: portalURL },
            ];
            let emailRequestArr = [
              { name: "Email Name", value: emailTemplateName },
              { name: "Tokens", value: tokenArr },
              {
                name: "Email Address",
                value: commLogUniqueEmailAddresses.join(","),
              },
              { name: "Email AddressCC", value: "" },
              { name: "SendDateTime", value: "" },
              {
                name: "RELATETORECORD",
                value: [operationalPermitID, businessId],
              },
              {
                name: "OTHERFIELDSTOUPDATE",
                value: {
                  "Primary Record ID": operationalPermitID,
                  "Other Record": businessId,
                },
              },
            ];

            let emailCommLogResp = await vvClient.scripts.runWebService(
              "LibEmailGenerateAndCreateCommunicationLog",
              emailRequestArr
            );
            let emailCommLogData = emailCommLogResp.hasOwnProperty("data")
              ? emailCommLogResp.data
              : null;

            if (emailCommLogResp.meta.status !== 200) {
              throw new Error(
                `There was an error when calling LibEmailGenerateAndCreateCommunicationLog.`
              );
            }
            if (!emailCommLogData || !Array.isArray(emailCommLogData)) {
              throw new Error(
                `Data was not returned when calling LibEmailGenerateAndCreateCommunicationLog.`
              );
            }
            if (emailCommLogData[0] === "Error") {
              throw new Error(
                `The call to LibEmailGenerateAndCreateCommunicationLog returned with an error. ${emailCommLogData[1]}.`
              );
            }
            if (emailCommLogData[0] !== "Success") {
              throw new Error(
                `The call to LibEmailGenerateAndCreateCommunicationLog returned with an unhandled error.`
              );
            }
          }
        }

        resolve();
      } catch (error) {
        errorLog.push(error);
        resolve();
      }
    });
  }

  try {
    /****************
     BEGIN ASYNC CODE
    *****************/
    // STEP 1 - Get all Operational Permit Certificates eligible for renewal.
    let queryParams = { filter: `` };

    let customQueryResp =
      await vvClient.customQuery.getCustomQueryResultsByName(
        yearlyOpPermRenewalQuery,
        queryParams
      );
    customQueryResp = JSON.parse(customQueryResp);
    let customQueryData = customQueryResp.hasOwnProperty("data")
      ? customQueryResp.data
      : null;
    let customQueryLength = Array.isArray(customQueryData)
      ? customQueryData.length
      : 0;

    if (customQueryResp.meta.status !== 200) {
      throw new Error(
        `Error encountered when calling getCustomQueryResultsByName. ${customQueryResp.meta.statusMsg}.`
      );
    }
    if (!customQueryData || !Array.isArray(customQueryData)) {
      throw new Error(
        `Data was not returned when calling getCustomQueryResultsByName.`
      );
    }

    // STEP 2 - Process renewal.
    for (const renewal of customQueryData) {
      await generateRenewalInvoice(renewal);
    }
  } catch (error) {
    errorLog.push(error);
  } finally {
    // STEP 4 - Log errors and send response to server.
    logger.info(JSON.stringify(`${errorLog}`));

    if (errorLog.length) {
      return vvClient.scheduledProcess.postCompletion(
        token,
        "complete",
        true,
        `Error encountered during processing of OpPerm Renewals.`
      );
    } else {
      return vvClient.scheduledProcess.postCompletion(
        token,
        "complete",
        true,
        "OpPerm Renewals processed successfully."
      );
    }
  }
};
