var vvEntities = require("../VVRestApi");
var logger = require("../log");

module.exports.getCredentials = function () {
  var options = {};
  options.customerAlias = "CAGaming";
  options.databaseAlias = "Default";
  options.userId = "renato.corbellini@onetree.com";
  options.password = "M4rz0.2022";
  options.clientId = "43d9f3dc-af49-48f2-8b77-db7377d21b5c";
  options.clientSecret = "F6YoDeB72Up7bYbstkoFiFUSvMk7dH5E0XOmODgnLbg=";
  return options;
};

module.exports.main = async function (ffCollection, vvClient, response) {
  /*Script Name:   InvoiceGenerate
        Customer:      California Office of Problem Gambling, Department of Public Health
        Purpose:       The purpose of this script is to gather information and perform actions to support generation of invoices.
        Date of Dev:   10/2013
        Last Rev Date: 10/12/2018
    
        Revision Notes:
        08/2013 - At this time we are writing the code in nodejs to complete the same functions as is currently being
        executed in the .NET web services.
        06/10/2014 - Jason: Prepare for production release.
        06/27/2014 - Jason: Updated messaging to have more information and hopefully be uniform.
        07/09/2014 - Jason: Update to handle group sessions in billing.
        07/16/2014 - Jason: Reworked some logic in processing the billable items so it would be more accurate.  Also reworked calculation of fiscal period as it had a problem when you are in July.
        08/01/2014 - Jason: Updated to include billing for Supervisor log.
        08/11/2014 - Jason: Modified slightly the range of client intakes begin brought in.  Previously was the last x days based on modify date where x is the invoice range.  I added 30 days to insure higher probability that nothing would be missed.
        08/22/2014 - Jason: Add code to create relationships between this invoice and the items that are billable.  Mechanisms are also in place to remove relationships when needed.
                            Corrected bug that was encountered with disassociating supervisor logs.  Also passed information back when no items available to clear out anything that might have been filled in before.
        09/15/2014 - Jason: Modify logic to handle how AZ Gaming uses.
        09/16/2014 - Jason: Update form template variables to be standard across all processes.
        12/02/2014 - Jason: During testing encountered an issue when PO pushed over the limit by adding the first item.  The Update logic was going through ever time because if statement was incorrectly
                            assigning a value and updating every time.  Removed this line then added processcontrol count to where the PO Limit is flagged.  This makes sure the process gets through to
                            the communications stage in the promise.  Changed process control count to occur for every line item since all need to be processed in one way or another.
        02/02/2015 - Jason: Acquired and passed agency information about the provider back to the invoice form.
        09/06/2018 - Nikola: Added PGTI as an invoiceable program.
        10/01/2018 - Kendra: 2018 Codebook project. Update Questionnaire Type measures to reflect numeric values.
        10/12/2018 - Kendra: 2018 Codebook Project. Updated group in-treatment sessions query not to include forms that have not been fully submitted.
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
      // If an error ocurrs, it's because it the fee is not present in the active fees query
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
  var groupSessionValue = getFeeValue(customQueryResp, "Group Session Value"); //Keeps track of the amount paid for each participant in a group session.
  var groupEOTValue = getFeeValue(customQueryResp, "Group EOT Value"); //Keeps track of the amount paid for conducting a group eot.
  var supervisorLogValue = getFeeValue(customQueryResp, "Supervisor Log Value"); //Keeps track of the amount paid for providing supervisor services.

  //Following are variables that control invoicing parameters.
  var groupScreeningBillable = 1; //Determines if screening should be billable or not.  0 = no, 1 = yes.
  var supervisorLogBillable = 1; //Determines if supervisor logs should be billable or not.  0 = no, 1 = yes.
  var amtDaysToInvoice = 300; //Time allowed in the past for invoicing
  var nameOfOPG = "OPG"; //Name of the Office of Problem Gambling Group in the system.

  logger.info("Entering into the InvoiceGenerate process" + new Date());

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

  //Array used to keep track of the list of billable type cases or intake forms.
  var invoiceablePrograms = [];
  invoiceablePrograms[0] = "Outpatient"; //Load the array with other items where the intake type of program are invoiceable.
  invoiceablePrograms[1] = "TEST";
  invoiceablePrograms[2] = "Problem Gambling Telephone Intervention";

  //Get the key fields from the invoice form to utilize during the process.
  var formLoggedInUserSite = ffCollection.getFormFieldByName("USERSITE"); //need this to get the current provider logged in.
  var formHolder = ffCollection.getFormFieldByName("Start Range");
  var formBeginRangeComp = new Date(formHolder.value); //Setup comparison to see if dates out of range.
  var invFormID = ffCollection.getFormFieldByName("Invoice_Identifier"); //Get the ID of the invoice to put into the treatment questionnaires.
  var invInvNumber = ffCollection.getFormFieldByName("Invoice Number");
  var invoiceFormGUID = ffCollection.getFormFieldByName("FORMID"); //Get the GUID of the invoice.

  //Get short date format for beginning invoice range.
  var d = new Date(formHolder.value); //Change form info from string to date.  Will be in seconds format. (i.e. 1401580800000)
  var formBeginRange = d.toISOString();

  formHolder = ffCollection.getFormFieldByName("End Range");

  //Get short date format for invoice end range.
  var d = new Date(formHolder.value);
  var e = new Date(); //Setup date holder variable.
  d.setHours(d.getHours() + 23); //Take the date passed and add 23 hours so it is the end of the day
  d.setMinutes(d.getMinutes() + 59); //Take the date value for d and add 59 minutes.  Should put it at 23:59 for the date passed.
  var formEndRange = d.toISOString();

  logger.info(
    "Range of the Invoice is " + formBeginRange + " to " + formEndRange
  );

  var formInvoiceNumber = ffCollection.getFormFieldByName("Invoice Number"); //Load invoice number.

  var whoIsProvider = ""; //Used to know who is provider after information gathered.
  var whoIsProvName = "";

  var poLimit = 0; //Used to calculate PO Limit from ACS forms.

  var outputCollection = []; //Variable for communication back to the form as an array.  [0] for message, [1] for data.
  outputCollection[2] = 0; //Assign 0 so form is not saved.  1 will cause form to save.

  //Calculate Fiscal Period

  var thisYear = d.getFullYear();
  var thisMonth = d.getMonth();
  var beginFiscalDate = new Date();
  var endFiscalDate = new Date();

  if (thisMonth > 5) {
    beginFiscalDate = thisYear + "-07-01T00:00:00Z";
    endFiscalDate = thisYear + 1 + "-06-30T23:59:59Z";
  } else {
    beginFiscalDate = thisYear - 1 + "-07-01T00:00:00Z";
    endFiscalDate = thisYear + "-06-30T23:59:59Z";
  }

  //Calculate date range to get list of intakes and compare.  Also used to determine the scope of how far back things can be invoiced.
  var thisDate = new Date();
  var rangeHolder = new Date(thisDate);
  rangeHolder.setDate(rangeHolder.getDate() - (amtDaysToInvoice + 30));
  var rangeDaystoInvoice = rangeHolder.toISOString();

  //Get todays date in a short date format for updating treatment questionnaires.
  var dateCalc = new Date();
  var fullDateVal = dateCalc.toISOString();
  var newMonth = fullDateVal.substr(5, 2);
  var newDate = fullDateVal.substr(8, 2);
  var newYear = fullDateVal.substr(0, 4);
  var todayDate = newMonth + "/" + newDate + "/" + newYear;

  if (formBeginRangeComp < rangeHolder) {
    //Comparing millisecond versions of these two dates.  End if attempting to do out of the invoice range allowed
    logger.info("Invoice Date out of range");
    outputCollection[0] =
      "The beginning date for the invoice is out of range.  You cannot have a range that begins prior to " +
      rangeHolder.toLocaleDateString() +
      ".";
    outputCollection.push();
    response.json(200, outputCollection);
    return false;
  }

  //Get the provider information for the current user logged in.
  var Q = require("q");

  var currentUserSitedata = {}; //Get the site of the logged in user to insure they are not OPG users.
  //currentUserSitedata.q = "[id] eq '02723FEF-57C0-DF11-B402-002655317788'";
  currentUserSitedata.q = "[id] eq '" + formLoggedInUserSite.value + "'";
  currentUserSitedata.fields = "id,name,description,revisionId";

  Q.allSettled([
    vvClient.sites.getSites(currentUserSitedata), //Nodejs helper function to get the site of the logged in user.
  ]).then(function (promises) {
    var promiseProviderForm = promises[0];

    try {
      //Gets the site for selected provider.
      if (promiseProviderForm.state == "fulfilled") {
        //Clean results from the getForms call.
        var siteProviderData = JSON.parse(promiseProviderForm.value);
        if (
          siteProviderData.meta.status == "200" &&
          siteProviderData.data.length > 0
        ) {
          //Records returned when status = 200 and length says the number of records returned.
          if (typeof siteProviderData.data[0].id != "undefined") {
            logger.info("Selected Provider Site Found.");
            if (siteProviderData.data[0].name == nameOfOPG) {
              //Stop the invoicing process because the user logged in is from OPG.
              logger.info("User logged in is part of OPG");
              outputCollection[0] = "OPG users cannot submit invoices.";
              outputCollection.push();
              response.json(200, outputCollection);
              return false;
            }

            whoIsProvider = siteProviderData.data[0].name; //Load the provider information to pull in next set of information.
            whoIsProvName = siteProviderData.data[0].description;

            /*   *******************************************************************************************************************
    
                                The following section is used to bring together information needed to calculate invoice limits and process questionnaires
                                for the provider.  Intake forms are used to determine what items can be updated and associated with the invoice and which
                                ones should not be associated.  All of the items (treatment questionnaires, group forms, supervisor forms, etc.) that should
                                be billed will be loaded into an array.  Then the sort function will be used to put them in order so that oldest items
                                are loaded into the invoice first.
    
                                *******************************************************************************************************************    */

            //Get all the invoices that have been approved or waiting for approval to calculate how much has been billed or waiting for approval so far.
            var formInvoicesApproved = {};
            formInvoicesApproved.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Start Range] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "' AND [Status] ne 'Denied' AND [Status] ne 'VOID' AND [Invoice Number] ne '" +
              formInvoiceNumber.value +
              "'";
            formInvoicesApproved.fields =
              "InstanceName,createdate,createby,ProviderID,Status,Total";
            formInvoicesApproved.offset = 0;
            formInvoicesApproved.limit = 1000;

            //Additional Covered Services get the list to calculate the PO Limit for the fiscal year.  Only bringing in approved forms since others have not increased the PO Limit yet.
            var formAddlSvcData = {}; //Setup the object used to find the Additional Covered Services in a fiscal year.
            formAddlSvcData.q =
              "[Provider ID] eq '" +
              whoIsProvider +
              "' AND [Covered Date] BETWEEN '" +
              beginFiscalDate +
              "' AND '" +
              endFiscalDate +
              "' AND [Request Status] eq 'Approved'";
            formAddlSvcData.fields =
              "InstanceName,createdate,createby,Provider ID,Request Status,Current PO Limit,Current PO Usage,PO Increment";
            formAddlSvcData.offset = 0;
            formAddlSvcData.limit = 1000;

            //Get provider information so that we can use it to fill in invoice.
            var formProvider = {};
            formProvider.q = "[ProviderID] eq '" + whoIsProvider + "'";
            formProvider.fields =
              "InstanceName,createdate,createby,ProviderID,Provider Name,Provider Name Group,Address,City,State,ZipCode,Phone,Agency";
            formProvider.offset = 0;
            formProvider.limit = 1000;

            /*********************Following queries used to get Outpatient Treatment forms that are billable.**********************************/

            //Questionnaires get list that have not been invoiced in date range.  Using Invoice Number equal to blank to insure that items associated with invoice are excluded.
            var formQuestData = {}; //Setup the object used to find the questionnaires.
            formQuestData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Questionnaire Date] BETWEEN '" +
              formBeginRange +
              "' AND '" +
              formEndRange +
              "' AND [Questionnaire Type] NOT LIKE '%Follow-up' AND [Invoice Number] eq ''";
            formQuestData.fields =
              "InstanceName,createdate,createby,ProviderID,Questionnaire Type,Questionnaire Date,ClientID,CaseID,Visit,Type of Client";
            formQuestData.offset = 0;
            formQuestData.limit = 3000;

            //Questionnaires get list that are part of the current invoice.
            var formQuestInInvoiceData = {}; //Setup the object used to find the questionnaires.
            formQuestInInvoiceData.q =
              "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
            formQuestInInvoiceData.fields =
              "InstanceName,createdate,createby,ProviderID,Questionnaire Type,Questionnaire Date,ClientID,CaseID,Visit,Type of Client";
            formQuestInInvoiceData.offset = 0;
            formQuestInInvoiceData.limit = 3000;

            //Use the invoiceablePrograms array to load the query string dynamically.
            var intakeQuery = "";
            var x = 0;
            for (var item in invoiceablePrograms) {
              intakeQuery =
                intakeQuery +
                "[Type of Program] eq '" +
                invoiceablePrograms[x] +
                "' OR ";
              x = x + 1;
            }

            intakeQuery = intakeQuery.substr(0, intakeQuery.length - 4); //strip off the last OR.

            //Client Intake forms that can be invoiced based on the types that are allowed to be invoiced.  Also bringing in the range of intakes where last visit is within allowed range and end of invoice range.
            var formClientIntake = {};
            //formClientIntake.q = "[ProviderID] eq '" + whoIsProvider + "' AND [modifydate] BETWEEN '" + rangeDaystoInvoice + "' AND '" + formEndRange + "' AND (" + intakeQuery + ")"
            formClientIntake.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [modifydate] gt '" +
              rangeDaystoInvoice +
              "' AND (" +
              intakeQuery +
              ")";
            formClientIntake.fields =
              "InstanceName,createdate,createby,ProviderID,Type of Program,LastVisitDate,ClientID,CaseID,modifydate";
            formClientIntake.offset = 0;
            formClientIntake.limit = 3000;

            /*********************Following queries used to get Group Treatment forms that are billable.**********************************/

            //Group Screening forms included in the invoice.
            var formGroupScreeningIncData = {}; //Setup the object used to find the questionnaires.
            formGroupScreeningIncData.q =
              "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
            formGroupScreeningIncData.fields =
              "InstanceName,createdate,createby,ProviderID,ClientID,CaseID,Screening Date";
            formGroupScreeningIncData.offset = 0;
            formGroupScreeningIncData.limit = 3000;

            //Group Screening forms in date range that are not included in the invoice.  Using Invoice Number equal to blank to insure that items associated with invoice are excluded.
            var formGroupScreeningNotIncData = {}; //Setup the object used to find the questionnaires.
            formGroupScreeningNotIncData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Screening Date] BETWEEN '" +
              formBeginRange +
              "' AND '" +
              formEndRange +
              "' AND [Invoice Number] eq ''";
            formGroupScreeningNotIncData.fields =
              "InstanceName,createdate,createby,ProviderID,ClientID,CaseID,Screening Date";
            formGroupScreeningNotIncData.offset = 0;
            formGroupScreeningNotIncData.limit = 3000;

            //Group In-treatment forms included in the invoice.
            var formGroupIntreatIncData = {}; //Setup the object used to find the questionnaires.
            formGroupIntreatIncData.q =
              "[Invoice Number] eq '" +
              formInvoiceNumber.value +
              "' AND [Validated] eq 'true'";
            formGroupIntreatIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupIntreatIncData.offset = 0;
            formGroupIntreatIncData.limit = 3000;

            //Group In-treatment forms in date range that are not included in the invoice.  Using Invoice Number equal to blank to insure that items associated with invoice are excluded.
            var formGroupIntreatNotIncData = {}; //Setup the object used to find the questionnaires.
            formGroupIntreatNotIncData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Session Date] BETWEEN '" +
              formBeginRange +
              "' AND '" +
              formEndRange +
              "' AND [Invoice Number] eq '' AND [Validated] eq 'true' AND [Form Submitted] eq 'true'";
            formGroupIntreatNotIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupIntreatNotIncData.offset = 0;
            formGroupIntreatNotIncData.limit = 3000;

            //Group EOT forms included in the invoice
            var formGroupEOTIncData = {}; //Setup the object used to find the questionnaires.
            formGroupEOTIncData.q =
              "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
            formGroupEOTIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupEOTIncData.offset = 0;
            formGroupEOTIncData.limit = 3000;

            //Group EOT forms in date range that are not included in the invoice.  Using Invoice Number equal to blank to insure that items associated with invoice are excluded.
            var formGroupEOTNotIncData = {}; //Setup the object used to find the questionnaires.
            formGroupEOTNotIncData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Session Date] BETWEEN '" +
              formBeginRange +
              "' AND '" +
              formEndRange +
              "' AND [Invoice Number] eq ''";
            formGroupEOTNotIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Session Date,ClientID,CaseID";
            formGroupEOTNotIncData.offset = 0;
            formGroupEOTNotIncData.limit = 3000;

            /*********************Following queries used to get Supervisor Log forms that are billable.**********************************/

            //Supervisor Log forms included in the invoice
            var formSuperLogIncData = {}; //Setup the object used to find the questionnaires.
            formSuperLogIncData.q =
              "[Invoice Number] eq '" + formInvoiceNumber.value + "'";
            formSuperLogIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Meeting Date";
            formSuperLogIncData.offset = 0;
            formSuperLogIncData.limit = 3000;

            //Supervisor Log forms not included in the invoice.
            var formSuperLogNotIncData = {}; //Setup the object used to find the questionnaires.
            formSuperLogNotIncData.q =
              "[ProviderID] eq '" +
              whoIsProvider +
              "' AND [Meeting Date] BETWEEN '" +
              formBeginRange +
              "' AND '" +
              formEndRange +
              "' AND [Invoice Number] eq ''";
            formSuperLogNotIncData.fields =
              "InstanceName,createdate,createby,ProviderID,Meeting Date";
            formSuperLogNotIncData.offset = 0;
            formSuperLogNotIncData.limit = 3000;

            Q.allSettled([
              vvClient.forms.getForms(formInvoicesApproved, formIDInvoiceForm),
              vvClient.forms.getForms(
                formAddlSvcData,
                formIDAddlCoveredServices
              ), //Nodejs helper function to get the list of additional covered services forms.
              vvClient.forms.getForms(formProvider, formIDProviderForm),
              vvClient.forms.getForms(
                formQuestData,
                formIDTreatmentQuestionnaire
              ), //Nodejs helper function to get the list of questionnaires with same info as current.
              vvClient.forms.getForms(
                formQuestInInvoiceData,
                formIDTreatmentQuestionnaire
              ),
              vvClient.forms.getForms(formClientIntake, formIDClientIntake),
              vvClient.forms.getForms(
                formGroupScreeningIncData,
                formIDGroupTreatmentScreening
              ),
              vvClient.forms.getForms(
                formGroupScreeningNotIncData,
                formIDGroupTreatmentScreening
              ),
              vvClient.forms.getForms(
                formGroupIntreatIncData,
                formIDGroupInTreatment
              ),
              vvClient.forms.getForms(
                formGroupIntreatNotIncData,
                formIDGroupInTreatment
              ),
              vvClient.forms.getForms(
                formGroupEOTIncData,
                formIDGroupEndofTreatment
              ),
              vvClient.forms.getForms(
                formGroupEOTNotIncData,
                formIDGroupEndofTreatment
              ),
              vvClient.forms.getForms(formSuperLogIncData, formIDSupervisorLog),
              vvClient.forms.getForms(
                formSuperLogNotIncData,
                formIDSupervisorLog
              ),
            ]).then(function (promises) {
              var promiseInvoiceApproved = promises[0];
              var promiseAddlCovSvc = promises[1];
              var promiseProvider = promises[2];
              var promiseQuestionnaires = promises[3];
              var promiseQuestInInvoice = promises[4];
              var promiseClientIntake = promises[5];
              var promiseGroupScreenInc = promises[6];
              var promiseGroupScreenNot = promises[7];
              var promiseGroupIntreatInc = promises[8];
              var promiseGroupIntreatNot = promises[9];
              var promiseGroupEOTInc = promises[10];
              var promiseGroupEOTNot = promises[11];
              var promiseSuperLogInc = promises[12];
              var promiseSuperLogNot = promises[13];

              try {
                var invoiceTotal = 0;
                var providerUpdateData = {};

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
                var intakeRecordset = []; //used to compare against invoice recordset.  Should only include intake forms that can be invoiced.

                //Read number of approved invoices to calculate the value of the invoices for the fiscal period.
                if (promiseInvoiceApproved.state == "fulfilled") {
                  var formInvoiceApproved = JSON.parse(
                    promiseInvoiceApproved.value
                  );
                  if (
                    formInvoiceApproved.meta.status == "200" &&
                    formInvoiceApproved.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Invoice Forms found.");
                    for (var i = 0; i < formInvoiceApproved.data.length; i++) {
                      invoiceTotal =
                        invoiceTotal + formInvoiceApproved.data[i]["total"];
                    }
                  } else {
                    logger.info("No Invoice forms found");
                  }
                }

                //Load value of PO Limit
                poLimit = basePOValue; //Set value for the base value since every provider starts with a base value.
                //Get all requests for additional services forms for a provider to calculate PO Limit.
                if (promiseAddlCovSvc.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formACSData = JSON.parse(promiseAddlCovSvc.value);
                  if (
                    formACSData.meta.status == "200" &&
                    formACSData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("ACS Forms found.");

                    var numACS = 0;
                    var numApprovedACS = 0;
                    //var numDeniedACS = 0;
                    if (typeof formACSData.data != "undefined") {
                      //If any additional covered service forms come back, figure out number of approved, denied and other to get PO Limit.
                      for (var i = 0; i < formACSData.data.length; i++) {
                        if (
                          typeof formACSData.data[i]["pO Increment"] !=
                            "undefined" &&
                          typeof formACSData.data[i]["request Status"] !=
                            "undefined"
                        ) {
                          if (
                            formACSData.data[i]["request Status"] == "Approved"
                          ) {
                            if (
                              formACSData.data[i]["pO Increment"] == null ||
                              formACSData.data[i]["pO Increment"] == ""
                            ) {
                              //This takes care of old legacy forms and situations where an increment was not entered.
                              poLimit = poLimit + basePOValue;
                            } else {
                              poLimit =
                                poLimit + formACSData.data[i]["pO Increment"]; //Add PO Increment to the process for PO Limit.
                            }
                            numApprovedACS++;
                          }
                          //else if (formACSData.data[i]['request Status'] == 'Denied') {
                          //    numDeniedACS++;
                          //}
                        } else {
                          if (
                            formACSData.data[i]["request Status"] == "Approved"
                          ) {
                            poLimit = poLimit + basePOValue; //Legacy forms used base po value so this line is taking care of old legacy forms.
                            numApprovedACS++;
                          }
                          //else if (formACSData.data[i]['request Status'] == 'Denied') {
                          //    numDeniedACS++;
                          //}
                        }
                        numACS++; //Calculate total number of ACS forms.
                      }
                    }

                    if (poLimit == invoiceTotal || invoiceTotal > poLimit) {
                      //If PO Limit and invoice totals are equal, then stop processing.
                      logger.info(
                        "Invoices for Fiscal Period is more than PO Limit"
                      );
                      outputCollection[0] =
                        "You have invoiced $" +
                        invoiceTotal +
                        " for this fiscal period.  You're PO Limit is currently $" +
                        poLimit +
                        ".  You need to submit a request for additional services to increase your PO Limit before you can submit additional invoices.";
                      outputCollection.push();
                      response.json(200, outputCollection);
                      return false;
                    }
                  } else {
                    logger.info("No ACS forms found");
                  }
                }

                //Get all requests for provider form to get relevant info for invoice.
                if (promiseProvider.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formProviderData = JSON.parse(promiseProvider.value);
                  if (
                    formProviderData.meta.status == "200" &&
                    formProviderData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Provider Forms found.");
                    //Load provider information for use when updating the invoice.
                    //Following are items returned from REST Query:  ProviderID,Provider Name,Provider Name Group,Address,City,State,ZipCode,Phone,Agency
                    providerUpdateData.provid =
                      formProviderData.data[0]["providerID"];
                    providerUpdateData.provname =
                      formProviderData.data[0]["provider Name"];
                    providerUpdateData.address =
                      formProviderData.data[0]["address"];
                    providerUpdateData.city = formProviderData.data[0]["city"];
                    providerUpdateData.state =
                      formProviderData.data[0]["state"];
                    providerUpdateData.zip =
                      formProviderData.data[0]["zipCode"];
                    providerUpdateData.phone =
                      formProviderData.data[0]["phone"];
                    providerUpdateData.agency =
                      formProviderData.data[0]["agency"];
                  } else {
                    logger.info("No Provider forms found");
                  }
                }

                //Get all questionnaires not invoiced in date range.
                if (promiseQuestionnaires.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formQuestNotInvData = JSON.parse(
                    promiseQuestionnaires.value
                  );
                  if (
                    formQuestNotInvData.meta.status == "200" &&
                    formQuestNotInvData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Questionnaire Forms found.");
                    //Following loop takes each form returned and loads it into an array for processing.
                    for (var i = 0; i < formQuestNotInvData.data.length; i++) {
                      /* Need the following to build an array of information to calculate billing.  Array held in invoiceRecordset.
                                                        FormType = Treatment
                                                        VisitType = Intake, InTreatment, EOT
                                                        ClientType = Patient, Affected Individual
                                                        VisitDate = date when any of the billable items occurred
                                                        includedInvoice = Yes or No
                                                        revisionID = id of form so update with invoice info can be applied.
                                                        invValue = value of the line item if included in invoice.
                                                        caseID = needed to determine if the record should be included in the invoice.
                                                        */
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formQuestNotInvData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Treatment"; //Load Formtype part of the object.  Treatment is for this type of form.
                      loadInvoiceArray.clienttype =
                        formQuestNotInvData.data[i]["type of Client"]; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formQuestNotInvData.data[i]["questionnaire Date"]; //Loading questionnaire date for sorting.
                      loadInvoiceArray.revisionid =
                        formQuestNotInvData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "No"; //Loading that this questionnaire not associated with an invoice.
                      loadInvoiceArray.caseid =
                        formQuestNotInvData.data[i]["caseID"]; //Load the case id for checking if the line item is billable.

                      //Load the type and value of the line item
                      if (
                        formQuestNotInvData.data[i]["questionnaire Type"] ==
                        "Intake"
                      ) {
                        loadInvoiceArray.visittype = "intake";
                        loadInvoiceArray.invValue = intakeValue;
                      } else if (
                        formQuestNotInvData.data[i]["questionnaire Type"] ==
                        "In-Treatment"
                      ) {
                        loadInvoiceArray.visittype = "intreatment";
                        loadInvoiceArray.invValue = intreatmentValue;
                      } else if (
                        formQuestNotInvData.data[i]["questionnaire Type"] ==
                        "End of Treatment"
                      ) {
                        loadInvoiceArray.visittype = "eot";
                        loadInvoiceArray.invValue = endoftreatValue;
                      }

                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Questionnaire forms found");
                  }
                }

                //Get all questionnaires already associated with invoice.
                if (promiseQuestInInvoice.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formQuestOnInvData = JSON.parse(
                    promiseQuestInInvoice.value
                  );
                  if (
                    formQuestOnInvData.meta.status == "200" &&
                    formQuestOnInvData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Questionnaires with Invoice found.");
                    for (var i = 0; i < formQuestOnInvData.data.length; i++) {
                      /* Need the following to build an array of information to calculate billing.  Array held in invoiceRecordset.
                                                        FormType = Treatment
                                                        VisitType = Intake, InTreatment, EOT
                                                        ClientType = Patient, Affected Individual
                                                        VisitDate = date when any of the billable items occurred
                                                        includedInvoice = Yes or No
                                                        revisionID = id of form so update with invoice info can be applied.
                                                        invValue = value of the line item if included in invoice.
                                                        */
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formQuestOnInvData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Treatment"; //Load Formtype part of the object.  Treatment is for this type of form.
                      loadInvoiceArray.clienttype =
                        formQuestOnInvData.data[i]["type of Client"]; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formQuestOnInvData.data[i]["questionnaire Date"]; //Loading questionnaire date for sorting.
                      loadInvoiceArray.revisionid =
                        formQuestOnInvData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "Yes"; //Loading that this questionnaire is associated with an invoice.
                      loadInvoiceArray.caseid =
                        formQuestOnInvData.data[i]["caseID"]; //Load the case id for checking if the line item is billable.

                      //Load the type and value of the line item
                      if (
                        formQuestOnInvData.data[i]["questionnaire Type"] ==
                        "Intake"
                      ) {
                        loadInvoiceArray.visittype = "intake";
                        loadInvoiceArray.invValue = intakeValue;
                      } else if (
                        formQuestOnInvData.data[i]["questionnaire Type"] ==
                        "In-Treatment"
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

                //Get client intake forms that should be billed.
                if (promiseClientIntake.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formIntakeData = JSON.parse(promiseClientIntake.value);
                  if (
                    formIntakeData.meta.status == "200" &&
                    formIntakeData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Intake forms found.");
                    var a = 0;
                    for (var i = 0; i < formIntakeData.data.length; i++) {
                      //Load into the array that will be searched.
                      intakeRecordset[a] = formIntakeData.data[i]["caseID"];
                      a = a + 1;
                    }
                    intakeRecordset.sort(function (a, b) {
                      return a - b;
                    }); //Sort the array for faster searching.
                  } else {
                    logger.info("No Intake forms found");
                  }
                }

                /* Need the following variables to build an array of information to calculate billing.  Array held in invoiceRecordset.
    
                                            The following is the format of the objects being loaded into invoiceRecordset.  Snippets of the following inserted wherever this is being loaded.
                                            FormType = Treatment, Group, Supervisor
                                            VisitType = Intake, Intreatment, EOT, Screening, Log
                                            Treatment - Intake, InTreatment, EOT
                                            Group - Screening, InTreatment, EOT
                                            Supervisor - Log
                                            ClientType = Patient, Affected Individual, NA
                                            VisitDate = date when any of the billable items occurred
                                            includedInvoice = Yes or No
                                            revisionID = id of form so update with invoice info can be applied.
                                            invValue = value of the line item if included in invoice.
                                            caseID = needed to determine if the record should be included in the invoice.
                                            */

                //Get all the group screening forms that are included.
                if (
                  promiseGroupScreenInc.state == "fulfilled" &&
                  groupScreeningBillable == 1
                ) {
                  //Clean results from the getForms call.
                  var formGroupScreenIncData = JSON.parse(
                    promiseGroupScreenInc.value
                  );
                  if (
                    formGroupScreenIncData.meta.status == "200" &&
                    formGroupScreenIncData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Screening with Invoice found.");
                    for (
                      var i = 0;
                      i < formGroupScreenIncData.data.length;
                      i++
                    ) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupScreenIncData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupScreenIncData.data[i]["screening Date"]; //Loading screening date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupScreenIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupScreenIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
                      loadInvoiceArray.visittype = "screening";
                      loadInvoiceArray.invValue = groupScreeningValue;
                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Group Screening with Invoice");
                  }
                }
                //Get all the group screening forms that are not included.
                if (
                  promiseGroupScreenNot.state == "fulfilled" &&
                  groupScreeningBillable == 1
                ) {
                  //Clean results from the getForms call.
                  var formGroupScreenNotData = JSON.parse(
                    promiseGroupScreenNot.value
                  );
                  if (
                    formGroupScreenNotData.meta.status == "200" &&
                    formGroupScreenNotData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Screening with Invoice found.");
                    for (
                      var i = 0;
                      i < formGroupScreenNotData.data.length;
                      i++
                    ) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupScreenNotData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupScreenNotData.data[i]["screening Date"]; //Loading screening date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupScreenNotData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "No"; //Loading that this screening is not associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupScreenNotData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
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
                  var formGroupIntreatIncData = JSON.parse(
                    promiseGroupIntreatInc.value
                  );
                  if (
                    formGroupIntreatIncData.meta.status == "200" &&
                    formGroupIntreatIncData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Intreat with Invoice found.");
                    for (
                      var i = 0;
                      i < formGroupIntreatIncData.data.length;
                      i++
                    ) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupIntreatIncData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupIntreatIncData.data[i]["session Date"]; //Loading session date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupIntreatIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupIntreatIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
                      loadInvoiceArray.visittype = "intreatment";
                      loadInvoiceArray.invValue = groupSessionValue;
                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Group Intreat with Invoice");
                  }
                }
                //Get all the group intreatment forms that are not included.
                if (promiseGroupIntreatNot.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupIntreatNotData = JSON.parse(
                    promiseGroupIntreatNot.value
                  );
                  if (
                    formGroupIntreatNotData.meta.status == "200" &&
                    formGroupIntreatNotData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group Intreat found.");
                    for (
                      var i = 0;
                      i < formGroupIntreatNotData.data.length;
                      i++
                    ) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupIntreatNotData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupIntreatNotData.data[i]["session Date"]; //Loading session date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupIntreatNotData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "No"; //Loading that this screening is associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupIntreatNotData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
                      loadInvoiceArray.visittype = "intreatment";
                      loadInvoiceArray.invValue = groupSessionValue;
                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Group Intreat found");
                  }
                }
                //Get all the group eot forms that are included.
                if (promiseGroupEOTInc.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupEOTIncData = JSON.parse(
                    promiseGroupEOTInc.value
                  );
                  if (
                    formGroupEOTIncData.meta.status == "200" &&
                    formGroupEOTIncData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group EOT with Invoice found.");
                    for (var i = 0; i < formGroupEOTIncData.data.length; i++) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupEOTIncData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupEOTIncData.data[i]["session Date"]; //Loading session date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupEOTIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupEOTIncData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
                      loadInvoiceArray.visittype = "eot";
                      loadInvoiceArray.invValue = groupEOTValue;
                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Group EOT with Invoice");
                  }
                }
                //Get all the group eot forms that not are included.
                if (promiseGroupEOTNot.state == "fulfilled") {
                  //Clean results from the getForms call.
                  var formGroupEOTNotData = JSON.parse(
                    promiseGroupEOTNot.value
                  );
                  if (
                    formGroupEOTNotData.meta.status == "200" &&
                    formGroupEOTNotData.data.length > 0
                  ) {
                    //Records returned when status = 200 and length says the number of records returned.
                    logger.info("Group EOT found.");
                    for (var i = 0; i < formGroupEOTNotData.data.length; i++) {
                      var loadInvoiceArray = {}; //used to load the array.
                      loadInvoiceArray.instancename =
                        formGroupEOTNotData.data[i]["instanceName"];
                      loadInvoiceArray.FormType = "Group"; //Load Formtype part of the object.  Group is for this type of form.
                      loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                      loadInvoiceArray.visitdate =
                        formGroupEOTNotData.data[i]["session Date"]; //Loading session date for sorting.
                      loadInvoiceArray.revisionid =
                        formGroupEOTNotData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                      loadInvoiceArray.includedInvoice = "No"; //Loading that this screening is not associated with an invoice.
                      loadInvoiceArray.caseid =
                        formGroupEOTNotData.data[i]["caseID"]; //Load the case id, no reason for group treatment.
                      loadInvoiceArray.visittype = "eot";
                      loadInvoiceArray.invValue = groupEOTValue;
                      invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                      invRecordControl = invRecordControl + 1; //increment the total record control variable.
                    }
                  } else {
                    logger.info("No Group EOT found");
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

                //Load supervisor logs if they are considered billable
                if (supervisorLogBillable == 1) {
                  //Get all the Supervisor Log forms that are included.
                  if (promiseSuperLogInc.state == "fulfilled") {
                    //Clean results from the getForms call.
                    var formSuperLogIncData = JSON.parse(
                      promiseSuperLogInc.value
                    );
                    if (
                      formSuperLogIncData.meta.status == "200" &&
                      formSuperLogIncData.data.length > 0
                    ) {
                      //Records returned when status = 200 and length says the number of records returned.
                      logger.info("Supervisor Logs with Invoice found.");
                      for (
                        var i = 0;
                        i < formSuperLogIncData.data.length;
                        i++
                      ) {
                        var loadInvoiceArray = {}; //used to load the array.
                        loadInvoiceArray.instancename =
                          formSuperLogIncData.data[i]["instanceName"];
                        loadInvoiceArray.FormType = "Supervisor"; //Load Formtype part of the object.  Group is for this type of form.
                        loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                        loadInvoiceArray.visitdate =
                          formSuperLogIncData.data[i]["meeting Date"]; //Loading session date for sorting.
                        loadInvoiceArray.revisionid =
                          formSuperLogIncData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                        loadInvoiceArray.includedInvoice = "Yes"; //Loading that this screening is associated with an invoice.
                        loadInvoiceArray.caseid = ""; //Load the case id, no reason for group treatment.
                        loadInvoiceArray.visittype = "log";
                        loadInvoiceArray.invValue = supervisorLogValue;
                        invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                        invRecordControl = invRecordControl + 1; //increment the total record control variable.
                      }
                    } else {
                      logger.info("No Supervisor Logs with Invoice");
                    }
                  }
                  //Get all the group eot forms that not are included.
                  if (promiseSuperLogNot.state == "fulfilled") {
                    //Clean results from the getForms call.
                    var formSuperLogNotData = JSON.parse(
                      promiseSuperLogNot.value
                    );
                    if (
                      formSuperLogNotData.meta.status == "200" &&
                      formSuperLogNotData.data.length > 0
                    ) {
                      //Records returned when status = 200 and length says the number of records returned.
                      logger.info("Supervisor Logs found to be Invoice.");
                      for (
                        var i = 0;
                        i < formSuperLogNotData.data.length;
                        i++
                      ) {
                        var loadInvoiceArray = {}; //used to load the array.
                        loadInvoiceArray.instancename =
                          formSuperLogNotData.data[i]["instanceName"];
                        loadInvoiceArray.FormType = "Supervisor"; //Load Formtype part of the object.  Group is for this type of form.
                        loadInvoiceArray.clienttype = "NA"; //Loading the client type.
                        loadInvoiceArray.visitdate =
                          formSuperLogNotData.data[i]["meeting Date"]; //Loading session date for sorting.
                        loadInvoiceArray.revisionid =
                          formSuperLogNotData.data[i]["revisionId"]; //Loading the revisionID of the form so the form can be updated with invoice info.
                        loadInvoiceArray.includedInvoice = "No"; //Loading that this screening is associated with an invoice.
                        loadInvoiceArray.caseid = ""; //Load the case id, no reason for group treatment.
                        loadInvoiceArray.visittype = "log";
                        loadInvoiceArray.invValue = supervisorLogValue;
                        invoiceRecordset[invRecordControl] = loadInvoiceArray; //Assign the object to a location in the array
                        invRecordControl = invRecordControl + 1; //increment the total record control variable.
                      }
                    } else {
                      logger.info("No Supervisor Logs found to be Invoice.");
                    }
                  }
                }

                /*   *********************************************************************************************
    
                                            Invoice Processing.  All records to be processed should already be loaded by this time.
    
                                            **************************************************************************************************/
                //Sort the combined recordset to order them for processing.
                invoiceRecordset.sort(function (a, b) {
                  //Function used to compare two values.  Comparing part of the object stored in each array location.
                  var firstDate = Date.parse(a.visitdate);
                  var secondDate = Date.parse(b.visitdate);
                  return firstDate - secondDate; //Cause the sort to be latest date first.
                });

                //Commenting out the following.  It is catching the limits before any generation occurs.
                // Similar code is found above.  Placing this here to catch in case it has not been caught previously.

                if (
                  Number(poLimit) < Number(invoiceTotal) ||
                  Number(poLimit) == Number(invoiceTotal)
                ) {
                  logger.info(
                    "Fiscal Invoice total is at or greater than PO Limit."
                  );
                  outputCollection[0] =
                    "The invoices you have submitted for this fiscal year are equal to $" +
                    invoiceTotal +
                    "  This is equal to or greater than your PO Limit of $" +
                    poLimit +
                    ".  A request for additional service needs to be submitted to increase your PO Limit.";
                  outputCollection.push();
                  response.json(200, outputCollection);
                  return false;
                }

                /* The array is organized inthe following way..  Array held in invoiceRecordset.
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

                //The following is a set of variables used for the returning of data to the invoice form.
                var patientIntakeVisits = 0;
                var patientIntakeUnit = intakeValue;
                var patientIntreatVisits = 0;
                var patientIntreatUnit = intreatmentValue;
                var patientEotVisits = 0;
                var patientEotUnit = endoftreatValue;
                var affectIntakeVisits = 0;
                var affectIntakeUnit = intakeValue;
                var affectIntreatVisits = 0;
                var affectIntreatUnit = intreatmentValue;
                var affectEotVisits = 0;
                var affectEotUnit = endoftreatValue;
                var newInvoiceLevel = invoiceTotal;
                var groupScreeningVisits = 0;
                var groupScreeningUnit = groupScreeningValue;
                var groupIntreatVisits = 0;
                var groupIntreatUnits = groupSessionValue;
                var groupEOTVisits = 0;
                var groupEOTUnits = groupEOTValue;
                var supervisorLogVisits = 0;
                var supervisorLogUnits = supervisorLogValue;
                var processLoopControl = 0; //Use this variable to control the processing loop qty.  This should help determine number of times promises communicate back and when to communicate to client.
                var overPOLimitFlag = 0; //Used to tell system that PO Limit was reached.

                if (invRecordControl > 0) {
                  //Following loop goes through each record and determines the status of an item in the array. Then it adds the item to the invoice.
                  for (var i = 0; i < invRecordControl; i++) {
                    var formTemplateID = "";
                    var formRevID = "";
                    var formRelateDocID = "";
                    var communicationSuccess = 0;
                    var communicationFail = 0;
                    var updateLineItem = 0; //Determines if the rest call should occur to update the form.  0 = no, 1 = yes.
                    var updateRelationship = 0; //Determines if the form relationship should be created or removed with the invoice.  0 = do nothing, 1 = create, 2 = remove
                    var formClientData = {}; //Contains the information that will be used for the update if needed.

                    formRevID = invoiceRecordset[i].revisionid; //Loading the GUID that represents the revision of the form record to be updated.
                    formRelateDocID = invoiceRecordset[i].instancename;

                    //Get the FormTemplateID assigned for updating the form.
                    if (invoiceRecordset[i].FormType == "Treatment") {
                      formTemplateID = formIDTreatmentQuestionnaire; //Loading the GUID that is the ID of the Treatment Questionnaire Template.
                    } else if (invoiceRecordset[i].FormType == "Group") {
                      if (invoiceRecordset[i].visittype == "screening") {
                        formTemplateID = formIDGroupTreatmentScreening; //Loading the GUID that is the ID of the Group Screening Template.
                      } else if (
                        invoiceRecordset[i].visittype == "intreatment"
                      ) {
                        formTemplateID = formIDGroupInTreatment; //Loading the GUID that is the ID of the Group Intreatment Questionnaire Template.
                      } else if (invoiceRecordset[i].visittype == "eot") {
                        formTemplateID = formIDGroupEndofTreatment; //Loading the GUID that is the ID of the Group EOT Template.
                      }
                    } else if (invoiceRecordset[i].FormType == "Supervisor") {
                      formTemplateID = formIDSupervisorLog; //Loading the GUID that is the ID of the supervisor log form template.
                    }

                    //Calculate the possible new invoice level
                    var tempInvoiceLevel =
                      newInvoiceLevel + Number(invoiceRecordset[i].invValue); //Increment the invoice value by the value recorded.

                    processLoopControl = processLoopControl + 1;
                    //Determine if line item should be added to the invoice, updated as not part of invoice or left alone.
                    if (
                      invoiceRecordset[i].includedInvoice == "Yes" &&
                      (Date.parse(invoiceRecordset[i].visitdate) <
                        Date.parse(formBeginRange) ||
                        Date.parse(invoiceRecordset[i].visitdate) >
                          Date.parse(formEndRange))
                    ) {
                      updateLineItem = 1;
                      updateRelationship = 2; //Remove
                      formClientData["Invoice Date"] = todayDate; //Load items to update invoice as being included.
                      formClientData["Invoice Number"] = "";
                      formClientData["Invoice_Identifier"] = "";
                    }
                    //Following will take Outpatient Treatment questionnaires and see if they are on the list of billable cases.  If none is found (-1), then it will mark as not applicable.
                    else if (
                      invoiceRecordset[i].FormType == "Treatment" &&
                      FindVal(intakeRecordset, invoiceRecordset[i].caseid) == -1
                    ) {
                      updateLineItem = 1;
                      updateRelationship = 0; //Do nothing as it is not billable.
                      formClientData["Invoice Date"] = todayDate; //Load items to update invoice as being included.
                      formClientData["Invoice Number"] = "Not Applicable";
                      formClientData["Invoice_Identifier"] = "Not Applicable";
                      formClientData["Invoiced"] = true;
                    }
                    //Following works with items when invoice level would be pushed beyond PO Limit with this line item and it was previously included in the invoice.  It clears out the association.
                    else if (
                      tempInvoiceLevel > poLimit &&
                      invoiceRecordset[i].includedInvoice == "Yes"
                    ) {
                      updateLineItem = 1;
                      updateRelationship = 2; //Remove
                      overPOLimitFlag = 1;
                      //processLoopControl = processLoopControl + 1;
                      formClientData["Invoice Date"] = todayDate; //Load items to update invoice as being included.
                      formClientData["Invoice Number"] = "";
                      formClientData["Invoice_Identifier"] = "";
                    } else if (
                      tempInvoiceLevel > poLimit &&
                      invoiceRecordset[i].includedInvoice == "No"
                    ) {
                      //UpdateLineItem is already set to zero from when it was declared.  Do nothing as this line items is not included in invoice and it is currently over the PO Limit.
                      //Update relationship does not need to be followed either.
                      if (overPOLimitFlag == 0) {
                        logger.info(
                          "PO LIMIT OVER.  PO LIMIT IS " +
                            poLimit +
                            "AND INVOICE LEVEL WOULD MAKE IT " +
                            tempInvoiceLevel
                        );
                      }
                      overPOLimitFlag = 1;
                      //processLoopControl = processLoopControl + 1;
                    }
                    //All of the above filtering out criteria has been processed, the following can include the line item.
                    else if (
                      tempInvoiceLevel < poLimit ||
                      tempInvoiceLevel == poLimit
                    ) {
                      updateLineItem = 1;
                      updateRelationship = 1; //Create Relationship
                      //processLoopControl = processLoopControl + 1;
                      //Update the new invoice level as this can be included.
                      newInvoiceLevel =
                        newInvoiceLevel + Number(invoiceRecordset[i].invValue); //Increment the invoice value by the value recorded as it will not take value over PO Limit.

                      //Load up the number of visits for the invoice calculation.
                      if (invoiceRecordset[i].FormType == "Treatment") {
                        //following if/else statements incrementing counts for the type of visit and type of client respectively.
                        if (
                          invoiceRecordset[i].visittype == "intake" &&
                          invoiceRecordset[i].clienttype == "1"
                        ) {
                          patientIntakeVisits = patientIntakeVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "intreatment" &&
                          invoiceRecordset[i].clienttype == "1"
                        ) {
                          patientIntreatVisits = patientIntreatVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "eot" &&
                          invoiceRecordset[i].clienttype == "1"
                        ) {
                          patientEotVisits = patientEotVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "intake" &&
                          invoiceRecordset[i].clienttype == "2"
                        ) {
                          affectIntakeVisits = affectIntakeVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "intreatment" &&
                          invoiceRecordset[i].clienttype == "2"
                        ) {
                          affectIntreatVisits = affectIntreatVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "eot" &&
                          invoiceRecordset[i].clienttype == "2"
                        ) {
                          affectEotVisits = affectEotVisits + 1;
                        }
                      } else if (invoiceRecordset[i].FormType == "Group") {
                        if (invoiceRecordset[i].visittype == "screening") {
                          groupScreeningVisits = groupScreeningVisits + 1;
                        } else if (
                          invoiceRecordset[i].visittype == "intreatment"
                        ) {
                          groupIntreatVisits = groupIntreatVisits + 1;
                        } else if (invoiceRecordset[i].visittype == "eot") {
                          groupEOTVisits = groupEOTVisits + 1;
                        }
                      } else if (invoiceRecordset[i].FormType == "Supervisor") {
                        supervisorLogVisits = supervisorLogVisits + 1;
                      }
                      formClientData["Invoice Date"] = todayDate; //Load items to update invoice as being included.
                      formClientData["Invoice Number"] =
                        formInvoiceNumber.value;
                      formClientData["Invoice_Identifier"] = invFormID.value;
                    }

                    //if (updateLineItem == 1) {

                    //Following promise is to control the updates of any billable form passed to it.
                    Q.allSettled([
                      ManageRelationships(
                        invoiceFormGUID.value,
                        formRelateDocID,
                        updateRelationship
                      ),
                      UpdateForm(formClientData, formTemplateID, formRevID),
                    ]).then(function (promises) {
                      var promiseFollowupResults = promises[1];
                      var promiseRelateItems = promises[0];

                      var commUpdateForms = 0;
                      var commManageRelate = 0;

                      if (
                        promiseFollowupResults.state == "fulfilled" &&
                        promiseFollowupResults.value == "Updated"
                      ) {
                        logger.info("Billable Form Updated");
                        commUpdateForms = 1; //form update was successful.
                      } else if (promiseFollowupResults.state == "rejected") {
                        commUpdateForms = 2; //form update failed.
                      }

                      if (
                        promiseRelateItems.state == "fulfilled" &&
                        (promiseRelateItems.value == "Relation Removed" ||
                          promiseRelateItems.value ==
                            "Relationship Does not Exist" ||
                          promiseRelateItems.value == "Relation Created" ||
                          promiseRelateItems.value ==
                            "Relationship Already Exists" ||
                          promiseRelateItems.value == "Update Not Needed")
                      ) {
                        commManageRelate = 1;
                      } else {
                        commManageRelate = 2;
                      }

                      if (commUpdateForms == 1 && commManageRelate == 1) {
                        logger.info("Billable Form Updated and Related");
                        communicationSuccess = communicationSuccess + 1; //Increment if the form update was successful.
                      } else {
                        communicationFail = communicationFail + 1; //Increment if the form update failed.
                      }

                      //When number of communications back from form update matches the number of times the form was updated, then communicate back to client.
                      if (i == invRecordControl) {
                        if (
                          communicationFail + communicationSuccess ==
                          processLoopControl
                        ) {
                          var formReturnData = {};

                          //Following are items to pass back to client to update the form.
                          formReturnData.patientIntakeVisits =
                            patientIntakeVisits;
                          formReturnData.patientIntakeUnit = patientIntakeUnit;
                          formReturnData.patientIntreatVisits =
                            patientIntreatVisits;
                          formReturnData.patientIntreatUnit =
                            patientIntreatUnit;
                          formReturnData.patientEotVisits = patientEotVisits;
                          formReturnData.patientEotUnit = patientEotUnit;
                          formReturnData.affectIntakeVisits =
                            affectIntakeVisits;
                          formReturnData.affectIntakeUnit = affectIntakeUnit;
                          formReturnData.affectIntreatVisits =
                            affectIntreatVisits;
                          formReturnData.affectIntreatUnit = affectIntreatUnit;
                          formReturnData.affectEotVisits = affectEotVisits;
                          formReturnData.affectEotUnit = affectEotUnit;
                          formReturnData.groupScreenVisits =
                            groupScreeningVisits;
                          formReturnData.groupScreenUnit = groupScreeningUnit;
                          formReturnData.groupIntreatVisits =
                            groupIntreatVisits;
                          formReturnData.groupIntreatUnit = groupIntreatUnits;
                          formReturnData.groupEOTVisits = groupEOTVisits;
                          formReturnData.groupEOTUnit = groupEOTUnits;
                          formReturnData.supervisorLogVisits =
                            supervisorLogVisits;
                          formReturnData.supervisorLogUnit = supervisorLogUnits;
                          formReturnData.newInvoiceLevel = newInvoiceLevel;
                          formReturnData.provid = providerUpdateData.provid;
                          formReturnData.provname = providerUpdateData.provname;
                          formReturnData.address = providerUpdateData.address;
                          formReturnData.city = providerUpdateData.city;
                          formReturnData.state = providerUpdateData.state;
                          formReturnData.zip = providerUpdateData.zip;
                          formReturnData.phone = providerUpdateData.phone;
                          formReturnData.agency = providerUpdateData.agency;

                          outputCollection[1] = formReturnData;

                          //Measure if there were any communication failures.
                          if (communicationFail == 0) {
                            if (overPOLimitFlag == 1) {
                              logger.info(
                                "Invoices for Fiscal Period is more than PO Limit, not all billable items included"
                              );
                              outputCollection[0] =
                                "Total value of invoices for the Fiscal Period have reached or are at the point where adding the next billable items will exceed the PO Limit.  Not all billable items were included.  Request a higher PO Limit by filling in a Request for Additional Services form.";
                            } else {
                              logger.info(
                                "All billable questionnaires included successfully."
                              );
                              outputCollection[0] =
                                "All billable questionnaires included successfully.";
                            }
                            outputCollection.push();
                            response.json(200, outputCollection);
                            return false;
                          } else {
                            //Choosing to communicate a failure and force regeneration.
                            logger.info(
                              "Errors in updating billable questionnaires."
                            );
                            outputCollection[0] =
                              "Errors in updating billable questionnaires.";
                            outputCollection.push();
                            response.json(200, outputCollection);
                            return false;
                          }
                        }
                      }
                    });

                    //}
                    // Not putting an else here because if this code has been entered, the promise should be taking care of ending the process.  Code in place higher to stop invoices above PO Limits.
                  }
                } else {
                  var formReturnData = {};
                  //Following are items to pass back to client to update the form.
                  formReturnData.patientIntakeVisits = patientIntakeVisits;
                  formReturnData.patientIntakeUnit = patientIntakeUnit;
                  formReturnData.patientIntreatVisits = patientIntreatVisits;
                  formReturnData.patientIntreatUnit = patientIntreatUnit;
                  formReturnData.patientEotVisits = patientEotVisits;
                  formReturnData.patientEotUnit = patientEotUnit;
                  formReturnData.affectIntakeVisits = affectIntakeVisits;
                  formReturnData.affectIntakeUnit = affectIntakeUnit;
                  formReturnData.affectIntreatVisits = affectIntreatVisits;
                  formReturnData.affectIntreatUnit = affectIntreatUnit;
                  formReturnData.affectEotVisits = affectEotVisits;
                  formReturnData.affectEotUnit = affectEotUnit;
                  formReturnData.groupScreenVisits = groupScreeningVisits;
                  formReturnData.groupScreenUnit = groupScreeningUnit;
                  formReturnData.groupIntreatVisits = groupIntreatVisits;
                  formReturnData.groupIntreatUnit = groupIntreatUnits;
                  formReturnData.groupEOTVisits = groupEOTVisits;
                  formReturnData.groupEOTUnit = groupEOTUnits;
                  formReturnData.supervisorLogVisits = supervisorLogVisits;
                  formReturnData.supervisorLogUnit = supervisorLogUnits;
                  formReturnData.newInvoiceLevel = newInvoiceLevel;
                  logger.info("No items to load for invoicing.");
                  outputCollection[0] =
                    "No billable items were available to add to the invoice.";
                  outputCollection[1] = formReturnData;
                  outputCollection.push();
                  response.json(200, outputCollection);
                  return false;
                }
              } catch (ex) {
                logger.info(ex);
              }
            });
          }
        } else {
          logger.info("Selected Provider form not found");
          outputCollection[0] =
            "The provider (" +
            whoIsProvider +
            ") was not found.  Users submitting this form must be a provider. If you are a provider please try to resubmit it or contact OPG.";
          outputCollection.push();
          response.json(200, outputCollection);
          return false;
        }
      }
    } catch (ex) {
      logger.info(ex);
    }
  });

  //Function used to find values in the client intake array.
  var FindVal = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        return i;
      }
    }
    return -1;
  };

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

  var ManageRelationships = function (
    thisFormID,
    formDocIDToManageRelationship,
    updateRelationship
  ) {
    var Q = require("q");
    var deferred = Q.defer();
    //Do Nothing
    if (updateRelationship == 0) {
      deferred.resolve("Update Not Needed");
    }
    //Create Relationship
    else if (updateRelationship == 1) {
      Q.allSettled([
        vvClient.forms.relateFormByDocId(
          thisFormID,
          formDocIDToManageRelationship
        ),
      ]).then(function (promises) {
        var promiseFormRelate = promises[0];

        try {
          if (promiseFormRelate.state == "fulfilled") {
            var formResultData = JSON.parse(promiseFormRelate.value);
            if (
              formResultData.meta.status == "success" ||
              formResultData.meta.status == "200"
            ) {
              logger.info("Relation Created");
              deferred.resolve("Relation Created");
            } else if (formResultData.meta.status == "400") {
              logger.info("Form Not Found");
              deferred.resolve("Form Not Found");
            } else if (formResultData.meta.status == "404") {
              logger.info("Relationship Already Exists");
              deferred.resolve("Relationship Already Exists");
            } else {
              logger.info("Form not filled in");
              deferred.resolve(formResultData.meta.status);
            }
          } else {
            deferred.resolve("unfulfilled");
          }
        } catch (ex) {
          logger.info(ex);
          deferred.reject(ex);
        }
      });
    }
    //Remove Relationship
    else if (updateRelationship == 2) {
      Q.allSettled([
        vvClient.forms.unrelateFormByDocId(
          thisFormID,
          formDocIDToManageRelationship
        ),
      ]).then(function (promises) {
        var promiseFormRelate = promises[0];

        try {
          if (promiseFormRelate.state == "fulfilled") {
            var formResultData = JSON.parse(promiseFormRelate.value);
            if (
              formResultData.meta.status == "success" ||
              formResultData.meta.status == "200"
            ) {
              logger.info("Relation Removed");
              deferred.resolve("Relation Removed");
            } else if (formResultData.meta.status == "400") {
              logger.info("Form Not Found");
              deferred.resolve("Form Not Found");
            } else if (formResultData.meta.status == "404") {
              logger.info("Relationship Already Exists");
              deferred.resolve("Relationship Does not Exist");
            } else {
              logger.info("Form not filled in");
              deferred.resolve(formResultData.meta.status);
            }
          } else {
            deferred.resolve("unfulfilled");
          }
        } catch (ex) {
          logger.info(ex);
          deferred.reject(ex);
        }
      });
    }

    return deferred.promise;
  };
};
