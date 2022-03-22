console.log("Start");

function loginUser(email, password, callback) {
  setTimeout(() => {
    console.log("Now we have the data");
    callback({ userEmail: email });
  }, 4000);
}

function getUserVideos(email, callback) {
  setTimeout(() => {
    callback(["video1", "video2", "video3"]);
  }, 2000);
}

function videoDetails(video, callback) {
  setTimeout(() => {
    callback("title of the video");
  }, 1000);
}

const user = loginUser("renacorbe123@goomail.com", 123456789, (user) => {
  console.log(user);
  getUserVideos(user.userEmail, (videos) => {
    console.log(videos);
    videoDetails(videos[0], (title) => {
      console.log(title);
    });
  });
});

console.log("Finish");

// This is a good first approach to learn how asynchronous methods work.
// However is could really easily turn into callback hell where we have
// a bunch of callback functions calling eachother and this results in
// a poorly readable code.

// Another alternative is to use Promises (example1WithPromises &
// example2Promises.js)
