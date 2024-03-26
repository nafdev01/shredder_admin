const { invoke } = window.__TAURI__.core;

const LoginSwal = Swal.mixin({
    showConfirmButton: false,
    didOpen: () => {
        Swal.showLoading();
        Swal.getPopup().querySelector("b");
    },
});

const adminForm = document.querySelector('#admin-login-form');

adminForm.addEventListener('submit', (event) => {
    LoginSwal.fire({
        title: 'Logging in admin ...',
        html: 'Please wait while we log you in <b></b>',
    });

    event.preventDefault();

    const adminUsername = document.querySelector('#admin-signin-username').value;
    const adminPassword = document.querySelector('#admin-signin-password').value;

    invoke('authenticate_admin', {
        username: adminUsername,
        password: adminPassword,
    }).then(response => {
        LoginSwal.close();

        let admin = response;
        loginAdmin(admin.adminid, admin.username, admin.fullname);
        Swal.fire({
            title: `Welcome back ${admin.username}!`,
            html: `Please wait while we log you in <b></b>`,
            timer: 3000,
            didOpen: () => {
                Swal.showLoading();
                Swal.getPopup().querySelector("b");
            },
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                window.location.href = 'admin-dashboard.html';
            }
        });
    }
    ).catch(error => {
        LoginSwal.close();

        // if the error is lowercase is query retured no rows
        if (error.toString().toLowerCase().includes('query returned no rows')) {
            var errorMessage = 'Invalid admin username or password';
        }

        Swal.fire({
            title: 'Error!',
            text: error, // ensure error is a string
            icon: errorMessage,
            confirmButtonText: 'Ok'
        });
    });
});
