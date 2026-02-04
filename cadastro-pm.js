// cadastro-pm.js

// Elementos da página
const voltarButton = document.getElementById('voltarButton');
const pmForm = document.getElementById('pm-form');
const pmIdInput = document.getElementById('pm-id');
const pmNomeInput = document.getElementById('pm-nome');
const pmMatriculaInput = document.getElementById('pm-matricula');
const pmCompanhiaInput = document.getElementById('pm-companhia');
const pmFuncaoInput = document.getElementById('pm-funcao');
const savePmButton = document.getElementById('save-pm-button');
const cancelPmFormButton = document.getElementById('cancel-pm-form');
const pmListDiv = document.getElementById('pm-list');

// "Banco de dados" em memória para os PMs
let policiaisMilitares = [];
let nextPmId = 1;

// Função para salvar os PMs no localStorage (para persistência básica)
function savePmsToLocalStorage() {
    localStorage.setItem('policiaisMilitares', JSON.stringify(policiaisMilitares));
    localStorage.setItem('nextPmId', nextPmId);
}

// Função para carregar os PMs do localStorage
function loadPmsFromLocalStorage() {
    const storedPms = localStorage.getItem('policiaisMilitares');
    const storedNextPmId = localStorage.getItem('nextPmId');
    if (storedPms) {
        policiaisMilitares = JSON.parse(storedPms);
    }
    if (storedNextPmId) {
        nextPmId = parseInt(storedNextPmId, 10);
    }
}

// Renderiza a lista de PMs
function renderPmList() {
    pmListDiv.innerHTML = ''; // Limpa a lista atual

    if (policiaisMilitares.length === 0) {
        pmListDiv.innerHTML = '<p>Nenhum policial cadastrado ainda.</p>';
        return;
    }

    policiaisMilitares.forEach(pm => {
        const pmItem = document.createElement('div');
        pmItem.classList.add('pm-item');
        pmItem.dataset.pmId = pm.id;

        pmItem.innerHTML = `
            <div class="pm-details">
                <p><strong>Nome:</strong> ${pm.nome}</p>
                <p><strong>Matrícula:</strong> ${pm.matricula}</p>
                <p><strong>Companhia:</strong> ${pm.companhia}</p>
                <p><strong>Função:</strong> ${pm.funcao}</p>
            </div>
            <div class="pm-actions">
                <button class="edit-pm-btn">Editar</button>
                <button class="delete-pm-btn">Excluir</button>
            </div>
        `;

        // Adiciona eventos para os botões de editar e excluir
        pmItem.querySelector('.edit-pm-btn').addEventListener('click', () => editPm(pm.id));
        pmItem.querySelector('.delete-pm-btn').addEventListener('click', () => deletePm(pm.id));

        pmListDiv.appendChild(pmItem);
    });
}

// Preenche o formulário para edição
function editPm(id) {
    const pmToEdit = policiaisMilitares.find(pm => pm.id === id);
    if (pmToEdit) {
        pmIdInput.value = pmToEdit.id;
        pmNomeInput.value = pmToEdit.nome;
        pmMatriculaInput.value = pmToEdit.matricula;
        pmCompanhiaInput.value = pmToEdit.companhia;
        pmFuncaoInput.value = pmToEdit.funcao;
        savePmButton.textContent = 'Salvar Edição';
    }
}

// Exclui um PM
function deletePm(id) {
    const confirmation = confirm('Tem certeza que deseja excluir este policial? Esta ação não pode ser desfeita.');
    if (confirmation) {
        policiaisMilitares = policiaisMilitares.filter(pm => pm.id !== id);
        savePmsToLocalStorage();
        renderPmList();
        // Se o PM excluído era o que estava sendo editado, limpa o formulário
        if (parseInt(pmIdInput.value, 10) === id) {
            clearForm();
        }
    }
}

// Limpa o formulário
function clearForm() {
    pmForm.reset();
    pmIdInput.value = '';
    savePmButton.textContent = 'Cadastrar PM';
}

// Lida com o envio do formulário
function handlePmFormSubmit(event) {
    event.preventDefault();

    const id = pmIdInput.value ? parseInt(pmIdInput.value, 10) : null;

    const pmData = {
        nome: pmNomeInput.value,
        matricula: pmMatriculaInput.value,
        companhia: pmCompanhiaInput.value,
        funcao: pmFuncaoInput.value
    };

    if (id) { // Edição
        const index = policiaisMilitares.findIndex(pm => pm.id === id);
        if (index !== -1) {
            policiaisMilitares[index] = { ...policiaisMilitares[index], ...pmData };
        }
    } else { // Novo cadastro
        pmData.id = nextPmId++;
        policiaisMilitares.push(pmData);
    }

    savePmsToLocalStorage();
    renderPmList();
    clearForm();
}

// Event Listeners
voltarButton.addEventListener('click', () => {
    window.location.href = 'index.html'; // Volta para a página principal
});

pmForm.addEventListener('submit', handlePmFormSubmit);
cancelPmFormButton.addEventListener('click', clearForm);

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadPmsFromLocalStorage();
    renderPmList();
});
