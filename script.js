const form = document.querySelector("#todo-form"); //get the form element
const list = document.querySelector("#todo-list");
const buttonAddTodo = document.querySelector("#button-add-todo");

//Get Data
let TODOs = []; //array to store the tasks
//make sure the local storage is not empty before parsing it
if (localStorage["data"] !== null && localStorage["data"] !== undefined) {
  TODOs = JSON.parse(localStorage["data"]); //parse out the data
}

function buildUI() {
  let HTML = ``;
  TODOs.forEach((todo) => {
    HTML += `<li id="${todo.id}" style="view-transition-name:list-item-${todo.id};">
    ${todo.title}
    <button aria-label="Complete" class="button-complete">
      <svg width="20" height="20" viewBox="0 0 241.44 259.83" class="svg-check">
        <polyline pathLength="1" points="16.17 148.63 72.17 225.63 225.17 11.63"/>
      </svg>  
    </button>
    </li>`;
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
    completed: false, //when we add a new task, it is not completed. So, false
    id: self.crypto.randomUUID(), //browser gives a unique id for free
  });

  localStorage["data"] = JSON.stringify(TODOs); //store the tasks in local storage
  buildUI();
  buttonAddTodo.classList.add("added");
}

document.documentElement.addEventListener("click", (event) => {
  if (event.target.classList.contains("button-complete")) {
    removeTodo(event);
  }
});

function removeTodo(event) {
  const listItem = event.target.parentElement;
  console.log("list item", listItem);
  //Trigger complete animation
  listItem.classList.toggle("complete");
  console.log("list item", listItem.classList);
  setTimeout(() => {
    TODOs = TODOs.filter((todo) => todo.id !== event.target.parentElement.id);
    localStorage["data"] = JSON.stringify(TODOs);

    if (!document.startViewTransition) {
      buildUI();
    } else {
      document.startViewTransition(() => {
        buildUI();
      });
    }
  }, 1000);
}
buildUI();
