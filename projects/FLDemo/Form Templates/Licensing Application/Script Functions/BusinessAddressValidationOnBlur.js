// // Script Name:  BusinessAddressValidationOnBlur
// // Parameters:   None
// // Script created by Eric Oyanadel

// var street = VV.Form.GetFieldValue("Mailing Street");
// var city = VV.Form.GetFieldValue("Mailing City");
// var state = VV.Form.GetFieldValue("Mailing State");
// var zip = VV.Form.GetFieldValue("Mailing Zip");

// var responseAddressString = VV.Form.GetFieldValue("Business Address String");
// var userFormAddressString = street + city + state + zip;
// userFormAddressString = userFormAddressString.replace(/ /g, "").toUpperCase();

// if (responseAddressString != userFormAddressString) {
//   VV.Form.SetFieldValue("Business Address String", userFormAddressString);

//   if (street && city && state != "Select Item" && zip) {
//     VV.Form.Global.AddressValidation(
//       "Country",
//       "Mailing Street",
//       "Mailing City",
//       "Mailing State",
//       "Mailing Zip",
//       "Business Address String"
//     );
//   }
// }
