var vvEntities = require("../VVRestApi");
var logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "CAGaming";
  options.databaseAlias = "Default";
  options.userId = "ca.admin";
  options.password = "Au3rs0ft1";
  options.clientId = "4426f41a-0e49-4df7-b6ac-55df031605fd";
  options.clientSecret = "kZsf9b88r77DOBDPVvVGS7q6Plez3v43VeZye5OLxGQ=";
  return options;
};

// module.exports.getCredentials = function () {
//   var options = {};
//   options.customerAlias = "CAGaming";
//   options.databaseAlias = "Default";
//   options.userId = "renato.corbellini@onetree.com";
//   options.password = "M4rz0.2022";
//   options.clientId = "43d9f3dc-af49-48f2-8b77-db7377d21b5c";
//   options.clientSecret = "F6YoDeB72Up7bYbstkoFiFUSvMk7dH5E0XOmODgnLbg=";
//   return options;
// };

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:   InvoiceApprove
      Customer:      California Office of Problem Gambling, Department of Public Health
      Purpose:       The purpose of this script is to gather information and perform actions to support approval of invoices.
      Date of Dev:   10/2013
      Last Rev Date: 09/16/2014

      Revision Notes:
      08/2013 - At this time we are writing the code in nodejs to complete the same functions as is currently being
      executed in the .NET web services.
      06/10/2014 - Jason: Update for production release.
      06/27/2014 - Jason: Updated messaging to have more information and hopefully be uniform.
      07/16/2014 - Jason: Add logic to include group treatment forms.
      08/04/2014 - Jason: Add logic to handle supervisor billing.
      09/16/2014 - Jason: Updated form template variables to be standard across all processes.
      05/12/2022 - Renato Corbellini: Added helper functions parseRes, getFeeValue, checkMetaAndStatus and checkDataPropertyExists used in the getCustomQueryResultByName to bring the active fees from VV instead of hard coding them.
      05/25/2022 - Renato Corbellini: Defined variables needed for execution roupScreeningBillable and supervisorBillable

    */

  /*****************
     Helper Functions
    ******************/

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

  function getFeeValue(feeArray, feeName) {
    try {
      const feeFound = feeArray.data.find((fee) => fee["fee Name"] == feeName);
      return feeFound["fee Value"];
    } catch (e) {
      // If an error ocurrs, it's because the fee value is not present in the active fees query
    }
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

  // GET ALL THE FEES THAT ARE ACTIVE (CURRENT DATE >= EFFECTIVITY START DATE AND CURRENT DATE <= EFECTIVITY END DATE)

  const queryName = "zWebSvc Active Fees";
  let shortDescription = "Custom Query trying to get active fees";

  const customQueryResp = await vvClient.customQuery
    .getCustomQueryResultsByName(queryName)
    .then((res) => parseRes(res))
    .then((res) => checkMetaAndStatus(res, shortDescription))
    .then((res) => checkDataPropertyExists(res, shortDescription));

  //Following are variables that determine the value for each item included in the invoice.
  var basePOValue = getFeeValue(customQueryResp, "Base PO Value"); //Keeps track of the base value of any starting PO limit.
  var intakeValue = getFeeValue(customQueryResp, "Intake Value"); //Keeps track of the amount paid per intake questionnaires form.
  var intreatmentValue = getFeeValue(customQueryResp, "Intreatment Value"); //Keeps track of the amount paid for intreatment questionnaires.
  var endoftreatValue = getFeeValue(customQueryResp, "End of Treatment Value"); //Keeps track of the amount paid for eot type questionnaires.
  var groupScreeningValue = getFeeValue(
    customQueryResp,
    "Group Screening Value"
  ); //Keeps track of the amount paid for conducting group screening if groupScreeningBillable = 1.
  var groupScreeningBillable = 1; //Determines if screening should be billable or not.  0 = no, 1 = yes.
  var supervisorBillable = 1; //Determines if supervisor logs should be billable or not.  0 = no, 1 = yes.
  var groupSessionValue = getFeeValue(customQueryResp, "Group Session Value"); //Keeps track of the amount paid for each participant in a group session.
  var groupEOTValue = getFeeValue(customQueryResp, "Group EOT Value"); //Keeps track of the amount paid for conducting a group eot.
  var supervisorLogValue = getFeeValue(customQueryResp, "Supervisor Log Value"); //Keeps track of the amount paid for providing supervisor services.

  logger.info("Entering the process InvoiceApprove.");

  //Following is a list of the GUIDs or unique identifiers used for the forms that are used to calculate invoice items.
  var formIDAddlCoveredServices = "416539f4-d884-e411-80ce-0050568dab13"; //Form Template ID for Additional Covered Services Form
  var formIDClientExemption = "5d3555f9-5585-e411-80ce-0050568dab13"; //Form Template ID for Client Exemption form
  var formIDClientIntake = "353e0441-5885-e411-80ce-0050568dab13"; //Form Template ID for Client Intake form
  var formIDEndofTreatment = "d8a18867-5685-e411-80ce-0050568dab13"; //Form Template ID for Outpatient End of Treatment Form
  var formIDGroupEndofTreatment = "a41c40e0-5885-e411-80ce-0050568dab13"; //Form Template ID for Group End of Treatment form
  var formIDGroupExemption = "f80b8d71-9184-e411-80c6-0050568dbd2f"; //Form Template ID for Group Exemption Form
  var formIDGroupFollowup = "d347c1f1-5985-e411-80ce-0050568dab13"; //Form Template ID for Group Follow-up form
  var formIDGroupInTreatment = "6d3e7711-5a85-e411-80ce-0050568dab13"; //Form Template ID for Group In-Treatment form
  var formIDGroupProviderApp = "b763aaed-9984-e411-80c6-0050568dbd2f"; //Form Template ID for Group Provider Application
  var formIDGroupSession = "fa5d5fb3-5a85-e411-80ce-0050568dab13"; //Form Template ID for Group Session form
  var formIDGroupTreatmentScreening = "42fb2f97-5b85-e411-80ce-0050568dab13"; //Form Template ID for Group Treatment Screening Form.  Acts as Intake for Group Treatment
  var formIDInvoiceForm = "b239e216-01f7-e311-bf0f-001b2170fb85"; //Form Template ID for Invoice Form
  var formIDProviderForm = "78f2517f-1ace-e211-b58c-001b2170fb85"; //Form Template ID for Provider Form
  var formIDProviderLocation = ""; //Form Template ID for Provider Location Form.  Only used for AZ Gaming
  var formIDRESIOPEndofTreatment = "441fbb52-a384-e411-80c6-0050568dbd2f"; //Form Template ID for Residential/Intensive Outpatient (IOP) End of Treatment Form
  var formIDResIOPTreatmentQuestionnaire =
    "f51d128a-a484-e411-80c6-0050568dbd2f"; //Form Template ID for Residential/Intensive Outpatient (IOP) Treatment Quesitonnaire
  var formIDSupervisorLog = "df955fd4-b684-e411-80ce-0050568dab13"; //Form Template ID for Supervisor Log
  var formIDTreatmentQuestionnaire = "7ebffef0-a2f8-e311-bf0f-001b2170fb85"; //Form Template ID for Outpatient Treatment Questionnaire

  //Get the key fields from the provider form to utilize during the process.
  var formInvoiceNumber = ffCollection.getFormFieldByName("Invoice Number"); //Load invoice number.
  var formTotal = ffCollection.getFormFieldByName("Total");

  var outputCollection = []; //Variable for communication back to the form as an array.  [0] for message, [1] for data.
  outputCollection[2] = 0; //Assign 0 so form is not saved.  1 will cause form to save.

  //Get todays date in a short date format for updating the approval date.
  var dateCalc = new Date();
  var fullDateVal = dateCalc.toISOString();
  var newMonth = fullDateVal.substr(5, 2);
  var newDate = fullDateVal.substr(8, 2);
  var newYear = fullDateVal.substr(0, 4);
  var todayDate = newMonth + "/" + newDate + "/" + newYear;

  var Q = require("q");

  //Treatment Questionnaires get list that are part of the current invoice.
  var formQuestInInvoiceData = {}; //Setup the object used to find the questionnaires.
  formQuestInInvoiceData.q =
    "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
  formQuestInInvoiceData.fields =
    "InstanceName,createdate,createby,ProviderID,Questionnaire Type,Questionnaire Date,ClientID,CaseID,Visit,Type of Client";
  formQuestInInvoiceData.offset = 0;
  formQuestInInvoiceData.limit = 3000;

  /*********************Following queries used to get Group Treatment forms that are billable.**********************************/

  //Group Screening forms included in the invoice.
  var formGroupScreeningData = {}; //Setup the object used to find the questionnaires.
  formGroupScreeningData.q =
    "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
  formGroupScreeningData.fields =
    "InstanceName,createdate,createby,ProviderID,ClientID,CaseID,Screening Date";
  formGroupScreeningData.offset = 0;
  formGroupScreeningData.limit = 3000;

  //Group In-treatment forms included in the invoice.
  var formGroupIntreatData = {}; //Setup the object used to find the questionnaires.
  formGroupIntreatData.q =
    "[Invoice Number] eq '" +
    formInvoiceNumber.value +
    "' AND [Validated] eq 'true'";
  formGroupIntreatData.fields =
    "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
  formGroupIntreatData.offset = 0;
  formGroupIntreatData.limit = 3000;

  //Group EOT forms included in the invoice
  var formGroupEOTData = {}; //Setup the object used to find the questionnaires.
  formGroupEOTData.q = "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
  formGroupEOTData.fields =
    "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
  formGroupEOTData.offset = 0;
  formGroupEOTData.limit = 3000;

  /*********************Following queries used to get Group Treatment forms that are billable.**********************************/
  //Supervisor logs included in the invoice.
  var formSupervisorData = {}; //Setup the object used to find the questionnaires.
  formSupervisorData.q =
    "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
  formSupervisorData.fields =
    "InstanceName,createdate,createby,ProviderID,Meeting Date";
  formSupervisorData.offset = 0;
  formSupervisorData.limit = 3000;

  Q.allSettled([
    vvClient.forms.getForms(
      formQuestInInvoiceData,
      formIDTreatmentQuestionnaire
    ),
    vvClient.forms.getForms(
      formGroupScreeningData,
      formIDGroupTreatmentScreening
    ),
    vvClient.forms.getForms(formGroupIntreatData, formIDGroupInTreatment),
    vvClient.forms.getForms(formGroupEOTData, formIDGroupEndofTreatment),
    vvClient.forms.getForms(formSupervisorData, formIDSupervisorLog),
  ]).then(function (promises) {
    var promiseQuestInInvoice = promises[0]; //Results from the getForms call for treatment questionnaires.
    var promiseGroupScreenInc = promises[1];
    var promiseGroupIntreatInc = promises[2];
    var promiseGroupEOTInc = promises[3];
    var promiseSupervisorLog = promises[4];

    try {
      /* Need the following variables to build an array of information to calculate billing.  Array held in invoiceRecordset.

                 The following is the format of the objects being loaded into invoiceRecordset.  Snippets of the following inserted wherever this is being loaded.
                 FormType = Treatment, Group, Supervisor
                 VisitType = Intake, Intreatment, EOT, Screening, Log
                 Treatment - Intake, InTreatment, EOT
                 Group - Screening, InTreatment, EOT
                 Supervisor - Log
                 ClientType = Patient, Affected Individual
                 VisitDate = date when any of the billable items occurred
                 includedInvoice = Yes or No
                 revisionID = id of form so update with invoice info can be applied.
                 invValue = value of the line item if included in invoice.
                 caseID = needed to determine if the record should be included in the invoice.
                 */

      var invoiceRecordset = []; //used to hold all the records for billing purposes.
      var invRecordControl = 0; //used to control next value in array.

      //Get all questionnaires already associated with invoice.
      if (promiseQuestInInvoice.state == "fulfilled") {
        //Clean results from the getForms call.
        var formQuestOnInvData = JSON.parse(promiseQuestInInvoice.value);
        if (
          formQuestOnInvData.meta.status == "200" &&
          formQuestOnInvData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Questionnaires with Invoice found.");
          for (var i = 0; i < formQuestOnInvData.data.length; i++) {
            /* Need the following to build an array of information to calculate invoice amt.  Array held in invoiceRecordset.
                             FormType = Treatment
                             VisitType = Intake, InTreatment, EOT
                             ClientType = Patient, Affected Individual
                             VisitDate = date when any of the billable items occurred
                             includedInvoice = Yes or No
                             revisionID = id of form so update with invoice info can be applied.
                             invValue = value of the line item if included in invoice.
                             */
            var loadInvoiceArray = {}; //used to load the array.
            loadInvoiceArray.FormType = "Treatment"; //Load Formtype part of the object.  Treatment is for this type of form.
            loadInvoiceArray.clienttype =
              formQuestOnInvData.data[i]["type of Client"]; //Loading the client type.
            loadInvoiceArray.visitdate =
              formQuestOnInvData.data[i]["questionnaire Date"]; //Loading questionnaire date for sorting.
            loadInvoiceArray.revisionid =
              formQuestOnInvData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
            loadInvoiceArray.includedInvoice = "Yes"; //Loading that this questionnaire is associated with an invoice.
            loadInvoiceArray.caseid = formQuestOnInvData.data[i]["caseID"]; //Load the case id for checking if the line item is billable.

            //Load the type and value of the line item
            if (formQuestOnInvData.data[i]["questionnaire Type"] == "Intake") {
              loadInvoiceArray.visittype = "intake";
              loadInvoiceArray.invValue = intakeValue;
            } else if (
              formQuestOnInvData.data[i]["questionnaire Type"] == "In-Treatment"
            ) {
              loadInvoiceArray.visittype = "intreatment";
              loadInvoiceArray.invValue = intreatmentValue;
            } else if (
              formQuestOnInvData.data[i]["questionnaire Type"] ==
              "End of Treatment"
            ) {
              loadInvoiceArray.visittype = "eot";
              loadInvoiceArray.invValue = endoftreatValue;
            }

            invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
            invRecordControl = invRecordControl + 1; //increment the total record control variable.
          }
        } else {
          logger.info("No Questionnaires with Invoice");
        }
      }

      //Get all the group screening forms that are included.
      if (
        promiseGroupScreenInc.state == "fulfilled" &&
        groupScreeningBillable == 1
      ) {
        //Clean results from the getForms call.
        var formGroupScreenIncData = JSON.parse(promiseGroupScreenInc.value);
        if (
          formGroupScreenIncData.meta.status == "200" &&
          formGroupScreenIncData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Group Screening with Invoice found.");
          for (var i = 0; i < formGroupScreenIncData.data.length; i++) {
            var loadInvoiceArray = {}; //used to load the array.
            loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
            loadInvoiceArray.clienttype = "NA"; //Loading the client type.
            loadInvoiceArray.visitdate =
              formGroupScreenIncData.data[i]["screening Date"]; //Loading screening date for sorting.
            loadInvoiceArray.revisionid =
              formGroupScreenIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
            loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
            loadInvoiceArray.caseid = formGroupScreenIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
            loadInvoiceArray.visittype = "screening";
            loadInvoiceArray.invValue = groupScreeningValue;
            invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
            invRecordControl = invRecordControl + 1; //increment the total record control variable.
          }
        } else {
          logger.info("No Group Screening with Invoice");
        }
      }

      //Get all the group intreatment forms that are included.
      if (promiseGroupIntreatInc.state == "fulfilled") {
        //Clean results from the getForms call.
        var formGroupIntreatIncData = JSON.parse(promiseGroupIntreatInc.value);
        if (
          formGroupIntreatIncData.meta.status == "200" &&
          formGroupIntreatIncData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Group Intreat with Invoice found.");
          for (var i = 0; i < formGroupIntreatIncData.data.length; i++) {
            var loadInvoiceArray = {}; //used to load the array.
            loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
            loadInvoiceArray.clienttype = "NA"; //Loading the client type.
            loadInvoiceArray.visitdate =
              formGroupIntreatIncData.data[i]["session Date"]; //Loading session date for sorting.
            loadInvoiceArray.revisionid =
              formGroupIntreatIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
            loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
            loadInvoiceArray.caseid = formGroupIntreatIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
            loadInvoiceArray.visittype = "intreatment";
            loadInvoiceArray.invValue = groupSessionValue;
            invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
            invRecordControl = invRecordControl + 1; //increment the total record control variable.
          }
        } else {
          logger.info("No Group Intreat with Invoice");
        }
      }

      //Get all the group eot forms that are included.
      if (promiseGroupEOTInc.state == "fulfilled") {
        //Clean results from the getForms call.
        var formGroupEOTIncData = JSON.parse(promiseGroupEOTInc.value);
        if (
          formGroupEOTIncData.meta.status == "200" &&
          formGroupEOTIncData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          logger.info("Group EOT with Invoice found.");
          for (var i = 0; i < formGroupEOTIncData.data.length; i++) {
            var loadInvoiceArray = {}; //used to load the array.
            loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
            loadInvoiceArray.clienttype = "NA"; //Loading the client type.
            loadInvoiceArray.visitdate =
              formGroupEOTIncData.data[i]["session Date"]; //Loading session date for sorting.
            loadInvoiceArray.revisionid =
              formGroupEOTIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
            loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
            loadInvoiceArray.caseid = formGroupEOTIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
            loadInvoiceArray.visittype = "eot";
            loadInvoiceArray.invValue = groupEOTValue;
            invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
            invRecordControl = invRecordControl + 1; //increment the total record control variable.
          }
        } else {
          logger.info("No Group EOT with Invoice");
        }
      }

      /* Need the following variables to build an array of information to calculate billing.  Array held in invoiceRecordset.

                 The following is the format of the objects being loaded into invoiceRecordset.  Snippets of the following inserted wherever this is being loaded.
                 FormType = Treatment, Group, Supervisor
                 VisitType = Intake, Intreatment, EOT, Screening, Log
                 Treatment - Intake, InTreatment, EOT
                 Group - Screening, InTreatment, EOT
                 Supervisor - Log
                 ClientType = Patient, Affected Individual
                 VisitDate = date when any of the billable items occurred
                 includedInvoice = Yes or No
                 revisionID = id of form so update with invoice info can be applied.
                 invValue = value of the line item if included in invoice.
                 caseID = needed to determine if the record should be included in the invoice.
                 */

      //Get all the supervisor forms that are included.
      if (supervisorBillable == 1) {
        if (promiseSupervisorLog.state == "fulfilled") {
          //Clean results from the getForms call.
          var formSupervisorIncData = JSON.parse(promiseSupervisorLog.value);
          if (
            formSupervisorIncData.meta.status == "200" &&
            formSupervisorIncData.data.length > 0
          ) {
            //Records returned when status = 200 and length says the number of records returned.
            logger.info("Supervisor Log with Invoice found.");
            for (var i = 0; i < formSupervisorIncData.data.length; i++) {
              loadInvoiceArray = {}; //used to load the array.
              loadInvoiceArray.FormType = "Supervisor"; //Load Formtype part of the object.  Group is for this type of form.
              loadInvoiceArray.clienttype = "NA"; //Loading the client type.
              loadInvoiceArray.visitdate =
                formSupervisorIncData.data[i]["meeting Date"]; //Loading session date for sorting.
              loadInvoiceArray.revisionid =
                formSupervisorIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
              loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
              loadInvoiceArray.caseid = ""; //Load the case id, no reason for group treatment.
              loadInvoiceArray.visittype = "log";
              loadInvoiceArray.invValue = supervisorLogValue;
              invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
              invRecordControl = invRecordControl + 1; //increment the total record control variable.
            }
          } else {
            logger.info("No Supervisor Log with Invoice");
          }
        }
      }

      /* **************************************************************************************************************

                The following code takes records loaded above and measures the billable forms associated with the questionnaires
                to make sure they match the total on the invoice.  If they match, then approve the invoice and update all
                billable questionnaires so they are marked as invoiced.

                 *****************************************************************************************************************/

      //Load the values of all items in the invoiceRecordset to see if they match what is on the invoice.
      var newInvoiceLevel = 0;
      for (var a = 0; a < invRecordControl; a++) {
        newInvoiceLevel =
          newInvoiceLevel + Number(invoiceRecordset[a].invValue); //Increment the invoice value by the value recorded.
      }

      //Compare what is on the invoice versus associated items.  If not equal, then stop approval.
      if (newInvoiceLevel != Number(formTotal.value)) {
        logger.info(
          "Associated billable questionnaires do not equal amount on invoice.  The amount on the invoice is $" +
            formTotal.value +
            " and the value calculated was $" +
            newInvoiceLevel +
            "."
        );
        outputCollection[0] =
          "Associated billable questionnaires do not equal amount on invoice.  The amount on the invoice is $" +
          formTotal.value +
          " and the value calculated was $" +
          newInvoiceLevel +
          ".";
        outputCollection.push();
        response.json(200, outputCollection);
        return false;
      }
      //If the calculated amount of billable questionnaires match what is on the invoice, then process all questionnaires.
      else {
        var processLoopControl = 0; //Use this variable to control the processing loop qty.  This should help determine number of times promises communicate back and when to communicate to client.
        var formTemplateID = ""; //used to hold the form template guid for the template that will have form records updatd.
        var formRevID = ""; //used to hold the form record revision id to update that record.
        var communicationSuccess = 0; //used to measure successful communications coming back from the UpdateForm function.
        var communicationFail = 0; //used to measure the failed communications coming back from the UpdateForm function.

        //Following loop loads the records and prepares appropriate information to update each type of form that is included in the invoice.
        for (var a = 0; a < invRecordControl; a++) {
          var formClientData = {};
          if (invoiceRecordset[a].FormType == "Treatment") {
            formTemplateID = formIDTreatmentQuestionnaire; //assign the template id for Treatment Questionnaire.
            formClientData["Invoiced"] = true;
            //formClientData['Approval Date'] = todayDate;
          } else if (invoiceRecordset[a].FormType == "Group") {
            if (invoiceRecordset[a].visittype == "screening") {
              formTemplateID = formIDGroupTreatmentScreening;
              formClientData["Invoiced"] = true;
            } else if (invoiceRecordset[a].visittype == "intreatment") {
              formTemplateID = formIDGroupInTreatment;
              formClientData["Invoiced"] = true;
            } else if (invoiceRecordset[a].visittype == "eot") {
              formTemplateID = formIDGroupEndofTreatment;
              formClientData["Invoiced"] = true;
            }
          } else if (invoiceRecordset[a].FormType == "Supervisor") {
            formTemplateID = formIDSupervisorLog;
            formClientData["Invoiced"] = true;
          }

          formRevID = invoiceRecordset[a].revisionid; //Assign the revision id for the form.
          processLoopControl = processLoopControl + 1;

          //Following promise is to control the updates of any billable form passed to it.
          Q.allSettled([
            UpdateForm(formClientData, formTemplateID, formRevID),
          ]).then(function (promises) {
            var promiseFollowupResults = promises[0];
            if (
              promiseFollowupResults.state == "fulfilled" &&
              promiseFollowupResults.value == "Updated"
            ) {
              logger.info("Billable Form Updated");
              communicationSuccess = communicationSuccess + 1; //Increment if the form update was successful.
            } else if (promiseFollowupResults.state == "rejected") {
              communicationFail = communicationFail + 1; //Increment if the form update failed.
            }

            //When number of communications back from form update matches the number of times the form was updated, then communicate back to client.
            if (
              communicationFail + communicationSuccess ==
              processLoopControl
            ) {
              //Measure if there were any communication failures.
              if (communicationFail == 0) {
                logger.info(
                  "All billable questionnaires updated successfully."
                );
                outputCollection[0] =
                  "All billable questionnaires updated successfully.";
                outputCollection.push();
                response.json(200, outputCollection);
                return false;
              } else {
                //Choosing to communicate a failure and force regeneration.
                logger.info("Errors when updating billable questionnaires.");
                outputCollection[0] =
                  "Errors in updating billable questionnaires.";
                outputCollection.push();
                response.json(200, outputCollection);
                return false;
              }
            }
          });
        }
      }
    } catch (ex) {
      logger.info(ex);
    }
  });

  //Function used to update the any billable forms

  var UpdateForm = function (formData, formID, formRevID) {
    var Q = require("q");
    var deferred = Q.defer();
    var formParams = {};
    Q.allSettled([
      vvClient.forms.postFormRevision(formParams, formData, formID, formRevID),
    ]).then(function (promises) {
      var promiseUpdate = promises[0]; //Results from the client intake forms update.
      try {
        if (promiseUpdate.state == "fulfilled") {
          //postFormRevisions completed cleanly.
          var formUpdateData = promiseUpdate.value; //Load values for processing
          if (formUpdateData.meta.status == "201") {
            //Status 201 indicates the form was updated.
            logger.info("Form Updated");
            deferred.resolve("Updated");
          } else {
            logger.info("Form not updated");
            deferred.reject(new Error(error));
          }
        }
      } catch (ex) {
        logger.info(ex);
        deferred.reject(new Error(error));
      }
    });
    return deferred.promise;
  };
};
