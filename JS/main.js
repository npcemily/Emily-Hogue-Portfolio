document.addEventListener('DOMContentLoaded', () => {
    function updateClock() {
        const now = new Date();

        let hours = now.getHours();
        let minutes = now.getMinutes();

        minutes = minutes < 10 ? '0' + minutes : minutes;
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        document.getElementById('clock').innerText = `${hours}:${minutes} ${ampm}`;
    }

    updateClock();
    setInterval(updateClock, 1000);
    
    const startButton = document.querySelector('.start-button');
    const startMenu = document.getElementById('start-menu');

    startMenu.addEventListener('beforetoggle', (event) => {
        if (event.newState === 'open') {
            startButton.classList.add('active');
        } else {
            startButton.classList.remove('active');
        }
    });

    const programsItem = document.querySelector('.programs-item');
    const documentsItem = document.querySelector('.documents-item');
    const programsMenu = document.getElementById('programs-menu');
    const documentsMenu = document.getElementById('documents-menu');

    if (programsItem && programsMenu) {
        programsItem.addEventListener('click', () => {
            programsMenu.togglePopover();
        });
    }

    if (documentsItem && documentsMenu) {
        documentsItem.addEventListener('click', () => {
            documentsMenu.togglePopover();
        });
    }
});