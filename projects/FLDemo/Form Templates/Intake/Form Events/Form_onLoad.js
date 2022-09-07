// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.MessageModal(true);

let userGroups = VV.Form.FormUserGroups;

setTimeout(function () {
  // Add userId to the HiddenID select and then selects it
  var id = VV.Form.FormUserID;
  //var id = 'jason.hatch+09282021@visualvault.com';
  VV.Form.SetFieldValue("User ID", id, true);

  if (userGroups.includes("Citizens")) {
    // Populate Email and Phone from Individual Record
    VV.Form.Template.FillIndividualRecordInformation();

    // If the user has an Individual Record ID sets it in the "Individual ID" field
    VV.Form.Template.CallToLibUserLookUpLoggedInUser();
  }
}, 500);

//CloseButtonFormat hides the VV close button, changes the form close button colors, and makes them clickable even in read-only mode.
//This function must be called on Load and in EventsEnd.
//VV.Form.Global.CloseButtonFormat();

// Start date
var date = VV.Form.GetFieldValue("Start Date");

if (!date) {
  VV.Form.SetFieldValue("Start Date", new Date());
}
