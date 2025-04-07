document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const validUser = {
        username: 'c.llanos',
        password: '3525913',
        role: 'admin'
    };

    if (username === validUser.username && password === validUser.password) {
        sessionStorage.setItem('userRole', validUser.role);
        sessionStorage.setItem('username', validUser.username);
        window.location.href = 'index.html';
        alert('¡Bienvenido Administrador!');
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});