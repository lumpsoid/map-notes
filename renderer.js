let formContainer;
let formOverlay;
let notes = [];
let currentMarker;


function formCleaner() {  
    document.getElementById('title').value = '';
    document.getElementById('text').value = '';
    document.getElementById('date').value = '';
};

function addNoteToList(noteId, newNote) {  
    // Создание нового элемента списка заметок
    const listItem = document.createElement('li');
    listItem.id = noteId
    listItem.classList.add('note-item');
    
    // Формирование текста заметки
    const noteTitle = document.createElement('div');
    noteTitle.classList.add('note-title');
    noteTitle.innerHTML = newNote.title;
    
    const noteDate = document.createElement('div');
    noteDate.classList.add('note-date');
    noteDate.innerHTML = newNote.date;
    
    const noteText = document.createElement('div');
    noteText.classList.add('note-text');
    noteText.innerHTML = newNote.text;
    
    // Добавление текста заметки в элемент списка
    listItem.append(noteDate, noteTitle, noteText);
    
    // Добавление элемента списка в список заметок
    document.getElementById('notes-list').appendChild(listItem);
};

window.api.once('load-file', (event, jsonData) => {
    console.log(jsonData)
});

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
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    currentMarker.remove()
    formCleaner();
});

document.getElementById('map-note').addEventListener('submit', (event) => {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    const timestamp = Date.now()
    
    const note = {
        date: date,
        title: title,
        text: text
    };

    addNoteToList(timestamp, note);
    notes[timestamp] = note;
    console.log(notes)

    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    formCleaner();
});

// Add event listener for Cancel button
document.getElementById('cancel-button').addEventListener('click', () => {
    // Clear form fields
    formCleaner();
    // Hide form container
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    currentMarker.remove();
  });

window.api.receive('notes-data-request', (event, content) => {
    console.log(notes)
    if (content.request == "request") {
        window.api.send('notes-data', {request: 'data', data: notes});
    } else {
        console.log('Something wrong with request notes data.')
    }
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
