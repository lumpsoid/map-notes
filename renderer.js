let formContainer;
let notes = [];
let marker;

document.addEventListener('DOMContentLoaded', () => {
    formContainer = document.getElementById('form-container');

    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    }).addTo(map);

    map.on('click', function(event) {
        marker = L.marker(event.latlng).addTo(map);
        window.api.send(
            'show-form',
            {
                x: event.originalEvent.screenX, 
                y: event.originalEvent.screenY,
                latlng: event.latlng
            }
        );
    });
});



window.api.receive('form-show-request', (event, position) => {
    formContainer.style.display = 'block';
    formContainer.style.top = (position.y + 150) + 'px';
    formContainer.style.left = position.x + 'px';
    
});

document.getElementById('map-note').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const name = document.getElementById('title').value;
    const email = document.getElementById('text').value;
    
    formContainer.style.display = 'none';
});

// Event listener for form blur (unfocus)
document.getElementById('form-container').addEventListener('blur', () => {
    // Perform any desired actions when the form loses focus
    console.log('Form unfocused');
  });

// Add event listener for Cancel button
document.getElementById('cancel-button').addEventListener('click', () => {
    // Clear form fields
    document.getElementById('title').value = '';
    document.getElementById('text').value = '';
    document.getElementById('date').value = '';
    // Hide form container
    formContainer.style.display = 'none';
    marker.remove()
  });

// document.getElementById('new-note-form').addEventListener('submit', function(event) {
//     event.preventDefault();

//     const title = document.getElementById('note-title').value;
//     const date = document.getElementById('note-date').value;
//     const description = document.getElementById('note-description').value;

//     const note = {
//         title,
//         date,
//         description
//     };
//     console.log(note);

//     window.api.send("save-note", note);
// });


// window.api.receive('save-note-reply', (response) => {
//     if (response.success) {
//         console.log('Заметка успешно сохранена');
//         // Дополнительные действия при успешном сохранении заметки
//     } else {
//         console.error('Ошибка при сохранении заметки', response.error);
//         // Дополнительные действия при ошибке сохранения заметки
//     }
// });
