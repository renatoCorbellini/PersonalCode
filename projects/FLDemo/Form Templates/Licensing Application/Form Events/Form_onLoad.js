// Modal Section
VV.Form.Global.LoadModalSettings();
VV.Form.Global.MessageModal(true);

setTimeout(function () {
  // Add userId to the HiddenID select and then selects it
  var id = VV.Form.FormUserID;
  //var id = 'jason.hatch+09282021@visualvault.com';
  VV.Form.SetFieldValue("User ID", id, true);

  // If the user has an Individual Record ID sets it in the "Individual ID" field
  VV.Form.Template.CallToLibUserLookUpLoggedInUser();
}, 500);

//CloseButtonFormat hides the VV close button, changes the form close button colors, and makes them clickable even in read-only mode.
//This function must be called on Load and in EventsEnd.
//VV.Form.Global.CloseButtonFormat();

// Default value for paying
VV.Form.SetFieldValue("Total Owed", "100", false);

// Load Payment Modals
VV.Form.Global.CreatePaymentModal();

// Validation Modal
VV.Form.Global.ValidationCreateModal();
