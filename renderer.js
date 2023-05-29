let notes = {};
let markers = {};
let formContainer;
let formOverlay;
let saveButton;
let markerContextMenu;
let notesPanel;
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

function contextMenuClose() {
    markerContextMenu.style.display = 'none';
    formOverlay.style.display = 'none';
    formOverlay.style.backgroundColor = 'black';
    markerContextMenu.removeAttribute('data-note-id')
}

function onOverlayClick() {
    if (formContainer.style.display == 'block') {
        formContainer.style.display = 'none';
        formOverlay.style.display = 'none';
        if (currentMarker != null && !formContainer.getAttribute('data-note-id')) currentMarker.remove();
        formCleaner();
        formContainer.removeAttribute('data-note-id')
    }

    if (markerContextMenu.style.display == 'block') {
        contextMenuClose()
    }    
}

function onListItemClick(e) {
    if (!e.currentTarget) {
        return;
    }

    const noteId = e.currentTarget.getAttribute('data-note-id');

    const latlng = notes[noteId].latlng;
    map.flyTo([latlng.lat, latlng.lng-0.3], 10);
    markers[noteId].openTooltip()
};

function onNoteEdit(e) {
    e.stopPropagation();

    const
        parentElement = e.currentTarget.parentElement,
        noteId = parentElement.getAttribute('data-note-id');
        data = notes[noteId];
    
    currentMarker = markers[noteId];

    displayForm()
    formContainer.setAttribute('data-note-id', noteId);
    document.getElementById('title').value = data.title;
    document.getElementById('date').value = data.date;
    document.getElementById('text').value = data.text;
};

function onNoteDelete(e) {
    e.stopPropagation();

    const
        noteId = e.currentTarget.parentElement.getAttribute('data-note-id'),
        note = notesPanel.querySelector(`[data-note-id="${noteId}"]`);
    console.log(note);
    delete notes[noteId];
    
    note.remove();

    markers[noteId].remove()
    delete markers[noteId]
    saveButton.style.display = 'block';
    
    if (markerContextMenu.style.display == 'block') {
        contextMenuClose()
    }
};

function addNoteToList(noteId, newNote, mute=0) {
    const note = notesPanel.querySelector(`[data-note-id="${noteId}"]`);

    if (note != null) {
        note.querySelector('.note-title').innerHTML = newNote.title;
        note.querySelector('.note-date').innerHTML = newNote.date;
        note.querySelector('.note-text').innerHTML = newNote.text;
        new window.Notification('Заметка обновлена', { body: `Обновили заметку ${newNote.title}` })
        return;
    }

    // Создание нового элемента списка заметок
    const listItem = document.createElement('li');
    listItem.setAttribute('data-note-id', noteId);
    listItem.classList.add('note-item');

    const iconDelete = document.createElement('div');
    iconDelete.classList.add('note-delete');
    iconDelete.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M112 112l20 320c.95 18.49 14.4 32 32 32h184c17.67 0 30.87-13.51 32-32l20-320" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="32" d="M80 112h352"/><path d="M192 112V72h0a23.93 23.93 0 0124-24h80a23.93 23.93 0 0124 24h0v40M256 176v224M184 176l8 224M328 176l-8 224" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>';
    iconDelete.addEventListener('click', onNoteDelete);

    const iconEdit = document.createElement('div');
    iconEdit.classList.add('note-edit');
    iconEdit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
    iconEdit.addEventListener('click', onNoteEdit);
    
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
    listItem.append(noteTitle, noteDate, noteText, iconDelete, iconEdit);
    listItem.addEventListener('click', onListItemClick);
    
    // Добавление элемента списка в список заметок
    document.getElementById('notes-list').appendChild(listItem);
    if (!mute) new window.Notification('Заметка создана', { body: `Создана заметка ${title}` })
};

function focusOnNote(event) {
    const 
        noteId = event.currentTarget.parentElement.getAttribute('data-note-id'),
        note = notesPanel.querySelector(`[data-note-id="${noteId}"]`),
        overlay = document.getElementById('notes-overlay');


    if (notesPanel.style.left == '-500px') {
        panelOpen()
    }
    const offsetTop = note.offsetTop - 20;
    notesPanel.scrollTop = offsetTop;
    
    overlay.style.display = 'block'
    overlay.style.opacity = '20%'
    note.style.zIndex = '1011'

    setTimeout(() => {
        overlay.style.display = 'none'
        note.style.zIndex = '1000'
        overlay.style.opacity = '0%'
    }, 1500);

    if (markerContextMenu.style.display == 'block') {
        contextMenuClose()
    }
}

function onMarkerClick(event) {
    const noteId = event.target.noteId
    const data = notes[noteId];
    currentMarker = event.target;

    displayForm()

    formContainer.setAttribute('data-note-id', noteId);
    document.getElementById('title').value = data.title;
    document.getElementById('date').value = data.date;
    document.getElementById('text').value = data.text;
};

function onMarkerRightClick(event) {
    const 
        position = event.containerPoint
        noteId = event.target.noteId
    
    markerContextMenu.setAttribute('data-note-id', noteId);
    markerContextMenu.style.top = position.y + 'px';
    markerContextMenu.style.left = (position.x + 10) + 'px';
    
    formOverlay.style.backgroundColor = 'transparent';
    formOverlay.style.display = 'block'
    markerContextMenu.style.display = 'block'
};

document.addEventListener('DOMContentLoaded', () => {
    formContainer = document.getElementById('form-container');
    formOverlay = document.getElementById('overlay');
    saveButton = document.getElementById('save-btn');
    markerContextMenu = document.getElementById('context-menu');
    notesPanel = document.getElementById('notes-panel')

    map = L.map('map').setView([50, 30], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
    }).addTo(map);

    map.on('click', function(event) {
        currentMarker = L.marker(event.latlng, {icon: myIcon}).addTo(map).on('click', onMarkerClick).on('contextmenu', onMarkerRightClick);
        
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
        currentMarker = L.marker(jsonData[noteId].latlng, {icon: myIcon}).bindTooltip(jsonData[noteId].title).addTo(map).on('click', onMarkerClick).on('contextmenu', onMarkerRightClick);
        currentMarker.noteId = noteId
        markers[noteId] = currentMarker;
    });
});

window.api.receive('form-show-request', (event, position) => {
    displayForm()
    // formContainer.style.top = (position.y + 150) + 'px';
    // formContainer.style.left = position.x + 'px';
    
});

function panelOpen() {
    const panelBtn = document.getElementById('panel-btn');

    if (notesPanel.style.left == '-500px') {
        notesPanel.style.left = '0px';
        panelBtn.style.left = '500px';

    } else {
        notesPanel.style.left = '-500px'
        panelBtn.style.left = '0px';
    }   
}

document.getElementById('map-note').addEventListener('submit', (event) => {
    event.preventDefault();
    
    const date = document.getElementById('date').value;
    const title = document.getElementById('title').value;
    const text = document.getElementById('text').value;
    const timestamp = formContainer.getAttribute('data-note-id') || Date.now()
    console.log(timestamp);
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

document.getElementById('overlay').addEventListener('click', onOverlayClick);
document.getElementById('context-note-delete').addEventListener('click', onNoteDelete);
document.getElementById('context-panel-open').addEventListener('click', focusOnNote);
document.getElementById('panel-btn').addEventListener('click', panelOpen);
document.getElementById('cancel-button').addEventListener('click', onOverlayClick);
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