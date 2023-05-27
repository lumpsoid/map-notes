document.getElementById('new-note-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const title = document.getElementById('note-title').value;
    const date = document.getElementById('note-date').value;
    const description = document.getElementById('note-description').value;

    const note = {
        title,
        date,
        description
    };
    console.log(note);

    window.api.send("save-note", note);
});


window.api.receive('save-note-reply', (response) => {
    if (response.success) {
        console.log('Заметка успешно сохранена');
        // Дополнительные действия при успешном сохранении заметки
    } else {
        console.error('Ошибка при сохранении заметки', response.error);
        // Дополнительные действия при ошибке сохранения заметки
    }
});
