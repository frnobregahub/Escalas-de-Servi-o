import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  User,
  Shield,
  Package,
  FileText,
  Send,
  LogOut,
  AlertCircle,
  Clock,
  Search,
  Settings,
  Users,
  History,
  MapPin,
  X,
  Upload,
  BookOpen,
  Mail,
  ChevronRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

// --- CONFIGURAÇÕES INICIAIS ---
const INITIAL_MILITAR_DB = [
  { matricula: '1234567', posto: 'SD PM', nome: 'SILVA' },
  { matricula: '7654321', posto: 'CB PM', nome: 'SANTOS' },
  { matricula: '1112223', posto: 'SGT PM', nome: 'OLIVEIRA' },
  { matricula: '9998887', posto: 'CAP PM', nome: 'COSTA' },
];

const POSTOS_DB = [
  'SD PM', 'CB PM', '3º SGT PM', '2º SGT PM', '1º SGT PM',
  'SUBTEN PM', '2º TEN PM', '1º TEN PM', 'CAP PM', 'MAJ PM', 'TEN CEL PM', 'CEL PM'
];

const INITIAL_NATUREZAS = [
  'AMEAÇA', 'APROPRIAÇÃO INDÉBITA', 'AVERIGUAÇÃO DE PESSOA SUSPEITA',
  'DANO', 'DESOBEDIÊNCIA', 'ENTORPECENTES (POSSE E USO)',
  'ENTORPECENTES (TRÁFICO)', 'FURTO', 'HOMICÍDIO', 'LESÃO CORPORAL',
  'PORTE ILEGAL DE ARMA DE FOGO', 'ROUBO', 'VIOLÊNCIA DOMÉSTICA',
].sort();

const CIDADES_DB = [
  "ALCANTIL", "AROEIRAS", "BARRA DE SANTANA", "BARRA DE SÃO MIGUEL",
  "BOQUEIRÃO", "CABACEIRAS", "CATURITÉ", "FAGUNDES", "GADO BRAVO",
  "NATUBA", "QUEIMADAS", "RIACHO DE SANTO ANTÔNIO", "SANTA CECÍLIA",
  "SÃO DOMINGOS DO CARIRI", "UMBUZEIRO"
].sort();

const UF_LIST = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const UNIDADES_MEDIDA = ['GRAMAS', 'QUILOGRAMAS', 'UNIDADES', 'EMBALAGENS', 'MILILITROS', 'LITROS'];

// Bug 4 — MOCK_HISTORY virou dado inicial do state; novos BOs são adicionados ao finalizar
const INITIAL_HISTORY = [
  {
    id: '45212/2026',
    data: '2026-05-10', hora: '14:30',
    matricula: '1234567', local: 'QUEIMADAS', rua: 'RUA PRINCIPAL', bairro: 'CENTRO',
    natureza: 'ROUBO', vtr: 'VTR 1801',
    relato: 'DURANTE PATRULHAMENTO, A EQUIPE FOI ACIONADA PARA ATENDER OCORRÊNCIA DE ROUBO A ESTABELECIMENTO COMERCIAL. NO LOCAL, A VÍTIMA INFORMOU QUE DOIS INDIVÍDUOS EM UMA MOTOCICLETA SUBTRAÍRAM QUANTIA EM DINHEIRO.',
    envolvidos: [{ tipo: 'VÍTIMA', nome: 'JOÃO DA SILVA', cpf: '00000000000' }],
    apreensoes: []
  },
];

// --- COMPONENTES AUXILIARES ---

const up = (str) => (str ? str.toUpperCase() : '');

const InputField = ({
  label, value, onChange, type = 'text', placeholder = '',
  readOnly = false, error = '', inputMode = 'text',
  suffix = null, forceUpper = true, required = false
}) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-blue-900 mb-1 uppercase Arial">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={type}
        inputMode={inputMode}
        value={value ?? ''}
        readOnly={readOnly}
        onChange={(e) => {
          if (readOnly) return;
          const val = e.target.value;
          onChange(forceUpper ? up(val) : val);
        }}
        placeholder={placeholder}
        className={`w-full p-3 bg-white border-2 rounded-lg text-black ${forceUpper ? 'uppercase' : ''} outline-none transition-all Arial
          ${error ? 'border-red-500 bg-red-50 shadow-inner' : 'border-blue-900 focus:border-blue-600'}
          ${readOnly ? 'bg-gray-100 text-gray-500 cursor-default border-gray-300' : ''}
          ${suffix ? 'pr-12' : ''}`}
      />
      {suffix}
    </div>
    {error && (
      <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1 uppercase">
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
);

const ActionButton = ({ children, onClick, className = '', secondary = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 rounded-xl font-bold uppercase transition-all shadow-md flex items-center justify-center gap-3
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-400' : 'active:scale-95'}
      ${secondary ? 'bg-gray-500 text-white' : 'bg-blue-800 text-white'}
      ${className} Arial`}
  >
    {children}
  </button>
);

const LayoutContainer = ({
  title, icon: Icon, step, screenProgress = 0,
  children, onBack, onNext, nextLabel = 'PRÓXIMO', validationMsg = ''
}) => (
  <div className="min-h-screen bg-gray-200 flex flex-col pb-24 Arial">
    <div className="bg-blue-900 text-white sticky top-0 z-20 shadow-md">
      <div className="p-4 flex justify-between items-center">
        <span className="font-bold uppercase tracking-wider">{title}</span>
        <Icon size={20} className="text-blue-100" />
      </div>
      {step !== undefined && (
        <div className="bg-blue-950 px-4 py-1.5 space-y-1">
          <div className="w-full bg-blue-800 rounded-full h-1">
            <div className="bg-white h-1 rounded-full transition-all duration-300" style={{ width: `${((step + 1) / 6) * 100}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-blue-900 rounded-full h-0.5">
              <div className="bg-green-400 h-0.5 rounded-full transition-all duration-500" style={{ width: `${screenProgress}%` }} />
            </div>
            <span className="text-[8px] font-black text-green-300 uppercase">
              {screenProgress === 100 ? 'CONCLUÍDO' : `${screenProgress}%`}
            </span>
          </div>
        </div>
      )}
    </div>

    <div className="p-6 flex-1 overflow-y-auto">{children}</div>

    {validationMsg && (
      <div className="fixed bottom-24 left-6 right-6 bg-red-600 text-white p-3 rounded-lg shadow-xl flex items-center gap-3 animate-bounce z-30 font-bold text-[10px] uppercase">
        <AlertTriangle size={16} /> {validationMsg}
      </div>
    )}

    {onBack && onNext && (
      <div className="fixed bottom-0 w-full p-4 bg-gray-300 border-t border-gray-400 flex gap-3 z-20 shadow-lg">
        <ActionButton onClick={onBack} secondary className="flex-1">VOLTAR</ActionButton>
        <ActionButton onClick={onNext} className="flex-1">{nextLabel}</ActionButton>
      </div>
    )}
  </div>
);

// --- APLICATIVO PRINCIPAL ---

// Bug 7 — fábrica centralizada para criar/resetar o estado do BO
const makeEmptyBo = () => ({
  id: `${Math.floor(Math.random() * 90000) + 10000}/2026`,
  cicc: '',   // Bug 1 — era 'PM'; campo começa vazio para não confundir validação
  data: '', hora: '',
  local: { rua: '', num: '', bairro: '', cidade: 'QUEIMADAS', ref: '' },
  natureza: '', naturezaEspec: '',
  equipe: { vtr: '', motorista: '', p1: '', p2: '' },
  envolvidos: [], apreensoes: [], relato: '',
  recepcao: { nome: '', mat: '', cargo: 'DELEGADO', local: '' }
});

export default function App() {
  const [screen, setScreen] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [matriculaLogin, setMatriculaLogin] = useState('');
  const [loginError, setLoginError] = useState('');

  const [militarDb, setMilitarDb] = useState(INITIAL_MILITAR_DB);
  const [naturesDb, setNaturesDb] = useState(INITIAL_NATUREZAS);
  // Bug 4 — state editável para o histórico
  const [historyDb, setHistoryDb] = useState(INITIAL_HISTORY);

  const fileInputRef = useRef(null);

  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminTab, setAdminTab] = useState('HISTORICO');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [showMilitarForm, setShowMilitarForm] = useState(false);
  const [tempMilitar, setTempMilitar] = useState({ matricula: '', posto: 'SD PM', nome: '' });
  const [editingMilitarMat, setEditingMilitarMat] = useState(null);

  const [destinatarios, setDestinatarios] = useState([
    { id: 1, nome: 'CENTRAL 18º BPM', numero: '83999999999', email: 'contato@18bpm.pb.gov.br' }
  ]);
  const [tempDest, setTempDest] = useState({ nome: '', numero: '', email: '' });
  const [editingDestId, setEditingDestId] = useState(null);
  const [showDestForm, setShowDestForm] = useState(false);

  const [newNature, setNewNature] = useState('');
  const [showNatureForm, setShowNatureForm] = useState(false);
  const [editingNatureOriginal, setEditingNatureOriginal] = useState(null);

  const [tempEnv, setTempEnv] = useState(null);
  const [tempApr, setTempApr] = useState(null);
  const [editIdx, setEditIdx] = useState(null);

  const [validationErrors, setValidationErrors] = useState({});
  const [validationMsg, setValidationMsg] = useState('');

  const [showNumDropdown, setShowNumDropdown] = useState(false);
  const [showUfDropdown, setShowUfDropdown] = useState(false);

  const [bo, setBo] = useState(makeEmptyBo);

  // Auto-limpa o toast de validação após 3s
  useEffect(() => {
    if (!validationMsg) return;
    const t = setTimeout(() => setValidationMsg(''), 3000);
    return () => clearTimeout(t);
  }, [validationMsg]);

  // Bug 2 — fecha qualquer dropdown ao clicar fora dele
  useEffect(() => {
    if (!showNumDropdown && !showUfDropdown) return;
    const close = () => { setShowNumDropdown(false); setShowUfDropdown(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [showNumDropdown, showUfDropdown]);

  // Bug 11 — helper: limpa o erro de um campo específico ao digitar
  const clearError = (field) => {
    setValidationErrors(prev => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const calculateScreenProgress = () => {
    let required = [];
    switch (screen) {
      case 'DADOS':
        // Bug 1 — 'PM' sozinho (length <= 2) não conta como preenchido
        required = [
          bo.cicc && bo.cicc.length > 2 ? bo.cicc : '',
          bo.data, bo.hora, bo.local.cidade,
          bo.local.rua, bo.local.num, bo.local.bairro, bo.natureza
        ];
        if (bo.natureza === 'OUTROS') required.push(bo.naturezaEspec);
        break;
      case 'EQUIPE':
        // Bug 6 — p2 é opcional; removido do cálculo
        required = [bo.equipe.vtr, bo.equipe.motorista, bo.equipe.p1];
        break;
      case 'HISTORICO':
        // Só conta como preenchido se tiver >= 20 chars
        required = [bo.relato && bo.relato.length >= 20 ? bo.relato : ''];
        break;
      case 'FINALIZACAO':
        required = [bo.recepcao.nome, bo.recepcao.mat, bo.recepcao.cargo, bo.recepcao.local];
        break;
      default:
        return 100;
    }
    const filled = required.filter(f => f && String(f).trim() !== '').length;
    return required.length > 0 ? Math.round((filled / required.length) * 100) : 100;
  };

  const handleNextWithValidation = (targetScreen) => {
    const errors = {};
    if (screen === 'DADOS') {
      // Bug 1 — valida length > 2 em vez de === 'PM'
      if (!bo.cicc || bo.cicc.length <= 2) errors.cicc = 'OBRIGATÓRIO';
      if (!bo.data) errors.data = 'OBRIGATÓRIO';
      if (!bo.hora) errors.hora = 'OBRIGATÓRIO';
      if (!bo.local.rua) errors.rua = 'OBRIGATÓRIO';
      if (!bo.local.num) errors.num = 'OBRIGATÓRIO';
      if (!bo.local.bairro) errors.bairro = 'OBRIGATÓRIO';
      if (!bo.natureza) errors.natureza = 'OBRIGATÓRIO';
      if (bo.natureza === 'OUTROS' && !bo.naturezaEspec) errors.naturezaEspec = 'OBRIGATÓRIO';
    }
    if (screen === 'EQUIPE') {
      if (!bo.equipe.vtr) errors.vtr = 'OBRIGATÓRIO';
      if (!bo.equipe.motorista) errors.motorista = 'OBRIGATÓRIO';
      if (!bo.equipe.p1) errors.p1 = 'OBRIGATÓRIO';
      // Bug 6 — p2 removido da validação obrigatória
    }
    if (screen === 'LISTA_ENV' && targetScreen === 'LISTA_APR') {
      if (bo.envolvidos.length === 0) {
        setValidationMsg('ADICIONE AO MENOS UM ENVOLVIDO');
        return;
      }
    }
    if (screen === 'HISTORICO') {
      if (!bo.relato || bo.relato.length < 20) {
        errors.relato = 'MÍNIMO 20 CARACTERES';
        setValidationMsg('RELATO MUITO CURTO OU VAZIO');
      }
    }
    if (screen === 'FINALIZACAO') {
      if (!bo.recepcao.nome) errors.rNome = 'OBRIGATÓRIO';
      if (!bo.recepcao.mat) errors.rMat = 'OBRIGATÓRIO';
      if (!bo.recepcao.local) errors.rLocal = 'OBRIGATÓRIO';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setValidationMsg('PREENCHA OS CAMPOS OBRIGATÓRIOS');
    } else {
      setValidationErrors({});
      setScreen(targetScreen);
    }
  };

  const handleLogin = () => {
    const found = militarDb.find(m => m.matricula === matriculaLogin.trim());
    if (found) {
      setUser(found);
      setScreen('WELCOME');
      setLoginError('');
    } else {
      setLoginError('MATRÍCULA NÃO ENCONTRADA');
    }
  };

  const handleAdminLogin = () => {
    const normalizedUser = adminUsername.trim().toUpperCase();
    const normalizedPass = adminPassword.trim().toLowerCase();
    if (normalizedUser === 'ADMIN' && normalizedPass === '18bpm') {
      setScreen('PANEL_ADMIN');
      setLoginError('');
    } else {
      setLoginError('USUÁRIO OU SENHA INVÁLIDOS');
    }
  };

  // Bug 7 — reset completo de todos os estados transitórios
  const logout = () => {
    setUser(null);
    setMatriculaLogin('');
    setAdminUsername('');
    setAdminPassword('');
    setScreen('LOGIN');
    setBo(makeEmptyBo());
    setSelectedRecord(null);
    setValidationErrors({});
    setValidationMsg('');
    setTempEnv(null);
    setTempApr(null);
    setEditIdx(null);
    setShowNumDropdown(false);
    setShowUfDropdown(false);
    setShowMilitarForm(false);
    setShowNatureForm(false);
  };

  // Bug 8 — verifica duplicata de matrícula também na edição
  const handleSaveMilitar = () => {
    if (!tempMilitar.matricula || !tempMilitar.nome) return;
    if (editingMilitarMat) {
      const conflict = militarDb.find(
        m => m.matricula === tempMilitar.matricula && m.matricula !== editingMilitarMat
      );
      if (conflict) { alert('ESTA MATRÍCULA JÁ ESTÁ CADASTRADA.'); return; }
      setMilitarDb(militarDb.map(m => m.matricula === editingMilitarMat ? tempMilitar : m));
      setEditingMilitarMat(null);
    } else {
      if (militarDb.find(m => m.matricula === tempMilitar.matricula)) {
        alert('ESTA MATRÍCULA JÁ ESTÁ CADASTRADA.');
        return;
      }
      setMilitarDb([...militarDb, tempMilitar]);
    }
    setTempMilitar({ matricula: '', posto: 'SD PM', nome: '' });
    setShowMilitarForm(false);
  };

  const handleEditMilitar = (m) => {
    setTempMilitar(m);
    setEditingMilitarMat(m.matricula);
    setShowMilitarForm(true);
  };

  const handleRemoveMilitar = (mat) => {
    setMilitarDb(militarDb.filter(m => m.matricula !== mat));
  };

  const handleAddNature = () => {
    if (!newNature.trim()) return;
    const upperNature = newNature.toUpperCase();
    if (editingNatureOriginal) {
      setNaturesDb(naturesDb.map(n => n === editingNatureOriginal ? upperNature : n).sort());
      setEditingNatureOriginal(null);
    } else {
      if (naturesDb.includes(upperNature)) { alert('ESTA NATUREZA JÁ EXISTE.'); return; }
      setNaturesDb([...naturesDb, upperNature].sort());
    }
    setNewNature('');
    setShowNatureForm(false);
  };

  const handleEditNature = (nature) => {
    setNewNature(nature);
    setEditingNatureOriginal(nature);
    setShowNatureForm(true);
  };

  const handleRemoveNature = (natureToRemove) => {
    setNaturesDb(naturesDb.filter(n => n !== natureToRemove));
    if (editingNatureOriginal === natureToRemove) {
      setEditingNatureOriginal(null);
      setNewNature('');
      setShowNatureForm(false);
    }
  };

  const handleImportClick = () => { fileInputRef.current?.click(); };

  // Bug 9 — deduplica matrículas antes de importar
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split('\n');
      const parsed = [];
      lines.forEach((line, idx) => {
        if (idx === 0 || !line.trim()) return;
        const [matricula, posto, nome] = line.split(',').map(s => s.trim());
        if (matricula && posto && nome) {
          parsed.push({
            matricula: matricula.replace(/\D/g, '').slice(0, 7),
            posto: up(posto),
            nome: up(nome)
          });
        }
      });
      if (parsed.length > 0) {
        setMilitarDb(prev => {
          const existing = new Set(prev.map(m => m.matricula));
          const unique = parsed.filter(m => !existing.has(m.matricula));
          const skipped = parsed.length - unique.length;
          alert(
            skipped > 0
              ? `${unique.length} importado(s). ${skipped} duplicata(s) ignorada(s).`
              : `${unique.length} Militares importados com sucesso!`
          );
          return [...prev, ...unique];
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // ============================================================
  // TELAS
  // ============================================================

  if (screen === 'LOGIN') return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 Arial">
      <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mb-6 shadow-xl border-4 border-white">
        <Shield className="text-white" size={48} />
      </div>
      <h1 className="text-blue-900 font-black text-2xl mb-10 text-center uppercase tracking-widest">BOPM DIGITAL</h1>
      <div className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-lg border border-gray-300">
        <InputField
          label="Matrícula (7 Dígitos)"
          type="text"
          inputMode="numeric"
          value={matriculaLogin}
          onChange={(v) => {
            setMatriculaLogin(v.replace(/\D/g, '').slice(0, 7));
            setLoginError('');
          }}
          placeholder="EX: 1234567"
          error={loginError}
          required
        />
        <ActionButton onClick={handleLogin}>Entrar</ActionButton>
      </div>
      <button
        onClick={() => { setLoginError(''); setScreen('LOGIN_ADMIN'); }}
        className="mt-12 text-blue-900 opacity-40 text-[10px] font-bold uppercase tracking-widest hover:opacity-100 transition-opacity"
      >
        Acesso Administrativo
      </button>
    </div>
  );

  if (screen === 'LOGIN_ADMIN') return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 Arial">
      <div className="w-20 h-20 bg-blue-950 rounded-full flex items-center justify-center mb-6 shadow-xl border-2 border-white">
        <Settings className="text-white" size={32} />
      </div>
      <h2 className="text-blue-950 font-black text-lg mb-8 text-center uppercase">PAINEL DE GESTÃO</h2>
      <div className="w-full max-w-xs bg-white p-6 rounded-2xl shadow-lg border border-gray-300">
        <InputField
          label="Usuário"
          value={adminUsername}
          onChange={(v) => { setAdminUsername(v); setLoginError(''); }}
          placeholder="ADMIN"
          required
        />
        <InputField
          label="Senha"
          type={showAdminPassword ? 'text' : 'password'}
          value={adminPassword}
          onChange={(v) => { setAdminPassword(v); setLoginError(''); }}
          placeholder="••••••••"
          error={loginError}
          forceUpper={false}
          required
          suffix={
            <button
              onClick={() => setShowAdminPassword(!showAdminPassword)}
              className="absolute right-3 top-2 bottom-2 text-blue-900 opacity-50 px-1"
            >
              {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          }
        />
        <ActionButton onClick={handleAdminLogin}>Acessar Sistema</ActionButton>
        <button onClick={() => setScreen('LOGIN')} className="w-full mt-4 text-xs font-bold text-gray-500 uppercase">
          Voltar ao Login Policial
        </button>
      </div>
    </div>
  );

  if (screen === 'PANEL_ADMIN') return (
    <div className="min-h-screen bg-gray-200 flex flex-col pb-16 Arial">
      <div className="bg-blue-950 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-blue-300" />
          <span className="font-black text-sm uppercase tracking-wider">GESTÃO 18º BPM</span>
        </div>
        <button onClick={logout} className="p-2 bg-red-800 rounded-lg active:scale-90 transition-transform">
          <LogOut size={16} />
        </button>
      </div>

      <div className="flex bg-blue-900 text-white text-[10px] font-black uppercase shadow-inner">
        <button
          onClick={() => { setSelectedRecord(null); setAdminTab('HISTORICO'); }}
          className={`flex-1 p-4 flex flex-col items-center gap-2 ${adminTab === 'HISTORICO' ? 'bg-blue-800 border-b-4 border-white' : ''}`}
        >
          <History size={16} /> Histórico
        </button>
        <button
          onClick={() => { setSelectedRecord(null); setAdminTab('EFETIVO'); }}
          className={`flex-1 p-4 flex flex-col items-center gap-2 ${adminTab === 'EFETIVO' ? 'bg-blue-800 border-b-4 border-white' : ''}`}
        >
          <Users size={16} /> Efetivo
        </button>
        <button
          onClick={() => { setSelectedRecord(null); setAdminTab('CONFIG'); }}
          className={`flex-1 p-4 flex flex-col items-center gap-2 ${adminTab === 'CONFIG' ? 'bg-blue-800 border-b-4 border-white' : ''}`}
        >
          <Settings size={16} /> Ajustes
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">

        {adminTab === 'HISTORICO' && (
          selectedRecord ? (
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <button onClick={() => setSelectedRecord(null)} className="flex items-center gap-2 text-blue-900 font-black text-[10px] mb-4 uppercase">
                <ArrowLeft size={14} /> Voltar
              </button>
              <div className="bg-white rounded-2xl shadow-xl border border-gray-300 overflow-hidden">
                <div className="bg-blue-900 p-4 text-white">
                  <h3 className="text-xl font-black uppercase">{selectedRecord.id}</h3>
                  <p className="text-blue-300 text-xs mt-1">{selectedRecord.natureza} — {selectedRecord.local}</p>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-xs text-gray-700 leading-relaxed Arial uppercase whitespace-pre-wrap">{selectedRecord.relato}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Bug 4 — usa historyDb (state) em vez da constante MOCK_HISTORY */}
              {historyDb.map(h => (
                <button
                  key={h.id}
                  onClick={() => setSelectedRecord(h)}
                  className="w-full text-left bg-white p-4 rounded-xl border-l-8 border-blue-900 shadow-sm flex justify-between items-center group"
                >
                  <div className="flex-1">
                    <p className="text-[10px] font-black text-blue-800 tracking-tighter uppercase">BO {h.id}</p>
                    <p className="text-xs font-black text-black uppercase">{h.natureza}</p>
                  </div>
                  <ChevronRight size={20} className="text-blue-900 opacity-30" />
                </button>
              ))}
              {historyDb.length === 0 && (
                <p className="text-center text-gray-400 text-xs font-bold uppercase mt-8">NENHUM REGISTRO ENCONTRADO</p>
              )}
            </div>
          )
        )}

        {adminTab === 'EFETIVO' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 border-b-2 border-blue-900 pb-3">
              <h3 className="text-blue-900 font-black text-xs uppercase tracking-widest flex items-center gap-3">
                <Users size={16} /> Efetivo
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => { setEditingMilitarMat(null); setTempMilitar({ matricula: '', posto: 'SD PM', nome: '' }); setShowMilitarForm(true); }}
                  className="bg-blue-900 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                >
                  <Plus size={14} /> Novo
                </button>
                <button
                  onClick={handleImportClick}
                  className="bg-white border border-blue-900 text-blue-900 px-3 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"
                >
                  <Upload size={14} /> CSV
                </button>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
            </div>

            {showMilitarForm && (
              <div className="mb-6 p-5 bg-blue-50 rounded-2xl border-2 border-blue-900">
                <InputField
                  label="Matrícula"
                  value={tempMilitar.matricula}
                  onChange={v => setTempMilitar({ ...tempMilitar, matricula: v.replace(/\D/g, '').slice(0, 7) })}
                  placeholder="EX: 1234567"
                  inputMode="numeric"
                  required
                />
                <div className="mb-4">
                  <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">
                    Posto <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black uppercase outline-none font-bold"
                    value={tempMilitar.posto}
                    onChange={(e) => setTempMilitar({ ...tempMilitar, posto: e.target.value })}
                  >
                    {POSTOS_DB.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <InputField
                  label="Nome"
                  value={tempMilitar.nome}
                  onChange={v => setTempMilitar({ ...tempMilitar, nome: v })}
                  placeholder="EX: SILVA"
                  required
                />
                <ActionButton onClick={handleSaveMilitar}>Salvar</ActionButton>
              </div>
            )}

            <div className="space-y-2">
              {militarDb.map(m => (
                <div key={m.matricula} className="bg-white p-2.5 px-4 rounded-xl border border-gray-300 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 bg-blue-50 rounded-full flex items-center justify-center text-blue-900">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="text-[8px] font-black text-blue-900 leading-none mb-0.5">{m.posto}</p>
                      <p className="text-[11px] font-bold text-black uppercase">{m.nome}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => handleEditMilitar(m)} className="w-8 h-8 flex items-center justify-center text-blue-800 bg-blue-50 rounded-lg">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleRemoveMilitar(m.matricula)} className="w-8 h-8 flex items-center justify-center text-red-600 bg-red-50 rounded-lg">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {adminTab === 'CONFIG' && (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-300 shadow-lg">
              <div className="flex justify-between items-center border-b-2 border-blue-900 pb-4 mb-4">
                <h3 className="text-blue-900 font-black text-xs uppercase tracking-widest">Naturezas</h3>
                <button onClick={() => setShowNatureForm(true)} className="bg-blue-800 text-white p-1 rounded-full">
                  <Plus size={16} />
                </button>
              </div>
              {showNatureForm && (
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-900">
                  <InputField label="Nome" value={newNature} onChange={setNewNature} placeholder="EX: ROUBO" required />
                  <ActionButton onClick={handleAddNature}>Salvar</ActionButton>
                </div>
              )}
              <div className="space-y-2">
                {naturesDb.map((n, i) => (
                  <div key={i} className="bg-white p-2.5 px-4 rounded-xl border border-gray-300 flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-black text-blue-900 uppercase truncate flex-1">{n}</span>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditNature(n)} className="text-blue-800"><Edit2 size={14} /></button>
                      <button onClick={() => handleRemoveNature(n)} className="text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (screen === 'WELCOME') return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 text-center Arial">
      <p className="text-blue-900 font-bold mb-1 uppercase tracking-widest">Bem vindo,</p>
      <h2 className="text-3xl font-black text-blue-950 mb-16 uppercase">{user.posto} {user.nome}!</h2>
      <button
        onClick={() => setScreen('DADOS')}
        className="w-56 h-56 bg-blue-800 rounded-full border-8 border-white shadow-2xl flex flex-col items-center justify-center text-white font-black active:scale-90 transition-transform"
      >
        <Plus size={72} strokeWidth={3} />
        <span className="text-xl mt-2 uppercase">Novo BOPM</span>
      </button>
      <button onClick={logout} className="mt-16 text-red-600 font-bold flex items-center gap-3 uppercase">
        <LogOut size={18} /> Sair
      </button>
    </div>
  );

  if (screen === 'DADOS') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={Shield}
      step={0}
      screenProgress={calculateScreenProgress()}
      onBack={() => setScreen('WELCOME')}
      onNext={() => handleNextWithValidation('EQUIPE')}
      validationMsg={validationMsg}
    >
      {/* Bug 1 — cicc começa vazio; onChange permite limpar o campo */}
      <InputField
        label="Nº CICC"
        value={bo.cicc}
        onChange={(v) => {
          const digits = v.replace(/^PM/i, '').replace(/\D/g, '').slice(0, 10);
          setBo({ ...bo, cicc: digits ? `PM${digits}` : '' });
          clearError('cicc');
        }}
        placeholder="EX: PM0123456789"
        inputMode="numeric"
        required
        error={validationErrors.cicc}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="DATA" type="date" value={bo.data}
          onChange={v => { setBo({ ...bo, data: v }); clearError('data'); }}
          required error={validationErrors.data}
        />
        <InputField
          label="HORA" type="time" value={bo.hora}
          onChange={v => { setBo({ ...bo, hora: v }); clearError('hora'); }}
          required error={validationErrors.hora}
        />
      </div>

      <h3 className="text-blue-900 font-black mt-4 mb-2 border-b border-blue-900 text-[10px] uppercase tracking-wider">LOCALIZAÇÃO</h3>
      <div className="mb-4">
        <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">CIDADE <span className="text-red-500">*</span></label>
        <select
          className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black uppercase outline-none font-bold"
          value={bo.local.cidade}
          onChange={(e) => setBo({ ...bo, local: { ...bo.local, cidade: e.target.value } })}
        >
          {CIDADES_DB.map(city => <option key={city} value={city}>{city}</option>)}
        </select>
      </div>

      <InputField
        label="RUA" value={bo.local.rua}
        onChange={v => { setBo({ ...bo, local: { ...bo.local, rua: v } }); clearError('rua'); }}
        required error={validationErrors.rua}
      />

      <div className="grid grid-cols-3 gap-4">
        <InputField
          label="Nº"
          value={bo.local.num}
          onChange={v => { setBo({ ...bo, local: { ...bo.local, num: v } }); clearError('num'); }}
          required
          error={validationErrors.num}
          suffix={
            // Bug 2 — stopPropagation impede que o document listener feche o dropdown imediatamente
            <div className="absolute right-1 top-1 bottom-1 flex items-center" onMouseDown={e => e.stopPropagation()}>
              <div className="relative h-full flex items-center">
                <button
                  onClick={() => setShowNumDropdown(!showNumDropdown)}
                  className="px-3 h-full bg-blue-100 text-blue-900 hover:bg-blue-200 transition-colors rounded border border-blue-200 flex items-center justify-center shadow-sm"
                >
                  <ChevronDown size={16} strokeWidth={3} className={`transition-transform duration-200 ${showNumDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showNumDropdown && (
                  <div
                    className="absolute top-full right-0 mt-1 w-32 bg-white border-2 border-blue-900 rounded-lg shadow-xl z-50 overflow-hidden"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => { setBo({ ...bo, local: { ...bo.local, num: 'S/N' } }); clearError('num'); setShowNumDropdown(false); }}
                      className="w-full p-3 text-left hover:bg-blue-50 text-blue-900 text-[10px] font-black uppercase border-b border-gray-100"
                    >
                      SEM NÚMERO
                    </button>
                    <button
                      onClick={() => { setBo({ ...bo, local: { ...bo.local, num: '' } }); setShowNumDropdown(false); }}
                      className="w-full p-3 text-left hover:bg-red-50 text-red-600 text-[10px] font-black uppercase"
                    >
                      LIMPAR
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
        />
        <div className="col-span-2">
          <InputField
            label="BAIRRO" value={bo.local.bairro}
            onChange={v => { setBo({ ...bo, local: { ...bo.local, bairro: v } }); clearError('bairro'); }}
            required error={validationErrors.bairro}
          />
        </div>
      </div>

      <h3 className="text-blue-900 font-black mt-4 mb-2 border-b border-blue-900 text-[10px] uppercase tracking-wider">NATUREZA</h3>
      <div className="mb-4">
        <select
          className={`w-full p-3 bg-white border-2 rounded-lg text-black uppercase outline-none font-bold ${validationErrors.natureza ? 'border-red-500 bg-red-50' : 'border-blue-900'}`}
          value={bo.natureza}
          onChange={(e) => { setBo({ ...bo, natureza: e.target.value }); clearError('natureza'); }}
        >
          <option value="">SELECIONE...</option>
          {naturesDb.map(n => <option key={n} value={n}>{n}</option>)}
          <option value="OUTROS">OUTROS</option>
        </select>
        {validationErrors.natureza && (
          <p className="text-red-600 text-[10px] mt-1 font-bold flex items-center gap-1 uppercase">
            <AlertCircle size={10} /> {validationErrors.natureza}
          </p>
        )}
      </div>
      {bo.natureza === 'OUTROS' && (
        <InputField
          label="ESPECIFIQUE" value={bo.naturezaEspec}
          onChange={v => { setBo({ ...bo, naturezaEspec: v }); clearError('naturezaEspec'); }}
          required error={validationErrors.naturezaEspec}
        />
      )}
    </LayoutContainer>
  );

  if (screen === 'EQUIPE') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={Shield}
      step={1}
      screenProgress={calculateScreenProgress()}
      onBack={() => setScreen('DADOS')}
      onNext={() => handleNextWithValidation('LISTA_ENV')}
      validationMsg={validationMsg}
    >
      <InputField
        label="VIATURA" value={bo.equipe.vtr}
        onChange={v => { setBo({ ...bo, equipe: { ...bo.equipe, vtr: v } }); clearError('vtr'); }}
        required error={validationErrors.vtr}
      />
      <InputField label="COMANDANTE" value={`${user.posto} ${user.nome} - ${user.matricula}`} readOnly />
      <InputField
        label="MOTORISTA" value={bo.equipe.motorista}
        onChange={v => { setBo({ ...bo, equipe: { ...bo.equipe, motorista: v } }); clearError('motorista'); }}
        required error={validationErrors.motorista}
      />
      <InputField
        label="PATRULHEIRO 1" value={bo.equipe.p1}
        onChange={v => { setBo({ ...bo, equipe: { ...bo.equipe, p1: v } }); clearError('p1'); }}
        required error={validationErrors.p1}
      />
      {/* Bug 6 — PATRULHEIRO 2 é opcional; sem required, sem erro */}
      <InputField
        label="PATRULHEIRO 2"
        value={bo.equipe.p2}
        onChange={v => setBo({ ...bo, equipe: { ...bo.equipe, p2: v } })}
      />
    </LayoutContainer>
  );

  if (screen === 'LISTA_ENV') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={User}
      step={2}
      screenProgress={bo.envolvidos.length > 0 ? 100 : 0}
      onBack={() => setScreen('EQUIPE')}
      onNext={() => handleNextWithValidation('LISTA_APR')}
      validationMsg={validationMsg}
    >
      <div className="space-y-3 mb-8">
        <ActionButton onClick={() => { setTempEnv({ tipo: 'ACUSADO', nome: '', cpf: '', rg: '' }); setEditIdx(null); setScreen('FORM_ENV'); }}>+ ACUSADO</ActionButton>
        <ActionButton onClick={() => { setTempEnv({ tipo: 'VÍTIMA', nome: '', cpf: '', rg: '' }); setEditIdx(null); setScreen('FORM_ENV'); }}>+ VÍTIMA</ActionButton>
        <ActionButton onClick={() => { setTempEnv({ tipo: 'TESTEMUNHA', nome: '', cpf: '', rg: '' }); setEditIdx(null); setScreen('FORM_ENV'); }}>+ TESTEMUNHA</ActionButton>
      </div>
      <div className="space-y-3">
        {bo.envolvidos.map((e, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border-l-8 border-blue-900 flex justify-between items-center shadow-md">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase">{e.tipo}</p>
              <p className="font-black text-blue-900 uppercase">{e.nome}</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => { setTempEnv(e); setEditIdx(i); setScreen('FORM_ENV'); }} className="text-blue-900"><Edit2 size={18} /></button>
              <button onClick={() => setBo({ ...bo, envolvidos: bo.envolvidos.filter((_, idx) => idx !== i) })} className="text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </LayoutContainer>
  );

  if (screen === 'FORM_ENV') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={User}
      step={2}
      screenProgress={tempEnv?.nome ? 100 : 50}
      onBack={() => setScreen('LISTA_ENV')}
      onNext={() => {
        if (!tempEnv?.nome) { setValidationMsg('NOME É OBRIGATÓRIO'); return; }
        const list = [...bo.envolvidos];
        if (editIdx !== null) list[editIdx] = tempEnv; else list.push(tempEnv);
        setBo({ ...bo, envolvidos: list });
        setScreen('LISTA_ENV');
        setEditIdx(null);
      }}
      nextLabel="SALVAR"
      validationMsg={validationMsg}
    >
      <h2 className="text-lg font-black text-blue-900 mb-5 border-b-2 border-blue-100 uppercase">{tempEnv?.tipo}</h2>
      <InputField label="NOME COMPLETO" value={tempEnv?.nome} onChange={v => setTempEnv({ ...tempEnv, nome: v })} required />
      <div className="grid grid-cols-2 gap-4">
        {/* Bug 10 — CPF limitado a 11 dígitos */}
        <InputField
          label="CPF"
          value={tempEnv?.cpf}
          onChange={v => setTempEnv({ ...tempEnv, cpf: v.replace(/\D/g, '').slice(0, 11) })}
          inputMode="numeric"
        />
        <InputField
          label="RG"
          value={tempEnv?.rg}
          onChange={v => setTempEnv({ ...tempEnv, rg: v })}
          suffix={
            // Bug 2 — stopPropagation no dropdown de UF
            <div className="absolute right-1 top-1 bottom-1 flex items-center" onMouseDown={e => e.stopPropagation()}>
              <div className="relative h-full flex items-center">
                <button
                  onClick={() => setShowUfDropdown(!showUfDropdown)}
                  className="px-3 h-full bg-blue-100 text-blue-900 hover:bg-blue-200 transition-colors rounded border border-blue-200 flex items-center justify-center shadow-sm"
                  title="Selecione o Estado Emissor"
                >
                  <ChevronDown size={16} strokeWidth={3} className={`transition-transform duration-200 ${showUfDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showUfDropdown && (
                  <div
                    className="absolute top-full right-0 mt-1 w-24 bg-white border-2 border-blue-900 rounded-lg shadow-xl z-50 overflow-y-auto max-h-48"
                    onMouseDown={e => e.stopPropagation()}
                  >
                    {UF_LIST.map(uf => (
                      <button
                        key={uf}
                        onClick={() => {
                          // Bug 12 — regex remove qualquer "/ XX" existente antes de adicionar novo
                          const cleanRg = (tempEnv.rg || '').replace(/\s*\/\s*[A-Z]{2}$/, '').trim();
                          setTempEnv({ ...tempEnv, rg: `${cleanRg} / ${uf}` });
                          setShowUfDropdown(false);
                        }}
                        className="w-full p-2 text-center hover:bg-blue-50 text-blue-900 text-[10px] font-black border-b border-gray-100 Arial transition-colors"
                      >
                        {uf}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />
      </div>
      <div className="mt-10 p-12 border-4 border-dashed border-blue-900 rounded-3xl flex flex-col items-center bg-white text-blue-900 active:bg-blue-50 transition-colors">
        <Camera size={44} className="mb-3 text-blue-700" />
        <span className="text-xs font-black uppercase tracking-wider">Foto/Doc</span>
      </div>
    </LayoutContainer>
  );

  if (screen === 'LISTA_APR') return (
    // Bug 15 — screenProgress reflete se há apreensões, em vez de hardcode 100
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={Package}
      step={3}
      screenProgress={bo.apreensoes.length > 0 ? 100 : 0}
      onBack={() => setScreen('LISTA_ENV')}
      onNext={() => setScreen('HISTORICO')}
    >
      {/* Bug 5 — VEÍCULOS e OUTROS restaurados */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <ActionButton onClick={() => { setTempApr({ cat: 'ARMA', tipo: '', marca: '', calibre: '', numeracao: '', estado: 'ÍNTEGRO' }); setEditIdx(null); setScreen('FORM_APR'); }}>ARMAS</ActionButton>
        <ActionButton onClick={() => { setTempApr({ cat: 'DROGA', tipo: '', qtd: '', unid: 'GRAMAS' }); setEditIdx(null); setScreen('FORM_APR'); }}>DROGAS</ActionButton>
        <ActionButton onClick={() => { setTempApr({ cat: 'VEÍCULO', placa: '', marca: '', cor: '', estado: '' }); setEditIdx(null); setScreen('FORM_APR'); }}>VEÍCULOS</ActionButton>
        <ActionButton onClick={() => { setTempApr({ cat: 'OUTROS', descricao: '' }); setEditIdx(null); setScreen('FORM_APR'); }}>OUTROS</ActionButton>
      </div>
      <div className="space-y-3">
        {bo.apreensoes.map((a, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border-l-8 border-blue-800 flex justify-between items-center shadow-md text-blue-900 font-bold uppercase">
            <div>
              <p className="text-[10px] font-black text-blue-600">{a.cat}</p>
              <p className="text-sm">
                {a.cat === 'ARMA' && `${a.tipo} ${a.calibre}`.trim()}
                {a.cat === 'DROGA' && `${a.tipo} — ${a.qtd} ${a.unid}`}
                {a.cat === 'VEÍCULO' && `${a.marca} — ${a.placa}`.trim()}
                {a.cat === 'OUTROS' && a.descricao}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setTempApr(a); setEditIdx(i); setScreen('FORM_APR'); }} className="text-blue-900"><Edit2 size={18} /></button>
              <button onClick={() => setBo({ ...bo, apreensoes: bo.apreensoes.filter((_, idx) => idx !== i) })} className="text-red-500"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>
    </LayoutContainer>
  );

  if (screen === 'FORM_APR') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={Package}
      step={3}
      onBack={() => setScreen('LISTA_APR')}
      onNext={() => {
        // Bug 3 — validação antes de salvar apreensão
        const valid =
          tempApr?.cat === 'ARMA'    ? !!tempApr.tipo :
          tempApr?.cat === 'DROGA'   ? !!tempApr.tipo && !!tempApr.qtd :
          tempApr?.cat === 'VEÍCULO' ? !!tempApr.placa :
          !!tempApr?.descricao;
        if (!valid) { setValidationMsg('PREENCHA OS CAMPOS OBRIGATÓRIOS'); return; }
        const list = [...bo.apreensoes];
        if (editIdx !== null) list[editIdx] = tempApr; else list.push(tempApr);
        setBo({ ...bo, apreensoes: list });
        setScreen('LISTA_APR');
        setEditIdx(null);
      }}
      nextLabel="SALVAR"
      validationMsg={validationMsg}
    >
      <h2 className="text-lg font-black text-blue-900 mb-5 border-b-2 border-blue-100 uppercase">{tempApr?.cat}</h2>

      {/* Bug 5 — ARMA: campos completos restaurados */}
      {tempApr?.cat === 'ARMA' && (
        <>
          <InputField label="TIPO" value={tempApr.tipo} onChange={v => setTempApr({ ...tempApr, tipo: v })} placeholder="EX: PISTOLA, REVÓLVER" required />
          <InputField label="MARCA/MODELO" value={tempApr.marca} onChange={v => setTempApr({ ...tempApr, marca: v })} />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="CALIBRE" value={tempApr.calibre} onChange={v => setTempApr({ ...tempApr, calibre: v })} />
            <InputField label="NUMERAÇÃO" value={tempApr.numeracao} onChange={v => setTempApr({ ...tempApr, numeracao: v })} />
          </div>
          <InputField label="ESTADO DE CONSERVAÇÃO" value={tempApr.estado} onChange={v => setTempApr({ ...tempApr, estado: v })} />
        </>
      )}

      {/* Bug 5 — DROGA: qtd e unidade restaurados */}
      {tempApr?.cat === 'DROGA' && (
        <>
          <InputField label="TIPO DE ENTORPECENTE" value={tempApr.tipo} onChange={v => setTempApr({ ...tempApr, tipo: v })} placeholder="EX: COCAÍNA, MACONHA" required />
          <div className="grid grid-cols-2 gap-4">
            <InputField label="QUANTIDADE" type="number" value={tempApr.qtd} onChange={v => setTempApr({ ...tempApr, qtd: v })} inputMode="numeric" required />
            <div className="mb-4">
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">UNIDADE <span className="text-red-500">*</span></label>
              <select
                className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black uppercase outline-none font-bold"
                value={tempApr.unid}
                onChange={e => setTempApr({ ...tempApr, unid: e.target.value })}
              >
                {UNIDADES_MEDIDA.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        </>
      )}

      {/* Bug 5 — VEÍCULO restaurado */}
      {tempApr?.cat === 'VEÍCULO' && (
        <>
          <InputField label="PLACA" value={tempApr.placa} onChange={v => setTempApr({ ...tempApr, placa: v })} required />
          <InputField label="MARCA/MODELO" value={tempApr.marca} onChange={v => setTempApr({ ...tempApr, marca: v })} />
          <InputField label="COR" value={tempApr.cor} onChange={v => setTempApr({ ...tempApr, cor: v })} />
          <InputField label="ESTADO DO VEÍCULO" value={tempApr.estado} onChange={v => setTempApr({ ...tempApr, estado: v })} />
        </>
      )}

      {/* Bug 5 — OUTROS restaurado */}
      {tempApr?.cat === 'OUTROS' && (
        <InputField label="DESCRIÇÃO DO OBJETO" value={tempApr.descricao} onChange={v => setTempApr({ ...tempApr, descricao: v })} required />
      )}
    </LayoutContainer>
  );

  if (screen === 'HISTORICO') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={FileText}
      step={4}
      screenProgress={calculateScreenProgress()}
      onBack={() => setScreen('LISTA_APR')}
      onNext={() => handleNextWithValidation('FINALIZACAO')}
      validationMsg={validationMsg}
    >
      <label className="block text-xs font-black text-blue-900 mb-3 uppercase">
        Relato: <span className="text-red-500">*</span>
      </label>
      <textarea
        className={`w-full h-80 p-5 bg-white border-4 rounded-2xl text-black uppercase outline-none shadow-inner leading-relaxed Arial font-bold ${validationErrors.relato ? 'border-red-500 bg-red-50' : 'border-blue-900'}`}
        value={bo.relato}
        onChange={e => {
          setBo({ ...bo, relato: up(e.target.value) });
          if (validationErrors.relato) setValidationErrors({ ...validationErrors, relato: null });
        }}
        placeholder="HISTÓRICO COMPLETO..."
      />
      {/* Bug 14 — contador claro: mostra quanto falta ou confirma quando ok */}
      <p className="text-[9px] mt-2 font-bold uppercase">
        {bo.relato.length < 20
          ? <span className="text-red-500">Faltam {20 - bo.relato.length} caractere(s)</span>
          : <span className="text-green-600">{bo.relato.length} caracteres ✓</span>
        }
      </p>
    </LayoutContainer>
  );

  if (screen === 'FINALIZACAO') return (
    <LayoutContainer
      title={`BOPM ${bo.id}`}
      icon={CheckCircle}
      step={5}
      screenProgress={calculateScreenProgress()}
      onBack={() => setScreen('HISTORICO')}
      onNext={() => handleNextWithValidation('SUCESSO')}
      nextLabel="FINALIZAR"
      validationMsg={validationMsg}
    >
      <h3 className="text-blue-900 font-black mb-5 border-b-4 border-blue-900 text-sm uppercase">RECEPÇÃO</h3>
      <InputField
        label="Autoridade" value={bo.recepcao.nome}
        onChange={v => { setBo({ ...bo, recepcao: { ...bo.recepcao, nome: v } }); clearError('rNome'); }}
        required error={validationErrors.rNome}
      />
      <div className="grid grid-cols-2 gap-4">
        <InputField
          label="MATRÍCULA" type="number" value={bo.recepcao.mat}
          onChange={v => { setBo({ ...bo, recepcao: { ...bo.recepcao, mat: v } }); clearError('rMat'); }}
          required error={validationErrors.rMat}
        />
        <div className="mb-4">
          <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">
            Cargo <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg outline-none font-bold uppercase"
            value={bo.recepcao.cargo}
            onChange={e => setBo({ ...bo, recepcao: { ...bo.recepcao, cargo: e.target.value } })}
          >
            <option>DELEGADO</option>
            <option>ESCRIVÃO</option>
            <option>AGENTE</option>
          </select>
        </div>
      </div>
      <InputField
        label="UNIDADE" value={bo.recepcao.local}
        onChange={v => { setBo({ ...bo, recepcao: { ...bo.recepcao, local: v } }); clearError('rLocal'); }}
        required error={validationErrors.rLocal}
      />
    </LayoutContainer>
  );

  if (screen === 'SUCESSO') return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 text-center Arial">
      <div className="w-24 h-24 bg-blue-800 rounded-full flex items-center justify-center mb-8 shadow-2xl border-4 border-white animate-bounce">
        <CheckCircle className="text-white" size={60} />
      </div>
      <h2 className="text-3xl font-black text-blue-950 mb-4 uppercase">SUCESSO!</h2>
      <p className="text-blue-800 mb-14 uppercase font-bold px-8 tracking-tighter">Protocolo enviado com sucesso.</p>
      {/* Bug 4 — salva o BO no historyDb antes de encerrar a sessão */}
      <ActionButton onClick={() => {
        setHistoryDb(prev => [{
          id: bo.id,
          data: bo.data,
          hora: bo.hora,
          matricula: user.matricula,
          local: bo.local.cidade,
          rua: bo.local.rua,
          bairro: bo.local.bairro,
          natureza: bo.natureza === 'OUTROS' ? bo.naturezaEspec : bo.natureza,
          vtr: bo.equipe.vtr,
          relato: bo.relato,
          envolvidos: bo.envolvidos,
          apreensoes: bo.apreensoes,
        }, ...prev]);
        alert('PDF Enviado!');
        logout();
      }}>
        <Send size={20} /> Concluir
      </ActionButton>
    </div>
  );

  return null;
}
