const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('error-email');
const passwordError = document.getElementById('error-password');
var button = document.getElementById('signUpButton');

emailInput.addEventListener('input', validateEmail);
passwordInput.addEventListener('input', validatePassword);

function validateEmail() {
  const email = emailInput.value;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!regex.test(email)) {
    emailError.textContent = 'El email no es válido.';
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
    passwordError.textContent = 'La contraseña debe tener al entre 8 y 16 caracteres, al menos un dígito, una minúscula, una mayúscula y al menos un caracter no alfanumérico.';
    button.disabled = true;
  } else {
    passwordError.textContent = '';
    button.disabled = false;
  }
}