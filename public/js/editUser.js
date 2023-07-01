const editButton = document.getElementById('editButtonAllUsersTab');
const saveButton = document.getElementById('saveButtonAllUsersTab');
saveButton.disabled=true;
const allInputs = document.querySelectorAll('input[type="text"]');
const inputs = allInputs.getElementByClassName('allUsersInput');

editButton.addEventListener('click', () => {
    inputs.forEach(input => {
        console.log(input.nameInput);
        input.removeAttribute('readonly');
    });
    saveButton.removeAttribute('disabled');
});

saveButton.addEventListener('click', () => {
    const nameInput = document.getElementById('nameInput');
    const emailInput = document.getElementById('emailInput');
    const roleInput = document.getElementById('roleInput');
    const passwordInput = document.getElementById('passowrdInput');

    const updatedName = nameInput.value;
    const updatedEmail = emailInput.value;
    const updatedRole = roleInput.value;
    const updatePass = passwordInput.value;

    // Aquí puedes enviar los datos actualizados a la base de datos mediante una solicitud HTTP (por ejemplo, utilizando fetch o axios)

    // Ejemplo de cómo mostrar una alerta con los datos actualizados
    alert(`Datos actualizados del usuario :\nNombre: ${updatedName}\nCorreo Electrónico: ${updatedEmail}`);

    inputs.forEach(input => {
        input.setAttribute('readonly', true);
    });
    saveButton.setAttribute('disabled', true);
});