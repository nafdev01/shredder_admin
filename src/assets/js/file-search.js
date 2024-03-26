const { invoke } = window.__TAURI__.core;
const { open } = window.__TAURI__.dialog;

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


