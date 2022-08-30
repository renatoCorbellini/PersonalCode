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
  /*Script Name:  CreateLicenseApplication
     Customer:    City of Lincoln
     Purpose:     The purpose of this process is to create a lincense application with the business information received from the Intake form, relate the facility and employee record with the application. 
     Parameters:    
                    Business required fields: Fields that are required to create a license application.
                      License Application Type - (String, Required) 
                      Business Legal Name - (String, Required) 
                      Mailing Street - (String, Required) 
                      Mailing Zip - (String, Required) 
                      Mailing State - (String, Required) 
                      Mailing City - (String, Required) 
                      Physical Same - (String, Required) 
                      Business Type - (String, Required) 
                      SSN - (String, Optional) 
                        OR
                      FEIN - (String, Optional)

                      Physical Street - (String, Required) 
                      Physical Zip - (String, Required) 
                      Physical State - (String, Required) 
                      Physical City - (String, Required) 

                      First Name - (String, Required) 
                      MI - (String, Optional)
                      Last Name - (String, Required)
                      Title - (String, Required)
                      Phone - (String, Required)
                      Email - (String, Required)
                
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
   
     Date of Dev: 08/29/2022
     Last Rev Date: 08/29/2022
     Revision Notes:
     08/29/2022 - Renato Corbellini: Script created.
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

  //   async function getBusinessInformation(businessID) {
  //     const shortDescription = `Get form ${businessID}`;

  //     const getFormsParams = {
  //       q: `[Business ID] eq '${businessID}'`,
  //       fields: "revisionId",
  //     };

  //     const getFormsRes = await vvClient.forms
  //       .getForms(getFormsParams, BusinessTemplateID)
  //       .then((res) => parseRes(res))
  //       .then((res) => checkMetaAndStatus(res, shortDescription))
  //       .then((res) => checkDataPropertyExists(res, shortDescription))
  //       .then((res) => checkDataIsNotEmpty(res, shortDescription));

  //     return getFormsRes.data[0].revisionId;
  //   }

  //   async function lookForExistingIndividual(individualEmail) {
  //     let individualParams = {};
  //     individualParams = {
  //       q: `[Personal Email] = '${individualEmail}'`,
  //       fields: "Form ID, Personal Email",
  //     };

  //     shortDescription = `Get form ${IndividualTemplateID}`;

  //     let getIndividualResp = await vvClient.forms
  //       .getForms(individualParams, IndividualTemplateID)
  //       .then((res) => parseRes(res))
  //       .then((res) => checkMetaAndStatus(res, shortDescription))
  //       .then((res) => checkDataPropertyExists(res, shortDescription));

  //     if (getIndividualResp.data.length !== 0) {
  //       throw new Error(
  //         `An Individual Record with an Email '${individualEmail}' already exists.`
  //       );
  //     }
  //   }

  async function createLicenseApplicationRecord(licenseAppData) {
    shortDescription = `Post form ${LicenseApplicationTemplateID}`;

    return await vvClient.forms
      .postForms(null, licenseAppData, LicenseApplicationTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));
  }

  async function getRelatedEmployees(intakeIndividualID) {
    let shortDescription = `Get form ${IntakeTemplateID}`;

    const getFormsParams = {
      q: `[instanceName] eq '${intakeIndividualID}'`,
      fields: "revisionId",
    };

    const getFormsRes = await vvClient.forms
      .getForms(getFormsParams, IntakeTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    const formGUID = getFormsRes.data[0].revisionId;

    // GET RELATED FORMS

    shortDescription = "Related Forms";
    const getRelatedForms = {
      q: "[instanceName] LIKE '%EMPLOYEE-ASSIGN-%'",
    };

    let relatedFormsResp = await vvClient.forms
      .getFormRelatedForms(formGUID, getRelatedForms)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription));
    // .then((res) => checkDataIsNotEmpty(res, shortDescription));

    let returnArray = [];
    relatedFormsResp.data.forEach((form) => returnArray.push(form.revisionId));

    return returnArray;
  }

  async function getRelatedFacility(facilityID) {
    let shortDescription = `Get form ${facilityID}`;

    const getFormsParams = {
      q: `[instanceName] eq '${facilityID}'`,
      fields: "revisionId",
    };

    const getFormsRes = await vvClient.forms
      .getForms(getFormsParams, FacilityTemplateID)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    return getFormsRes.data[0].revisionId;
  }

  async function relateRecords(formRevId, formId) {
    shortDescription = `relating forms: ${formRevId} and form ${formId}`;

    await vvClient.forms
      .relateFormByDocId(formRevId, formId)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription));
  }

  // async function createEmployeeRecord(employeeData) {
  //   const shortDescription = `Post form ${EmployeeTemplateID}`;

  //   return await vvClient.forms
  //     .postForms(null, employeeData, EmployeeTemplateID)
  //     .then((res) => parseRes(res))
  //     .then((res) => checkMetaAndStatus(res, shortDescription))
  //     .then((res) => checkDataPropertyExists(res, shortDescription))
  //     .then((res) => checkDataIsNotEmpty(res, shortDescription));
  // }

  //This function creates the object to use in postForm or postFormRevision.
  function createUpdateObj(dataFields, templateID) {
    var objFields = {};

    if (templateID === LicenseApplicationTemplateID) {
      objFields["Primary Business Legal Name"] = dataFields.BusinessLegalName;
      objFields["Primary Doing Business As"] = dataFields.DoingBusinessAs;
      objFields["License Application Type"] = dataFields.LicenseType;
      objFields["License Type"] = dataFields.LicenseType;
      objFields["Business Legal Name"] = dataFields.BusinessLegalName;
      objFields["Mailing Street"] = dataFields.MailingStreet;
      objFields["Mailing Zip"] = dataFields.MailingZip;
      objFields["Mailing State"] = dataFields.MailingState;
      objFields["Mailing City"] = dataFields.MailingCity;
      objFields["Mailing County"] = "";
      objFields["Physical Same"] = dataFields.PhysicalSame;
      objFields["Business Type"] = dataFields.BusinessType;
      objFields["SSN"] = dataFields.SSN;
      objFields["FEIN"] = dataFields.FEIN;
      objFields["Physical Street"] = dataFields.PhysicalStreet;
      objFields["Physical Zip"] = dataFields.PhysicalZip;
      objFields["Physical State"] = dataFields.PhysicalState;
      objFields["Physical City"] = dataFields.PhysicalCity;
      objFields["Physical County"] = "";
      objFields["DataField4"] = dataFields.FirstName;
      objFields["MI"] = dataFields.MI;
      objFields["DataField11"] = dataFields.LastName;
      objFields["Title"] = dataFields.Title;
      objFields["Phone"] = dataFields.Phone;
      objFields["Email"] = dataFields.Email;
      objFields["Email Confirm"] = dataFields.Email;
      objFields["DataField14"] = getFieldValueByName("Individual ID");
      objFields["Business ID"] = getFieldValueByName("Business ID");
      objFields["Display State"] = "2"; // Land in the business demographics page
    }
    // if (templateID === EmployeeTemplateID) {
    //   objFields["Employee First Name"] = dataFields.FirstName;
    //   objFields["Employee Last Name"] = dataFields.LastName;
    //   objFields["Email"] = dataFields.Email;
    //   objFields["Employee Email"] = dataFields.Email;
    //   objFields["MI"] = dataFields.MI;
    //   objFields["Individual ID"] = dataFields.instanceName;
    //   objFields["Business ID"] = businessID;
    //   objFields["Business Administrator"] = true;
    //   objFields["Status"] = "Active";
    //   objFields["Form Saved"] = true;
    // }
    return objFields;
  }

  try {
    // IntakeRelateDocsToBusiness ws

    // Required fields
    // let BusinessGUID = getFieldValueByName("Business GUID", "isOptional");
    // const BusinessID = getFieldValueByName("Business ID");
    // const IntakeID = getFieldValueByName("Record ID");
    // let IntakeRevID = "";

    // if (BusinessGUID === "") {
    //   const shortDescription = `Get form ${BusinessID}`;
    //   const templateName = `Business`;

    //   const getFormsParams = {
    //     q: `[Form ID] eq '${BusinessID}'`,
    //     fields: "revisionId",
    //   };

    //   const getFormsRes = await vvClient.forms
    //     .getForms(getFormsParams, templateName)
    //     .then((res) => parseRes(res))
    //     .then((res) => checkMetaAndStatus(res, shortDescription))
    //     .then((res) => checkDataPropertyExists(res, shortDescription));

    //   BusinessGUID = getFormsRes.data[0].revisionId;
    // }

    // if (IntakeRevID === "") {
    //   const shortDescription = `Get form ${IntakeID}`;
    //   const templateName = `Intake`;

    //   const getFormsParams = {
    //     q: `[Form ID] eq '${IntakeID}'`,
    //     fields: "revisionId",
    //   };

    //   const getFormsRes = await vvClient.forms
    //     .getForms(getFormsParams, templateName)
    //     .then((res) => parseRes(res))
    //     .then((res) => checkMetaAndStatus(res, shortDescription))
    //     .then((res) => checkDataPropertyExists(res, shortDescription));

    //   IntakeRevID = getFormsRes.data[0].revisionId;
    // }

    // //Get Related documents.
    // //RevisionID = GUID of the form
    // let relatedDocumentsResp = await vvClient.forms.getFormRelatedDocs(
    //   IntakeRevID,
    //   null
    // );
    // relatedDocumentsResp = JSON.parse(relatedDocumentsResp);
    // let relatedDocumentsData = relatedDocumentsResp.hasOwnProperty("data")
    //   ? relatedDocumentsResp.data
    //   : null;
    // // let relatedDocumentsDataLength = Array.isArray(relatedDocumentsData)
    // //   ? relatedDocumentsData.length
    // //   : 0;

    // if (relatedDocumentsResp.meta.status != 200) {
    //   throw new Error("Error encountered when calling relateDocumentByDocId.");
    // }

    // for (let relatedDoc of relatedDocumentsData) {
    //   //Relate the documents to the business.
    //   // Relate the document to another form.
    //   //RevisionID = GUID of the form you want to relate the document to.
    //   //document['name'] = name of the document
    //   let relateDocByDocIdResp = await vvClient.forms.relateDocumentByDocId(
    //     BusinessGUID,
    //     relatedDoc["name"]
    //   );
    //   relateDocByDocIdResp = JSON.parse(relateDocByDocIdResp);

    //   if (
    //     relateDocByDocIdResp.meta.status != 200 &&
    //     relateDocByDocIdResp.meta.status != 404
    //   ) {
    //     throw new Error(
    //       "Error encountered when calling relateDocumentByDocId."
    //     );
    //   }
    // }

    // STEP 1 - Fields required to create the Individual Record.
    let businessData = {
      LicenseType: getFieldValueByName("License Application Type"),
      BusinessLegalName: getFieldValueByName("Business Legal Name"),
      MailingStreet: getFieldValueByName("Mailing Street"),
      MailingZip: getFieldValueByName("Mailing Zip"),
      MailingState: getFieldValueByName("Mailing State"),
      MailingCity: getFieldValueByName("Mailing City"),
      PhysicalSame: getFieldValueByName("Physical Same"),
      BusinessType: getFieldValueByName("Business Type"),
      SSN: getFieldValueByName("SSN", "isOptional"),
      FEIN: getFieldValueByName("FEIN", "isOptional"),
      PhysicalStreet: getFieldValueByName("Physical Street"),
      PhysicalZip: getFieldValueByName("Physical Zip"),
      PhysicalState: getFieldValueByName("Physical State"),
      PhysicalCity: getFieldValueByName("Physical City"),
      FirstName: getFieldValueByName("First Name"),
      MI: getFieldValueByName("MI", "isOptional"),
      LastName: getFieldValueByName("Last Name"),
      Title: getFieldValueByName("Title"),
      Phone: getFieldValueByName("Phone"),
      Email: getFieldValueByName("Email"),
    };

    let facilityID = getFieldValueByName("Facility ID");

    // STEP 2 - Create the License Application Record and populate the business related fields

    let licenseApplicationFields = createUpdateObj(
      businessData,
      LicenseApplicationTemplateID
    );

    let licenseApplicationCreateResp = await createLicenseApplicationRecord(
      licenseApplicationFields
    );

    // instanceName used to relate records
    let licenseAppFormId = licenseApplicationCreateResp.data.instanceName;

    // revisionId used to return to client-side to open a new window with the License Application
    let licenseAppRevisionId = licenseApplicationCreateResp.data.revisionId;

    // STEP 3 - Relate the License Application with the facility record and employee records.

    // STEP 3A - Get the employee records related with the Intake form

    const intakeFormID = getFieldValueByName("Record ID");

    let employeeRecordsRevId = await getRelatedEmployees(intakeFormID);

    // STEP 3B - Relate the employee records with the License Application
    for (let i = 0; i < employeeRecordsRevId.length; i++) {
      const formRevId = employeeRecordsRevId[i];
      await relateRecords(formRevId, licenseAppFormId);
    }

    // employeeRecordsRevId.forEach((formRevId) => {
    //   await relateRecords(formRevId, licenseAppFormId);
    // });

    // STEP 3C - Get the facility record related with the Intake form

    let facilityRecordRevId = await getRelatedFacility(facilityID);

    // STEP 3D - Relate the facility record with the License Application
    await relateRecords(facilityRecordRevId, licenseAppFormId);

    // // STEP 3E - Create an object with the information to create a new Employee Assignment Record
    // let createEmployeeCEOFields = createUpdateObj(
    //   CEOorPresData,
    //   EmployeeTemplateID,
    //   businessID
    // );

    // let createEmployeeCEOResp = await createEmployeeRecord(
    //   createEmployeeCEOFields
    // );

    // // STEP 3F - Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
    // let employeeRevisionID = createEmployeeCEOResp.data.revisionId;

    // // STEP 3G - Relate the employee record to the individual record.
    // await relateRecords(
    //   employeeRevisionID,
    //   CEOorPresCreateResp.data.instanceName
    // );

    // // STEP 3H - Relate the employee record to the business record.
    // await relateRecords(employeeRevisionID, businessID);

    // // STEP 4 - LOGIC FOR THE CHIEF MEDICAL OFFICER

    // // STEP 4A - Check if an Individual Record already exists with the received Email.
    // await lookForExistingIndividual(CMOData.Email);

    // // STEP 4B - Create an object with the information to create a new Individual Record
    // let createCMOFields = createUpdateObj(CMOData, IndividualTemplateID);

    // // STEP 4C - Create the Chief Medical Officer Individual Record
    // let CMOCreateResp = await createIndividualRecord(createCMOFields);

    // // STEP 4D - Add the requiered information to create the Employee Asignment Record
    // CMOData.instanceName = CMOCreateResp.data.instanceName;
    // CMOData.businessID = businessID;

    // // STEP 4E - Create an object with the information to create a new Employee Assignment Record
    // let createEmployeeCMOFields = createUpdateObj(
    //   CMOData,
    //   EmployeeTemplateID,
    //   businessID
    // );

    // let createEmployeeCMOResp = await createEmployeeRecord(
    //   createEmployeeCMOFields
    // );

    // // STEP 4F - Extract the employee revision ID from the new employee record. This will be used to related the employee revision ID with the Individual and Business Record.
    // employeeRevisionID = createEmployeeCMOResp.data.revisionId;

    // // STEP 4G - Relate the employee record to the individual record.
    // await relateRecords(employeeRevisionID, CMOCreateResp.data.instanceName);

    // // STEP 4H - Relate the employee record to the business record.
    // await relateRecords(employeeRevisionID, businessID);

    // STEP 5 - Build the response array
    outputCollection[0] = "Success";
    outputCollection[1] = "Individuals and Employee Records created.";
    outputCollection[2] = licenseAppFormId;
    outputCollection[3] = licenseAppRevisionId;
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
