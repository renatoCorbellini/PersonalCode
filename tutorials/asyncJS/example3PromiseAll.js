// The method Promise.all is used to start executing more
// asynchronous code at the same time

const yt = new Promise((resolve) => {
  setTimeout(() => {
    console.log("Getting stuff from youtube");
    resolve({ videos: [1, 2, 3, 4, 5] });
  }, 2000);
});

const fb = new Promise((resolve) => {
  setTimeout(() => {
    console.log("Getting stuff from facebook");
    resolve({ user: "user Name" });
  }, 5000);
});

Promise.all([yt, fb]).then((result) => console.log(result));
