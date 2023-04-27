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

    console.log(asmnt);
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

// Calendar

const daysTag = document.querySelector(".days"),
currentDate = document.querySelector(".current-date"),
prevNextIcon = document.querySelectorAll(".icons span");

// getting new date, current year and month
let date = new Date(),
currYear = date.getFullYear(),
currMonth = date.getMonth();

// storing full name of all months in array
const months = ["January", "February", "March", "April", "May", "June", "July",
                "August", "September", "October", "November", "December"];

const renderCalendar = () => {
    let firstDayofMonth = new Date(currYear, currMonth, 1).getDay(), // getting first day of month
    lastDateofMonth = new Date(currYear, currMonth + 1, 0).getDate(), // getting last date of month
    lastDayofMonth = new Date(currYear, currMonth, lastDateofMonth).getDay(), // getting last day of month
    lastDateofLastMonth = new Date(currYear, currMonth, 0).getDate(); // getting last date of previous month
    let liTag = "";

    for (let i = firstDayofMonth; i > 0; i--) { // creating li of previous month last days
        liTag += `<li class="inactive">${lastDateofLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateofMonth; i++) { // creating li of all days of current month
        // adding active class to li if the current day, month, and year matched
        let isToday = i === date.getDate() && currMonth === new Date().getMonth() 
                     && currYear === new Date().getFullYear() ? "active" : "";
        liTag += `<li class="${isToday}">${i}</li>`;
    }

    for (let i = lastDayofMonth; i < 6; i++) { // creating li of next month first days
        liTag += `<li class="inactive">${i - lastDayofMonth + 1}</li>`
    }
    currentDate.innerText = `${months[currMonth]} ${currYear}`; // passing current mon and yr as currentDate text
    daysTag.innerHTML = liTag;
}
renderCalendar();

prevNextIcon.forEach(icon => { // getting prev and next icons
    icon.addEventListener("click", () => { // adding click event on both icons
        // if clicked icon is previous icon then decrement current month by 1 else increment it by 1
        currMonth = icon.id === "prev" ? currMonth - 1 : currMonth + 1;

        if(currMonth < 0 || currMonth > 11) { // if current month is less than 0 or greater than 11
            // creating a new date of current year & month and pass it as date value
            date = new Date(currYear, currMonth, new Date().getDate());
            currYear = date.getFullYear(); // updating current year with new date year
            currMonth = date.getMonth(); // updating current month with new date month
        } else {
            date = new Date(); // pass the current date as date value
        }
        renderCalendar(); // calling renderCalendar function
    });
});


// API

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