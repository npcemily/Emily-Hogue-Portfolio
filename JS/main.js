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
        static windows = [];
        static zIndex = 200;
        static instancesByTitle = {};

        constructor({ title, content, icon }) {
            if (Win98Window.instancesByTitle[title]) {
                const existing = Win98Window.instancesByTitle[title];

                if (existing.minimized) {
                    existing.restore();
                } else {
                    existing.activate();
                }

                return;
            }

            this.id = crypto.randomUUID();
            this.title = title;
            this.content = content;
            this.icon = icon;
            this.minimized = false;

            this.createWindow();
            this.makeDraggable();
            this.createTaskbarButton();

            Win98Window.windows.push(this);
            this.activate();
            Win98Window.instancesByTitle[this.title] = this;
        }

        createWindow() {
            this.el = document.createElement('div');
            this.el.classList.add('window');
            if (this.title === 'Internet Explorer') {
                this.el.classList.add('internet-window');
            }
            if (this.title === 'Paint') {
                this.el.classList.add('paint-window');
            }
            if (this.title === '3D Pinball') {
                this.el.classList.add('pinball-window');
            }
            if (this.title === 'Minesweeper') {
                this.el.classList.add('minesweeper-window');
            }
            if (this.title === 'Solitaire') {
                this.el.classList.add('solitaire-window');
            }
            if (this.title === 'Notepad') {
                this.el.classList.add('notepad-window');
            }
            this.el.dataset.id = this.id;

            this.el.innerHTML = `
            <div class="window-titlebar">
                <span>${this.title}</span>
                <div class="window-controls">
                    <button class="window-btn minimize">_</button>
                    <button class="window-btn maximize">&#9744;</button>
                    <button class="window-btn close">X</button>
                </div>
            </div>
            <div class="window-subtitlebar">
                <div class="sub-divider"></div>
                <span><u>F</u>ile</span>
                <span><u>E</u>dit</span>
                <span><u>V</u>iew</span>
                <span><u>G</u>o</span>
                <span>F<u>a</u>vorites</span>
                <span><u>H</u>elp</span>
            </div>
            ${this.title === 'Internet Explorer' ? `
            <div class="ie-toolbar">
                <span>Address:</span>
                <div class="select-wrapper">
                    <select class="ie-address">
                        <option value="https://www.google.com/search?igu=1">
                            https://www.google.com/search?igu=1
                        </option>

                        <option value="https://npcemily.github.io/Weather-App/">
                            https://npcemily.github.io/Weather-App/
                        </option>

                        <option value="https://npcemily.github.io/Landing-Page-Example/">
                            https://npcemily.github.io/Landing-Page-Example/
                        </option>

                        <option value="https://npcemily.github.io/Fictional-Portfolio/">
                            https://npcemily.github.io/Fictional-Portfolio/
                        </option>
                    </select>
                </div>
            </div>
            ` : ''}
            <div class="window-body">
                <div class="inner-window"></div>
            </div>
            `;

            document.body.appendChild(this.el);

            this.contentContainer = this.el.querySelector('.inner-window');
            Array.from(this.content.childNodes).forEach(node => {
                this.contentContainer.appendChild(node.cloneNode(true));
            });

            const width =
                this.title === 'Internet Explorer' ? 950 :
                    this.title === 'Paint' ? 900 :
                        this.title === '3D Pinball' ? 615 :
                            this.title === 'Minesweeper' ? 525 :
                                this.title === 'Solitaire' ? 600 :
                                    this.title === 'Notepad' ? 750 :
                                        550;
            const height =
                this.title === 'Internet Explorer' ? 600 :
                    this.title === 'Paint' ? 550 :
                        this.title === '3D Pinball' ? 525 :
                            this.title === 'Minesweeper' ? 430 :
                                this.title === 'Notepad' ? 450 :
                                    500;

            this.el.style.width = width + 'px';
            this.el.style.height = height + 'px';
            this.el.style.left = (window.innerWidth - width) / 2 + 'px';
            this.el.style.top = (window.innerHeight - height) / 2 + 'px';

            this.setupControls();
            this.setupFocus();

            const dropdown = this.el.querySelector('.ie-address');
            const frame = this.el.querySelector('.app-frame');

            if (dropdown && frame) {
                dropdown.addEventListener('change', () => {
                    frame.src = dropdown.value;
                });
            }
        }

        createTaskbarButton() {
            const container = document.querySelector('.taskbar-windows');

            this.taskBtn = document.createElement('button');
            this.taskBtn.classList.add('taskbar-button');

            if (this.icon) {
                const img = document.createElement('img');
                img.src = this.icon;
                img.classList.add('taskbar-icon');
                this.taskBtn.appendChild(img);
            }

            const span = document.createElement('span');
            span.innerText = this.title;
            this.taskBtn.appendChild(span);

            this.taskBtn.addEventListener('click', () => {
                if (this.minimized) {
                    this.restore();
                } else if (this.isActive()) {
                    this.minimize();
                } else {
                    this.activate();
                }
            });

            container.appendChild(this.taskBtn);
        }

        setupControls() {
            this.el.querySelector('.close').addEventListener('click', () => {
                this.close();
            });

            this.el.querySelector('.minimize').addEventListener('click', () => {
                this.minimize();
            });
        }

        setupFocus() {
            this.el.addEventListener('mousedown', () => {
                this.activate();
            });
        }

        activate() {
            Win98Window.windows.forEach(w => w.deactivate());

            this.el.style.display = 'block';
            this.el.style.zIndex = ++Win98Window.zIndex;

            this.el.classList.add('active-window');
            this.taskBtn.classList.add('active-task');
            this.minimized = false;
        }

        deactivate() {
            this.el.classList.remove('active-window');
            this.taskBtn.classList.remove('active-task');
        }

        minimize() {
            this.el.style.display = 'none';
            this.taskBtn.classList.remove('active-task');
            this.minimized = true;
        }

        restore() {
            this.el.style.display = 'block';
            this.activate();
        }

        isActive() {
            return this.taskBtn.classList.contains('active-task');
        }

        close() {
            this.el.remove();
            this.taskBtn.remove();
            delete Win98Window.instancesByTitle[this.title];
            Win98Window.windows = Win98Window.windows.filter(w => w !== this);
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

    document.addEventListener('click', event => {
        const item = event.target.closest('.menu-launch');
        if (!item) return;

        const title = item.dataset.title;
        const templateId = item.dataset.content;
        const template = document.getElementById(templateId);

        const iconImg = item.tagName === 'IMG'
            ? item
            : item.querySelector('img');

        const iconSrc = iconImg ? iconImg.getAttribute('src') : null;

        if (template) {
            new Win98Window({
                title,
                content: template,
                icon: iconSrc
            });
        }
    });
});