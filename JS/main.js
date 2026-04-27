class WindowManager {
    static zIndex = 100;

    static bringToFront(win) {
        win.style.zIndex = ++WindowManager.zIndex;
    }
}

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

    class Win98Window {
        constructor({ title, content }) {
            this.title = title;
            this.content = content;
            this.createWindow();
            this.makeDraggable();
        }

        createWindow() {
            this.el = document.createElement('div');
            this.el.classList.add('window');
            this.el.style.position = 'absolute';

            this.el.innerHTML = `
                <div class="window-titlebar">
                    <span>${this.title}</span>
                    <div class="window-controls">
                        <button class="win-btn minimize">_</button>
                        <button class="win-btn maximize">□</button>
                        <button class="win-btn close">X</button>
                    </div>
                </div>
                <div class="window-body">
                    <div class="inner-window"></div>
                </div>
            `;

            document.body.appendChild(this.el);

            this.contentContainer = this.el.querySelector('.inner-window');
            const contentNodes = Array.from(this.content.childNodes);
            contentNodes.forEach(node => {
                const clone = node.cloneNode(true);
                this.contentContainer.appendChild(clone);
            });

            this.el.style.display = 'block';

            const width = 400;
            const height = 400;

            this.el.style.width = width + 'px';
            this.el.style.height = height + 'px';
            this.el.style.left = (window.innerWidth - width) / 2 + 'px';
            this.el.style.top = (window.innerHeight - height) / 2 + 'px';

            WindowManager.bringToFront(this.el);

            this.setupControls();
            this.setupFocus();
        }

        setupControls() {
            const closeBtn = this.el.querySelector('.close');
            closeBtn.addEventListener('click', () => {
                this.el.remove();
            });
        }

        setupFocus() {
            this.el.addEventListener('mousedown', () => {
                WindowManager.bringToFront(this.el);
            });
        }

        makeDraggable() {
            const titleBar = this.el.querySelector('.window-titlebar');
            let isDragging = false;
            let offsetX, offsetY;

            titleBar.addEventListener('mousedown', (e) => {
                isDragging = true;
                const rect = this.el.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;
                e.preventDefault();
            });

            document.addEventListener('mousemove', (e) => {
                if (isDragging) {
                    this.el.style.left = e.clientX - offsetX + 'px';
                    this.el.style.top = e.clientY - offsetY + 'px';
                }
            });

            document.addEventListener('mouseup', () => {
                isDragging = false;
            });
        }
    }

    document.querySelectorAll('.menu-launch').forEach(item => {
        item.addEventListener('click', () => {
            const title = item.dataset.title;
            const templateId = item.dataset.content;
            const template = document.getElementById(templateId);

            if (template) {
                new Win98Window({
                    title,
                    content: template
                });
            }
        });
    });
});