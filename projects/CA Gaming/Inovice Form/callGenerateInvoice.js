/* eslint-disable no-undef */
VV.Form.ShowLoadingPanel();

if (typeof VV.Form.Template.FormVal == "undefined") {
  VV.Form.Template.SetupTemplateVariables();
}

if (VV.Form.GetFieldValue("Invoice_Identifier") == "") {
  //Set the value of the GUID for the revision when the first generation occurs.  This is to update questionnaires with this identifier.
  VV.Form.SetFieldValue("Invoice_Identifier", VV.Form.DataID);
}

VV.Form.Template.FormVal[0] = 1;
VV.Form.Template.FormVal[1] = 0;
VV.Form.Template.FormVal[2] = 0;

VV.Form.Template.FormValidation();

if (VV.Form.Template.FormVal[2] == 1) {
  VV.Form.Global.DisplayMessaging(
    "An error was encountered.  Highlight over the red icons to determine the issues with the invoice data."
  );
  return false;
}

VV.Form.DoAjaxFormSave();

var callGenerateInvoice = function () {
  var apiVer = "v1";
  var formData = VV.Form.getFormDataCollection();
  var formDataLength = formData.length;
  // Acquiring and pushing the logged in user and site into the array of fields.
  var loggedInUser = {};
  loggedInUser.id = "LOGGEDINUSER";
  loggedInUser.name = "LOGGEDINUSER";
  loggedInUser.value = VV.Form.FormUserID;
  formData.push(loggedInUser);
  var loggedInUser = {};
  loggedInUser.id = "USERSITE";
  loggedInUser.name = "USERSITE";
  loggedInUser.value = VV.Form.FormUserSiteID;
  formData.push(loggedInUser);
  // Acquiring and pushing the FormID into the array of fields.
  var FormInfo = {};
  FormInfo.id = "FORMID";
  FormInfo.name = "FORMID";
  FormInfo.value = VV.Form.DataID;
  formData.push(FormInfo);
  var data = JSON.stringify(formData);
  var requestObject = $.ajax({
    type: "POST",
    url:
      VV.BaseAppUrl +
      "api/" +
      apiVer +
      "/" +
      VV.CustomerAlias +
      "/" +
      VV.CustomerDatabaseAlias +
      "/scripts?name=InvoiceGenerate",
    contentType: "application/json; charset=utf-8",
    data: data,
    success: "",
    error: "",
  });

  return requestObject;
};

$.when(callGenerateInvoice()).always(function (arg1) {
  VV.Form.HideLoadingPanel();
  if (typeof arg1.status != "undefined") {
    messageData =
      "A status code of " +
      arg1.status +
      " returned from the server.  There is a communication problem with the CalGETS web servers.  If this continues, please contact Office of Problem Gaming and communicate to them this message and where it occured.";
  } else if (typeof arg1.statusCode != "undefined") {
    messageData =
      "A status code of " +
      arg1.statusCode +
      " with a message of '" +
      arg1.errorMessages[0].message +
      "' returned from the server.  This may mean that the servers to run the business logic are not available.";
  } else if (typeof arg1.meta.status != "undefined") {
    if (arg1.meta.status == "200") {
      if (typeof arg1.data[0] != "undefined") {
        if (
          arg1.data[0] ==
            "All billable questionnaires included successfully." ||
          arg1.data[0] ==
            "Total value of invoices for the Fiscal Period have reached or are at the point where adding the next billable items will exceed the PO Limit.  Not all billable items were included.  Request a higher PO Limit by filling in a Request for Additional Services form."
        ) {
          messageData = arg1.data[0] + "\n";
          //Following are items associated with Affected Indivdiuals and Outpatient billing.
          VV.Form.SetFieldValue(
            "Affected_EOT UnitAmt",
            arg1.data[1].affectEotUnit
          );
          VV.Form.SetFieldValue(
            "Affected_EOT Visits",
            arg1.data[1].affectEotVisits
          );
          VV.Form.SetFieldValue(
            "Affected_Intake UnitAmt",
            arg1.data[1].affectIntakeUnit
          );
          VV.Form.SetFieldValue(
            "Affected_Intake Visits",
            arg1.data[1].affectIntakeVisits
          );
          VV.Form.SetFieldValue(
            "Affected_1to6 UnitAmt",
            arg1.data[1].affectIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Affected_1to6 Visits",
            arg1.data[1].affectIntreatVisits
          );

          //Following are items associated with Patient and Outpatient billing.
          VV.Form.SetFieldValue(
            "Patient_EOT UnitAmt",
            arg1.data[1].patientEotUnit
          );
          VV.Form.SetFieldValue(
            "Patient_EOT Visits",
            arg1.data[1].patientEotVisits
          );
          VV.Form.SetFieldValue(
            "Patient_Intake UnitAmt",
            arg1.data[1].patientIntakeUnit
          );
          VV.Form.SetFieldValue(
            "Patient_Intake Visits",
            arg1.data[1].patientIntakeVisits
          );
          VV.Form.SetFieldValue(
            "Patient_1to6 UnitAmt",
            arg1.data[1].patientIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Patient_1to6 Visits",
            arg1.data[1].patientIntreatVisits
          );

          //Following is associated with Group Treatment billing
          VV.Form.SetFieldValue(
            "Group_Screen Visits",
            arg1.data[1].groupScreenVisits
          );
          VV.Form.SetFieldValue(
            "Group_Screen UnitAmt",
            arg1.data[1].groupScreenUnit
          );
          VV.Form.SetFieldValue(
            "Group_Session Visits",
            arg1.data[1].groupIntreatVisits
          );
          VV.Form.SetFieldValue(
            "Group_Sessions UnitAmt",
            arg1.data[1].groupIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Group_EOT Visits",
            arg1.data[1].groupEOTVisits
          );
          VV.Form.SetFieldValue("Group_EOT UnitAmt", arg1.data[1].groupEOTUnit);

          //Following are associated with Supervisor Billing
          VV.Form.SetFieldValue(
            "Supervisor Visits",
            arg1.data[1].supervisorLogVisits
          );
          VV.Form.SetFieldValue(
            "Supervisor UnitAmt",
            arg1.data[1].supervisorLogUnit
          );

          //Following loads the provider information into the invoice.
          VV.Form.SetFieldValue("ProviderID", arg1.data[1].provid);
          VV.Form.SetFieldValue("Provider Name", arg1.data[1].provname);
          VV.Form.SetFieldValue("Address", arg1.data[1].address);
          VV.Form.SetFieldValue("City", arg1.data[1].city);
          VV.Form.SetFieldValue("State", arg1.data[1].state);
          VV.Form.SetFieldValue("ZipCode", arg1.data[1].zip);
          VV.Form.SetFieldValue("Phone", arg1.data[1].phone);
          VV.Form.SetFieldValue("Agency", arg1.data[1].agency);
          VV.Form.SetFieldValue("Status", "Waiting for Submission");

          VV.Form.DoPostbackSave();
        } else if (
          arg1.data[0] ==
          "No billable items were available to add to the invoice."
        ) {
          messageData = arg1.data[0] + "\n";
          //Following are items associated with Affected Indivdiuals and Outpatient billing.
          VV.Form.SetFieldValue(
            "Affected_EOT UnitAmt",
            arg1.data[1].affectEotUnit
          );
          VV.Form.SetFieldValue(
            "Affected_EOT Visits",
            arg1.data[1].affectEotVisits
          );
          VV.Form.SetFieldValue(
            "Affected_Intake UnitAmt",
            arg1.data[1].affectIntakeUnit
          );
          VV.Form.SetFieldValue(
            "Affected_Intake Visits",
            arg1.data[1].affectIntakeVisits
          );
          VV.Form.SetFieldValue(
            "Affected_1to6 UnitAmt",
            arg1.data[1].affectIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Affected_1to6 Visits",
            arg1.data[1].affectIntreatVisits
          );

          //Following are items associated with Patient and Outpatient billing.
          VV.Form.SetFieldValue(
            "Patient_EOT UnitAmt",
            arg1.data[1].patientEotUnit
          );
          VV.Form.SetFieldValue(
            "Patient_EOT Visits",
            arg1.data[1].patientEotVisits
          );
          VV.Form.SetFieldValue(
            "Patient_Intake UnitAmt",
            arg1.data[1].patientIntakeUnit
          );
          VV.Form.SetFieldValue(
            "Patient_Intake Visits",
            arg1.data[1].patientIntakeVisits
          );
          VV.Form.SetFieldValue(
            "Patient_1to6 UnitAmt",
            arg1.data[1].patientIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Patient_1to6 Visits",
            arg1.data[1].patientIntreatVisits
          );

          //Following is associated with Group Treatment billing
          VV.Form.SetFieldValue(
            "Group_Screen Visits",
            arg1.data[1].groupScreenVisits
          );
          VV.Form.SetFieldValue(
            "Group_Screen UnitAmt",
            arg1.data[1].groupScreenUnit
          );
          VV.Form.SetFieldValue(
            "Group_Session Visits",
            arg1.data[1].groupIntreatVisits
          );
          VV.Form.SetFieldValue(
            "Group_Sessions UnitAmt",
            arg1.data[1].groupIntreatUnit
          );
          VV.Form.SetFieldValue(
            "Group_EOT Visits",
            arg1.data[1].groupEOTVisits
          );
          VV.Form.SetFieldValue("Group_EOT UnitAmt", arg1.data[1].groupEOTUnit);

          //Following are associated with Supervisor Billing
          VV.Form.SetFieldValue(
            "Supervisor Visits",
            arg1.data[1].supervisorLogVisits
          );
          VV.Form.SetFieldValue(
            "Supervisor UnitAmt",
            arg1.data[1].supervisorLogUnit
          );
        } else {
          messageData = arg1.data[0] + "\n";
        }
      } else {
        messageData = arg1.data.error + "\n";
        //VV.Form.Global.DisplayMessaging(messageData);
      }
    }
  } else {
    messageData = "Communication codes from the server were unhandled.";
  }
  VV.Form.Global.DisplayMessaging(messageData);
});
