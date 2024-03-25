
// function to check if admin is logged in
function loginAdmin(adminId, adminUsername, adminFullName) {
    localStorage.setItem('adminId', `${adminId}`);
    localStorage.setItem('adminUsername', `${adminUsername}`);
    localStorage.setItem('adminName', `${adminFullName}`);
}


// function to logout admin
function logoutAdmin() {
    localStorage.removeItem('adminId');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminName');
    window.location.href = 'index.html';
}


// function to check if admin is logged in
function isAdminLoggedIn() {
    let AdminLoggedIn = localStorage.getItem('adminId') !== null;
    return AdminLoggedIn;
}


// function to update admin session details
function updateAdminSessionDetails(adminId, adminUsername, adminFullName) {
    localStorage.setItem('adminId', `${adminId}`);
    localStorage.setItem('adminUsername', `${adminUsername}`);
    localStorage.setItem('adminName', `${adminFullName}`);
}
