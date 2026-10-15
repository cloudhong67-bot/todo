(function () {
  "use strict";

  var STORAGE_KEY = "todo-app.v1";
  var FILTERS = {
    all: function () { return true; },
    active: function (t) { return !t.done; },
    completed: function (t) { return t.done; }
  };
  var EMPTY_MESSAGES = {
    all: "할 일이 없어요. 하나 추가해 보세요!",
    active: "진행 중인 할 일이 없어요.",
    completed: "완료한 할 일이 없어요."
  };

  var todos = load();
  var filter = "all";
  var editingId = null;

  var form = document.getElementById("new-todo-form");
  var input = document.getElementById("new-todo");
  var toggleAll = document.getElementById("toggle-all");
  var list = document.getElementById("todo-list");
  var empty = document.getElementById("empty");
  var footer = document.getElementById("footer");
  var count = document.getElementById("count");
  var clearCompleted = document.getElementById("clear-completed");
  var filterLinks = document.querySelectorAll(".filters a");

  // ---- 저장소 ----

  function load() {
    try {
      var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(data)) return [];
      return data.filter(function (t) {
        return t && typeof t.id === "string" && typeof t.text === "string";
      }).map(function (t) {
        return { id: t.id, text: t.text, done: !!t.done, createdAt: t.createdAt || Date.now() };
      });
    } catch (e) {
      return [];
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      // 저장소를 쓸 수 없는 환경(사생활 보호 모드 등)에서는 메모리에만 유지
    }
  }

  function newId() {
    if (window.crypto && typeof crypto.randomUUID === "function") return crypto.randomUUID();
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
  }

  // ---- 상태 변경 ----

  function commit() {
    save();
    render();
  }

  function addTodo(text) {
    todos.push({ id: newId(), text: text, done: false, createdAt: Date.now() });
    commit();
  }

  function findTodo(id) {
    for (var i = 0; i < todos.length; i++) {
      if (todos[i].id === id) return todos[i];
    }
    return null;
  }

  function removeTodo(id) {
    todos = todos.filter(function (t) { return t.id !== id; });
    commit();
  }

  function finishEdit(id, text) {
    if (editingId !== id) return; // Enter 후 blur 등 중복 호출 방지
    editingId = null;
    var todo = findTodo(id);
    if (!todo) return render();
    text = text.trim();
    if (text) {
      todo.text = text;
      commit();
    } else {
      removeTodo(id);
    }
  }

  function cancelEdit() {
    editingId = null;
    render();
  }

  // ---- 렌더링 ----

  function renderItem(todo) {
    var li = document.createElement("li");
    li.className = "todo-item" + (todo.done ? " done" : "");
    li.dataset.id = todo.id;

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "toggle";
    checkbox.checked = todo.done;
    checkbox.setAttribute("aria-label", "완료 표시: " + todo.text);
    li.appendChild(checkbox);

    if (editingId === todo.id) {
      var edit = document.createElement("input");
      edit.type = "text";
      edit.className = "edit-input";
      edit.value = todo.text;
      edit.maxLength = 200;
      edit.setAttribute("aria-label", "할 일 수정");
      li.appendChild(edit);
    } else {
      var label = document.createElement("span");
      label.className = "todo-text";
      label.textContent = todo.text;
      label.title = "더블클릭하여 수정";
      li.appendChild(label);
    }

    var del = document.createElement("button");
    del.type = "button";
    del.className = "delete-btn";
    del.textContent = "×";
    del.setAttribute("aria-label", "삭제: " + todo.text);
    li.appendChild(del);

    return li;
  }

  function render() {
    var visible = todos.filter(FILTERS[filter]);
    var activeCount = todos.filter(FILTERS.active).length;
    var completedCount = todos.length - activeCount;

    list.replaceChildren.apply(list, visible.map(renderItem));
    empty.textContent = visible.length ? "" : EMPTY_MESSAGES[todos.length ? filter : "all"];

    footer.hidden = todos.length === 0;
    count.textContent = "남은 할 일 " + activeCount + "개";
    clearCompleted.hidden = completedCount === 0;

    toggleAll.disabled = todos.length === 0;
    toggleAll.checked = todos.length > 0 && activeCount === 0;

    filterLinks.forEach(function (a) {
      a.classList.toggle("selected", a.dataset.filter === filter);
    });

    var editInput = list.querySelector(".edit-input");
    if (editInput) {
      editInput.focus();
      editInput.setSelectionRange(editInput.value.length, editInput.value.length);
    }
  }

  // ---- 이벤트 ----

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    addTodo(text);
  });

  toggleAll.addEventListener("change", function () {
    var done = toggleAll.checked;
    todos.forEach(function (t) { t.done = done; });
    commit();
  });

  clearCompleted.addEventListener("click", function () {
    todos = todos.filter(FILTERS.active);
    commit();
  });

  function itemId(el) {
    var li = el.closest(".todo-item");
    return li ? li.dataset.id : null;
  }

  list.addEventListener("change", function (e) {
    if (!e.target.classList.contains("toggle")) return;
    var todo = findTodo(itemId(e.target));
    if (!todo) return;
    todo.done = e.target.checked;
    commit();
  });

  list.addEventListener("click", function (e) {
    if (!e.target.classList.contains("delete-btn")) return;
    removeTodo(itemId(e.target));
  });

  list.addEventListener("dblclick", function (e) {
    if (!e.target.classList.contains("todo-text")) return;
    editingId = itemId(e.target);
    render();
  });

  list.addEventListener("keydown", function (e) {
    if (!e.target.classList.contains("edit-input")) return;
    if (e.isComposing) return; // 한글 조합 중 Enter는 무시
    if (e.key === "Enter") {
      finishEdit(itemId(e.target), e.target.value);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  });

  list.addEventListener("focusout", function (e) {
    if (!e.target.classList.contains("edit-input")) return;
    finishEdit(itemId(e.target), e.target.value);
  });

  function readFilterFromHash() {
    var name = location.hash.replace(/^#\/?/, "");
    filter = FILTERS.hasOwnProperty(name) ? name : "all";
    render();
  }

  window.addEventListener("hashchange", readFilterFromHash);

  // 다른 탭에서 변경하면 동기화
  window.addEventListener("storage", function (e) {
    if (e.key !== STORAGE_KEY) return;
    todos = load();
    editingId = null;
    render();
  });

  document.getElementById("today").textContent = new Date().toLocaleDateString("ko-KR", {
    year: "numeric", month: "long", day: "numeric", weekday: "long"
  });

  readFilterFromHash();
})();
