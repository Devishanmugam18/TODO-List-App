//UI constants
const form = document.querySelector("#todo-form"); //get the form element
const list = document.querySelector("#todo-list");
const buttonAddTodo = document.querySelector("#button-add-todo");
const toggles = document.querySelectorAll(".todo-type-toggles > button");

//Enums
const states = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
};

//Get Data on page load
let TODOs = []; //array to store the tasks
try {
  if (localStorage["data"]) {
    TODOs = JSON.parse(localStorage["data"]); //parse out the data
  }
  if (!Array.isArray(TODOs)) {
    TODOs = [];
  }
} catch (e) {
  console.error("Error parsing local storage data", e);
  TODOs = [];
}

function buildUI(state) {
  let HTML = ``;
  let viewTODOs = [];

  if (state === states.COMPLETED) {
    //if the state is completed, then filter out the completed tasks
    viewTODOs = TODOs.filter((todo) => todo.complete); //
  } else {
    //if the state is active, then filter out the active tasks
    viewTODOs = TODOs.filter((todo) => !todo.complete);
  }

  if (viewTODOs.length === 0) {
    HTML = `<li class="empty">Nothing to do!</li>`;
  }
  viewTODOs.forEach((todo) => {
    if (todo !== null) {
      HTML += `<li id="${todo.id}" style="view-transition-name:list-item-${todo.id};" data-complete="${todo.complete}">
    <span class="text">${todo.title}</span>
    <button aria-label="Complete" class="button-complete">
      <svg width="20" height="20" viewBox="0 0 241.44 259.83" class="svg-check">
        <polyline pathLength="1" points="16.17 148.63 72.17 225.63 225.17 11.63"/>
      </svg>  
    </button>
    </li>`;
    }
  });
  console.log("HTML for todo list", HTML);
  list.innerHTML = HTML;
}

//add event listener to the form
form.addEventListener("submit", (event) => {
  event.preventDefault(); //prevent the default form submission
  //add todo task to data and render in UI

  //Don't allow empty todo
  if (!form[0].value) {
    buttonAddTodo.classList.add("shake");
    return;
  }
  addTodo(event);
  //    reset the form after adding the task.So that previous task will not sitting in the input field,
  //    it will go back to blank.
  form.reset();
});
buttonAddTodo.addEventListener("animationend", () => {
  buttonAddTodo.classList.remove("shake", "added");
});

function addTodo() {
  TODOs.push({
    //add the task to the array
    title: form[0].value, //event.target[0] is the input field
    complete: false, //when we add a new task, it is not completed. So, false
    id: self.crypto.randomUUID(), //browser gives a unique id for free
  });

  localStorage["data"] = JSON.stringify(TODOs); //store the tasks in local storage
  buildUI();
  buttonAddTodo.classList.add("added");
}

document.documentElement.addEventListener("click", (event) => {
  if (event.target.classList.contains("button-complete")) {
    toggleTodo(event);
  }
});

list.addEventListener("dblclick", (event) => {
  const listItem = event.target.closest("li");

  // If already editing, let it be.
  if (listItem.classList.contains("editing")) return;

  listItem.classList.add("editing");
  const textItem = listItem.querySelector(".text");
  listItem.insertAdjacentHTML(
    "beforeend",
    ` <form onsubmit="updateTodo(event);" class="form-edit">
      <input onblur="updateTodo(event);" type="text" class="input-edit" value="${textItem.textContent}" />
    </form>`
  );

  const input = listItem.querySelector(".input-edit");
  input.focus();

  //put cursor at end of input
  input.setSelectionRange(input.value.length, input.value.length);
});

function updateTodo(event) {
  event.preventDefault();

  const listItem = event.target.closest("li");
  const textItem = listItem.querySelector(".text");
  const inputItem = listItem.querySelector(".input-edit");
  const form = listItem.querySelector(".form-edit");

  textItem.textContent = inputItem.value;
  listItem.classList.remove("editing");
  form.remove();

  TODOs = TODOs.map((todo) => {
    if (todo.id === listItem.id) {
      todo.title = inputItem.value;
    }
    return todo;
  });
  localStorage["data"] = JSON.stringify(TODOs);
}

function toggleTodo(event) {
  const listItem = event.target.parentElement;
  console.log("list item", listItem);
  console.log("list item dataset", listItem.dataset);
  //Trigger complete animation
  listItem.classList.toggle("complete");
  setTimeout(() => {
    if (listItem.dataset.complete === "true") {
      // remove the checked off item on completed tab
      TODOs = TODOs.filter((todo) => todo.id != listItem.id);

      //if the browser does not support view transition, then directly build the UI
      if (!document.startViewTransition) {
        buildUI(states.COMPLETED); //build the UI based on the state
      } else {
        //if browser supports view transition, then start the transition
        document.startViewTransition(() => {
          buildUI(); //build the UI
        });
      }
    } else {
      // else block is executed if complete status is false for the task item
      TODOs.forEach((todo) => {
        //iterate through the tasks
        if (todo.id === listItem.id) {
          //mark the task as complete
          todo.complete = !todo.complete;
        }
      });
      //
      if (!document.startViewTransition) {
        buildUI(states.ACTIVE);
      } else {
        document.startViewTransition(() => {
          buildUI();
        });
      }
    }
    localStorage["data"] = JSON.stringify(TODOs);
  }, 1000);
}

toggles.forEach((toggle) => {
  toggle.addEventListener("click", (event) => {
    toggles.forEach((toggle) => {
      toggle.setAttribute("aria-pressed", false);
    });
    toggle.setAttribute("aria-pressed", true);

    if (toggle.textContent === states.ACTIVE) {
      buildUI(states.ACTIVE);
    } else {
      buildUI(states.COMPLETED);
    }
  });
});

buildUI();
