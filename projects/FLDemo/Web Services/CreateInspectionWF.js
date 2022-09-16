const logger = require("../log");

module.exports.getCredentials = function () {
  let options = {};
  options.customerAlias = "Demo";
  options.databaseAlias = "FacilityLicensing";
  options.userId = "vv5demo.APIUser";
  options.password = "Y8t89yPcWn4N6Nj";
  options.clientId = "3416ea76-8dec-4de5-b498-f2a315ada5ad";
  options.clientSecret = "v2VEJTDH7r9ezpSJ0OHzujzBNYrdXS06a3VttoxJXOs=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:  CreateInspection
     Customer:    City of Lincoln
     Purpose:     The purpose of this process is to create a lincense application with the business information received from the Intake form, relate the facility and employee record with the application. 
     Parameters:    
                    
                
     Return Array:  1. Status: 'Success', 'Error'
                    2. Message
                    3. Individual ID - If success and individual record created
                    
     Pseudo code:   
   
     Date of Dev: 09/13/2022
     Last Rev Date: 09/13/2022
     Revision Notes:
     09/13/2022 - Renato Corbellini: Script created.
     */

  logger.info("Start of the process TestWorkflowMicroservice at " + Date());

  /**************************************
     Response and error handling variables
    ***************************************/

  let returnObject;

  // Respond immediately before the "processing"
  const responseParams = {
    success: true,
    message: "Process started successfully.",
  };
  response.json(200, responseParams);

  // Array for capturing error messages that may occur during the process
  let errorLog = [];

  /***********************
     Configurable Variables
    ************************/

  const LicenseApplicationTemplateID = "License Application";
  const FacilityTemplateID = "Facility Form";
  const InspectionTemplateID = "Inspection Form";

  /*****************
     Script Variables
    ******************/

  // Describes the process being checked using the parsing and checking helper functions
  let shortDescription = "";
  // Execution ID is needed from the http header in order to help VV identify which workflow item/microservice is complete.
  const executionId = response.req.headers["vv-execution-id"];

  /*****************
     Helper Functions
    ******************/

  function getFieldValueByName(fieldName, isRequired = true) {
    /*
        Check if a field was passed in the request and get its value
        Parameters:
            fieldName: The name of the field to be checked
            isRequired: If the field is required or not
        */

    let resp = null;

    try {
      // Tries to get the field from the passed in arguments
      const field = ffCollection.getFormFieldByName(fieldName);

      if (!field && isRequired) {
        throw new Error(`The field '${fieldName}' was not found.`);
      } else if (field) {
        // If the field was found, get its value
        let fieldValue = field.value ? field.value : null;

        if (typeof fieldValue === "string") {
          // Remove any leading or trailing spaces
          fieldValue = fieldValue.trim();
        }

        if (fieldValue) {
          // Sets the field value to the response
          resp = fieldValue;
        } else if (isRequired) {
          // If the field is required and has no value, throw an error
          throw new Error(
            `The value property for the field '${fieldName}' was not found or is empty.`
          );
        }
      }
    } catch (error) {
      // If an error was thrown, add it to the error log
      errorLog.push(error);
    }
    return resp;
  }

  function parseRes(vvClientRes) {
    /*
        Generic JSON parsing function
        Parameters:
            vvClientRes: JSON response from a vvClient API method
        */
    try {
      // Parses the response in case it's a JSON string
      const jsObject = JSON.parse(vvClientRes);
      // Handle non-exception-throwing cases:
      if (jsObject && typeof jsObject === "object") {
        vvClientRes = jsObject;
      }
    } catch (e) {
      // If an error ocurrs, it's because the resp is already a JS object and doesn't need to be parsed
    }
    return vvClientRes;
  }

  function checkMetaAndStatus(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the meta property of a vvCliente API response object has the expected status code
        Parameters:
            vvClientRes: Parsed response object from a vvClient API method
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkData(), make sure to pass the same param as well.
        */

    if (!vvClientRes.meta) {
      throw new Error(
        `${shortDescription} error. No meta object found in response. Check method call parameters and credentials.`
      );
    }

    const status = vvClientRes.meta.status;

    // If the status is not the expected one, throw an error
    if (status != 200 && status != 201 && status != ignoreStatusCode) {
      const errorReason =
        vvClientRes.meta.errors && vvClientRes.meta.errors[0]
          ? vvClientRes.meta.errors[0].reason
          : "unspecified";
      throw new Error(
        `${shortDescription} error. Status: ${vvClientRes.meta.status}. Reason: ${errorReason}`
      );
    }
    return vvClientRes;
  }

  function checkDataPropertyExists(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the data property of a vvCliente API response object exists 
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
    const status = vvClientRes.meta.status;

    if (status != ignoreStatusCode) {
      // If the data property doesn't exist, throw an error
      if (!vvClientRes.data) {
        throw new Error(
          `${shortDescription} data property was not present. Please, check parameters and syntax. Status: ${status}.`
        );
      }
    }

    return vvClientRes;
  }

  function checkDataIsNotEmpty(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the data property of a vvCliente API response object is not empty
        Parameters:
            res: Parsed response object from the API call
            shortDescription: A string with a short description of the process
            ignoreStatusCode: An integer status code for which no error should be thrown. If you're using checkMeta(), make sure to pass the same param as well.
        */
    const status = vvClientRes.meta.status;

    if (status != ignoreStatusCode) {
      const dataIsArray = Array.isArray(vvClientRes.data);
      const dataIsObject = typeof vvClientRes.data === "object";
      const isEmptyArray = dataIsArray && vvClientRes.data.length == 0;
      const isEmptyObject =
        dataIsObject && Object.keys(vvClientRes.data).length == 0;

      // If the data is empty, throw an error
      if (isEmptyArray || isEmptyObject) {
        throw new Error(
          `${shortDescription} returned no data. Please, check parameters and syntax. Status: ${status}.`
        );
      }
      // If it is a Web Service response, check that the first value is not an Error status
      if (dataIsArray) {
        const firstValue = vvClientRes.data[0];

        if (firstValue == "Error") {
          throw new Error(
            `${shortDescription} returned an error. Please, check called Web Service. Status: ${status}.`
          );
        }
      }
    }
    return vvClientRes;
  }

  async function createInspectionRecord(inspectionData) {
    shortDescription = `Post form ${InspectionTemplateID}`;

    return await vvClient.forms
      .postForms(null, inspectionData, InspectionTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));
  }

  async function getRelatedFacility(facilityID) {
    let shortDescription = `Get form ${facilityID}`;

    const getFormsParams = {
      q: `[instanceName] eq '${facilityID}'`,
      fields: "revisionId, AddressLine1, zipCode, City_Field, State_Field",
    };

    const getFormsRes = await vvClient.forms
      .getForms(getFormsParams, FacilityTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    let street = getFormsRes.data[0].addressLine1;
    let city = getFormsRes.data[0].city_Field;
    let state = getFormsRes.data[0].state_Field;
    let zip = getFormsRes.data[0].zipCode;

    let address = street + " " + city + " " + state + " " + zip;
    address = address.toUpperCase();

    return {
      revisionID: getFormsRes.data[0].revisionId,
      addressString: address,
    };

    // return getFormsRes.data[0].revisionId;
  }

  async function relateRecords(formRevId, formId) {
    shortDescription = `relating forms: ${formRevId} and form ${formId}`;

    await vvClient.forms
      .relateFormByDocId(formRevId, formId)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription));
  }

  //This function creates the object to use in postForm or postFormRevision.
  function createUpdateObj(dataFields, templateID) {
    var objFields = {};

    if (templateID === InspectionTemplateID) {
      objFields["Provider Name"] = dataFields.BusinessLegalName;
      objFields["Address Inspected"] = dataFields.LocationAddressString;
      objFields["License Type"] = dataFields.LicenseType;
      objFields["City"] = dataFields.PhysicalCity;
      objFields["Zip"] = dataFields.PhysicalZip;
      objFields["Business Name"] = dataFields.BusinessLegalName;
      objFields["Organization Name"] = dataFields.PrimaryBusinessLegalName;
      objFields["Audited Address"] = dataFields.PhysicalAddress;
      objFields["Audited City"] = dataFields.PhysicalCity;
      objFields["Audited Zip"] = dataFields.PhysicalZip;
      objFields["Audited State"] = dataFields.PhysicalState;
      objFields["Audited Phone"] = dataFields.Phone;
      objFields["Audited Email"] = dataFields.Email;
      objFields["Business ID"] = dataFields.BusinessID;
      objFields["Status"] = "New";
      objFields["Start Date"] = Date();
    }

    return objFields;
  }

  /**********
     MAIN CODE 
    **********/

  try {
    // Extract information from the ffCollection.  ffCollection is the set of fields that are sent when configuring the microservice.
    const licenseApplicationFormID = getFieldValueByName("WF DocID");
    const processMessage = `The value passed into the web service is ${licenseApplicationFormID}`;

    const getFormsParams = {
      q: `[Record ID] eq '${licenseApplicationFormID}'`,
      fields:
        "Business Legal Name, License Application Type, Physical Zip, Physical City, Primary Business Legal Name, Physical Street, Physical State, Phone, Email, Business ID, Facility ID",
    };

    let getFormsRes = await vvClient.forms
      .getForms(getFormsParams, LicenseApplicationTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    let facilityID = getFormsRes.data[0]["facility ID"];

    let facilityRecordInfo = await getRelatedFacility(facilityID);

    let licenseApplicationData = {
      BusinessLegalName: getFormsRes.data[0]["business Legal Name"],
      LocationAddressString: facilityRecordInfo.addressString,
      LicenseType: getFormsRes.data[0]["license Application Type"],
      PhysicalZip: getFormsRes.data[0]["physical Zip"],
      PhysicalCity: getFormsRes.data[0]["physical City"],
      PrimaryBusinessLegalName:
        getFormsRes.data[0]["primary Business Legal Name"],
      PhysicalAddress: getFormsRes.data[0]["physical Street"],
      PhysicalState: getFormsRes.data[0]["physical State"],
      Phone: getFormsRes.data[0]["phone"],
      Email: getFormsRes.data[0]["email"],
      BusinessID: getFormsRes.data[0]["business ID"],
    };

    let InspectionFields = createUpdateObj(
      licenseApplicationData,
      InspectionTemplateID
    );

    let inspectionCreateResp = await createInspectionRecord(InspectionFields);

    // instanceName used to relate records
    let inspectionFormId = inspectionCreateResp.data.instanceName;

    // revisionId used to return to client-side to open a new window with the License Application
    let inspectionRevisionId = inspectionCreateResp.data.revisionId;

    await relateRecords(facilityRecordInfo.revisionID, inspectionFormId);

    // Create the following object that will be used when the api call is made to communicate the workflow item is complete.
    // First two items of the object are required to tell if the process completed successfully and the message that should be returned.
    // The other items in the object would have the name of any workflow variable that would be updated with data coming from the microservice/node script.
    returnObject = {
      MicroserviceResult: true,
      MicroserviceMessage: "Microservice completed successfully",
      DocID: licenseApplicationFormID,
      "Process Message": processMessage,
      TestValue: "Test val returned",
    };
  } catch (err) {
    logger.info("Error encountered" + err);

    returnObject = {
      MicroserviceResult: false,
      MicroserviceMessage: err,
    };
  } finally {
    const completeResp = await vvClient.scripts.completeWorkflowWebService(
      executionId,
      returnObject
    );

    // If the complete was successful or not to the log server. This helps to track down what occurred when a microservice completed.
    if (completeResp.meta.status == 200) {
      logger.info("Completion signaled to WF engine successfully.");
    } else {
      logger.info("There was an error signaling WF completion.");
    }
  }
};
