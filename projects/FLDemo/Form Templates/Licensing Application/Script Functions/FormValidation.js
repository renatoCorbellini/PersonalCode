//FormValidation Screen 2 for the License Application Form
//pass in ControlName to validate a single item or nothing to validate everything.
let ErrorReporting = true;
let RunAll = false;

if (ControlName == null) {
  RunAll = true;
}

// SCREEN 2

if (ControlName == "License Application Type" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("License Application Type"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "License Application Type",
      "A value needs to be selected for the License Application Type."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("License Application Type");
  }
}

// SCREEN 3

if (ControlName == "Business Legal Name" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Business Legal Name"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Business Legal Name",
      "A value needs to be entered for the Business Legal Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Business Legal Name");
  }
}

if (ControlName == "Mailing Street" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Mailing Street"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Mailing Street",
      "A value needs to be entered for the Mailing Street."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Mailing Street");
  }
}

if (ControlName == "Mailing Zip" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Mailing Zip"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Mailing Zip",
      "A value needs to be entered for the Mailing Zip."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Mailing Zip");
  }
}

if (ControlName == "Mailing State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Mailing State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Mailing State",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Mailing State");
  }
}

if (ControlName == "Mailing City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Mailing City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Mailing City",
      "A value needs to be entered for the Mailing City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Mailing City");
  }
}

if (ControlName == "Physical Same" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Physical Same"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Physical Same",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Physical Same");
  }
}

if (ControlName == "Business Type" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Business Type"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Business Type",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Business Type");
  }
}

// SSN or FEIN validations
let businessType = VV.Form.GetFieldValue("Business Type");
let typeIsSelected =
  businessType !== null || businessType != "Select Item" ? true : false;
let checkSSN = businessType == "Sole Proprietor" ? true : false;

if (typeIsSelected) {
  if (checkSSN) {
    if (ControlName == "SSN" || RunAll) {
      if (
        VV.Form.Global.CentralValidation(VV.Form.GetFieldValue("SSN"), "SSN") ==
        false
      ) {
        VV.Form.SetValidationErrorMessageOnField(
          "SSN",
          "A value needs to be entered for the SSN."
        );
        ErrorReporting = false;
      } else {
        VV.Form.ClearValidationErrorOnField("SSN");
      }
    }
  } else {
    if (ControlName == "FEIN" || RunAll) {
      if (
        VV.Form.Global.CentralValidation(
          VV.Form.GetFieldValue("FEIN"),
          "EIN"
        ) == false
      ) {
        VV.Form.SetValidationErrorMessageOnField(
          "FEIN",
          "A value needs to be entered for the FEIN."
        );
        ErrorReporting = false;
      } else {
        VV.Form.ClearValidationErrorOnField("FEIN");
      }
    }
  }
}

if (ControlName == "Physical Street" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Physical Street"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Physical Street",
      "A value needs to be entered for the Physical Street."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Physical Street");
  }
}

if (ControlName == "Physical Zip" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Physical Zip"),
      "Zip"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Physical Zip",
      "A value needs to be entered for the Physical Zip."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Physical Zip");
  }
}

if (ControlName == "Physical State" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Physical State"),
      "DDSelect"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Physical State",
      "A value needs to be selected."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Physical State");
  }
}

if (ControlName == "Physical City" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("Physical City"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Physical City",
      "A value needs to be entered for the Physical City."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Physical City");
  }
}

// First Name - The form field is broken and doesn't allow to change it's name

if (ControlName == "DataField4" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("DataField4"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "DataField4",
      "A value needs to be entered for the First Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("DataField4");
  }
}

// Last Name - The form field is broken and doesn't allow to change it's name

if (ControlName == "DataField11" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(
      VV.Form.GetFieldValue("DataField11"),
      "Blank"
    ) == false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "DataField11",
      "A value needs to be entered for the Last Name."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("DataField11");
  }
}

if (ControlName == "Title" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(VV.Form.GetFieldValue("Title"), "Blank") ==
    false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Title",
      "A value needs to be entered for the Title."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Title");
  }
}

if (ControlName == "Phone" || RunAll) {
  if (
    VV.Form.Global.CentralValidation(VV.Form.GetFieldValue("Phone"), "Phone") ==
    false
  ) {
    VV.Form.SetValidationErrorMessageOnField(
      "Phone",
      "A value needs to be entered for the Phone."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Phone");
  }
}

// Email validations

let emailAddress = VV.Form.GetFieldValue("Email");
let emailConfirm = VV.Form.GetFieldValue("Email Confirm");

if (ControlName == "Email" || RunAll) {
  if (VV.Form.Global.CentralValidation(emailAddress, "Email") == false) {
    VV.Form.SetValidationErrorMessageOnField(
      "Email",
      "An email address must be entered, and it must be in the form of a valid email address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Email");
  }
}

if (ControlName == "Email Confirm" || RunAll) {
  if (VV.Form.Global.CentralValidation(emailConfirm, "Email") == false) {
    VV.Form.SetValidationErrorMessageOnField(
      "Email Confirm",
      "An email address must be entered, and it must be in the form of a valid email address."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Email Confirm");
  }
}

if (emailAddress && emailConfirm) {
  if (emailAddress !== emailConfirm) {
    VV.Form.SetValidationErrorMessageOnField(
      "Email Confirm",
      "Email addresses must match."
    );
    ErrorReporting = false;
  } else {
    VV.Form.ClearValidationErrorOnField("Email Confirm");
    VV.Form.ClearValidationErrorOnField("Email");
  }
}

// SCREEN 6

let checkboxValue = VV.Form.GetFieldValue("Applicant Signature");

if (!checkboxValue) {
  VV.Form.SetValidationErrorMessageOnField(
    "Applicant Signature",
    "The Application should be signed before paying."
  );
  ErrorReporting = false;
}

return ErrorReporting;
