const minimumProjectsPerCall = 5;
const maximumProjectsPerUser = 2;
var projectsCurrentCall = 0;
var usersCurrentCall = 0;
function allUsersChecked() { return usersCurrentCall == usernames.length; }

function moreDataNeeded() {  return ((allUsersChecked()) && (projectsCurrentCall < minimumProjectsPerCall)); }
var callInProgress = true;

var emoji = new EmojiConvertor();
var reqNo = Math.floor(Math.random() * 3) + 1;
var projectsPerPage = 2;

function nFormatter(num) {
    if (num <= 999) {
        return num + "";
    } else if (num <= 99999) {
        return (num / 1000).toFixed(1) + "k";
    }
}

function userFormatter(username) {
  return "<a href='https://github.com/" + username + "?tab=stars'>" + username + "</a>";
}

function dataCollector(response, username) {
    ++usersCurrentCall;
    var filterFunction = languageFilter(languageSelected);
    response.data.filter(filterFunction).slice(0, maximumProjectsPerUser).forEach(function(entry) {
        if (typeof entry != "undefined") {
            ++projectsCurrentCall;
            if (!entry.description) entry.description = "";
            var innerContent = "<li><span class='link'><a href='" + entry.html_url + "' target='_blank'>" + entry.name + "<span> - " + String(entry.description) + "</span>" + "<br/></a></span>";
            innerContent += "<div class='additional'>";
                innerContent += nFormatter(entry.stargazers_count) + " <i class='fa fa-star'></i>";
                innerContent += "&emsp;" + nFormatter(entry.forks) + " <i class='fa fa-code-fork'></i>";
                innerContent += (entry.language != null) ? "&emsp;" + entry.language : "";
                innerContent += "&emsp;(from " + userFormatter(username) + ")";
            innerContent += "</div></li>";
            innerContent = emoji.replace_unified(innerContent);
            content.innerHTML += emoji.replace_colons(innerContent);
            emoji.img_sets.apple.path = "http://cdn.mubaris.com/emojis/";
        }
    });
    if(moreDataNeeded()) {
        getData(localStorage.getItem("accessToken"));
    } else if(allUsersChecked()) {
        projectsCurrentCall = 0, callInProgress = false;
        document.getElementById("searching").innerHTML = "";
    }
}

function getData() {
    document.getElementById("searching").innerHTML = "<br/>Searching for projects...";
    usersCurrentCall = 0;
    callInProgress = true;
    ++reqNo;
    for (var i = 0; i < usernames.length; i++) {
        const username = usernames[i];
        var url = "https://api.github.com/users/" + username + "/starred?per_page=" + projectsPerPage + "&access_token=" + accessToken + "&page=" + reqNo;
        axios({
            url,
            method: "get",
            responseType: "json"
        }).then((response) => {
            dataCollector(response, username);
        }).catch((err) => {
            console.log(err);
        });
    }
}

var content = document.getElementById("content");
var accessToken;

if (window.localStorage) {
    if (!localStorage.getItem("accessToken")) {
        swal({
            title: "Submit Github Token",
            html: "Curiosity requires a Github Token to access Github API. Your token will be saved in LocalStorage. So don't worry. Get new token <a target='_blank' href='https://github.com/settings/tokens/new?description=Curiosity'>here</a>.",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Submit",
            showLoaderOnConfirm: false,
            preConfirm: function(token) {
                return new Promise(function(resolve, reject) {
                    setTimeout(function() {
                        if (token == '') {
                            reject("Enter Valid Token");
                        } else {
                            localStorage.setItem("accessToken", token);
                            resolve();
                        }
                    }, 1000);
                });
            },
            allowOutsideClick: false
        }).then(function(token) {
            accessToken = token;
            getData();
            getLanguagesToShow();
            renderUsernames();
            swal({
                type: "success",
                title: "Thank You"
            })
        })
    }
} else {
    alert("Sorry! LocalStorage is not available");
}

accessToken = localStorage.getItem("accessToken");

if (accessToken) {
    getData();
    getLanguagesToShow();
    renderUsernames();
}

var options = {
    distance: 1,
    callback: function(done) {
        if(!callInProgress) getData();
        done();
    }
}

infiniteScroll(options);
