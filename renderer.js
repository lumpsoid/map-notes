let formContainer;
let formOverlay;
let saveButton;
let notes = {};
let markers = {};
let currentMarker;
let map;


function formCleaner() {  
    document.getElementById('title').value = '';
    document.getElementById('text').value = '';
    document.getElementById('date').value = '';
    formContainer.removeAttribute('class');
};

function displayForm() {
    formContainer.style.display = 'block';
    formOverlay.style.display = 'block';
};

function noteCancel() {
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    if (currentMarker != null && formContainer.classList.length == 0) currentMarker.remove();
    formCleaner();
}

function onListItemClick(e) {
    if (!e.currentTarget) {
        return;
    }

    console.log('list item');
    const latlng = notes[e.currentTarget.id].latlng;
    map.flyTo(latlng, 6);
};

function onNoteDelete(e) {
    e.stopPropagation();
    console.log(e);
    const parentElement = e.target.parentElement,
    noteId = parentElement.id;
    delete notes[noteId];
    parentElement.remove();
    markers[noteId].remove()
    delete markers[noteId]
};

function addNoteToList(noteId, newNote) {
    const note = document.getElementById(noteId)
    if (note != null) {
        note.querySelector('.note-title').innerHTML = newNote.title;
        note.querySelector('.note-date').innerHTML = newNote.date;
        note.querySelector('.note-text').innerHTML = newNote.text;
        new window.Notification('Заметка обновлена', { body: `Обновили заметку ${newNote.title}` })
        return;
    }
    // Создание нового элемента списка заметок
    const listItem = document.createElement('li');
    listItem.id = noteId
    listItem.classList.add('note-item');

    const iconDelete = document.createElement('div');
    iconDelete.classList.add('note-delete');
    iconDelete.addEventListener('click', onNoteDelete);
    
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
    listItem.append(noteDate, noteTitle, noteText, iconDelete);
    listItem.addEventListener('click', onListItemClick);
    
    // Добавление элемента списка в список заметок
    document.getElementById('notes-list').appendChild(listItem);
    new window.Notification('Заметка создана', { body: `Создана заметка ${title}` })
};


function onMarkerClick(event) {
    const noteId = event.target.noteId
    const data = notes[noteId];
    currentMarker = event.target;

    displayForm()

    formContainer.className = noteId;
    document.getElementById('title').value = data.title;
    document.getElementById('date').value = data.date;
    document.getElementById('text').value = data.text;
};

document.addEventListener('DOMContentLoaded', () => {
    formContainer = document.getElementById('form-container');
    formOverlay = document.getElementById('overlay');
    saveButton = document.getElementById('save-btn');

    map = L.map('map').setView([50, 30], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    }).addTo(map);

    map.on('click', function(event) {
        currentMarker = L.marker(event.latlng).addTo(map).on('click', onMarkerClick);
        
        displayForm()

        // window.api.send(
        //     'show-form',
        //     {
        //         x: event.originalEvent.screenX, 
        //         y: event.originalEvent.screenY,
        //         latlng: event.latlng
        //     }
        // );
    });
});

window.api.once('load-file', (event, jsonData) => {
    notes = jsonData;
    Object.keys(jsonData).map((noteId) => {
        addNoteToList(noteId, jsonData[noteId])
        currentMarker = L.marker(jsonData[noteId].latlng).bindTooltip(jsonData[noteId].title).addTo(map).on('click', onMarkerClick);
        currentMarker.noteId = noteId
        markers[noteId] = currentMarker;
    });
});

window.api.receive('form-show-request', (event, position) => {
    displayForm()
    // formContainer.style.top = (position.y + 150) + 'px';
    // formContainer.style.left = position.x + 'px';
    
});

document.getElementById('panel-btn').addEventListener('click', () => {
    const panel = document.getElementById('notes-panel');
    if (panel.style.left == '-500px') {
        panel.style.left = '0px'
    } else {
        panel.style.left = '-500px'
    }   
        
});

document.getElementById('map-note').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const date = document.getElementById('date').value;
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    const timestamp = formContainer.className || Date.now()
    
    const note = {
        latlng: currentMarker._latlng,
        date: date,
        title: title,
        text: text
    };

    addNoteToList(timestamp, note);
    notes[timestamp] = note;

    currentMarker.noteId = timestamp;
    currentMarker.bindTooltip(title);

    markers[timestamp] = currentMarker;
    formContainer.style.display = 'none';
    formOverlay.style.display = 'none';
    saveButton.style.display = 'block';
    currentMarker = null;

    formCleaner();
});

document.getElementById('overlay').addEventListener('click', noteCancel);

// Add event listener for Cancel button
document.getElementById('cancel-button').addEventListener('click', noteCancel);

document.getElementById('save-btn').addEventListener('click', () => {
    window.api.send('notes-data', {request: 'save', data: notes});
    saveButton.style.display = 'none'
});

window.api.receive('notes-data-reply', (event, content) => {
    if (content.success) {
        console.log('Заметки сохранены.')
        new window.Notification('Заметки сохранены', { body: 'Ваши заметки были сохранены.' })
    } else {
        new window.Notification('Заметки не сохранились', { body: 'Что то пошло не так, попробуйте еще раз.' })
        console.log('Something wrong notes-data save.')
        console.log(content.error)
    }
});

window.api.receive('save-note-request', (event, content) => {
    window.api.send('notes-data', {request: 'save', data: notes});
    new window.Notification('Заметки сохранены', { body: 'Ваши заметки были сохранены.' })
    // if (content.request) {
    //     window.api.send('notes-data', {request: 'save', data: notes});
    //     new window.Notification('Заметки сохранены', { body: 'Ваши заметки были сохранены.' })
    // } else {
    //     new window.Notification('Something wrong notes-data save.', { body: 'Something wrong notes-data save.' })
    // }
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
