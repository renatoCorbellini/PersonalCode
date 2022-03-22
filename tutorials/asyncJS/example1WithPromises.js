console.log("Start");

function loginUser(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("Now we got the data");
      resolve({ userEmail: email });
    }, 2000);
  });
}

function getUserVideos(email) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(["video1", "video2", "video3"]);
    }, 1000);
  });
}

function videoDetails(video) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve("title of the video");
    }, 1000);
  });
}

// loginUser("email", "pass")
//   .then((user) => getUserVideos(user.userEmail))
//   .then((videos) => videoDetails(videos[0]))
//   .then((detail) => console.log(detail));

// SYNC
async function displayUser() {
  try {
    const user = await loginUser("rena", 12345);
    const videos = await getUserVideos(user.userEmail);
    const details = await videoDetails(videos[0]);
    console.log(details);
  } catch (err) {
    console.log(err.message);
  }
}

displayUser();

console.log("Finish");
