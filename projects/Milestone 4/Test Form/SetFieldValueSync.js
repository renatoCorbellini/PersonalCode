var deferred = $.Deferred(); // jQuery Deferred Object
var promiseArray = [];

// Add promises to an array
promiseArray.push(VV.Form.SetFieldValue("Wizard", "0"));

// Wait for all promises to be resolved
Promise.all(promiseArray)
  .then(function () {
    // Resolve the deferred object
    deferred.resolve();
  })
  .catch(function (error) {
    // An error occurred
    deferred.reject(error);
  });

// Alternative function
// VV.Form.SetFieldValue('First Name', 'Juan').then(function(){});

