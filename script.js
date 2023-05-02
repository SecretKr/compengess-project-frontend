const backendIPAddress = "127.0.0.1:3000";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);

// status 0 = not logged in; 1 = logged in; 2 = not loading data; 3 = error;
if (urlParams.get('status') == "2") {
    document.getElementById("home-page-id").classList.add("active")
    document.getElementById("login-page-id").classList.remove("active")
}
if (urlParams.get('status') == 1) {
    document.getElementById("home-page-id").classList.add("active")
    document.getElementById("login-page-id").classList.remove("active")
    getData()
}

var filterDueDate = true;
var filterCourse = "000";
var asmntTemp = [];
var asmnt = [];
var courses = [];
var uid;

async function authorizeApplication() {
    window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
};

async function getData() {
    await getCourses()
    await getUserProfile()
    await getAssignmentFromDB()
    var fetchs = []
    for (let i = 0; i < courses.length; i++) {
        fetchs.push(getAssignments(courses[i].cv_cid, courses[i].title, false))
    }
    await Promise.all(fetchs)
    document.getElementById("courses-filter").onchange = filterCourseListener
    document.getElementById("due-date-filter").onchange = filterDueDateListener
    updateAssignments();
}

async function updateFilter() {
    const loading_asmnt = document.getElementById("loading-asmnt");
    loading_asmnt.classList.add("active");
    await getAssignmentFromDB();
    asmnt = []
    if (filterCourse == "000") {
        var fetchs = []
        for (let i = 0; i < courses.length; i++) {
            fetchs.push(getAssignments(courses[i].cv_cid, courses[i].title, false))
        }
        await Promise.all(fetchs)
    } else {
        await getAssignments(filterCourse.split(":")[0], filterCourse.split(":")[1], true)
    }
    updateAssignments()
    loading_asmnt.classList.remove("active");
}

function filterCourseListener() {
    filterCourse = this.value
    updateFilter()
}

function filterDueDateListener() {
    if (this.value == "1") {
        filterDueDate = false
    } else {
        filterDueDate = true
    }
    updateFilter()
}

const updateAssignments = () => {

    const asmnt_div = document.getElementById("asmng");
    asmnt_div.innerHTML = "";
    const pin_asmnt_div = document.getElementById("asmng-pinned");
    pin_asmnt_div.innerHTML = "";

    asmnt.sort((a, b) => {
        return b.duetime - a.duetime
    })

    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].pinned) {
            pin_asmnt_div.innerHTML += `
                <div class="assignment pinned" id="${asmnt[i].itemid}">
                    <div class="checkbox" onclick=unpin(${asmnt[i].itemid});>
                        <input type="checkbox" checked>
                        <span class="checkmark"></span>
                    </div>
                    <div class="detail-name">
                        <span class="cname">${asmnt[i].course}</span>
                        <span class="name">${asmnt[i].title}</span>
                        <input type="text" placeholder="Note" value="${asmnt[i].note}" onchange=updateNote(${asmnt[i].itemid},this.value)>
                    </div>
                    <div class="date-time">
                        <span class="due-date">${asmnt[i].ddate}</span>
                        <span class="due-time">${asmnt[i].dtime}</span>
                    </div>
                    <div class="dots-container" onclick='window.open("https://www.mycourseville.com/?q=courseville/worksheet/${asmnt[i].cid}/${asmnt[i].itemid}", "_blank");'>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            `
        } else {
            asmnt_div.innerHTML += `
                <div class="assignment" id="${asmnt[i].itemid}">
                <div class="checkbox" onclick=pin(${asmnt[i].itemid});>
                    <input type="checkbox">
                    <span class="checkmark"></span>
                </div>
                    <div class="detail-name">
                        <span class="cname">${asmnt[i].course}</span>
                        <span class="name">${asmnt[i].title}</span>
                        <input type="text/plain" placeholder="Note" value="${asmnt[i].note}" onchange=updateNote(${asmnt[i].itemid},this.value)>
                    </div>
                    <div class="date-time">
                        <span class="due-date">${asmnt[i].ddate}</span>
                        <span class="due-time">${asmnt[i].dtime}</span>
                    </div>
                    <div class="dots-container" onclick='window.open("https://www.mycourseville.com/?q=courseville/worksheet/${asmnt[i].cid}/${asmnt[i].itemid}", "_blank");'>
                        <div class="dot"></div>
                        <div class="dot"></div>
                        <div class="dot"></div>
                    </div>
                </div>
            `
        }
    }

    const asmnt_wrapper = document.getElementById("assignments-container");
    if (asmnt_div.innerHTML == "") asmnt_wrapper.classList.remove("active")
    else asmnt_wrapper.classList.add("active")
    const pin_asmnt_wrapper = document.getElementById("assignments-pinned");
    if (pin_asmnt_div.innerHTML == "") pin_asmnt_wrapper.classList.remove("active")
    else pin_asmnt_wrapper.classList.add("active")
    const asmnt_none = document.getElementById("assignments-none");
    if (asmnt.length == 0) asmnt_none.classList.add("active");
    else asmnt_none.classList.remove("active")
    const loading = document.getElementById("loading");
    loading.classList.remove("active");
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
            ).innerHTML = `${data.user.firstname_en} ${data.user.lastname_en}`;
            document.getElementById(
                "thai-name-info"
            ).innerHTML = `${data.user.firstname_th} ${data.user.lastname_th}`;
            uid = data.user.id;
        })
        .catch((error) => console.error(error));
};

async function getCourses() {
    const coursesList = document.getElementById("courses-filter")
    coursesList.innerHTML = `
    <option value="000">
        Show All
    </option>
    `
    await fetch(`http://${backendIPAddress}/courseville/get_courses`, {
            method: "GET",
            credentials: "include",
        })
        .then((response) => response.json())
        .then(({ data }) => {
            courses_temp = data.student
            courses = []
            console.log(data)
            let max_year = '0'
            let max_semester = 0
            for (let i = 0; i < courses_temp.length; i++) {
                if (max_year < courses_temp[i].year) {
                    max_year = courses_temp[i].year
                }
                if (max_semester < courses_temp[i].semester) {
                    max_semester = courses_temp[i].semester
                }
            }
            for (let i = 0; i < courses_temp.length; i++) {
                if (courses_temp[i].year == max_year && courses_temp[i].semester == max_semester) {
                    coursesList.innerHTML += `
                    <option value="${courses_temp[i].cv_cid}:${courses_temp[i].title}">
                        ${courses_temp[i].title}
                    </option>
                    `
                    courses.push(courses_temp[i])
                }
            }
        })
        .catch((error) => console.error(error));
};

async function getAssignments(cid, title, clear) {
    await fetch(`http://${backendIPAddress}/courseville/get_course_assignments/` + cid, {
            method: "GET",
            credentials: "include",
        })
        .then((response) => response.json())
        .then((data) => {
            console.log(data)
            let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            if (clear) { asmnt = [] }
            data.data.sort((a, b) => {
                return b.duetime - a.duetime
            })

            for (let i = 0; i < data.data.length; i++) {
                var assignment_data = data.data[i]
                assignment_data.cid = cid
                assignment_data.course = title;
                assignment_data.note = "";

                let unix_timestamp = assignment_data.duetime;
                let now_timestamp = Date.now()
                if (now_timestamp >= unix_timestamp * 1000 && filterDueDate) {
                    continue
                }

                let check = false;
                if (asmntTemp) {
                    for (let j = 0; j < asmntTemp.length; j++) {
                        if (assignment_data.itemid == asmntTemp[j].itemid && asmntTemp[j].uid == uid) {
                            assignment_data.pinned = asmntTemp[j].pinned;
                            assignment_data.note = asmntTemp[j].note;
                            check = true;
                        }
                    }
                }
                if (!check) { addAssignment(assignment_data, false, "") }
                let date = new Date(unix_timestamp * 1000)
                assignment_data.ddate = date.getDate() + " " + months[date.getMonth()];
                assignment_data.dtime = date.getHours() + ":" + ("0" + date.getMinutes()).substr(-2);
                asmnt.push(assignment_data)
            }
        });
};

async function getAssignmentFromDB() {
    const options = {
        method: "GET",
        credentials: "include",
    };
    await fetch(`http://${backendIPAddress}/courseville/`, options)
        .then((response) => response.json())
        .then((data) => {
            asmntTemp = data
        })
        .catch((error) => console.error(error));
};

const addAssignment = async(assignment, pinned, note) => {

    const memberToAdd = {
        uid: uid,
        itemid: assignment.itemid,
        course: assignment.course,
        title: assignment.title,
        pinned: pinned,
        note: note
    }

    fetch(`http://${backendIPAddress}/courseville/`, {
        method: "POST",
        body: JSON.stringify(memberToAdd),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    });

}

const deleteAssignment = async(itemid) => {
    const options = {
        method: "DELETE",
        credentials: "include",
    };
    await fetch(`http://${backendIPAddress}/courseville/` + itemid + '.' + uid, options)
        .then((response) => response.json())
        .catch((error) => console.error(error));
};

function pin(itemid) {
    getAssignmentFromDB();
    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].itemid == itemid) {
            dbPin(asmnt[i]);
            asmnt[i].pinned = true;
        }
    }
    updateAssignments();
}

function unpin(itemid) {
    getAssignmentFromDB()
    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].itemid == itemid) {
            dbUnPin(asmnt[i])
            asmnt[i].pinned = false;
        }
    }
    updateAssignments();
}

async function updateNote(itemid, note) {
    getAssignmentFromDB()
    for (let i = 0; i < asmnt.length; i++) {
        if (asmnt[i].itemid == itemid) {
            await deleteAssignment(asmnt[i].itemid);
            addAssignment(asmnt[i], asmnt[i].pinned, note)
            asmnt[i].note = note
        }
    }
}

const dbPin = async(assignment) => {
    const itemid = assignment.itemid;
    await deleteAssignment(itemid);
    addAssignment(assignment, true, "");
}

const dbUnPin = async(assignment) => {
    const itemid = assignment.itemid;
    await deleteAssignment(itemid);
    addAssignment(assignment, false, "");
}

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