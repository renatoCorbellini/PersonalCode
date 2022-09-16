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

  logger.info("Start of the process CreateUpdateIndividual at " + Date());

  /**********************
     Configurable Variables
    ***********************/
  //Template ID for Employee Assignment
  let BusinessTemplateID = "Business";
  let EmployeeTemplateID = "Employee Assignment";
  let IndividualTemplateID = "Individual Record";
  let LicenseApplicationTemplateID = "License Application";
  let IntakeTemplateID = "Intake";
  let FacilityTemplateID = "Facility Form";
  let InspectionTemplateID = "Inspection Form";

  //Query Name to get Business information and Administrator Employees.
  //   let businessQueryName = "zWebSvcBusinessAdministratorEmployee";

  //Script variables
  let outputCollection = [];

  let shortDescription = "";

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
      // If an error occurs, it's because the resp is already a JS object and doesn't need to be parsed
    }
    return vvClientRes;
  }

  function checkMetaAndStatus(
    vvClientRes,
    shortDescription,
    ignoreStatusCode = 999
  ) {
    /*
        Checks that the meta property of a vvClient API response object has the expected status code
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
        Checks that the data property of a vvClient API response object exists 
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
        Checks that the data property of a vvClient API response object is not empty
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

  try {
    let facilityID = getFieldValueByName("Facility ID");

    let facilityRecordInfo = await getRelatedFacility(facilityID);

    let LicenseApplicationData = {
      BusinessLegalName: getFieldValueByName("Business Legal Name"),
      LocationAddressString: facilityRecordInfo.addressString,
      LicenseType: getFieldValueByName("License Application Type"),
      PhysicalZip: getFieldValueByName("Physical Zip"),
      PhysicalCity: getFieldValueByName("Physical City"),
      PrimaryBusinessLegalName: getFieldValueByName(
        "Primary Business Legal Name"
      ),
      PhysicalAddress: getFieldValueByName("Physical Street"),
      PhysicalState: getFieldValueByName("Physical State"),
      Phone: getFieldValueByName("Phone"),
      Email: getFieldValueByName("Email"),
      BusinessID: getFieldValueByName("Business ID"),
    };

    let InspectionFields = createUpdateObj(
      LicenseApplicationData,
      InspectionTemplateID
    );

    let inspectionCreateResp = await createInspectionRecord(InspectionFields);

    // instanceName used to relate records
    let inspectionFormId = inspectionCreateResp.data.instanceName;

    // revisionId used to return to client-side to open a new window with the License Application
    let inspectionRevisionId = inspectionCreateResp.data.revisionId;

    await relateRecords(facilityRecordInfo.revisionID, inspectionFormId);

    // Build the response array
    outputCollection[0] = "Success";
    outputCollection[1] = "Individuals and Employee Records created.";
    outputCollection[2] = inspectionFormId;
    outputCollection[3] = inspectionRevisionId;
  } catch (error) {
    // Log errors captured.
    logger.info(JSON.stringify(error));
    outputCollection[0] = "Error";
    outputCollection[1] = error.message ? error.message : error;
  } finally {
    // Send the response
    response.json(200, outputCollection);
  }
};
