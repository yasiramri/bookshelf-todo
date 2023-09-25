document.addEventListener('DOMContentLoaded', function (){
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addTodo();
    });
    if (isStorageExist()) {
        loadDataFromStorage();
      }
});

    const todos = [];
    const RENDER_EVENT = 'render-todo';

    function addTodo() {
        const textBookTitle = document.getElementById('inputBookTitle').value;
        const textBookAuthor = document.getElementById('inputBookAuthor').value;
        const textBookYear = document.getElementById('inputBookYear').value;
        const checkboxIsComplete = document.getElementById('inputBookIsComplete');

        const generateID = generateId();
        const todoObject = generateTodoObject(generateID, textBookTitle, textBookAuthor, textBookYear, checkboxIsComplete.checked, false);
        todos.push(todoObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }
    

    function generateId() {
        return +new Date();
    }

    function generateTodoObject(id, title, author, year, isCompleted){
        return{
            id,
            title,
            author,
            year,
            isCompleted
        }
    }

    function makeTodo(todoObject) {
        const inputBookTitle = document.createElement('h3');
        inputBookTitle.innerText = todoObject.title;

        const inputBookAuthor = document.createElement('p');
        inputBookAuthor.innerText = `Penulis: ${todoObject.author}`;

        const inputBookYear = document.createElement('p');
        inputBookYear.innerText = `Tahun: ${todoObject.year}`;

        const actionDiv = document.createElement('div');
        actionDiv.classList.add('action');

        const container = document.createElement('article');
        container.classList.add('book_item');
        container.append(inputBookTitle, inputBookAuthor, inputBookYear, actionDiv);
        container.setAttribute('id', `todo-${todoObject.id}`);

        const checkboxIsComplete = document.createElement('input');
        checkboxIsComplete.type = 'checkbox';
        checkboxIsComplete.checked = todoObject.isCompleted;

        checkboxIsComplete.addEventListener('change', function() {
            if (checkboxIsComplete.checked) {
                addTaskToCompleted(todoObject.id);
            } else {
                undoTaskFromCompleted(todoObject.id);
            }
        });

        if (todoObject.isCompleted) {
            const undoButton = document.createElement('button');
            undoButton.classList.add('green');
            undoButton.innerText = 'Belum Selesai dibaca'

            undoButton.addEventListener('click', function() {
                undoTaskFromCompleted(todoObject.id);
            });

            const trashButton = document.createElement('button');
            trashButton.classList.add('red');
            trashButton.innerText = 'Hapus buku'


            trashButton.addEventListener('click', function() {
                removeTaskFromCompleted(todoObject.id);
            })
            
            actionDiv.append(undoButton, trashButton);
        } else {
            const checkButton = document.createElement('button');
            checkButton.innerText = 'Selesai dibaca'
            checkButton.classList.add('green');

            checkButton.addEventListener('click', function() {
                addTaskToCompleted(todoObject.id);
            })

            const trashButton = document.createElement('button');
            trashButton.innerText = 'Hapus buku'
            trashButton.classList.add('red');

            trashButton.addEventListener('click', function() {
                removeTaskFromCompleted(todoObject.id);
            })

            actionDiv.append(checkButton, trashButton);
        }
        return container;
    }

    function addTaskToCompleted (todoId){
        const todoTarget = findTodo(todoId);

        if (todoTarget == null) return;

        todoTarget.isCompleted = true;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function findTodo(todoId) {
        for (const todoItem of todos) {
            if (todoItem.id === todoId) {
                return todoItem;
            }
        }
        return null;
    }

    function removeTaskFromCompleted(todoId) {
        const todoTarget = findTodoIndex(todoId);

        if (todoTarget === -1) return;

        todos.splice(todoTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    }

    function undoTaskFromCompleted(todoId) {
        const todoTarget = findTodo(todoId);

        if (todoTarget == null) return;
        
        todoTarget.isCompleted = false;
        document.dispatchEvent(new Event(RENDER_EVENT))
        saveData();
    }

    function findTodoIndex(todoId) {
        for (const index in todos) {
            if (todos[index].id === todoId) {
                return index;
            }
        }
        return -1;
    }

    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(todos);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT))
        }
    }

    const SAVED_EVENT = 'saved-todo';
    const STORAGE_KEY = 'TODO_APPS'

    function isStorageExist() {
        if (typeof (Storage) === undefined) {
            alert('Browser kamu tidak mendukung local storage');
            return false;
        }
        return true;
    }

    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if(data !== null) {
            for (const todo of data) {
                todos.push(todo);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    
    document.addEventListener(SAVED_EVENT, function () {
        console.log(localStorage.getItem(STORAGE_KEY));
      });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBooks();
    });

    function searchBooks() {
        const searchBookTitle = document.getElementById('searchBookTitle').value.toLowerCase();
        
        const filteredBooks = todos.filter(function (todoItem) {
            const lowerCaseTitle = todoItem.title.toLowerCase();
            return lowerCaseTitle.includes(searchBookTitle);
        });
    
        renderFilteredBooks(filteredBooks);
    }

    function renderFilteredBooks(filteredBooks) {
        const uncompletedTODOList = document.getElementById('incompleteBookshelfList');
        uncompletedTODOList.innerHTML = '';
    
        const completedTODOList = document.getElementById('completeBookshelfList');
        completedTODOList.innerHTML = '';
    
        for (const todoItem of filteredBooks) {
            const todoElement = makeTodo(todoItem);
            if (todoItem.isCompleted) {
                completedTODOList.append(todoElement); // Masukkan ke div "Selesai dibaca"
            } else {
                uncompletedTODOList.append(todoElement); // Masukkan ke div "Belum selesai dibaca"
            }
        }
    }
    
document.addEventListener(RENDER_EVENT, function () {
    const uncompletedTODOList = document.getElementById('incompleteBookshelfList');
    uncompletedTODOList.innerHTML = '';

    const completedTODOList = document.getElementById('completeBookshelfList');
    completedTODOList.innerHTML = '';
    
    for (const todoItem of todos) {
        const todoElement = makeTodo(todoItem);
        if(!todoItem.isCompleted){
            uncompletedTODOList.append(todoElement);
        } else
        completedTODOList.append(todoElement);
    }
});