
//ESTE SCRIPT YA NO LO USO PERO LO DEJO POR SI ACASO

const editButtonAllUsersTab = document.getElementById('editButtonAllUsersTab');
const saveButtonAllUsersTab = document.getElementById('saveButtonAllUsersTab');
const cancelButtonAllUsersTab = document.getElementById('cancelButtonAllUsersTab');

const nameInputAllUsers = document.getElementById('nameInputAllUsers');
const emailInputAllUsers = document.getElementById('emailInputAllUsers');
const roleInputAllUsers = document.getElementById('roleInputAllUsers');
const passwordInputAllUsers = document.getElementById('passwordInputAllUsers');

const allUsersInputs = document.getElementsByClassName('allUsersInput');


function editButton() {
    changeButtonsDisplay();
}

editButtonAllUsersTab.addEventListener('click', () => {
    alert('HOLA' + data);
});
saveButtonAllUsersTab.addEventListener('click', () => {
    changeButtonsDisplay();
    changeInputsProperty();
});
cancelButtonAllUsersTab.addEventListener('click', () => {
    changeButtonsDisplay();
    changeInputsProperty();
});


function changeButtonsDisplay() {
    if (editButtonAllUsersTab.style.display === "none") {
        editButtonAllUsersTab.style.display = "block";
        saveButtonAllUsersTab.style.display = "none";
        cancelButtonAllUsersTab.style.display = "none";

    } else {
        editButtonAllUsersTab.style.display = "none";
        saveButtonAllUsersTab.style.display = "block";
        cancelButtonAllUsersTab.style.display = "block";
    }
}

function changeInputsProperty() {
    if (nameInputAllUsers.disabled) {
        nameInputAllUsers.disabled = false;
        emailInputAllUsers.disabled = false;
        roleInputAllUsers.disabled = false;
        passwordInputAllUsers.disabled = false;
    } else {
        nameInputAllUsers.disabled = true;
        emailInputAllUsers.disabled = true;
        roleInputAllUsers.disabled = true;
        passwordInputAllUsers.disabled = true;
    }
}
