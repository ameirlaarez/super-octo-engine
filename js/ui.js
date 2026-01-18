const UI = {
    showSection(sectionId) {
        State.currentSection = sectionId;
        this.render();
    },
    showModal(html) {
        document.getElementById('modal-content').innerHTML = html;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },
    closeModal() {
        document.getElementById('modal-overlay').classList.add('hidden');
    },
    async render() {
        const container = document.getElementById('content-area');
        const section = State.sections[State.currentSection];
        document.getElementById('section-title').innerText = section.title;
        container.innerHTML = '<div class="text-center p-10 font-bold">טוען מהענן...</div>';

        // קריאה לפונקציית הרינדור המתאימה לפי הקובץ
        if (State.currentSection === 'suppliers') Suppliers.render(container);
        if (State.currentSection === 'products') Products.render(container);
        if (State.currentSection === 'counting') Products.renderCounting(container);
        if (State.currentSection === 'payments') Payments.render(container);
        if (State.currentSection === 'reports') Reports.render(container);
        
        this.updateSidebar();
    },
    updateSidebar() {
        const nav = document.getElementById('sidebar-nav');
        nav.innerHTML = Object.entries(State.sections).map(([id, info]) => `
            <button onclick="UI.showSection('${id}')" class="sidebar-item w-full flex items-center px-6 py-4 hover:bg-slate-700 transition ${State.currentSection === id ? 'active' : ''}">
                <i class="fas ${info.icon} ml-3 text-white"></i> <span class="text-white">${info.title}</span>
            </button>
        `).join('');
    }
};
