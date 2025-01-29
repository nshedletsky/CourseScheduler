document.addEventListener("DOMContentLoaded", function () {
    const departmentFilter = document.getElementById("department-filter");
    const courseTable = document.getElementById("course-table-body");

    if (!departmentFilter) {
        console.error("Dropdown element NOT found! Check if it's in index.html.");
        return;
    }

    fetch("data/courses.json")
        .then(response => response.json())
        .then(courses => {
            console.log("Courses loaded:", courses);
            populateDepartmentFilter(courses);
            displayCourses(courses);
            
            departmentFilter.addEventListener("change", function () {
                const selectedDepartment = this.value;
                const filteredCourses = selectedDepartment === "all"
                    ? courses
                    : courses.filter(course => course.department === selectedDepartment);
                
                displayCourses(filteredCourses);
            });
        })
        .catch(error => console.error("Error loading course data:", error));
});

function populateDepartmentFilter(courses) {
    const departmentFilter = document.getElementById("department-filter");
    const departments = [...new Set(courses.map(course => course.department))];

    if (departments.length === 0) {
        console.warn("No departments found in courses.");
        return;
    }

    departments.forEach(department => {
        const option = document.createElement("option");
        option.value = department;
        option.textContent = department;
        departmentFilter.appendChild(option);
    });
}

function displayCourses(courses) {
    const courseTable = document.getElementById("course-table-body");
    courseTable.innerHTML = "";

    if (courses.length === 0) {
        courseTable.innerHTML = "<tr><td colspan='5'>No courses available</td></tr>";
        return;
    }

    courses.forEach(course => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.department}</td>
            <td>${course.semester}</td>
            <td>${course.time}</td>
        `;
        courseTable.appendChild(row);
    });
}
