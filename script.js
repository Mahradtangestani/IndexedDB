let db;
const firstNameInput = document.querySelector("#firstName");
const lastNameInput = document.querySelector("#lastName");
const form = document.querySelector("form");
const list = document.querySelector("ul");

window.onload = () => {
    let request = window.indexedDB.open("contacts", 1);

    request.onerror = () => {
        console.log("Database Failed To Open");
    }


    request.onsuccess = () => {
        console.log("Database Opened Successfully");
        db = request.result;
        displayData();
    }


    request.onupgradeneeded = (e) => {
        let db = e.target.result;
        console.log(db);

        let objectStore = db.createObjectStore('contacts', {
            keyPath: 'id',
            autoIncrement: true
        });


        objectStore.createIndex('firstName', 'firstName', {
            unique: false
        });

        objectStore.createIndex('lastName', 'lastName', {
            unique: false
        });


        console.log("Database Setup Successfully...");

    }


}


const addData = (e) => {
    e.preventDefault();

    let newItem = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value
    };

    let transaction = db.transaction(['contacts'], 'readwrite')


    let request = transaction.objectStore('contacts').add(newItem);


    transaction.onsuccess = () => {
        firstNameInput.value = "";
        lastNameInput.value = "";
    }

    transaction.oncomplete = () => {
        console.log("transaction Completed On Database");
        displayData();
    }


    transaction.onerror = () => {
        console.log("Error Transaction On Database");
    }


}


const displayData = () => {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    let objectStore = db.transaction('contacts').objectStore('contacts');

    objectStore.openCursor().onsuccess = (e) => {
        let cursor = e.target.result;

        if (cursor) {
            let listItem = document.createElement('li');
            let first = document.createElement('p');
            let last = document.createElement('p');

            first.textContent = cursor.value.firstName;
            last.textContent = cursor.value.lastName;

            listItem.appendChild(first);
            listItem.appendChild(last);
            list.appendChild(listItem);

            listItem.setAttribute('data-contact-id', cursor.value.id);

            let deleteButton = document.createElement('button');
            listItem.appendChild(deleteButton);
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener('click', deleteItem);

            cursor.continue();
        } else {
            if (!list.firstChild) {
                let listItem = document.createElement("li");
                listItem.textContent = "There is No Contact...!!!";
                list.appendChild(listItem);
            }
        }


    }


}

const deleteItem = (e) => {

    let contactId = Number(e.target.parentElement.getAttribute('data-contact-id'));

    let transaction = db.transaction(['contacts'], 'readwrite');
    let request = transaction.objectStore('contacts').delete(contactId);

    console.log('Delete Button Clicked');

    transaction.oncomplete = () => {
        e.target.parentElement.parentElement.removeChild(e.target.parentElement);

        console.log(`Contact ${contactId} is deleted`);

        if (!list.firstChild) {
            let listItem = document.createElement("li");
            listItem.textContent = "There is No Contact...!!!";
            list.appendChild(listItem);
        }

    }


}


form.addEventListener('submit', addData);