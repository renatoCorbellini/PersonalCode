console.log("Start");

// Creation of the promise
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log("got the user");
    reject(new Error("An error has occured"));
  }, 2000);
});

console.log("Processing");

// Here we consume the promise

promise
  .then((user) => {
    console.log(user);
  })
  .catch((err) => console.log(err));

console.log("Finish");
