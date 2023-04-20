const backendIPAddress = "127.0.0.1:3000";

const authorizeApplication = () => {
    window.location.href = `http://${backendIPAddress}/courseville/auth_app`;
};

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