const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passowrdInput');
const emailError = document.getElementById('error-email');
const passwordError = document.getElementById('error-password');
var button = document.getElementById('signUpButton') || document.getElementById('saveUserButton')

emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);

function validateEmail() {
  const email = emailInput.value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    emailError.textContent = 'Invalid email.';
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
    passwordError.textContent = 'The password must have at least 8 and a maximum of 16 characters, at least one digit, one lower case, one upper case and at least one non-alphanumeric character.';
    button.disabled = true;
  } else {
    passwordError.textContent = '';
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