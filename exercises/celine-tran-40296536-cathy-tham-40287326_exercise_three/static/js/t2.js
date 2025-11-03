window.onload = function() {
    let selectedDonut = null;

    //get notes and load on wall
    const notesWall = document.getElementById('notesWall');
    loadNotes();

    // Click donut to select
    document.querySelectorAll('.donut').forEach(donut => {
        donut.addEventListener('click', function() {
            document.querySelectorAll('.donut').forEach(d => d.classList.remove('selected'));
            this.classList.add('selected');
            selectedDonut = this.dataset.name;
            checkButton();
        });
    });

    // Type in textarea
    document.getElementById('comment').addEventListener('input', checkButton);

    // Enable button if both filled
    function checkButton() {
        const comment = document.getElementById('comment').value.trim();
        document.getElementById('submitBtn').disabled = !(selectedDonut && comment.length > 0);
    }

    // Submit button
    document.getElementById('submitBtn').addEventListener('click', async function() {
        const comment = document.getElementById('comment').value.trim();
        const userInput = `Favorite: ${selectedDonut} - Comment: ${comment}`;

        try {
            // Send data to server
            let res = await fetch('/postDataFetch', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({user_input: userInput})
            });
            let data = await res.json();

            // Save note and add to wall
            saveNote({ donut: selectedDonut, comment: comment });
            addNoteToWall({ donut: selectedDonut, comment: comment });

            // Show message to user when successful
            const msg = document.getElementById('message');
            msg.innerHTML = `🍩 Yum! Your love for <strong>${selectedDonut}</strong> has been saved! 🍩`;
            msg.classList.remove('hidden');
            msg.classList.add('success');

            // Reset after 2 seconds
            setTimeout(() => {
                msg.classList.add('hidden');
                document.getElementById('comment').value = '';
                selectedDonut = null;
                document.querySelectorAll('.donut').forEach(d => d.classList.remove('selected'));
                document.getElementById('submitBtn').disabled = true;
            }, 2000);

        } catch(err) {
            console.log(err);
        }
    });

    // Save note to localStorage
    function saveNote(note) {
        const notes = JSON.parse(localStorage.getItem('donutNotes') || '[]');
        notes.push(note);
        localStorage.setItem('donutNotes', JSON.stringify(notes));
    }

    // Load notes from localStorage
    function loadNotes() {
        const notes = JSON.parse(localStorage.getItem('donutNotes') || '[]');
        notes.forEach(addNoteToWall);
    }

    // Add note to wall
    function addNoteToWall(note) {
        const div = document.createElement('div');
        div.className = 'note';
        div.innerHTML = `<strong>${note.donut}</strong>: ${note.comment}`;
        notesWall.prepend(div);
    }
};