// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card with color coding based on deadline status
function createTaskCard(task) {
  const today = dayjs();
  const deadlineDate = dayjs(task.deadline);
  let bgColorClass = "";

  if (deadlineDate.isBefore(today, 'day')) {
    bgColorClass = "bg-danger"; // Task overdue
  } else if (deadlineDate.diff(today, 'day') <= 3) {
    bgColorClass = "bg-warning"; // Task nearing deadline
  }

  const card = `
    <div class="card task-card mb-3 ${bgColorClass}" id="task-${task.id}">
      <div class="card-body">
        <h5 class="card-title">${task.title}</h5>
        <p class="card-text">${task.description}</p>
        <p class="card-text">Deadline: ${task.deadline}</p>
        <button type="button" class="btn btn-danger delete-btn">Delete</button>
      </div>
    </div>
  `;
  return card;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards").empty();
  $("#in-progress-cards").empty();
  $("#done-cards").empty();

  taskList.forEach(task => {
    const card = createTaskCard(task);
    const $taskCard = $(card);
    $(`#${task.status}-cards`).append($taskCard);
    // Make task cards draggable
    $taskCard.draggable({
      revert: "invalid",
      helper: "clone"
    });
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();
  const title = $("#title").val();
  const description = $("#description").val();
  const deadline = $("#deadline").val();
  const status = "todo";
  
  const newTask = {
    id: generateTaskId(),
    title: title,
    description: description,
    deadline: deadline,
    status: status
  };

  taskList.push(newTask);
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", JSON.stringify(nextId));
  
  renderTaskList();
  $("#formModal").modal("hide");
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).closest(".task-card").attr("id").split("-")[1];
  taskList = taskList.filter(task => task.id !== parseInt(taskId));
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.attr("id").split("-")[1];
  const newStatus = $(this).attr("id");

  // Update the status of the task
  taskList.forEach(task => {
    if (task.id === parseInt(taskId)) {
      task.status = newStatus;
      // Change color of task when moved to "Done" section
      if (newStatus === "done") {
        $(`#task-${taskId}`).removeClass("bg-warning bg-danger").addClass("bg-white");
      } else {
        // Reapply original color if moved from "Done" section
        const deadlineDate = dayjs(task.deadline);
        const today = dayjs();
        if (deadlineDate.isBefore(today, 'day')) {
          $(`#task-${taskId}`).removeClass("bg-warning").addClass("bg-danger");
        } else if (deadlineDate.diff(today, 'day') <= 3) {
          $(`#task-${taskId}`).removeClass("bg-danger").addClass("bg-warning");
        }
      }
    }
  });

  // Save updated task list to localStorage and re-render task list
  localStorage.setItem("tasks", JSON.stringify(taskList));
  renderTaskList();
}

// Event listener for adding a new task
$("#addTaskForm").on("submit", handleAddTask);

// Event listener for deleting a task
$(document).on("click", ".delete-btn", handleDeleteTask);

// Event listener for making lanes droppable
$(".lane").droppable({
  drop: handleDrop
});

// Initialize datepicker for the deadline field
$("#deadline").datepicker({
  dateFormat: "yy-mm-dd"
});

// Initialize the task list on page load
$(document).ready(function () {
  renderTaskList();
});
