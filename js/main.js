let currentPage = 1;
let lastPage = 1;
//infinit scrolling for pagination
window.addEventListener("scroll", function () {
  //reach to the end od page or not
  const endOfPage =
    this.window.innerHeight + this.window.pageYOffset >=
    document.body.scrollHeight;
  if (endOfPage && currentPage < lastPage) {
    currentPage += 1;
    getPosts(false, currentPage);
  }
});
setUpUi();
getPosts();
function getPosts(reload = true, page = 1) {
  toggleLoader(true);
  axios
    .get(`https://tarmeezacademy.com/api/v1/posts?limit=50&page=${page}`)
    .then(function (response) {
      toggleLoader(false);
      let posts = response.data.data;

      lastPage = response.data.meta.last_page;

      if (reload) {
        document.getElementById("posts").innerHTML = "";
      }

      for (post of posts) {
        const author = post.author;
        let postTitle = "";
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = "";
        if (isMyPost) {
          editBtnContent = `
          
          <button class="btn btn-danger " style="float:right; margin-left:5px" onclick="deletePostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Delete</button>
          <button class="btn btn-secondary" style="float:right;" onclick="editPostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Edit</button>`;
        }
        if (post.title != null) {
          postTitle = post.title;
        }

        let content = `
      <div class="card shadow">
      <div class="card-header">

        <span style="cursor:pointer;" onclick="userClicked(${author.id})">
        <img
          class="rounded-circle border border-2"
          src="${post.author.profile_image}"
          alt=""
          style="width: 40px; height: 40px"
        />
        <span class="fw-bold">${post.author.name}</span> 
        </span>
        ${editBtnContent}
        
      </div>
      <div class="card-body" onclick = "postClicked(${post.id})" style = "cursor: pointer">
        <img
          src="${post.image}"
          alt=""
          class="w-100"
        />
        <h6 style="color: #eee" class="mt-1">${post.created_at}</h6>
        <h5>${postTitle}</h5>

        <p>
          ${post.body}
        </p>
        <hr />
        <div>
          <i class="fa-regular fa-comments"></i>
          <span>${post.comments_count} Comments
          <span id='post-tags-${post.id}'>
        
          </span>
          </span>
        </div>
      </div>
    </div>
      
      `;
        document.getElementById("posts").innerHTML += content;
        const currentPostTagsId = `post-tags-${post.id}`;
        document.getElementById(currentPostTagsId).innerHTML = "";
        for (tag of post.tags) {
          let tagsContent = `
        <button class="btn btn-sm rounded-5" style="background-color:gray; color:white;">
                ${tag.name}
        </button>
        `;
          document.getElementById(currentPostTagsId).innerHTML += tagsContent;
        }
      }
    })
    .catch(function (error) {});
}
function postClicked(postId) {
  // alert(postId);
  window.location = `postDetails.html?postId=${postId}`;
}
function loginBtnClicked() {
  const username = document.getElementById("username-input").value;
  const password = document.getElementById("password-input").value;

  const params = {
    username: username,
    password: password,
  };
  toggleLoader(true);
  axios
    .post("https://tarmeezacademy.com/api/v1/login", params)
    .then(function (response) {
      toggleLoader(false);
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      //to close the modal
      const modal = document.getElementById("login-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //--to close modal--//
      showAlert("logged in Successfully", "success");
      setUpUi();
      getPosts();
    })
    .catch(function (error) {
      const msg = error.response.data.message;
      showAlert(msg, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}
function registerBtnClicked() {
  let name = document.getElementById("register-name-input").value;
  let username = document.getElementById("register-username-input").value;
  const image = document.getElementById("register-image-input").files[0];
  let password = document.getElementById("register-password-input").value;

  let formData = new FormData();
  formData.append("name", name);
  formData.append("username", username);
  formData.append("password", password);
  formData.append("image", image);

  const headers = {
    "Content-Type": "multipart/form-data",
  };
  toggleLoader(true);
  axios
    .post("https://tarmeezacademy.com/api/v1/register", formData, {
      headers: headers,
    })
    .then(function (response) {
      let token = response.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      //to close the modal
      const modal = document.getElementById("register-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //--to close modal--//
      showAlert("New User Registered Successfully", "success");
      getPosts();
      setUpUi();
    })
    .catch(function (error) {
      const message = error.response.data.message;
      showAlert(message, "danger");
    })
    .finally(() => {
      toggleLoader(false);
    });
}
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showAlert("Logged out Successfully", "success");
  setUpUi();
}
function showAlert(customMessage, behavior) {
  const alertPlaceholder = document.getElementById("success-alert");
  const alert = (message, type) => {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = [
      `<div class="alert alert-${type} alert-dismissible" role="alert">`,
      `<div>${message}</div>`,
      `<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`,
      `</div>`,
    ].join("");

    alertPlaceholder.append(wrapper);
  };
  alert(customMessage, behavior);
  getPosts();
  //todo: hide the alert
  // setTimeout(() => {
  //   const alertToHide = bootstrap.Alert.getOrCreateInstance("#success-alert");
  //   alertToHide.close();
  // }, 2000);
}
function setUpUi() {
  const token = localStorage.getItem("token");

  const loginDiv = document.getElementById("logged-div");
  const logoutDiv = document.getElementById("logout-div");
  //add btn
  const addBtn = document.getElementById("add-btn");
  //user is guest (not logged in)
  if (token == null) {
    loginDiv.style.setProperty("display", "flex", "important");
    logoutDiv.style.setProperty("display", "none", "important");
    if (addBtn != null) {
      addBtn.style.setProperty("display", "none", "important");
    }
  } else {
    //for logged in user
    loginDiv.style.setProperty("display", "none", "important");
    logoutDiv.style.setProperty("display", "flex", "important");
    if (addBtn != null) {
      addBtn.style.setProperty("display", "block", "important");
    }
    const user = getCurrentUser();
    document.getElementById("nav-username").innerHTML = user.username;
    document.getElementById("nav-user-image").src = user.profile_image;
  }
}
function getCurrentUser() {
  let user = null;
  const storageUser = localStorage.getItem("user");
  if (storageUser != null) {
    user = JSON.parse(storageUser);
  }
  return user;
}
function createNewPostClicked() {
  let postId = document.getElementById("post-id-input").value;
  let isCreate = postId == null || postId == "";

  const title = document.getElementById("post-title-input").value;
  const body = document.getElementById("post-body-input").value;
  const image = document.getElementById("post-image-input").files[0];
  const token = localStorage.getItem("token");

  let formData = new FormData();
  formData.append("body", body);
  formData.append("title", title);
  formData.append("image", image);

  const headers = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${token}`,
  };
  if (isCreate) {
    toggleLoader(true);
    axios
      .post("https://tarmeezacademy.com/api/v1/posts", formData, {
        headers: headers,
      })
      .then(function (response) {
        //to close the modal
        const modal = document.getElementById("create-post-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        //--to close modal--//

        showAlert("New post Has Been Created", "success");
        getPosts();
      })
      .catch(function (error) {
        const message = error.response.data.message;
        showAlert(message, "danger");
      })
      .finally(() => {
        toggleLoader(false);
      });
  } else {
    formData.append("_method", "put");
    toggleLoader(true);
    axios
      .post(`https://tarmeezacademy.com/api/v1/posts/${postId}`, formData, {
        headers: headers,
      })
      .then(function (response) {
        //to close the modal
        const modal = document.getElementById("create-post-modal");
        const modalInstance = bootstrap.Modal.getInstance(modal);
        modalInstance.hide();
        //--to close modal--//

        showAlert("Post Updated Successfully", "success");
        getPosts();
      })
      .catch(function (error) {
        const message = error.response.data.message;
        showAlert(message, "danger");
      })
      .finally(() => {
        toggleLoader(false);
      });
  }
}
function scrollToTop() {
  let up = document.querySelector(".up");
  window.onscroll = function () {
    if (this.scrollY >= 394) {
      up.classList.add("show");
    } else {
      up.classList.remove("show");
    }
  };
  up.onclick = function () {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
}
scrollToTop();

//to get post id from query params
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("postId");

getPost();
function getPost() {
  axios
    .get(`https://tarmeezacademy.com/api/v1/posts/${id}`)
    .then(function (response) {
      let post = response.data.data;
      let comments = post.comments;
      const author = post.author;
      document.getElementById("username-span").innerHTML = author.username;
      let postTitle = "";

      if (post.title != null) {
        postTitle = post.title;
      }
      let commentsContent = "";
      for (comment of comments) {
        commentsContent = `
        <!-- start comment -->
              <div class="p-3" style="background-color: rgb(187, 187, 187)">
                <!-- profile pic  + username -->
                <div>
                  <img
                    src="${comment.author.profile_image}"
                    class="rounded-circle"
                    style="width: 40px; height: 40px"
                    alt=""
                  />
                  <b>${comment.author.username}</b>

                  
                </div>
                <!--/// profile pic  + username -->
                <!-- comment body -->
                <div>
                  ${comment.body}
                </div>
                <!--//// comment body -->
              </div>
              <!-- end comment -->
        `;
      }
      let Postcontent = `
      <!-- start post card -->
      <div class="card shadow">
        <div class="card-header">
          <img
            class="rounded-circle border border-2"
            src="${author.profile_image}"
            alt=""
            style="width: 40px; height: 40px"
          />
          <span class="fw-bold">${author.name}</span>
        </div>
        <div class="card-body">
          <img
            src="${post.image}"
            alt=""
            class="w-100"
          />
          <h6 style="color: #eee" class="mt-1">${post.created_at}</h6>
          <h5>${post.title}</h5>

          <p>
            ${post.body}
          </p>
          <hr />
          <div>
            <i class="fa-regular fa-comments"></i>
            <span>${post.comments_count}
            </span>
          </div>
        </div>
        <div id="comments">
            ${commentsContent}
        </div>
        <div class="input-group mb-3" id="add-comment-div">
          <input class="form-control" id = "comment-input" type = "text" placeholder="add Your comment here">
          <button class="btn-outline-primary bg-primary border-0" style="color:white;" type="button" onclick="createCommentClicked()">Send</button>
        </div>
      </div>
      <!-- end post card -->

      `;
      document.getElementById("post").innerHTML = Postcontent;
    })

    .catch(function (error) {});
}
function createCommentClicked() {
  let commentBody = document.getElementById("comment-input").value;
  let params = {
    body: commentBody,
  };
  let token = localStorage.getItem("token");
  axios
    .post(`https://tarmeezacademy.com/api/v1/posts/${id}/comments`, params, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      showAlert("The Comment has been created", "success");
      getPost();
    })
    .catch((error) => {
      const errorMsg = error.response.data.message;
      showAlert(errorMsg, "danger");
    });
}
function editPostBtnClicked(postObj) {
  let post = JSON.parse(decodeURIComponent(postObj));
  console.log(post);
  document.getElementById("post-modal-submit-btn").innerHTML = "Update";
  document.getElementById("post-id-input").value = post.id;
  document.getElementById("post-title-input").value = post.title;
  document.getElementById("post-body-input").value = post.body;
  document.getElementById("post-modal-title").innerHTML = "Edit Post";
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}
function deletePostBtnClicked(postObj) {
  let post = JSON.parse(decodeURIComponent(postObj));
  console.log(post);
  document.getElementById("delete-post-id-input").value = post.id;
  let postModal = new bootstrap.Modal(
    document.getElementById("delete-post-modal"),
    {}
  );
  postModal.toggle();
}
function confirmPostDelete() {
  const token = localStorage.getItem("token");
  const postId = document.getElementById("delete-post-id-input").value;
  const headers = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };
  axios
    .delete(`https://tarmeezacademy.com/api/v1/posts/${postId}`, {
      headers: headers,
    })
    .then(function (response) {
      //to close the modal
      const modal = document.getElementById("delete-post-modal");
      const modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      //--to close modal--//

      showAlert("The Post Has Been Deleted ", "success");
      getPosts();
    })
    .catch(function (error) {
      const msg = error.response.data.message;
      showAlert(msg, "danger");
    });
}

function addBtnClicked() {
  document.getElementById("post-modal-submit-btn").innerHTML = "Create";
  document.getElementById("post-id-input").value = "";
  document.getElementById("post-title-input").value = "";
  document.getElementById("post-body-input").value = "";
  document.getElementById("post-modal-title").innerHTML = "Create A New Post";
  let postModal = new bootstrap.Modal(
    document.getElementById("create-post-modal"),
    {}
  );
  postModal.toggle();
}

//profile page
function getUser() {
  const id = getCurrentUserId();
  axios
    .get(`https://tarmeezacademy.com/api/v1/users/${id}`)
    .then((response) => {
      const user = response.data.data;
      document.getElementById("main-info-email").innerHTML = user.email;
      document.getElementById("main-info-name").innerHTML = user.name;
      document.getElementById("main-info-username").innerHTML = user.username;
      document.getElementById("main-info-image").src = user.profile_image;
      document.getElementById("name-posts").innerHTML = user.username;
      document.getElementById("posts-count").innerHTML = user.posts_count;
      document.getElementById("comments-count").innerHTML = user.comments_count;
    });
}
getUser();
getProfilePosts();
function getProfilePosts() {
  const id = getCurrentUserId();
  axios
    .get(`https://tarmeezacademy.com/api/v1/users/${id}/posts`)
    .then(function (response) {
      const posts = response.data.data;
      document.getElementById("user-posts").innerHTML = "";

      for (post of posts) {
        const author = post.author;
        let postTitle = "";

        // show or hide edit button
        let user = getCurrentUser();
        let isMyPost = user != null && post.author.id == user.id;
        let editBtnContent = "";

        if (isMyPost) {
          editBtnContent = `
          
          <button class="btn btn-danger " style="float:right; margin-left:5px" onclick="deletePostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Delete</button>
          <button class="btn btn-secondary" style="float:right;" onclick="editPostBtnClicked('${encodeURIComponent(
            JSON.stringify(post)
          )}')">Edit</button>`;
        }

        if (post.title != null) {
          postTitle = post.title;
        }

        let content = `
      <div class="card shadow">
      <div class="card-header">
        <img
          class="rounded-circle border border-2"
          src="${post.author.profile_image}"
          alt=""
          style="width: 40px; height: 40px"
        />
        <span class="fw-bold">${post.author.name}</span> 
        ${editBtnContent}
        
      </div>
      <div class="card-body" onclick = "postClicked(${post.id})" style = "cursor: pointer">
        <img
          src="${post.image}"
          alt=""
          class="w-100"
        />
        <h6 style="color: #eee" class="mt-1">${post.created_at}</h6>
        <h5>${postTitle}</h5>

        <p>
          ${post.body}
        </p>
        <hr />
        <div>
          <i class="fa-regular fa-comments"></i>
          <span>${post.comments_count} Comments
          <span id='post-tags-${post.id}'>
        
          </span>
          </span>
        </div>
      </div>
    </div>
      
      `;
        document.getElementById("user-posts").innerHTML += content;
        const currentPostTagsId = `post-tags-${post.id}`;
        document.getElementById(currentPostTagsId).innerHTML = "";
        for (tag of post.tags) {
          let tagsContent = `
        <button class="btn btn-sm rounded-5" style="background-color:gray; color:white;">
                ${tag.name}
        </button>
        `;
          document.getElementById(currentPostTagsId).innerHTML += tagsContent;
        }
      }
    })
    .catch(function (error) {});
}
function userClicked(userId) {
  window.location = `profile.html?userid=${userId}`;
}
function getCurrentUserId() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("userid");
  return id;
}
function profileClicked() {
  const user = getCurrentUser();
  const userId = user.id;
  window.location = `profile.html?userid=${userId}`;
}

// loader
function toggleLoader(show = true) {
  if (show) {
    document.getElementById("loader").style.visibility = "visible";
  } else {
    document.getElementById("loader").style.visibility = "hidden";
  }
}
