const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passowrdInput');
const nameInput = document.getElementById('nameInput');

const emailError = document.getElementById('error-email');
const passwordError = document.getElementById('error-password');
const nameError = document.getElementById('error-name');

var button = document.getElementById('signUpButton') || document.getElementById('saveUserButton')

emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);
nameInput.addEventListener('input', validateName);


function validateEmail() {
  const email = emailInput.value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    emailError.textContent = 'Invalid email';
    button.disabled = true;
  } else {
    emailError.textContent = '';
    button.disabled = false;
  }
}

function validatePassword() {
  const password = passwordInput.value;
  const regex = /^(?=.*\d)(?=.*[\u0021-\u002b\u003c-\u0040])(?=.*[A-Z])(?=.*[a-z])\S{8,16}$/;

  if (!regex.test(password)) {
    passwordError.textContent = 'The password must have between 8 and 16 chars including a digit, lower and uppder case and a non-alphanumeric character';
    button.disabled = true;
  } else {
    passwordError.textContent = '';
    button.disabled = false;
  }
}

function validateName() {
  const name = emailInput.value;
  const regex = /^[a-zA-Z]+ [a-zA-Z]+$/;

  if (name == '') {
    nameError.textContent = 'Name is required';
    button.disabled = true;
  } else if (!regex.test(name)) {
    nameError.textContent = 'Enter a valid full name';
    button.disabled = true;
  }else {
    nameError.textContent = '';
    button.disabled = false;
  }

}

showPasswordCheckbox.addEventListener("change", function () {
  if (this.checked) {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
});