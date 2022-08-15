let logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "Demo";
  options.databaseAlias = "FacilityLicensing";
  options.userId = "vv5demo.APIUser";
  options.password = "Y8t89yPcWn4N6Nj";
  options.clientId = "3416ea76-8dec-4de5-b498-f2a315ada5ad";
  options.clientSecret = "v2VEJTDH7r9ezpSJ0OHzujzBNYrdXS06a3VttoxJXOs=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:  CreateUpdateBusiness
     Customer:    City of Lincoln
     Purpose:     The purpose of this process is to create or update a business record depending on the information provided.
     Parameters:  Business ID - (String, Is Optional) Used in the query to verify if the business will be updated or created.
                  Business required fields: Fields thay are required to created or update the business record.
                      Busines Name - (String, Required) 
                      FEIN - (String, Required) 
                      SSN - (String, Required) 
                      Business Address - (String, Required) This field will be used as Mailing and Physical Address
                      Business State - (String, Required) This field will be used as Mailing and Physical State
                      Business City - (String, Required) This field will be used as Mailing and Physical City
                      Business Zip Code - (String, Required) This field will be used as Mailing and Physical Zip Code
                      First Name - (String, Required) First name of the person of contact for the business
                      Last Name - (String, Required) Last name of the person of contact for the business
                      Email - (String, Required) 
                  Individual ID - (String, Required) Used in the query to verify if the business can be updated.
                
     Return Array:  1. Status: 'Success', 'Error'
                    2. Message
                    3. Business ID - If success and business record created
                    
     Pseudo code:   1. Verify if the Business ID was provided. 
                    2. Search the Business Record.
                    3. Validate if the individual ID is authorized to update the business record.
                    4. Update the business record with the information provided. 
                    5. If the business id was not provided, search if exist a business record with the same legal name or FEIN or SSN. 
                    6. Create a new business record if the information is unique. 
                    7. Search the individual record based on the individual id.
                    8. Create a new employee record based on the information of the individual record. 
                    9. Relate the new employee record with the new business record and the individual record.
                    10. Send response with return array.
   
     Date of Dev: 09/23/2021
     Last Rev Date: 09/23/2021
     Revision Notes:
     09/23/2021 - Agustina Mannise: Script created.
     */

  logger.info(
    "Start of the process EmployeeAssignmentAddEmployee at " + Date()
  );

  /**********************
     Configurable Variables
    ***********************/
  //Template ID for Employee Assignment
  let BusinessTemplateID = "Business";
  let EmployeeTemplateID = "Employee Assignment";
  let IndividualTemplateID = "Individual Record";

  //Query Name to get Business information and Administrator Employees.
  let businessQueryName = "zWebSvcBusinessAdministratorEmployee";

  //Script variables
  let outputCollection = [];

  /****************
     Helper Functions
    *****************/
  // Check if field object has a value property and that value is truthy before returning value.
  function getFieldValueByName(fieldName, isOptional) {
    try {
      let fieldObj = ffCollection.getFormFieldByName(fieldName);
      let fieldValue =
        fieldObj && (fieldObj.hasOwnProperty("value") ? fieldObj.value : null);

      if (fieldValue === null) {
        throw new Error(`A value property for ${fieldName} was not found.`);
      }
      if (!isOptional && !fieldValue) {
        throw new Error(`A value for ${fieldName} was not provided.`);
      }
      return fieldValue;
    } catch (error) {
      throw new Error(error);
    }
  }

  //This function creates the object to use in postForm or postFormRevision.
  function createUpdateObj(dataFields, templateID, BusinessID) {
    var objFields = {};

    if (templateID === BusinessTemplateID) {
      objFields["Business Legal Name"] = dataFields.BusinessLegalName;
      objFields["Mailing Street"] = dataFields.MalingAddress;
      objFields["Mailing State"] = dataFields.MailingState;
      objFields["Mailing City"] = dataFields.MailingCity;
      objFields["Mailing Zip"] = dataFields.MailingZipCode;
      objFields["Physical Same"] = "Same";
      objFields["Physical Street"] = dataFields.MalingAddress;
      objFields["Physical State"] = dataFields.MailingState;
      objFields["Physical City"] = dataFields.MailingCity;
      objFields["Physical Zip"] = dataFields.MailingZipCode;
      objFields["First Name"] = dataFields.FirstName;
      objFields["Last Name"] = dataFields.LastName;
      objFields["Email"] = dataFields.Email;
      objFields["Email Confirm"] = dataFields.Email;
      objFields["Status"] = "Pending Submission";
      if (dataFields.FEIN) {
        objFields["FEIN"] = dataFields.FEIN;
        objFields["Federal Tax ID Type"] = "FEIN";
      } else if (dataFields.SSN) {
        objFields["FEIN"] = dataFields.SSN;
        objFields["Federal Tax ID Type"] = "SSN";
      }
    }
    if (templateID === EmployeeTemplateID) {
      objFields["Employee Last Name"] = dataFields["last Name"];
      objFields["Employee First Name"] = dataFields["first Name"];
      objFields["Email"] = dataFields["personal Email"];
      objFields["Employee Email"] = dataFields["personal Email"];
      objFields["MI"] = dataFields["middle Initial"];
      objFields["Individual ID"] = dataFields.instanceName;
      objFields["Business ID"] = BusinessID;
      objFields["Business Administrator"] = true;
      objFields["Status"] = "Active";
      objFields["Form Saved"] = true;
    }
    return objFields;
  }

  try {
    let BusinessID = getFieldValueByName("Business ID", "isOptional");

    //Fields required to created the Business Record.
    let BusinessData = {
      BusinessLegalName: getFieldValueByName("Business Legal Name"),
      FEIN: getFieldValueByName("FEIN", "isOptional"),
      SSN: getFieldValueByName("SSN", "isOptional"),
      MalingAddress: getFieldValueByName("Mailing Street"),
      MailingCity: getFieldValueByName("Mailing City"),
      MailingState: getFieldValueByName("Mailing State"),
      MailingZipCode: getFieldValueByName("Mailing Zip"),
      FirstName: getFieldValueByName("First Name"),
      LastName: getFieldValueByName("Last Name"),
      Email: getFieldValueByName("Email"),
    };

    if (!BusinessData.FEIN && !BusinessData.SSN) {
      throw new Error("A value for FEIN or SSN was not found.");
    }

    let IndividualID = getFieldValueByName("Individual ID");
    let businessParams = {};

    if (BusinessID && BusinessID != "Select Item") {
      let businessQueryParams = { filter: `[business ID] = '${BusinessID}'` };

      let getBusinessResp =
        await vvClient.customQuery.getCustomQueryResultsByName(
          businessQueryName,
          businessQueryParams
        );
      getBusinessResp = JSON.parse(getBusinessResp);

      let businessQueryData = getBusinessResp.hasOwnProperty("data")
        ? getBusinessResp.data
        : null;
      let businessStatus = getBusinessResp.hasOwnProperty("meta")
        ? getBusinessResp.meta.status
        : null;

      if (businessStatus != 200) {
        throw new Error(
          `Call to query '${businessQueryName}' returned with an error`
        );
      }
      if (businessQueryData === null) {
        throw new Error(`The query '${businessQueryName}' returned no data.`);
      }
      if (businessQueryData.length === 0) {
        throw new Error(
          `No Business Record found for Business ID = '${BusinessID}'`
        );
      }

      for (let i = 0; i < businessQueryData.length; i++) {
        //Check if the individual ID is authorized to update the business record.
        if (businessQueryData[i]["form ID"]) {
          if (businessQueryData[i]["form ID"] == IndividualID) {
            let updateBusinessFields = createUpdateObj(
              BusinessData,
              BusinessTemplateID,
              BusinessID
            );

            businessParams = {
              q: `[Business ID] eq '${BusinessID}'`,
            };

            let getBusinessResp = await vvClient.forms.getForms(
              businessParams,
              BusinessTemplateID
            );

            getBusinessResp = JSON.parse(getBusinessResp);

            let businessRespData = getBusinessResp.hasOwnProperty("data")
              ? getBusinessResp.data
              : null;
            let businessRespStatus = getBusinessResp.hasOwnProperty("meta")
              ? getBusinessResp.meta.status
              : null;

            if (businessRespStatus != 200) {
              throw new Error(
                "Call to query existing forms returned with an error"
              );
            }
            if (businessRespData === null) {
              throw new Error("The query returned no data.");
            }
            if (businessRespData.length === 0) {
              throw new Error(
                `No Business Record found for Business ID = '${BusinessID}'`
              );
            }
            if (businessRespData.length > 1) {
              throw new Error(
                `More than one Business Record was found for Business ID = '${BusinessID}'`
              );
            }

            let businessRevisionId = businessRespData[0].revisionId;
            let updateBusinessResp = await vvClient.forms.postFormRevision(
              null,
              updateBusinessFields,
              BusinessTemplateID,
              businessRevisionId
            );
            businessRespStatus = updateBusinessResp.hasOwnProperty("meta")
              ? updateBusinessResp.meta.status
              : null;
            //let businessUpdateRespData = (updateBusinessResp.hasOwnProperty('data') ? updateBusinessResp.data : null);

            if (businessRespStatus !== 201) {
              throw new Error(
                `An error was encountered when attempting to update the '${BusinessID}' form.`
              );
            }

            outputCollection[0] = "Success";
            outputCollection[1] = "Business was updated.";
            outputCollection[2] = businessRespData[0].instanceName;
            outputCollection[3] = businessRespData[0].revisionId;
          }
        } else {
          outputCollection[0] = "Error";
          outputCollection[1] = `The Individual ID ${IndividualID} is not authorized to update Business ${BusinessID}.`;
        }
      }
    } else {
      businessParams = {
        q: `[Business Legal Name] = '${BusinessData.BusinessLegalName}' OR [FEIN] = '${BusinessData.FEIN}' OR [FEIN] = '${BusinessData.SSN}'`,
        fields: "[Business ID], [Business Legal Name], FEIN",
      };

      let getBusinessResp = await vvClient.forms.getForms(
        businessParams,
        BusinessTemplateID
      );
      getBusinessResp = JSON.parse(getBusinessResp);

      let businessRespData = getBusinessResp.hasOwnProperty("data")
        ? getBusinessResp.data
        : null;
      let businessRespStatus = getBusinessResp.hasOwnProperty("meta")
        ? getBusinessResp.meta.status
        : null;

      if (businessRespStatus != 200) {
        throw new Error("Call to query existing forms returned with an error");
      }
      if (businessRespData === null) {
        throw new Error("The query returned no data.");
      }
      if (businessRespData.length > 0) {
        businessRespData.map((business) => {
          if (business.fein == BusinessData.FEIN) {
            throw new Error(
              `A Business record with FEIN = '${BusinessData.FEIN}' already exists.`
            );
          } else if (business.fein == BusinessData.SSN) {
            throw new Error(
              `A Business record with SSN = '${BusinessData.SSN}' already exists.`
            );
          }
        });
      }

      //Create an object with the information to create a new Business Record
      let createBusinessFields = createUpdateObj(
        BusinessData,
        BusinessTemplateID,
        BusinessID
      );

      //Call postForms and handle the errors
      let createBusinessResp = await vvClient.forms.postForms(
        null,
        createBusinessFields,
        BusinessTemplateID
      );

      let createBusinessData = createBusinessResp.hasOwnProperty("data")
        ? createBusinessResp.data
        : null;
      let createBusinessStatus = createBusinessResp.hasOwnProperty("meta")
        ? createBusinessResp.meta.status
        : null;

      if (createBusinessStatus !== 201) {
        throw new Error(
          "There was an error when attempting to create a new Business record."
        );
      }
      if (createBusinessData === null) {
        throw new Error(
          "There was an error when attempting to create a new Business record."
        );
      }

      //Extract the Business ID from the new Business Record (will be used in the new employee asssignment record).
      BusinessID = createBusinessData.instanceName;
      let businessRevisionId = createBusinessData.revisionId;

      //Search the Individual record based on the Individual ID passed in.
      let individualParams = {
        q: `[Form ID] = '${IndividualID}'`,
        fields: "First Name, Last Name, Middle Initial, Personal Email",
      };

      let getIndividualResp = await vvClient.forms.getForms(
        individualParams,
        IndividualTemplateID
      );
      getIndividualResp = JSON.parse(getIndividualResp);

      let individualData = getIndividualResp.hasOwnProperty("data")
        ? getIndividualResp.data
        : null;
      let individualStatus = getIndividualResp.hasOwnProperty("meta")
        ? getIndividualResp.meta.status
        : null;

      if (individualStatus != 200) {
        throw new Error("Call to get Individual Record returned with an error");
      }
      if (individualData === null) {
        throw new Error("The query to get Individual record returned no data.");
      }
      if (individualData.length === 0) {
        throw new Error(
          `No Individual Record found for Business ID = ${BusinessID}`
        );
      }
      if (individualData.length > 1) {
        throw new Error(
          `More than one Individual Record was found for Business ID = ${BusinessID}`
        );
      }

      //Create an object with the information to create a new Employee Assignment Record
      let createEmployeeFields = createUpdateObj(
        individualData[0],
        EmployeeTemplateID,
        BusinessID
      );
      let individualRevisionID = individualData[0].revisionId;

      //Call postForms and handle the errors
      let creatEmployeeResp = await vvClient.forms.postForms(
        null,
        createEmployeeFields,
        EmployeeTemplateID
      );

      let creatEmployeeData = creatEmployeeResp.hasOwnProperty("data")
        ? creatEmployeeResp.data
        : null;
      let creatEmployeeStatus = creatEmployeeResp.hasOwnProperty("meta")
        ? creatEmployeeResp.meta.status
        : null;

      if (creatEmployeeStatus !== 201) {
        throw new Error(
          "There was an error when attempting to create a new Employee Assignment record."
        );
      }
      if (creatEmployeeData === null) {
        throw new Error(
          "There was an error when attempting to create a new Employee Assignment record."
        );
      }

      //Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
      let employeeRevisionID = creatEmployeeData.revisionId;

      // Relate the employee record to the individual record.
      let relateEmplIndResp = await vvClient.forms.relateForm(
        employeeRevisionID,
        individualRevisionID
      );
      relateEmplIndResp = JSON.parse(relateEmplIndResp);

      if (
        relateEmplIndResp.meta.status !== 201 &&
        relateEmplIndResp.meta.status !== 200
      ) {
        throw new Error(
          "There was an error when attempting to relate the Employee record with the Individual Record."
        );
      }

      // Relate the employee record to the Business record.
      let relateEmplBusResp = await vvClient.forms.relateForm(
        employeeRevisionID,
        businessRevisionId
      );
      relateEmplBusResp = JSON.parse(relateEmplBusResp);

      if (
        relateEmplBusResp.meta.status !== 201 &&
        relateEmplBusResp.meta.status !== 200
      ) {
        throw new Error(
          "There was an error when attempting to relate the Employee record with the Business Record."
        );
      }

      outputCollection[0] = "Success";
      outputCollection[1] = "Business and Employee Records created.";
      outputCollection[2] = BusinessID;
      outputCollection[3] = businessRevisionId;
    }
  } catch (error) {
    // Log errors captured.
    logger.info(JSON.stringify(error));
    outputCollection[0] = "Error";
    outputCollection[1] = error.message ? error.message : error;
  } finally {
    response.json(200, outputCollection);
  }
};
