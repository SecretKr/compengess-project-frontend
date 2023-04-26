const backendIPAddress = "127.0.0.1:3000";

let logged_in = false;
var asmnt = [];

async function authorizeApplication() {
    //window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
    await getAssignments()
    updateAssignments();
    logged_in = true;
    document.getElementById("home-page-id").classList.add("active")
    document.getElementById("login-page-id").classList.remove("active")
};

const updateAssignments = () => {
    const asmnt_div = document.getElementById("asmng");
    asmnt_div.innerHTML = "";
    const pin_asmnt_div = document.getElementById("asmng-pinned");
    pin_asmnt_div.innerHTML = "";

    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].pinned) {
            pin_asmnt_div.innerHTML += `
                <div class="assignment pinned" id="${asmnt[i].itemid}" onclick=unpin(${asmnt[i].itemid});>
                    <input type="checkbox" checked>
                    <span class="checkmark"></span>
                    <span class="cname">${asmnt[i].course}</span>
                    <span class="name">${asmnt[i].title}</span>
                    <span class="due-date">${asmnt[i].duedate}</span>
                    <span class="due-time">${asmnt[i].duetime}</span>
                </div>
            `
        } else {
            asmnt_div.innerHTML += `
                <div class="assignment" id="${asmnt[i].itemid}" onclick=pin(${asmnt[i].itemid});>
                    <input type="checkbox">
                    <span class="checkmark"></span>
                    <span class="cname">${asmnt[i].course}</span>
                    <span class="name">${asmnt[i].title}</span>
                    <span class="due-date">${asmnt[i].duedate}</span>
                    <span class="due-time">${asmnt[i].duetime}</span>
                </div>
            `
        }
    }

    const asmnt_wrapper = document.getElementById("assignments-container");
    const pin_asmnt_wrapper = document.getElementById("assignments-pinned");
    if (asmnt_div.innerHTML == "") asmnt_wrapper.classList.remove("active")
    else asmnt_wrapper.classList.add("active")
    if (pin_asmnt_div.innerHTML == "") pin_asmnt_wrapper.classList.remove("active")
    else pin_asmnt_wrapper.classList.add("active")
}

function pin(itemid) {
    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].itemid == itemid) {
            asmnt[i].pinned = true;
        }
    }
    updateAssignments();
}

function unpin(itemid) {
    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].itemid == itemid) {
            asmnt[i].pinned = false;
        }
    }
    updateAssignments();
}

const getUserProfile = async() => {
    const options = {
        method: "GET",
        credentials: "include",
    };
    await fetch(
            `http://${backendIPAddress}/courseville/get_profile_info`,
            options
        )
        .then((response) => response.json())
        .then((data) => {
            console.log(data.user);
            document.getElementById(
                "eng-name-info"
            ).innerHTML = `${data.user.title_en} ${data.user.firstname_en} ${data.user.lastname_en}`;
            document.getElementById(
                "thai-name-info"
            ).innerHTML = `${data.user.title_th} ${data.user.firstname_th} ${data.user.lastname_th}`;
        })
        .catch((error) => console.error(error));
};

const getCourses = async() => {
    const coursesList = document.getElementById("courses")
    coursesList.innerHTML = ""
    await fetch(`http://${backendIPAddress}/courseville/get_courses`, {
            method: "GET",
            credentials: "include",
        })
        .then((response) => response.json())
        .then(({ data }) => {
            var courses = data.student
            console.log(data)
            for (let i = 0; i < courses.length; i++) {
                coursesList.innerHTML += `
                <tr onclick=createAssignmentTable(${courses[i].cv_cid});>
                    <td>${courses[i].cv_cid}</td>
                    <td>${courses[i].title}</td>
                </tr>
                `
            }
        })
        .catch((error) => console.error(error));
};

async function getAssignments() {
    await fetch('./sample-assignments.json')
        .then((response) => response.json())
        .then((data) => {
            asmnt = []
            for (let i = 0; i < data.data.length; i++) {
                var assignment_data = data.data[i]
                assignment_data.pinned = false;
                assignment_data.course = "Computer Engineering Essentials";
                asmnt.push(assignment_data)
            }
        });
};

const createAssignmentTable = async(cid) => {
    const table_body = document.getElementById("main-table-body");
    table_body.innerHTML = "";

    await fetch(`http://${backendIPAddress}/courseville/get_course_assignments/` + cid, {
            method: "GET",
            credentials: "include",
        })
        .then((response) => response.json())
        .then((data) => {
            for (var i = 0; i < data.data.length; i++) {
                table_body.innerHTML += `
                <tr id="${i}">
                    <td>${data.data[i].itemid}</td>
                    <td>${data.data[i].title}</td>
                </tr>
                `
            }
        })
        .catch((error) => console.error(error));
};

const logout = async() => {
    window.location.href = `http://${backendIPAddress}/courseville/logout`;
};