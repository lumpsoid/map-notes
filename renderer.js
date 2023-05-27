let formContainer;
let formOverlay;
let notes = [];
let currentMarker;

document.addEventListener('DOMContentLoaded', () => {
    formContainer = document.getElementById('form-container');
    formOverlay = document.getElementById('overlay');

    const map = L.map('map').setView([50, 30], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    }).addTo(map);

    map.on('click', function(event) {
        currentMarker = L.marker(event.latlng).addTo(map);
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
    formOverlay.style.display = 'block';
    formContainer.style.top = '50%';
    formContainer.style.left = '50%';
    // formContainer.style.top = (position.y + 150) + 'px';
    // formContainer.style.left = position.x + 'px';
    
});

document.getElementById('panel-btn').addEventListener('click', (event) => {
    const panel = document.getElementById('notes-panel');
    if (panel.style.left == '-500px') {
        panel.style.left = '0px'
    } else {
        panel.style.left = '-500px'
    }   
        
});

document.getElementById('overlay').addEventListener('click', (event) => {
    const date = document.getElementById('date').value;
    const name = document.getElementById('title').value;
    const email = document.getElementById('text').value;
    
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    currentMarker.remove()
});

document.getElementById('map-note').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    
    const note = {
        'date': date,
        'title': title,
        'text': text
    }

    notes.push(note)
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
});

// Add event listener for Cancel button
document.getElementById('cancel-button').addEventListener('click', () => {
    // Clear form fields
    document.getElementById('title').value = '';
    document.getElementById('text').value = '';
    document.getElementById('date').value = '';
    // Hide form container
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    currentMarker.remove()
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
