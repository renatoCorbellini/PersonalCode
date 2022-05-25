VV.Form.ShowLoadingPanel();

if (typeof VV.Form.Template.FormVal == "undefined") {
  VV.Form.Template.SetupTemplateVariables();
}

var callApproveInvoice = function () {
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
      "/scripts?name=InvoiceApprove",
    contentType: "application/json; charset=utf-8",
    data: data,
    success: "",
    error: "",
  });

  return requestObject;
};

$.when(callApproveInvoice()).always(function (arg1) {
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
          arg1.data[0] == "All billable questionnaires updated successfully." ||
          arg1.data[0] ==
            "Invoices for Fiscal Period is more than PO Limit, not all invoices included"
        ) {
          messageData = arg1.data[0] + "\n";
          VV.Form.SetFieldValue("Status", "Approved");
          VV.Form.SetFieldValue("Approval Date", Date());
          VV.Form.DoPostbackSave();
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
