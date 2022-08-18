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
  /*Script Name:  CreateUpdateIndividual
     Customer:    City of Lincoln
     Purpose:     The purpose of this process is to create two individual records (One for the CEO or President and one for the Chief Medical Officer (CMO) ) based on the information provided.
     Parameters:    Business ID - (String, Required) Used to create the relation between the Employee Assignment Records and the Business Record.
                    Individual required fields: Fields that are required to created or update the individual record.
                      CEO or President First Name - (String, Required) 
                      CEO or President Last Name - (String, Required) 
                      CEO or President MI - (String, Required) 
                      CEO or President Title - (String, Required) 
                      CEO or President Street Address - (String, Required) 
                      CEO or President City - (String, Required) 
                      CEO or President State - (String, Required) 
                      CEO or President Zip Code - (String, Required) 
                      CEO or President Phone - (String, Required) 
                      CEO or President Email - (String, Required)

                      Chief Medical Officer First Name - (String, Required) 
                      Chief Medical Officer Last Name - (String, Required) 
                      Chief Medical Officer MI - (String, Required) 
                      Chief Medical Officer Title - (String, Required) 
                      Chief Medical Officer Street Address - (String, Required) 
                      Chief Medical Officer City - (String, Required) 
                      Chief Medical Officer State - (String, Required) 
                      Chief Medical Officer Zip Code - (String, Required) 
                      Chief Medical Officer Phone - (String, Required) 
                      Chief Medical Officer Email - (String, Required)
                
     Return Array:  1. Status: 'Success', 'Error'
                    2. Message
                    3. Individual ID - If success and individual record created
                    
     Pseudo code:   1. Fields required to create the Individual Record.
                    2. Get the revisionId of the business to send back to the client if process successful
                    3. LOGIC FOR THE CEO OR PRESIDENT RECORD
                      3A. Check if an Individual Record already exists with the received Email.
                      3B. Create an object with the information to create a new Individual Record.
                      3C. Create the CEO or President Individual Record.
                      3D. Add the requiered information to create the Employee Asignment Record
                      3E. Create an object with the information to create a new Employee Assignment Record
                      3F. Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
                      3G. Relate the employee record to the individual record.
                      3H. Relate the employee record to the business record.
                    4. LOGIC FOR THE CHIEF MEDICAL OFFICER
                      4A. Check if an Individual Record already exists with the received Email.
                      4B. Create an object with the information to create a new Individual Record
                      4C. Create the Chief Medical Officer Individual Record
                      4D. Add the requiered information to create the Employee Asignment Record
                      4E. Create an object with the information to create a new Employee Assignment Record
                      4F. Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
                      4G. Relate the employee record to the individual record.
                      4H. Relate the employee record to the business record.
                    5. Build the response array
                    6. Send the response
   
     Date of Dev: 08/15/2022
     Last Rev Date: 08/15/2022
     Revision Notes:
     08/15/2022 - Renato Corbellini: Script created.
     */

  logger.info("Start of the process CreateUpdateIndividual at " + Date());

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

  async function getBusinessInformation(businessID) {
    const shortDescription = `Get form ${businessID}`;

    const getFormsParams = {
      q: `[Business ID] eq '${businessID}'`,
      fields: "revisionId",
    };

    const getFormsRes = await vvClient.forms
      .getForms(getFormsParams, BusinessTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    return getFormsRes.data[0].revisionId;
  }

  async function lookForExistingIndividual(individualEmail) {
    let individualParams = {};
    individualParams = {
      q: `[Personal Email] = '${individualEmail}'`,
      fields: "Form ID, Personal Email",
    };

    shortDescription = `Get form ${IndividualTemplateID}`;

    let getIndividualResp = await vvClient.forms
      .getForms(individualParams, IndividualTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription));

    if (getIndividualResp.data.length !== 0) {
      throw new Error(
        `An Individual Record with an Email '${individualEmail}' already exists.`
      );
    }
  }

  async function createIndividualRecord(individualData) {
    shortDescription = `Post form ${IndividualTemplateID}`;

    return await vvClient.forms
      .postForms(null, individualData, IndividualTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));
  }

  async function relateRecords(employeeRevId, formId) {
    shortDescription = `relating forms: ${employeeRevId} and form ${formId}`;

    await vvClient.forms
      .relateFormByDocId(employeeRevId, formId)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription));
  }

  async function createEmployeeRecord(employeeData) {
    const shortDescription = `Post form ${EmployeeTemplateID}`;

    return await vvClient.forms
      .postForms(null, employeeData, EmployeeTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));
  }

  //This function creates the object to use in postForm or postFormRevision.
  function createUpdateObj(dataFields, templateID, businessID) {
    var objFields = {};

    if (templateID === IndividualTemplateID) {
      objFields["First Name"] = dataFields.FirstName;
      objFields["Last Name"] = dataFields.LastName;
      objFields["Middle Initial"] = dataFields.MI;
      objFields["Suffix"] = "";
      objFields["Title"] = dataFields.Title;
      objFields["DataField125"] = "Home"; //Address Type
      objFields["Street"] = dataFields.StreetAddress;
      objFields["City"] = dataFields.City;
      objFields["State"] = dataFields.State;
      objFields["Zip Code"] = dataFields.ZipCode;
      objFields["Contact Phone"] = dataFields.Phone;
      objFields["Personal Email"] = dataFields.Email;
      objFields["Retype Email"] = dataFields.Email;
      objFields["Email Address"] = dataFields.Email;
      objFields["Hidden First"] = dataFields.FirstName;
      objFields["Hidden Middle"] = dataFields.MI;
      objFields["Hidden Last"] = dataFields.LastName;
    }
    if (templateID === EmployeeTemplateID) {
      objFields["Employee First Name"] = dataFields.FirstName;
      objFields["Employee Last Name"] = dataFields.LastName;
      objFields["Email"] = dataFields.Email;
      objFields["Employee Email"] = dataFields.Email;
      objFields["MI"] = dataFields.MI;
      objFields["Individual ID"] = dataFields.instanceName;
      objFields["Business ID"] = businessID;
      objFields["Business Administrator"] = true;
      objFields["Status"] = "Active";
      objFields["Form Saved"] = true;
    }
    return objFields;
  }

  try {
    // STEP 1 - Fields required to create the Individual Record.
    let CEOorPresData = {
      FirstName: getFieldValueByName("CEO or President First Name"),
      LastName: getFieldValueByName("CEO or President Last Name"),
      MI: getFieldValueByName("CEO or President MI", "isOptional"),
      Title: getFieldValueByName("CEO or President Title"),
      StreetAddress: getFieldValueByName("CEO or President Street Address"),
      City: getFieldValueByName("CEO or President City"),
      State: getFieldValueByName("CEO or President State"),
      ZipCode: getFieldValueByName("CEO or President Zip Code"),
      Phone: getFieldValueByName("CEO or President Phone"),
      Email: getFieldValueByName("CEO or President Email"),
    };

    let CMOData = {
      FirstName: getFieldValueByName("Chief Medical Officer First Name"),
      LastName: getFieldValueByName("Chief Medical Officer Last Name"),
      MI: getFieldValueByName("Chief Medical Officer MI", "isOptional"),
      Title: getFieldValueByName("Chief Medical Officer Title"),
      StreetAddress: getFieldValueByName(
        "Chief Medical Officer Street Address"
      ),
      City: getFieldValueByName("Chief Medical Officer City"),
      State: getFieldValueByName("Chief Medical Officer State"),
      ZipCode: getFieldValueByName("Chief Medical Officer Zip Code"),
      Phone: getFieldValueByName("Chief Medical Officer Phone"),
      Email: getFieldValueByName("Chief Medical Officer Email"),
    };

    let individualID = getFieldValueByName("Individual ID");
    let businessID = getFieldValueByName("Business ID");

    // STEP 2 - Get the revisionId of the business to send back to the client if process successful
    let businessRevisionId = await getBusinessInformation(businessID);

    // STEP 3 - LOGIC FOR THE CEO OR PRESIDENT RECORD

    // STEP 3A - Check if an Individual Record already exists with the received Email.
    await lookForExistingIndividual(CEOorPresData.Email);

    // STEP 3B - Create an object with the information to create a new Individual Record
    let createCEOorPresFields = createUpdateObj(
      CEOorPresData,
      IndividualTemplateID
    );

    // STEP 3C - Create the CEO or President Individual Record
    let CEOorPresCreateResp = await createIndividualRecord(
      createCEOorPresFields
    );

    // STEP 3D - Add the requiered information to create the Employee Asignment Record
    CEOorPresData.instanceName = CEOorPresCreateResp.data.instanceName;
    CEOorPresData.businessID = businessID;

    // STEP 3E - Create an object with the information to create a new Employee Assignment Record
    let createEmployeeCEOFields = createUpdateObj(
      CEOorPresData,
      EmployeeTemplateID,
      businessID
    );

    let createEmployeeCEOResp = await createEmployeeRecord(
      createEmployeeCEOFields
    );

    // STEP 3F - Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
    let employeeRevisionID = createEmployeeCEOResp.data.revisionId;

    // STEP 3G - Relate the employee record to the individual record.
    await relateRecords(
      employeeRevisionID,
      CEOorPresCreateResp.data.instanceName
    );

    // STEP 3H - Relate the employee record to the business record.
    await relateRecords(employeeRevisionID, businessID);

    // STEP 4 - LOGIC FOR THE CHIEF MEDICAL OFFICER

    // STEP 4A - Check if an Individual Record already exists with the received Email.
    await lookForExistingIndividual(CMOData.Email);

    // STEP 4B - Create an object with the information to create a new Individual Record
    let createCMOFields = createUpdateObj(CMOData, IndividualTemplateID);

    // STEP 4C - Create the Chief Medical Officer Individual Record
    let CMOCreateResp = await createIndividualRecord(createCMOFields);

    // STEP 4D - Add the requiered information to create the Employee Asignment Record
    CMOData.instanceName = CMOCreateResp.data.instanceName;
    CMOData.businessID = businessID;

    // STEP 4E - Create an object with the information to create a new Employee Assignment Record
    let createEmployeeCMOFields = createUpdateObj(
      CMOData,
      EmployeeTemplateID,
      businessID
    );

    let createEmployeeCMOResp = await createEmployeeRecord(
      createEmployeeCMOFields
    );

    // STEP 4F - Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
    employeeRevisionID = createEmployeeCMOResp.data.revisionId;

    // STEP 4G - Relate the employee record to the individual record.
    await relateRecords(employeeRevisionID, CMOCreateResp.data.instanceName);

    // STEP 4H - Relate the employee record to the business record.
    await relateRecords(employeeRevisionID, businessID);

    // STEP 5 - Build the response array
    outputCollection[0] = "Success";
    outputCollection[1] = "Individuals and Employee Records created.";
    outputCollection[2] = businessID;
    outputCollection[3] = businessRevisionId;
  } catch (error) {
    // Log errors captured.
    logger.info(JSON.stringify(error));
    outputCollection[0] = "Error";
    outputCollection[1] = error.message ? error.message : error;
  } finally {
    // Step 6 - Send the response
    response.json(200, outputCollection);
  }
};
