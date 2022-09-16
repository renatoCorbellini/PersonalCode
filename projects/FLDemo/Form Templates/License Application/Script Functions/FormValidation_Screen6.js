//FormValidation Screen 6 for the License Application Form
let ErrorReporting = true;
let checkboxValue = VV.Form.GetFieldValue("Applicant Signature");

if (checkboxValue === "false") {
  VV.Form.SetValidationErrorMessageOnField(
    "Applicant Signature",
    "The Application should be signed before paying."
  );
  ErrorReporting = false;
}

return ErrorReporting;
