// script.js

// Elementos do DOM
const calendarGrid = document.getElementById('calendar-grid');
const currentMonthYearSpan = document.getElementById('currentMonthYear');
const prevMonthButton = document.getElementById('prevMonth');
const nextMonthButton = document.getElementById('nextMonth');
const selectedDateDisplay = document.getElementById('selected-date-display');
const serviceListDiv = document.getElementById('service-list');
const addServiceButton = document.getElementById('addServiceButton');

// Variáveis de estado
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null; // Armazena a data selecionada no calendário

// Array para armazenar os serviços (simulando um banco de dados)
// Cada serviço será um objeto com propriedades como data, companhia, tipo, etc.
let services = [];

// Funções de formatação de data
const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];
const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Mês é 0-indexado
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function parseDate(dateString) { // Converte "DD/MM/YYYY" para objeto Date
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
}

// Função para renderizar o calendário
function renderCalendar() {
    calendarGrid.innerHTML = ''; // Limpa o calendário existente
    currentMonthYearSpan.textContent = `${monthNames[currentMonth]} ${currentYear}`;

    // Adiciona os cabeçalhos dos dias da semana
    dayNames.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.classList.add('day-header');
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 para Domingo, 1 para Segunda, etc.

    // Preenche os dias vazios antes do primeiro dia do mês
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.classList.add('calendar-day');
        calendarGrid.appendChild(emptyDay);
    }

    // Preenche os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day);
        const dayElement = document.createElement('div');
        dayElement.classList.add('calendar-day');
        dayElement.dataset.date = formatDate(date); // Armazena a data formatada no dataset

        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        // Marca o dia atual
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }

        // Adiciona um indicador se houver serviços para este dia (ainda não implementado)
        // const servicesForDay = getServicesForDate(formatDate(date));
        // if (servicesForDay.length > 0) {
        //     const indicator = document.createElement('div');
        //     indicator.classList.add('service-indicator');
        //     dayElement.appendChild(indicator);
        // }

        dayElement.addEventListener('click', () => selectDate(date));
        calendarGrid.appendChild(dayElement);
    }

    // Atualiza a exibição dos serviços para a data selecionada (se houver)
    if (selectedDate) {
        displayServicesForSelectedDate();
    } else {
        serviceListDiv.innerHTML = '<p>Nenhum serviço agendado para esta data.</p>';
        selectedDateDisplay.textContent = 'Nenhuma data selecionada';
    }
}

// Função para selecionar uma data
function selectDate(date) {
    // Remove a classe 'selected' de qualquer dia previamente selecionado
    const previouslySelected = document.querySelector('.calendar-day.selected');
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }

    // Adiciona a classe 'selected' ao novo dia
    const newSelected = document.querySelector(`.calendar-day[data-date="${formatDate(date)}"]`);
    if (newSelected) {
        newSelected.classList.add('selected');
    }

    selectedDate = date;
    selectedDateDisplay.textContent = `Serviços para: ${formatDate(selectedDate)}`;
    displayServicesForSelectedDate();
}

// Função para exibir os serviços da data selecionada (ainda sem dados reais)
function displayServicesForSelectedDate() {
    serviceListDiv.innerHTML = '';
    if (!selectedDate) {
        serviceListDiv.innerHTML = '<p>Nenhum serviço agendado para esta data.</p>';
        return;
    }

    const formattedSelectedDate = formatDate(selectedDate);
    // Aqui, no futuro, vamos filtrar os 'services' pelo formattedSelectedDate
    const servicesForDay = services.filter(service => service.date === formattedSelectedDate);

    if (servicesForDay.length === 0) {
        serviceListDiv.innerHTML = '<p>Nenhum serviço agendado para esta data.</p>';
    } else {
        servicesForDay.forEach(service => {
            const serviceItem = document.createElement('div');
            serviceItem.classList.add('service-item');
            serviceItem.innerHTML = `
                <p><strong>Companhia:</strong> ${service.company}</p>
                <p><strong>Tipo:</strong> ${service.type}</p>
                <p><strong>Policiais:</strong> ${service.officers}</p>
                <p><strong>Horário:</strong> ${service.startTime} - ${service.endTime}</p>
                <p><strong>Local:</strong> ${service.location}</p>
                <p><strong>Obs:</strong> ${service.observations || 'N/A'}</p>
            `;
            serviceListDiv.appendChild(serviceItem);
        });
    }
}


// Event Listeners para navegação do calendário
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

// Event Listener para o botão "Adicionar Novo Serviço" (ainda sem funcionalidade)
addServiceButton.addEventListener('click', () => {
    if (selectedDate) {
        alert(`Você clicou para adicionar um serviço para ${formatDate(selectedDate)}. Esta funcionalidade será implementada em breve!`);
        // Aqui vamos abrir um formulário para adicionar o serviço
    } else {
        alert('Por favor, selecione uma data no calendário primeiro.');
    }
});


// Inicializa o calendário ao carregar a página
document.addEventListener('DOMContentLoaded', renderCalendar);
