let formContainer;
let formOverlay;
let saveButton;
let notes = {};
let markers = {};
let currentMarker;
let map;
const myIcon = L.icon({
    iconUrl: 'marker.svg',
    iconSize: [38, 95],
    iconAnchor: [20, 60],
    tooltipAnchor: [10, -23]
});


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

    const latlng = notes[e.currentTarget.id].latlng;
    map.flyTo([latlng.lat, latlng.lng-4], 6);
    markers[e.currentTarget.id].openTooltip()
};

function onNoteDelete(e) {
    e.stopPropagation();

    const
        parentElement = e.currentTarget.parentElement,
        noteId = parentElement.id;
        
    delete notes[noteId];
    
    parentElement.remove();

    markers[noteId].remove()
    delete markers[noteId]
    saveButton.style.display = 'block';
};

function addNoteToList(noteId, newNote, mute=0) {
    const note = document.getElementById(noteId);

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
    iconDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="delete-icon" viewBox="0 0 512 512"><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>';
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
    listItem.append(noteTitle, noteDate, noteText, iconDelete);
    listItem.addEventListener('click', onListItemClick);
    
    // Добавление элемента списка в список заметок
    document.getElementById('notes-list').appendChild(listItem);
    if (!mute) new window.Notification('Заметка создана', { body: `Создана заметка ${title}` })
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
        currentMarker = L.marker(event.latlng, {icon: myIcon}).addTo(map).on('click', onMarkerClick);
        
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
        addNoteToList(noteId, jsonData[noteId], 1)
        currentMarker = L.marker(jsonData[noteId].latlng, {icon: myIcon}).bindTooltip(jsonData[noteId].title).addTo(map).on('click', onMarkerClick);
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
    const
        panel = document.getElementById('notes-panel'),
        panelBtn = document.getElementById('panel-btn');

    if (panel.style.left == '-500px') {
        panel.style.left = '0px';
        panelBtn.style.left = '500px';

    } else {
        panel.style.left = '-500px'
        panelBtn.style.left = '0px';
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