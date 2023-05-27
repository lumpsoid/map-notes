let formContainer;

document.addEventListener('DOMContentLoaded', () => {
  formContainer = document.getElementById('form-container');

  const map = L.map('map').setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }).addTo(map);

  map.on('click', function(event) {
    console.log('event');
    
    window.api.send('show-form', {x: event.originalEvent.screenX, y: event.originalEvent.screenY});
    console.log(event);
  });
});

window.api.receive('form-show-request', (event, position) => {
  formContainer.style.display = 'block';
  formContainer.style.top = (position.y + 100) + 'px';
  formContainer.style.left = position.x + 'px';
});

document.getElementById('map-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    console.log('Name:', name);
    console.log('Email:', email);
    formContainer.style.display = 'none';
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
