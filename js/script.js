/* ================= ADD TASK ================= */

function addTask(e) {
    e.preventDefault();

    const title = document.getElementById("ttitle").value.trim();
    const category = document.getElementById("category").value.trim();
    const time = document.getElementById("time").value;
    const description = document.getElementById("description").value.trim();

    if (!title || !category || !time) {
        alert("Please Enter Task Details");
        return;
    }

    const newTask = new TaskList(title, category, time, description);

    const appData = JSON.parse(localStorage.getItem("taskApp"));

    appData.TaskList.push(newTask);

    localStorage.setItem("taskApp", JSON.stringify(appData));
    showToast("New Task Added!");
    displayTasks();
}

/* ================= Version CONSTRUCTOR ================= */

function VersionObj(v, tasks) {
    this.version = v;
    this.TaskList = tasks;
}

const storedApp = JSON.parse(localStorage.getItem("taskApp"));

if (!storedApp || storedApp.version !== 'v1' || !Array.isArray(storedApp.TaskList)) {
    const oldTasks = storedApp && Array.isArray(storedApp.TaskList) ? storedApp.TaskList : [];

    const appData = new VersionObj("v1", oldTasks);
    localStorage.setItem("taskApp", JSON.stringify(appData));
}


/* ================= TASK CONSTRUCTOR ================= */

function TaskList(title, category, time, description) {
    this.id = crypto.randomUUID();
    this.Tasktitle = title;
    this.Taskcategory = category;
    this.Tasktime = time;
    this.Taskdescription = description;
    this.status = "Pending";
}

/* ================= DISPLAY TASKS ================= */

let activeCategory = "ALL";
let sortByTime = "NONE"; // NONE | ASC | DESC

function displayTasks() {
    const list = document.getElementById("taskList");
    const taskLottie = document.getElementById("tasklottie");
    const heading = document.getElementById("task_list_heading");
    const clearContainer = document.getElementById("clear_Button");
    const detailSection = document.getElementById("detail-section");

    list.innerHTML = "";

    const appData = JSON.parse(localStorage.getItem("taskApp"));
    let tasks = appData.TaskList || [];

    tasks = sortTasksByTime(tasks);
    // const tasks =
    //     (JSON.parse(localStorage.getItem("taskApp"))).TaskList || [];
    const filteredTasks =
        activeCategory === "ALL"
            ? tasks
            : activeCategory === "DONE"
                ? tasks.filter(t => t.status === "Done")
                : tasks.filter(t => t.Taskcategory === activeCategory);

    if (tasks.length == 0) {
        heading.innerText = "No Tasks Exist in Your Task List";
        clearContainer.innerHTML = "";
        list.style.display = "none";
        taskLottie.style.display = "block";
        detailSection.style.display = "none";
        return;
    }

    list.style.display = "";
    taskLottie.style.display = "none";
    detailSection.style.display = "block";
    heading.innerText = "Your Tasks List 📝";

    document.getElementById("totalT").innerText =
        "Total Tasks: " + tasks.length;

    document.getElementById("pendingT").innerText =
        "Pending Tasks: " +
        tasks.filter(t => t.status === "Pending").length;

    let countDelayed = 0;
    let countUrgent = 0;

    const now = new Date();

    tasks.forEach(t => {
        const diff = new Date(t.Tasktime) - now;

        if (t.status === "Pending" && diff < 86400000) {
            diff > 0 ? countUrgent++ : countDelayed++;
        }
    });

    document.getElementById("delayedT").innerText =
        "Delayed Tasks: " + countDelayed;

    document.getElementById("urgentT").innerText =
        "Urgent Tasks: " + countUrgent;

    document.getElementById("completedT").innerText =
        "Completed Tasks: " +
        tasks.filter(t => t.status !== "Pending").length;

    updateDetail(tasks[0]);

    /* ---------- CLEAR BUTTON ---------- */

    clearContainer.innerHTML = "";

    const clearBtn = document.createElement("button");
    clearBtn.textContent = "Clear All Tasks";
    clearBtn.className = "inputbtn";

    clearBtn.onclick = () => {
        // localStorage.removeItem("taskApp");
        const appData = JSON.parse(localStorage.getItem("taskApp"));
        appData.TaskList = [];
        localStorage.setItem("taskApp", JSON.stringify(appData));
        showToast("All Tasks Deleted!");
        displayTasks();
    };

    clearContainer.append(clearBtn);

    /* ---------- FILTER BAR ---------- */

    let taskfilter = document.getElementById("taskfilter");

    if (!taskfilter) {
        taskfilter = document.createElement("div");
        taskfilter.id = "taskfilter";
        list.append(taskfilter);
    }

    taskfilter.innerHTML = "";

    const cats = [...new Set(tasks.map(t => t.Taskcategory))];

    createFilterBtn("ALL", taskfilter);
    createFilterBtn("DONE", taskfilter);
    createSortToggleBtn(taskfilter);;
    cats.forEach(cat =>
        createFilterBtn(cat, taskfilter)
    );

    /* ---------- TASK LIST ---------- */

    filteredTasks.forEach(item => {
        const taskItem = document.createElement("li");
        taskItem.style.cursor = "pointer";
        taskItem.className = "fade-left";

        const itemHeadingDiv =
            document.createElement("div");
        itemHeadingDiv.className = "taskhead";

        const itemOptionsDiv = document.createElement("div");

        const itemHeading =
            document.createElement("h4");

        const itemTime =
            document.createElement("span");
        itemTime.className = "task_time";

        const itemDesc =
            document.createElement("p");

        const itemStatus =
            document.createElement("span");
        const itemDelete =
            document.createElement("span");

        itemHeading.textContent =
            item.Tasktitle.slice(0, 14) +
            " - " +
            item.Taskcategory.slice(0, 8);

        const dateObj =
            new Date(item.Tasktime);

        const formattedTime =
            formatDate(item.Tasktime);

        const diff = dateObj - new Date();

        itemTime.style.color =
            diff < 86400000 && diff > 0
                ? "red"
                : diff > 86400000
                    ? "green"
                    : "gray";

        itemTime.textContent = formattedTime;

        itemDesc.textContent =
            item.Taskdescription.slice(0, 60);

        itemStatus.textContent =
            item.status === "Pending" ? "⏳" : "✅";

        itemStatus.style.cursor = "pointer";
        item.status === "Pending" ? itemStatus.setAttribute('title', 'Pending') : itemStatus.setAttribute('title', 'Done');

        item.status === "Done" ? (itemDelete.textContent = "🗑️", itemDelete.setAttribute('title', 'Delete Task')) : (itemDelete.style.display = "none");

        itemStatus.onclick = () => {
            const all =
                JSON.parse(localStorage.getItem("taskApp")) || [];

            const t = all.TaskList.find(x => x.id === item.id);
            if (t) t.status = "Done";

            localStorage.setItem(
                "taskApp",
                JSON.stringify(all)
            );

            displayTasks();
        };
        itemDelete.onclick = () => {
            const all =
                JSON.parse(localStorage.getItem("taskApp")) || [];
            all.TaskList = all.TaskList.filter(x => x.id != item.id);

            localStorage.setItem(
                "taskApp",
                JSON.stringify(all)
            );

            displayTasks();
        };

        taskItem.onclick = () =>

            updateDetail(item);

        itemOptionsDiv.append(
            itemStatus,
            itemDelete
        );

        itemHeadingDiv.append(
            itemHeading,
            itemTime,
            itemOptionsDiv
        );


        taskItem.append(
            itemHeadingDiv,
            itemDesc
        );

        list.append(taskItem);
    });
}

/* ================= FILTER BUTTON ================= */

function createFilterBtn(name, parent) {
    const btn = document.createElement("span");

    btn.textContent =
        name === "ALL" ? "All" : name === "DONE" ? "Done" : name.slice(0, 8);

    btn.className = "filter-item";

    if (activeCategory === name)
        btn.classList.add("active");

    btn.onclick = () => {
        activeCategory = name;
        displayTasks();
    };

    parent.append(btn);
}
function createSortToggleBtn(parent) {
    const btn = document.createElement("span");

    let label =
        sortByTime === "NONE"
            ? "Sort: Off"
            : sortByTime === "ASC"
                ? "Sort: ↑ Time"
                : "Sort: ↓ Time";

    btn.textContent = label;
    btn.className = "filter-item sort-btn";

    btn.onclick = () => {
        if (sortByTime === "NONE") {
            sortByTime = "ASC";
        } else if (sortByTime === "ASC") {
            sortByTime = "DESC";
        } else {
            sortByTime = "NONE";
        }

        displayTasks();
    };

    parent.append(btn);
}


/* ================= DETAIL ================= */

function updateDetail(item) {
    const task_detail =
        document.getElementById("task-detail");

    const diff =
        new Date(item.Tasktime) - new Date();

    const { days, hours } =
        msToDaysHours(diff);

    task_detail.querySelector("h2 span").innerText =
        item.Tasktitle;

    task_detail.querySelector("h4 span").innerText =
        item.Taskcategory;

    task_detail.querySelector("h6 span").innerText =
        formatDate(item.Tasktime);

    task_detail.querySelector("p span").innerText =
        days > 0
            ? days + " Days, " + hours + " Hours"
            : hours + " Hours";

    task_detail.querySelector(".description").innerText =
        item.Taskdescription;


    // Using datasetid to update the item later.
    task_detail.querySelector("h2 span").dataset.id = item.id;
    task_detail.querySelector("h2 span").dataset.field = "Tasktitle";

    task_detail.querySelector("h4 span").dataset.id = item.id;
    task_detail.querySelector("h4 span").dataset.field = "Taskcategory";

    task_detail.querySelector("h6 span").dataset.id = item.id;
    task_detail.querySelector("h6 span").dataset.field = "Tasktime";

    task_detail.querySelector(".description").dataset.id = item.id;
    task_detail.querySelector(".description").dataset.field = "Taskdescription";
}

/* ================= HELPERS ================= */

function formatDate(date) {
    return new Date(date)
        .toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        })
        .replace(",", "");
}

function msToDaysHours(ms) {
    const totalHours =
        Math.floor(ms / 3600000);

    return {
        days: Math.floor(totalHours / 24),
        hours: totalHours % 24
    };
}

function sortTasksByTime(tasks) {
    if (sortByTime === "NONE") return tasks;

    return [...tasks].sort((a, b) => {
        const t1 = new Date(a.Tasktime);
        const t2 = new Date(b.Tasktime);

        return sortByTime === "ASC"
            ? t1 - t2
            : t2 - t1;
    });
}

/* ================= SpanToInput for Item Updates ================= */

function textToInput(textElement) {
    const inputValue = textElement.textContent.trim();
    const tag = textElement.tagName.toLowerCase(); // span, h4, etc
    const inputElement = document.createElement(tag == "div" ? "textarea" : "input");
    inputElement.type = textElement.dataset.field === "Tasktime" ? "datetime-local" : "text";
    inputElement.value = inputValue;
    if (tag == "div") {
        inputElement.classList.add("detailUpdate")
    }

    inputElement.addEventListener("blur", function () {
        inputToText(this, tag, textElement.dataset.id, textElement.dataset.field);
    });

    textElement.parentNode.replaceChild(inputElement, textElement);
    inputElement.focus();
}

function inputToText(inputElement, tag, taskId, field) {
    const textElement = document.createElement(tag);

    textElement.textContent = inputElement.value;
    textElement.dataset.id = taskId;
    textElement.dataset.field = field;
    if (tag === 'div') {
        textElement.classList.add('description');
    }

    textElement.onclick = function () {
        textToInput(this);
    };

    inputElement.parentNode.replaceChild(textElement, inputElement);

    updateItem(taskId, field, inputElement.value);
}

/* ================= Updating Item Details ================= */

function updateItem(taskId, field, newValue) {
    let tasks = JSON.parse(localStorage.getItem("taskApp")) || [];

    const index = tasks.TaskList.findIndex(t => t.id === taskId);

    if (index === -1) return;

    tasks.TaskList[index][field] = newValue;

    localStorage.setItem("taskApp", JSON.stringify(tasks));

    displayTasks();
}

/* ================= THEME ================= */

const toggle =
    document.getElementById("themeToggle");

toggle.addEventListener("click", () => {
    const root = document.documentElement;

    const next =
        root.dataset.theme === "dark"
            ? "light"
            : "dark";

    root.dataset.theme = next;
    localStorage.setItem("theme", next);
});

const savedTheme =
    localStorage.getItem("theme");

if (savedTheme) {
    document.documentElement.dataset.theme =
        savedTheme;
} else if (
    window.matchMedia("(prefers-color-scheme: dark)").matches
) {
    document.documentElement.dataset.theme =
        "dark";
}


/* ================= Toastify ================= */

function showToast(message, type = "success") {
    Toastify({
        text: message,
        duration: 2500,
        gravity: "top",
        position: "right",
        close: true,
        stopOnFocus: true,
        style: {
            background:
                type === "error"
                    ? "linear-gradient(to right, #ef4444, #dc2626)"
                    : "linear-gradient(to right, #22c55e, #16a34a)"
        }
    }).showToast();
}

/* ================= INIT ================= */

displayTasks();


