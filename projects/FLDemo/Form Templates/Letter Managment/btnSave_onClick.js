// btnSave script for Letter Management
// const today = new Date().toISOString();
// const dateCreated = VV.Form.GetFieldValue('Date Created');

// if (dateCreated == '') {
//     VV.Form.SetFieldValue('Date Created', today);
// }

if (VV.Form.IsFormSaved) {
  VV.Form.SetFieldValue("Form Saved", "True");
}
VV.Form.SetFieldValue("Form Saved", "True");

VV.Form.DoAjaxFormSave().then(function () {
  if (window.opener && window.opener.VV) {
    let parentFormID = window.opener.VV.Form.GetFieldValue("Inspection ID");
    let parentFormIDLicense = window.opener.VV.Form.GetFieldValue("Record ID");
    // reload RRC for parent form
    if (parentFormID.startsWith("Inspection-")) {
      window.opener.VV.Form.ReloadRepeatingRowControl("RRCLetters");
    } else if (parentFormIDLicense.startsWith("LICENSE_APP-")) {
      window.opener.VV.Form.ReloadRepeatingRowControl("RRC Letters");
    }

    // save parent form
    window.opener.VV.Form.DoAjaxFormSave();

    //VV.Form.Template.RelateToLetterManagement();
  }
});
