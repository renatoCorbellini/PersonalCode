const logger = require("../log");
const moment = require("moment-timezone");

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
  /*Script Name:    SubmitApplication
    Customer:       City of Lincoln
    Purpose:        The purpous of this ws is to send a notification when a license application is submitted. This notification should be sent to the user and to the City Staff. 
    Parameters:    
 
    Return Array:   1. Message will be sent back to VV as part of the ending of this scheduled process.
 
    Pseudo code:    1. Call getForms to get all Inspector Signatures that have a status of Active.
                    2. Find the inspectors with a signature category 'Operational Permits' and a role 'Chief Fire Inspector'. 
                    3. Find the inspectors with a signature category 'Rentals' and a role 'Chief Housing Inspector'.
                    4. Check if there are chief inspectors for Operational Permits and Rentals.
                        4A. Call helper function sendEmailNotification to send notification email.
                    5. Log errors and send response to server.
 
    Date of Dev:    06/22/2022
    Last Rev Date:  06/23/2022
    Revision Notes: 06/22/2022 - Renato Corbellini: Script created
                    06/23/2022 - Renato Corbellini: Added helper functions  parseRes, checkMetaAndStatus, checkDataPropertyExists, checkDataIsNotEmpty to process responses from API. Added helper function sendEmailNotification to send email notification. 
     
    */

  logger.info(`Start of the process SubmitApplication at ${Date()}`);

  /**********************
   Configurable Variables
  ***********************/

  // Subject of the email notifications to send.
  const scheduledProcessName = "License Application Submitted Successfully";

  // Email addresses list to send notification if useTestEmailList is true.
  const testEmailList = "renato.corbellini@onetree.com";

  // On 'false' sends the notification to all City Staff users email addresses.
  const useTestEmailsList = true;

  // Group of users to get email addresses to send notification.
  const groupsParamObj = [
    {
      name: "groups",
      value: ["Home State Staff"],
    },
  ];

  /* -------------------------------------------------------------------------- */
  /*                    Response and error handling variables                   */
  /* -------------------------------------------------------------------------- */

  // Response array
  let outputCollection = [];
  // Array for capturing error messages that may occur during the process
  let errorLog = [];

  /**********************
      HELPER FUNCTIONS
  ***********************/

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
          fieldValue.trim();
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

  async function sendEmailNotification(emailInfo) {
    /*
      Purpose:      Auxiliary function intended to send an email with a summary of the process result.
      Parameters:   message - Message shown within the email body.
      Important:    Use the errorLog variable to store the error logs in the Process.
    
      Psuedo code:
                    1. Call LibGroupGetGroupUserEmails library to fetch Home State Staff user group data.
                    2. Loop every user data to get their email addresses to save it as a string of emails.
                    3. Check for errors within the log.
                    4. Determine email recipients.
                    5. Build email structure.
                    6. Send email.
     */

    logger.info("Entered sendEmailNotification process.");

    // List of email recipients to send email.
    let emailList = "";

    // Get scheduled process execution date and time.
    const localISODate = moment().tz("US/Central").format("MM/DD/YYYY");
    const localTime = moment().tz("US/Central").format("h:mm A");

    // FETCH THE GROUP USER DATA WHEN NOT USING testEmailList.
    let shortDescription = `Run Web Service: LibGroupGetGroupUserEmails`;

    if (!useTestEmailsList) {
      const resVisualAccessUsers = await vvClient.scripts
        .runWebService("LibGroupGetGroupUserEmails", groupsParamObj)
        .then((res) => parseRes(res, shortDescription))
        .then((res) => checkMetaAndStatus(res, shortDescription))
        .then((res) => checkDataPropertyExists(res, shortDescription))
        .then((res) => checkDataIsNotEmpty(res, shortDescription));

      // LOOPS EVERY USER  DATA TO GET THEIR EMAIL ADDRESSES TO SAVE IT AS A STRING OF EMAILS.
      resVisualAccessUsers.data[2].map(async (userData) => {
        emailList += userData["emailAddress"] + ",";
      });
    } else {
      // DETERMINES EMAIL RECIPIENTS.
      emailList = testEmailList;
    }

    // ADD THE USER THAT SUBMITS THE LICENSE APPLICATION TO THE LIST OF EMAILS TO SEND TO
    emailList += emailInfo[0];

    // BUILDS EMAIL STRUCTURE.
    const emailObj = {
      recipients: emailList,
      subject: `${scheduledProcessName}, ${localISODate}, ${localTime}`,
      body: `
            Hello ${emailInfo[2]} ${emailInfo[3]},<br>
            <br>
            Here is your email notifying the successful submit of the License Application number ${emailInfo[1]}, corresponding to ${emailInfo[0]}, done by ${emailInfo[4]}.

            Regards,<br>
            <br>
            VisualVault.
            <br>
            <br>
            ----------------------------------------
            <br>
            <br>
            <strong>IMPORTANT:</strong> this email was sent to inform you that a License Application Form has been submitted. 
            <br>
            <br>
        `,
    };

    // SENDS EMAIL.
    shortDescription = `Email sent to: ${emailList}`;

    const postEmailsRes = await vvClient.email
      .postEmails(null, emailObj)
      .then((res) => parseRes(res))
      .then((res) => checkMetaAndStatus(res, shortDescription))
      .then((res) => checkDataPropertyExists(res, shortDescription))
      .then((res) => checkDataIsNotEmpty(res, shortDescription));

    logger.info("Email sent successfully.");

    return postEmailsRes;
  }

  try {
    /****************
     BEGIN ASYNC CODE
    *****************/
    // Step 1 - Call getForms to get all Inspector Signatures that have a status of Active.
    let userId = getFieldValueByName("User ID"); // User that submits the application
    let individualID = getFieldValueByName("Individual ID"); // Individual Record that submits the application
    let userEmail = getFieldValueByName("Email");
    let applicationRecordID = getFieldValueByName("Record ID");
    let firstName = getFieldValueByName("DataField4"); // First Name
    let lastName = getFieldValueByName("DataField11"); // Last Name

    let emailInfo = [
      userEmail,
      applicationRecordID,
      firstName,
      lastName,
      userId,
    ];

    await sendEmailNotification(emailInfo);

    // 6. BUILD THE SUCCESS RESPONSE ARRAY
    outputCollection[0] = "Success"; // Don´t chance this
    outputCollection[1] = "The process completed successfully";
  } catch (error) {
    logger.info("Error encountered" + error);

    // BUILD THE ERROR RESPONSE ARRAY

    outputCollection[0] = "Error"; // Don´t change this

    if (errorLog.length > 0) {
      outputCollection[1] = "Some errors ocurred";
      outputCollection[2] = `Error/s: ${errorLog.join("; ")}`;
    } else {
      outputCollection[1] = error.message
        ? error.message
        : `Unhandled error occurred: ${error}`;
    }
  } finally {
    // SEND THE RESPONSE
    response.json(200, outputCollection);
  }
};
