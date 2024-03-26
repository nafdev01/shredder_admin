const { invoke } = window.__TAURI__.core;

const ShredderSwal = Swal.mixin({
    showConfirmButton: false,
    didOpen: () => {
        Swal.showLoading();
        Swal.getPopup().querySelector("b");
    },
});

if (localStorage.getItem('adminId')) {
    const adminId = parseInt(localStorage.getItem('adminId'));

    const searchType = document.getElementById('search-type').value;

    try {

        ShredderSwal.fire({
            title: 'Fetching shred requests ...',
            html: `Please wait while we fetch ${searchType} shred requests <b></b>`,
        });

        invoke(`get_${searchType}_shred_requests`, { requestto: adminId }).then(shredRequests => {

            ShredderSwal.close();

            if (shredRequests.length === 0) {
                document.getElementById('shred-request-table').innerHTML = `
                    <div class="alert alert-info" role="alert">
                        <p class="h4">No ${searchType} shred requests.</p<>
                    </div>
                `;
                return;
            }

            const shredRequestTable = document.getElementById('shred-request-table');
            let tableContent = `
                <thead>
                    <tr>
                        <th>Requested By</th>
                        <th>File Path</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Requested At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
            `;

            shredRequests.forEach(shredRequest => {
                if (shredRequest.requeststatus === "Approved") {
                    var statusIcon = `<i class="far fa-thumbs-up fa-2xl" style="color: #029705;"></i>`
                } else if (shredRequest.requeststatus === "Denied") {
                    var statusIcon = `<i class="far fa-thumbs-down fa-2xl" style="color: #ea0606;"></i>`
                } else if (shredRequest.requeststatus === "Pending") {
                    var statusIcon = `<i class="fas fa-spinner fa-2xl" style="color: orange;"></i>`
                }


                tableContent += `
                    <tr>
                        <td>${shredRequest.requestby}</td>
                        <td>${shredRequest.filepath}</td>
                        <td>${shredRequest.department}</td>
                        <td>${statusIcon}</td>
                        <td>${shredRequest.requestat}</td>
                        <td>
                        <div class="dropdown">
                        <button class="btn btn-sm app-btn-dark dropdown-toggle" type="button" id="actionsDropdown${shredRequest.requestid}" data-bs-toggle="dropdown" aria-expanded="false">
                            Actions
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="actionsDropdown${shredRequest.requestid}">
                            <li>
                                <button class="dropdown-item btn" data-file="${shredRequest.filepath}" data-file-id="${shredRequest.requestid}" onclick="approveShredRequest(this)">Approve</button>
                            </li>
                            <li>
                                <button class="dropdown-item btn" data-file="${shredRequest.filepath}" data-file-id="${shredRequest.requestid}" onclick="denyShredRequest(this)">Deny</button>
                            </li>
                        </ul>
                      </div>
                      
                        </td>
                    </tr>
                `;
            });

            tableContent += '</tbody>';
            shredRequestTable.innerHTML = tableContent;
        });
    } catch (error) {

        ShredderSwal.close();

        Swal.fire({
            title: 'Error!',
            text: `${error}`,
            icon: 'success'
        });
    }
}


function approveShredRequest(approvebutton) {
    const filepath = approvebutton.getAttribute('data-file');
    const fileId = approvebutton.getAttribute('data-file-id');

    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to approve the shred request for the file: <b>${filepath}</b>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Approve',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {

            ShredderSwal.fire({
                title: 'Approving shred request ...',
                html: `Please wait while we approve the shred request for the file: <b>${filepath}</b>`,
            });
        
            invoke('update_shred_request', { requestid: parseInt(fileId), requeststatus: "Approved" }).then(response => {

                ShredderSwal.close();

                if (response == "Success") {
                    Swal.fire({
                        title: 'Approved!',
                        text: `The shred request for the file: ${filepath} has been approved.`,
                        icon: 'success'
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Failed!',
                        text: `The shred request for the file: ${filepath} could not be approved.Error was ${response}`,
                        icon: 'error'
                    });
                }
            }).catch(error => {

                ShredderSwal.close();

                Swal.fire({
                    title: 'Error!',
                    text: `${error}`,
                    icon: 'success'
                });
            });
        }
    });
}

function denyShredRequest(denyButton) {
    const filepath = denyButton.getAttribute('data-file');
    const fileId = denyButton.getAttribute('data-file-id');

    Swal.fire({
        title: 'Are you sure?',
        html: `You are about to deny the shred request for the file: <b>${filepath}</b>`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: 'green',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Deny',
        reverseButtons: true
    }).then((result) => {
        if (result.isConfirmed) {

            ShredderSwal.fire({
                title: 'Denying shred request ...',
                html: `Please wait while we deny the shred request for the file: <b>${filepath}</b>`,
            });

            invoke('update_shred_request', { requestid: parseInt(fileId), requeststatus: "Denied" }).then(response => {

                ShredderSwal.close();

                if (response == "Success") {
                    Swal.fire({
                        title: 'Denied!',
                        text: `The shred request for the file: ${filepath} has been denied.`,
                        icon: 'success'
                    }).then(() => {
                        location.reload();
                    });
                } else {
                    Swal.fire({
                        title: 'Failed!',
                        text: `The shred request for the file: ${filepath} could not be denied.`,
                        icon: 'error'
                    });
                }
            }).catch(error => {

                ShredderSwal.close();

                Swal.fire({
                    title: 'Error!',
                    text: `${error}`,
                    icon: 'success'
                });
            });
        }
    });
}
