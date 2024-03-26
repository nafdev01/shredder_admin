const { invoke } = window.__TAURI__.core;

const SearchSwal = Swal.mixin({
    showConfirmButton: false,
    didOpen: () => {
        Swal.showLoading();
        Swal.getPopup().querySelector("b");
    },
});

function formatTimestamp(searched_at) {
    // Create a Date object from the timestamp string
    let date = new Date(searched_at);

    // Extract the hours, minutes, day, month, and year
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let day = date.getDate();
    let month = date.getMonth() + 1; // getMonth() is zero-based
    let year = date.getFullYear();

    // Determine whether it's AM or PM
    let period = hours >= 12 ? 'PM' : 'AM';

    // Convert the hours to a 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    // Pad the hours, minutes, day, and month with leading zeros if necessary
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    day = day < 10 ? '0' + day : day;
    month = month < 10 ? '0' + month : month;

    // Format the timestamp
    let formattedTimestamp = `${hours}:${minutes} ${period} on ${year}-${month}-${day}`;

    return formattedTimestamp;
}



if (document.querySelector('#history-table')) {
    try {
        const historyTableBody = document.querySelector('#history-table-body');
        const userName = localStorage.getItem('adminUsername');
        const adminId = parseInt(localStorage.getItem('adminId'));

        SearchSwal.fire({
            title: 'Fetching search history ...',
            html: `Please wait while we fetch search history for <b>${userName}</b>`
        });

        invoke('get_search_history', { adminid: parseInt(adminId) }).then(history => {

            SearchSwal.close();

            if (history.length === 0) {
                const noHistoryElement = document.createElement('p');
                noHistoryElement.textContent = 'No search history';
                historyTableBody.appendChild(noHistoryElement);
            }
            else {
                history.forEach(search => {
                    const row = document.createElement('tr');

                    const searcherCell = document.createElement('th');
                    searcherCell.textContent = search.searcher;
                    searcherCell.classList.add('cell');
                    searcherCell.setAttribute('scope', 'row');
                    row.appendChild(searcherCell);

                    const wordCell = document.createElement('th');
                    wordCell.textContent = search.word;
                    wordCell.classList.add('cell');
                    wordCell.setAttribute('scope', 'row');
                    row.appendChild(wordCell);

                    const directoryCell = document.createElement('td');
                    directoryCell.textContent = search.directory;
                    directoryCell.classList.add('cell');
                    row.appendChild(directoryCell);

                    const noFilesCell = document.createElement('td');
                    noFilesCell.textContent = search.no_of_files;
                    noFilesCell.classList.add('cell');
                    row.appendChild(noFilesCell);

                    const searchedAtCell = document.createElement('td');
                    searchedAtCell.textContent = formatTimestamp(search.searched_at);
                    searchedAtCell.classList.add('cell');
                    row.appendChild(searchedAtCell);


                    historyTableBody.appendChild(row);
                });
            }
        }).catch(error => {

            SearchSwal.close();

            Swal.fire({
                icon: 'error',
                title: error,
            });
        });

    } catch (error) {
        // output the error
        Swal.fire({
            icon: 'error',
            title: error.message
        });
    }
}

