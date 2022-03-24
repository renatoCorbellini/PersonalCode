// Calculate and set products total price
let productTotalPrice = VV.Form.Template.calculateProductTotal();
VV.Form.SetFieldValue("Product Total Price", productTotalPrice).then(
  function () {}
);

// Calculate and set total price including sales tax
let totalPriceWTax = VV.Form.Template.calculateTotalwithTax();
VV.Form.SetFieldValue("Total Price with Tax", totalPriceWTax).then(
  function () {}
);
