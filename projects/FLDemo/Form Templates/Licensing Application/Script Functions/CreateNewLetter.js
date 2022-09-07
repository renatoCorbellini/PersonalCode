//AddLetter on License Application

//Template GUID goes here
let templateId = "8dd5872e-771a-ed11-a9e0-d41c08021e3f";

//Form fields go here
let LicenseApplicationID = VV.Form.GetFieldValue("Record ID");

//Do ajax save before opening new form to keep this current form on the tab it's on.

if (VV.Form.Template.FormValidation()) {
  VV.Form.DoAjaxFormSave().then(function () {
    buildFieldMappings();
  });
} else {
  setTimeout(function () {
    VV.Form.Global.ValidationLoadModal("btnSave");
  }, 100);
}

function buildFieldMappings() {
  //Field mappings
  let fieldMappings = [
    {
      sourceFieldName: "License Application ID",
      sourceFieldValue: LicenseApplicationID,
      targetFieldName: "License Application ID",
    },
    {
      sourceFieldName: "License Application ID",
      sourceFieldValue: LicenseApplicationID,
      targetFieldName: "FormTemplateID_token",
    },
    {
      sourceFieldValue: "License Application",
      targetFieldName: "FormTemplateName_token",
    },
  ];

  VV.Form.Global.FillinAndRelateForm(templateId, fieldMappings);
}
