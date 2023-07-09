// Realizar la solicitud de inicio de sesión al backend
const login = async () => {
    const username = 'admin';
    const password = 'admin';

    const response = await fetch('/user/sign/in', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
  
    if (response.ok) {
      const data = await response.json();
      const token = data.token;
      
      // Guardar el token en el almacenamiento local (ejemplo con localStorage)
      localStorage.setItem('token', token);
  
      // Redirigir a otra página o realizar otras acciones
      window.location.href = '/user/sign/up';
    } else {
      // Manejar errores de inicio de sesión
      console.log('Error al iniciar sesión');
    }
  };
  
  // Llamar a la función de inicio de sesión al hacer clic en un botón o enviar un formulario
  document.getElementById('loginButton').addEventListener('click', login);