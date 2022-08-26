// // Script Name:  LocationAddressValidationOnBlur
// // Parameters:   None
// // Script created by Eric Oyanadel

// var street = VV.Form.GetFieldValue("Location Address");
// var city = VV.Form.GetFieldValue("Location City");
// var state = VV.Form.GetFieldValue("Location State");
// var zip = VV.Form.GetFieldValue("Location Zip Code");

// var responseAddressString = VV.Form.GetFieldValue("Location Address String");
// var userFormAddressString = street + city + state + zip;
// userFormAddressString = userFormAddressString.replace(/ /g, "").toUpperCase();

// if (responseAddressString != userFormAddressString) {
//   VV.Form.SetFieldValue("Location Address String", userFormAddressString);

//   if (street && city && state != "Select Item" && zip) {
//     VV.Form.Global.AddressValidation(
//       "Country",
//       "Location Address",
//       "Location City",
//       "Location State",
//       "Location Zip Code",
//       "Location Address String"
//     );
//   }
// }
