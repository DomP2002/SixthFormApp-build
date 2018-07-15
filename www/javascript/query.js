function query(url, postData, callback, fatal) {
  if(!isLoggedIn()) {
    var response = {
      "status": {
        "code": 401,
        "description": "User is not logged in"
      },
      "content": {}
    };

    fatal(response);
    return;
  }

  $.ajax({
    url: Cookies.get("base") + url,
    type: "post",
    dataType: "json",
    data: postData,
    headers: {
      authorization: Cookies.get("auth")
    },
    success: function(data) {
      callback(data);
    },
    error: function(data) {
      fatal(data);
    }
  });
}

function openInBrowser(url) {
  if(typeof cordova !== "undefined") {
    cordova.InAppBrowser.open(url, "_system", "location=yes");
  } else {
    window.open(url, "_blank");
  }
}

function sendAlert(message, title = "Alert", button = "OK") {
	if(typeof navigator.notification !== "undefined") {
		navigator.notification.alert(message, null, title, button);
	} else {
		alert(message);
	}
}

function doesPasswordMeetStandard(password) {
  if(password == null) {
    return "You must enter a password.";
  }

  if(password == "") {
    return "You must enter a password.";
  }

  if(password.length < 8) {
    return "Your password must be at least 8 characters long.";
  }

  if(/[0-9]+/.test(password) == false) {
    return "Your password must contain at least one number.";
  }

  if(/[a-z]+/.test(password) == false) {
    return "Your password must contain at least one lowercase letter.";
  }

  if(/[A-Z]+/.test(password) == false) {
    return "Your password must contain at least one uppercase letter.";
  }

  return true;
}

function isLoggedIn() {
  if(Cookies.get("auth") === undefined) {
    return false;
  }

  if(Cookies.get("base") === undefined) {
    return false;
  }

  if(Cookies.get("resource_base") === undefined) {
    return false;
  }

  return true;
}

function verifyUser(start, fatal) {
  if(Cookies.get("auth") === undefined) {
    return fatal("You are not logged in.");
  }

  if(Cookies.get("base") === undefined) {
    return fatal("You are not logged in.");
  }

  if(Cookies.get("resource_base") === undefined) {
    return fatal("You are not logged in.");
  }

  query("/accounts/details/", {}, function (data) {
    var code = data["status"]["code"];

    if(code == 200) {
      start();
    } else {
      fatal("Session has expired.");
    }
  }, function (data) {
    fatal("Unable to locate server.");
  });
}

function clearStorage() {
  if(typeof(Storage) !== "undefined") {
    localStorage.clear();
  }
}

function retrieveContent(key) {
  if(typeof(Storage) !== "undefined") {
    return localStorage.getItem(key);
  }

  return false;
}

function cacheContent(key, content) {
  if(typeof(Storage) !== "undefined") {
    localStorage.setItem(key, content);
  }
}

function onDeviceReady() {
  $(document).ready(function () {
    verifyUser(function () {
      loadPage();
    }, function(err) {
      window.location = "index.html";
    });
  });
}

function onResume() {
  verifyUser(function () {
    return;
  }, function (err) {
    window.location = "index.html";
  });
}

document.addEventListener("resume", onResume, false);
document.addEventListener("deviceready", onDeviceReady, false);
