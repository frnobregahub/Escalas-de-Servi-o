// script.js

// ----------------------
// Elementos da página
// ----------------------
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const cadastrarPmButton = document.getElementById('cadastrarPmButton'); // Novo botão

// Modal e formulário
const serviceModal = document.getElementById('service-modal');
const modalTitle = document.getElementById('modal-title');
const serviceForm = document.getElementById('service-form');

const serviceIdInput = document.getElementById('service-id');
const serviceDateInput = document.getElementById('service-date');
const jornadaServicoInput = document.getElementById('jornada-servico');
const comandanteInput = document.getElementById('comandante');
const motoristaInput = document.getElementById('motorista');
const patrulheiro1Input = document.getElementById('patrulheiro1');
const patrulheiro2Input = document.getElementById('patrulheiro2');

// Botões do modal
const deleteServiceButton = document.getElementById('delete-service-btn');
const editServiceButton   = document.getElementById('edit-service-btn');
const cancelModalButton   = document.getElementById('cancel-modal-btn');
const saveServiceButton   = document.getElementById('save-service-btn');

// ----------------------
// Estado da aplicação
// ----------------------
let currentMonth = new Date().getMonth();
let currentYear  = new Date().getFullYear();

let selectedDateForModal = null;   // Date do dia clicado
let currentServiceId     = null;   // ID do serviço exibido (se houver)

// "Banco de dados" em memória
// Cada item: { id, date (DD/MM/YYYY), jornada, comandante, motorista, patrulheiro1, patrulheiro2 }
let services = [];
let nextServiceId = 1;

// Nomes dos meses e dias (para exibição)
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

// ----------------------
// Utilitários de data
// ----------------------
function formatDate(date) {
    const d = new Date(date);
    const day   = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year  = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function parseDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// ----------------------
// Controle de campos e botões do modal
// ----------------------
function setFormFieldsDisabled(disabled) {
    jornadaServicoInput.disabled   = disabled;
    comandanteInput.disabled       = disabled;
    motoristaInput.disabled        = disabled;
    patrulheiro1Input.disabled     = disabled;
    patrulheiro2Input.disabled     = disabled;
}

function hideAllModalButtons() {
    deleteServiceButton.classList.add('hidden');
    editServiceButton.classList.add('hidden');
    cancelModalButton.classList.add('hidden');
    saveServiceButton.classList.add('hidden');
}

// Configura modal para "novo serviço"
function setModalModeNew() {
    modalTitle.textContent = 'Registrar Serviço';
    setFormFieldsDisabled(false);

    hideAllModalButtons(); // Esconde todos primeiro
    cancelModalButton.classList.remove('hidden');
    cancelModalButton.textContent = 'Cancelar';

    saveServiceButton.classList.remove('hidden');
    saveServiceButton.textContent = 'Salvar Serviço';
}

// Configura modal para "detalhes do serviço" (visualização)
function setModalModeView() {
    modalTitle.textContent = 'Detalhes do Serviço';
    setFormFieldsDisabled(true);

    hideAllModalButtons(); // Esconde todos primeiro
    deleteServiceButton.classList.remove('hidden');
    editServiceButton.classList.remove('hidden');
    cancelModalButton.classList.remove('hidden');
    cancelModalButton.textContent = 'Fechar';
}

// Configura modal para "editar serviço"
function setModalModeEdit() {
    modalTitle.textContent = 'Editar Serviço';
    setFormFieldsDisabled(false);

    hideAllModalButtons(); // Esconde todos primeiro
    deleteServiceButton.classList.remove('hidden');
    cancelModalButton.classList.remove('hidden');
    cancelModalButton.textContent = 'Cancelar';

    saveServiceButton.classList.remove('hidden');
    saveServiceButton.textContent = 'Salvar Edição';
}

// ----------------------
// Lógica do calendário
// ----------------------
function renderCalendar() {
    calendarGrid.innerHTML = '';
    currentMonthYearSpan.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Cabeçalho dos dias
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const firstDayOfMonth  = new Date(currentYear, currentMonth, 1);
    const daysInMonth      = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek   = firstDayOfMonth.getDay();
    const today            = new Date();

    // Espaços vazios antes do 1º dia
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day', 'empty');
        calendarGrid.appendChild(emptyDay);
    }

    // Dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date         = new Date(currentYear, currentMonth, day);
        const formattedDate = formatDate(date);

        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.dataset.date = formattedDate;

        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        const servicesForDay = getServicesForDate(formattedDate);
        if (servicesForDay.length > 0) {
            const service = servicesForDay[0]; // estamos usando 1 serviço por dia

            const serviceInfoDiv = document.createElement('div');
            serviceInfoDiv.classList.add('service-info');
            serviceInfoDiv.innerHTML = `
                <p><strong>Jornada:</strong> ${service.jornada}</p>
                <p><strong>Cmdt:</strong> ${service.comandante}</p>
                <p><strong>Mot:</strong> ${service.motorista}</p>
                ${service.patrulheiro1 ? `<p><strong>Patr 1:</strong> ${service.patrulheiro1}</p>` : ''}
                ${service.patrulheiro2 ? `<p><strong>Patr 2:</strong> ${service.patrulheiro2}</p>` : ''}
            `;
            dayElement.appendChild(serviceInfoDiv);
            dayElement.dataset.serviceId = String(service.id); // Garante que o ID é uma string
        }

        dayElement.addEventListener('click', () => {
            selectedDateForModal = date;

            const serviceIdAttr = dayElement.dataset.serviceId;
            const serviceId = serviceIdAttr ? parseInt(serviceIdAttr, 10) : null; // Converte para número ou null
            openServiceModal(serviceId);
        });

        calendarGrid.appendChild(dayElement);
    }
}

function getServicesForDate(formattedDate) {
    return services.filter(service => service.date === formattedDate);
}

// ----------------------
// Lógica do modal
// ----------------------
function openServiceModal(serviceId = null) {
    if (!selectedDateForModal) {
        alert('Erro: Nenhuma data selecionada.');
        return;
    }

    serviceForm.reset();
    serviceIdInput.value = '';
    currentServiceId = serviceId;

    serviceDateInput.value = formatDate(selectedDateForModal);

    if (serviceId) {
        // Dia COM serviço → modo VISUALIZAR
        const service = services.find(s => s.id === serviceId);
        if (!service) {
            // Fallback: se por algum motivo não achar o serviço, trata como novo
            jornadaServicoInput.value = '24h';
            setModalModeNew();
        } else {
            // Preenche dados
            serviceIdInput.value      = service.id;
            jornadaServicoInput.value = service.jornada;
            comandanteInput.value     = service.comandante;
            motoristaInput.value      = service.motorista;
            patrulheiro1Input.value   = service.patrulheiro1;
            patrulheiro2Input.value   = service.patrulheiro2;

            setModalModeView();
        }
    } else {
        // Dia SEM serviço → modo NOVO
        jornadaServicoInput.value = '24h';
        setModalModeNew();
    }

    serviceModal.classList.remove('hidden');
}

function activateEditMode() {
    if (!currentServiceId) return; // Só ativa edição se houver um serviço selecionado
    setModalModeEdit();
}

function closeServiceModal() {
    serviceModal.classList.add('hidden');
    currentServiceId = null;
}

// Salvar (novo ou edição)
function handleServiceFormSubmit(event) {
    event.preventDefault();

    const id = serviceIdInput.value ? parseInt(serviceIdInput.value, 10) : null;

    const serviceData = {
        date: serviceDateInput.value,
        jornada: jornadaServicoInput.value,
        comandante: comandanteInput.value,
        motorista: motoristaInput.value,
        patrulheiro1: patrulheiro1Input.value,
        patrulheiro2: patrulheiro2Input.value
    };

    if (!serviceData.comandante || !serviceData.motorista) {
        alert('Comandante e Motorista são campos obrigatórios.');
        return;
    }

    if (id) {
        // Edição
        const idx = services.findIndex(s => s.id === id);
        if (idx !== -1) {
            services[idx] = { ...services[idx], ...serviceData };
        }
    } else {
        // Novo
        serviceData.id = nextServiceId++;
        services.push(serviceData);
    }

    closeServiceModal();
    renderCalendar();
}

// Excluir serviço
function handleDeleteService() {
    const id = serviceIdInput.value ? parseInt(serviceIdInput.value, 10) : null;
    if (!id) return;

    const confirmation = confirm('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.');
    if (!confirmation) return;

    services = services.filter(s => s.id !== id);
    closeServiceModal();
    renderCalendar();
}

// ----------------------
// Navegação do calendário
// ----------------------
prevMonthButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar();
});

// ----------------------
// Eventos do modal
// ----------------------
cancelModalButton.addEventListener('click', closeServiceModal);
editServiceButton.addEventListener('click', activateEditMode);
deleteServiceButton.addEventListener('click', handleDeleteService);
serviceForm.addEventListener('submit', handleServiceFormSubmit);

// ----------------------
// Evento do botão "Cadastrar Policial Militar"
// ----------------------
cadastrarPmButton.addEventListener('click', () => {
    window.location.href = 'cadastro-pm.html'; // Redireciona para a nova página
});

// ----------------------
// Inicialização
// ----------------------
document.addEventListener('DOMContentLoaded', renderCalendar);
