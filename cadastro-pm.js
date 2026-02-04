// ============================================
// DADOS GLOBAIS
// ============================================
const QPP_DATA = {
    '1ª Cia': ['Alcantil', 'Barra de Santana', 'Caturité', 'Fagundes', 'Queimadas'],
    '2ª Cia': ['Aroeiras', 'Gado Bravo', 'Natuba', 'Santa Cecília', 'Umbuzeiro'],
    '3ª Cia': ['Boqueirão', 'Barra de São Miguel', 'Cabaceiras', 'Riacho de Santo Antônio', 'São Domingos do Cariri']
};

// Ordem de antiguidade das graduações (índice menor = mais antigo)
const ORDEM_GRADUACOES = {
    'Subtenente (ST)': 0,
    '1º Sargento (1º SGT)': 1,
    '2º Sargento (2º SGT)': 2,
    '3º Sargento (3º SGT)': 3,
    'Cabo (CB)': 4,
    'Soldado (SD)': 5
};

let PMS = [];
let NEXT_ID = 1;

// ============================================
// ELEMENTOS DO DOM
// ============================================
const form = document.getElementById('pm-form');
const inputId = document.getElementById('pm-id');
const inputNome = document.getElementById('pm-nome');
const inputMatricula = document.getElementById('pm-matricula');
const selectGuerra = document.getElementById('pm-nome-guerra');
const selectGraduacao = document.getElementById('pm-graduacao');
const selectCompanhia = document.getElementById('pm-companhia');
const selectQpp = document.getElementById('pm-qpp');
const selectSituacao = document.getElementById('pm-situacao');
const selectFuncao = document.getElementById('pm-funcao');
const btnLimpar = document.getElementById('cancel-pm-form');
const btnSalvar = document.getElementById('save-pm-button');
const divLista = document.getElementById('pm-list');

// ============================================
// INICIALIZAÇÃO
// ============================================
window.addEventListener('DOMContentLoaded', function() {
    carregarDados();
    renderizarLista();
    configurarEventos();
});

// ============================================
// EVENTOS
// ============================================
function configurarEventos() {
    inputNome.addEventListener('input', atualizarNomesGuerra);
    selectCompanhia.addEventListener('change', atualizarQpp);
    inputMatricula.addEventListener('input', validarMatricula);
    form.addEventListener('submit', salvarPm);
    btnLimpar.addEventListener('click', limparFormulario);
}

// ============================================
// MATRÍCULA
// ============================================
function validarMatricula(e) {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    if (e.target.value.length > 7) {
        e.target.value = e.target.value.substring(0, 7);
    }
}

function formatarMatricula(numero) {
    const n = numero.replace(/[^0-9]/g, '');
    if (n.length !== 7) return numero;
    return n.substring(0, 3) + '.' + n.substring(3, 6) + '-' + n.substring(6, 7);
}

// ============================================
// NOME DE GUERRA
// ============================================
function atualizarNomesGuerra() {
    const nome = inputNome.value.trim();
    const nomes = nome.split(/\s+/).filter(n => n.length > 0).map(n => n.toUpperCase());

    selectGuerra.innerHTML = '<option value="">Selecione um nome</option>';

    nomes.forEach(n => {
        const opt = document.createElement('option');
        opt.value = n;
        opt.textContent = n;
        selectGuerra.appendChild(opt);
    });

    if (nomes.length === 1) {
        selectGuerra.value = nomes[0];
    }
}

// ============================================
// QPP
// ============================================
function atualizarQpp() {
    const cia = selectCompanhia.value;
    selectQpp.innerHTML = '<option value="">Selecione o QPP</option>';

    if (!cia || !QPP_DATA[cia]) {
        selectQpp.disabled = true;
        return;
    }

    selectQpp.disabled = false;
    QPP_DATA[cia].forEach(qpp => {
        const opt = document.createElement('option');
        opt.value = qpp;
        opt.textContent = qpp;
        selectQpp.appendChild(opt);
    });
}

// ============================================
// SALVAR PM
// ============================================
function salvarPm(e) {
    e.preventDefault();

    const nome = inputNome.value.trim();
    const matricula = inputMatricula.value.trim();
    const guerra = selectGuerra.value.trim();
    const graduacao = selectGraduacao.value;
    const cia = selectCompanhia.value;
    const qpp = selectQpp.value;
    const situacao = selectSituacao.value;
    const funcao = selectFuncao.value;

    // Validações
    if (!nome) {
        alert('Preencha o Nome Completo');
        return;
    }
    if (matricula.length !== 7) {
        alert('Matrícula deve ter 7 números');
        return;
    }
    if (!guerra) {
        alert('Selecione um Nome de Guerra');
        return;
    }
    if (!graduacao) {
        alert('Selecione uma Graduação');
        return;
    }
    if (!cia) {
        alert('Selecione uma Companhia');
        return;
    }
    if (!qpp) {
        alert('Selecione um QPP');
        return;
    }
    if (!funcao) {
        alert('Selecione uma Função');
        return;
    }

    const matriculaFormatada = formatarMatricula(matricula);
    const id = inputId.value ? parseInt(inputId.value) : null;

    const pm = {
        id: id || NEXT_ID++,
        nome,
        matricula: matriculaFormatada,
        nomeGuerra: guerra,
        graduacao,
        companhia: cia,
        qpp,
        situacao,
        funcao
    };

    if (id) {
        const idx = PMS.findIndex(p => p.id === id);
        if (idx !== -1) {
            PMS[idx] = pm;
        }
    } else {
        PMS.push(pm);
    }

    salvarDados();
    renderizarLista();
    limparFormulario();
    alert('Policial salvo com sucesso!');
}

// ============================================
// EDITAR PM
// ============================================
function editarPm(id) {
    const pm = PMS.find(p => p.id === id);
    if (!pm) return;

    inputId.value = id;
    inputNome.value = pm.nome;
    inputMatricula.value = pm.matricula.replace(/[^0-9]/g, '');
    selectGraduacao.value = pm.graduacao;
    selectCompanhia.value = pm.companhia;
    selectSituacao.value = pm.situacao;
    selectFuncao.value = pm.funcao;

    atualizarNomesGuerra();
    selectGuerra.value = pm.nomeGuerra;

    atualizarQpp();
    selectQpp.value = pm.qpp;

    btnSalvar.textContent = 'Salvar Edição';
}

// ============================================
// EXCLUIR PM
// ============================================
function excluirPm(id) {
    if (!confirm('Tem certeza?')) return;

    PMS = PMS.filter(p => p.id !== id);
    salvarDados();
    renderizarLista();

    if (parseInt(inputId.value) === id) {
        limparFormulario();
    }
}

// ============================================
// LIMPAR FORMULÁRIO
// ============================================
function limparFormulario() {
    form.reset();
    inputId.value = '';
    selectGuerra.innerHTML = '<option value="">Selecione um nome</option>';
    selectQpp.innerHTML = '<option value="">Selecione o QPP</option>';
    selectQpp.disabled = true;
    selectSituacao.value = 'Apto ao Serviço';
    btnSalvar.textContent = 'Cadastrar PM';
}

// ============================================
// ORDENAR PMS POR ANTIGUIDADE
// ============================================
function ordenarPmsPorAntiguidade() {
    return [...PMS].sort((a, b) => {
        // Primeiro, ordena por graduação (mais antigo primeiro)
        const ordemA = ORDEM_GRADUACOES[a.graduacao] || 999;
        const ordemB = ORDEM_GRADUACOES[b.graduacao] || 999;

        if (ordemA !== ordemB) {
            return ordemA - ordemB;
        }

        // Se a graduação for a mesma, ordena por matrícula (menor = mais antigo)
        const matriculaA = parseInt(a.matricula.replace(/[^0-9]/g, ''));
        const matriculaB = parseInt(b.matricula.replace(/[^0-9]/g, ''));

        return matriculaA - matriculaB;
    });
}

// ============================================
// RENDERIZAR LISTA
// ============================================
function renderizarLista() {
    divLista.innerHTML = '';

    if (PMS.length === 0) {
        divLista.innerHTML = '<p>Nenhum policial cadastrado ainda.</p>';
        return;
    }

    const pmOrdenados = ordenarPmsPorAntiguidade();

    pmOrdenados.forEach(pm => {
        const div = document.createElement('div');
        div.className = 'pm-item';
        div.innerHTML = `
            <div class="pm-details">
                <p><strong>Nome:</strong> ${pm.nome}</p>
                <p><strong>Matrícula:</strong> ${pm.matricula}</p>
                <p><strong>Nome de Guerra:</strong> ${pm.nomeGuerra}</p>
                <p><strong>Graduação:</strong> ${pm.graduacao}</p>
                <p><strong>Companhia:</strong> ${pm.companhia}</p>
                <p><strong>QPP:</strong> ${pm.qpp}</p>
                <p><strong>Situação:</strong> ${pm.situacao}</p>
                <p><strong>Função:</strong> ${pm.funcao}</p>
            </div>
            <div class="pm-actions">
                <button class="edit-pm-btn" onclick="editarPm(${pm.id})">Editar</button>
                <button class="delete-pm-btn" onclick="excluirPm(${pm.id})">Excluir</button>
            </div>
        `;
        divLista.appendChild(div);
    });
}

// ============================================
// LOCALSTORAGE
// ============================================
function salvarDados() {
    localStorage.setItem('pms', JSON.stringify(PMS));
    localStorage.setItem('nextId', NEXT_ID.toString());
}

function carregarDados() {
    const dados = localStorage.getItem('pms');
    const id = localStorage.getItem('nextId');

    if (dados) {
        try {
            PMS = JSON.parse(dados);
        } catch (e) {
            PMS = [];
        }
    }

    if (id) {
        NEXT_ID = parseInt(id, 10);
    }
}
