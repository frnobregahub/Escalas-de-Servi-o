import React, { useState } from 'react';
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
} from 'lucide-react';

// --- MOCK DATABASE ---
const MILITAR_DB = [
  { matricula: '1234567', posto: 'SD PM', nome: 'SILVA' },
  { matricula: '7654321', posto: 'CB PM', nome: 'SANTOS' },
  { matricula: '1112223', posto: 'SGT PM', nome: 'OLIVEIRA' },
  { matricula: '9998887', posto: 'CAP PM', nome: 'COSTA' },
];

const NATUREZAS_DB = [
  'AMEAÇA',
  'APROPRIAÇÃO INDÉBITA',
  'AVERIGUAÇÃO DE PESSOA SUSPEITA',
  'DANO',
  'DESOBEDIÊNCIA',
  'ENTORPECENTES (POSSE E USO)',
  'ENTORPECENTES (TRÁFICO)',
  'FURTO',
  'HOMICÍDIO',
  'LESÃO CORPORAL',
  'PORTE ILEGAL DE ARMA DE FOGO',
  'ROUBO',
  'VIOLÊNCIA DOMÉSTICA',
];

const UNIDADES_MEDIDA = ['GRAMAS', 'QUILOGRAMAS', 'UNIDADES', 'EMBALAGENS', 'MILILITROS', 'LITROS'];

// --- STEPS para barra de progresso ---
const STEPS = ['DADOS', 'EQUIPE', 'ENVOLVIDOS', 'APREENSÕES', 'HISTÓRICO', 'ENCERRAMENTO'];
const SCREEN_TO_STEP = {
  HEADER: 0,
  EQUIPE: 1,
  LISTA_ENVOLVIDOS: 2,
  FORM_ENVOLVIDO: 2,
  LISTA_APREENSOES: 3,
  FORM_APREENSAO: 3,
  HISTORICO: 4,
  FINALIZACAO: 5,
};

// --- Fábrica de boData: garante reset completo a cada ocorrência ---
const makeBoData = () => ({
  numeroBopm: `2026/${Math.floor(Math.random() * 90000) + 10000}`,
  numeroCicc: '',
  dataFato: '',
  horaFato: '',
  localizacao: { rua: '', numero: '', bairro: '', cidade: 'RECIFE', ref: '' },
  natureza: '',
  naturezaEspec: '',
  guarnicao: { vtr: '', motorista: '', patrulheiro1: '', patrulheiro2: '' },
  envolvidos: [],
  apreensoes: [],
  historico: '',
  receptora: { nome: '', matricula: '', cargo: 'DELEGADO', unidade: '' },
  confirmado: false,
  assinatura: null,
});

const up = (str) => str.toUpperCase();

// ============================================================
// COMPONENTES BASE
// ============================================================

// BUG 2 CORRIGIDO: readOnly e onChange opcional tratados corretamente
const Input = ({ label, value, onChange, type = 'text', placeholder = '', readOnly = false, error = '' }) => (
  <div className="mb-4">
    <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">{label}</label>
    <input
      type={type}
      value={value ?? ''}
      readOnly={readOnly}
      onChange={readOnly ? undefined : (e) => onChange(type === 'text' ? up(e.target.value) : e.target.value)}
      placeholder={placeholder}
      className={`w-full p-3 bg-white border-2 rounded-lg text-black uppercase
        ${error ? 'border-red-500' : 'border-blue-900'}
        ${readOnly ? 'bg-gray-100 text-gray-500 cursor-default' : ''}`}
    />
    {error && (
      <p className="text-red-600 text-xs mt-1 font-bold flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const Button = ({ children, onClick, className = '', secondary = false, disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full py-4 rounded-xl font-bold uppercase transition-all shadow-md flex items-center justify-center gap-2
      ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'}
      ${secondary ? 'bg-gray-400 text-white' : 'bg-orange-500 text-blue-900'}
      ${className}`}
  >
    {children}
  </button>
);

// Barra de progresso entre etapas
const ProgressBar = ({ screen }) => {
  const step = SCREEN_TO_STEP[screen];
  if (step === undefined) return null;
  return (
    <div className="bg-blue-800 px-4 pb-3">
      <div className="flex justify-between mb-1">
        {STEPS.map((s, i) => (
          <span key={s} className={`text-[8px] font-bold ${i <= step ? 'text-orange-400' : 'text-blue-600'}`}>
            {s}
          </span>
        ))}
      </div>
      <div className="w-full bg-blue-700 rounded-full h-1.5">
        <div
          className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

const TopBar = ({ title, icon: Icon, screen }) => (
  <div className="bg-blue-900 sticky top-0 z-10">
    <div className="p-4 text-orange-500 flex justify-between items-center">
      <span className="font-bold">{title}</span>
      <Icon size={20} />
    </div>
    <ProgressBar screen={screen} />
  </div>
);

const NavBar = ({ onBack, onNext, backLabel = 'Voltar', nextLabel = 'Próximo', nextDisabled = false }) => (
  <div className="p-4 bg-gray-300 border-t border-gray-400 fixed bottom-0 w-full flex gap-4 z-10">
    <Button onClick={onBack} secondary className="flex-1">{backLabel}</Button>
    <Button onClick={onNext} className="flex-1" disabled={nextDisabled}>{nextLabel}</Button>
  </div>
);

// ============================================================
// APP PRINCIPAL
// ============================================================
const App = () => {
  // BUG 7 CORRIGIDO: todos os useState declarados antes das funções que os usam
  const [currentScreen, setCurrentScreen] = useState('LOGIN');
  const [user, setUser] = useState(null);
  const [matriculaInput, setMatriculaInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // BUG 3 CORRIGIDO: naturezaEspec incluída via makeBoData()
  // BUG 4 CORRIGIDO: boData criado via fábrica, resetado no logout
  const [boData, setBoData] = useState(makeBoData);

  const [headerErrors, setHeaderErrors] = useState({});

  const [tempEnvolvido, setTempEnvolvido] = useState(null);
  const [envolvidoEditIndex, setEnvolvidoEditIndex] = useState(null);

  const [tempApreensao, setTempApreensao] = useState(null);
  const [apreensaoEditIndex, setApreensaoEditIndex] = useState(null);

  // BUG 6 CORRIGIDO: estado do checkbox de confirmação
  const [confirmacaoMarcada, setConfirmacaoMarcada] = useState(false);

  // --- HANDLERS GLOBAIS ---

  const handleLogin = () => {
    const found = MILITAR_DB.find((m) => m.matricula === matriculaInput.trim());
    if (found) {
      setUser(found);
      setLoginError('');
      setCurrentScreen('WELCOME');
    } else {
      // Melhoria: erro inline em vez de alert()
      setLoginError('MATRÍCULA NÃO ENCONTRADA NO BANCO DO 18º BPM.');
    }
  };

  // BUG 4 CORRIGIDO: reset completo do boData no logout
  const handleLogout = () => {
    setUser(null);
    setMatriculaInput('');
    setLoginError('');
    setBoData(makeBoData());
    setConfirmacaoMarcada(false);
    setCurrentScreen('LOGIN');
  };

  // BUG 5 CORRIGIDO: nova ocorrência mantém o usuário logado
  const handleNovaOcorrencia = () => {
    setBoData(makeBoData());
    setConfirmacaoMarcada(false);
    setCurrentScreen('WELCOME');
  };

  // Melhoria: preenche data/hora com o momento atual
  const fillCurrentDateTime = () => {
    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().slice(0, 5);
    setBoData({ ...boData, dataFato: date, horaFato: time });
  };

  // Melhoria: validação inline antes de avançar telas
  const validateHeader = () => {
    const errs = {};
    if (!boData.dataFato) errs.dataFato = 'OBRIGATÓRIO';
    if (!boData.horaFato) errs.horaFato = 'OBRIGATÓRIO';
    if (!boData.localizacao.rua) errs.rua = 'OBRIGATÓRIO';
    if (!boData.localizacao.bairro) errs.bairro = 'OBRIGATÓRIO';
    if (!boData.natureza) errs.natureza = 'SELECIONE UMA NATUREZA';
    if (boData.natureza === 'OUTROS' && !boData.naturezaEspec) errs.naturezaEspec = 'ESPECIFIQUE A NATUREZA';
    setHeaderErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- ENVOLVIDOS ---
  const addEnvolvido = (tipo) => {
    setEnvolvidoEditIndex(null);
    setTempEnvolvido({ tipo, nome: '', cpf: '', rg: '', mae: '', endereco: '', telefone: '', nascimento: '', foto: null });
    setCurrentScreen('FORM_ENVOLVIDO');
  };

  const saveEnvolvido = () => {
    const list = [...boData.envolvidos];
    if (envolvidoEditIndex !== null) list[envolvidoEditIndex] = tempEnvolvido;
    else list.push(tempEnvolvido);
    setBoData({ ...boData, envolvidos: list });
    setCurrentScreen('LISTA_ENVOLVIDOS');
  };

  const removeEnvolvido = (i) =>
    setBoData({ ...boData, envolvidos: boData.envolvidos.filter((_, idx) => idx !== i) });

  // --- APREENSÕES ---
  const addApreensao = (categoria) => {
    setApreensaoEditIndex(null);
    setTempApreensao({
      categoria, tipo: '', marca: '', modelo: '', calibre: '', numeracao: '',
      qtd: '', unidade: 'GRAMAS', placa: '', cor: '', chassi: '',
      estado: 'ÍNTEGRO', descricao: '', foto: null,
    });
    setCurrentScreen('FORM_APREENSAO');
  };

  const saveApreensao = () => {
    const list = [...boData.apreensoes];
    if (apreensaoEditIndex !== null) list[apreensaoEditIndex] = tempApreensao;
    else list.push(tempApreensao);
    setBoData({ ...boData, apreensoes: list });
    setCurrentScreen('LISTA_APREENSOES');
  };

  const removeApreensao = (i) =>
    setBoData({ ...boData, apreensoes: boData.apreensoes.filter((_, idx) => idx !== i) });

  // ============================================================
  // TELAS
  // ============================================================

  if (currentScreen === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gray-200 p-6 flex flex-col items-center justify-center font-sans">
        <div className="mb-8 text-center">
          <div className="w-24 h-24 bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-orange-500">
            <Shield size={48} className="text-orange-500" />
          </div>
          <h1 className="text-xl font-bold text-blue-900">18º BPM - BOPM DIGITAL</h1>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-4">
            <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">Matrícula (RE)</label>
            <input
              type="number"
              value={matriculaInput}
              onChange={(e) => { setMatriculaInput(e.target.value); setLoginError(''); }}
              // Melhoria: Enter aciona o login
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="SOMENTE NÚMEROS"
              className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black"
            />
          </div>

          {/* Melhoria: erro inline, sem alert() */}
          {loginError && (
            <div className="flex items-center gap-2 bg-red-100 border border-red-500 rounded-lg p-3 mb-4">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <p className="text-red-600 text-xs font-bold">{loginError}</p>
            </div>
          )}

          <Button onClick={handleLogin}>Entrar</Button>
        </div>
        <p className="mt-8 text-xs text-gray-500 font-bold">SISTEMA EXCLUSIVO 18º BPM</p>
      </div>
    );
  }

  if (currentScreen === 'WELCOME') {
    return (
      <div className="min-h-screen bg-gray-200 p-6 flex flex-col items-center justify-center text-center font-sans">
        <p className="text-xl text-black mb-2">BEM VINDO,</p>
        <h2 className="text-2xl text-blue-900 font-bold mb-12 uppercase">
          {user.posto} <span className="underline">{user.nome}</span>!
        </h2>
        <button
          onClick={() => setCurrentScreen('HEADER')}
          className="w-56 h-56 bg-orange-500 rounded-full border-8 border-blue-900 shadow-2xl flex flex-col items-center justify-center text-blue-900 font-bold active:scale-95 transition-transform"
        >
          <Plus size={64} />
          <span className="mt-2 text-lg">NOVA OCORRÊNCIA</span>
        </button>
        <button onClick={handleLogout} className="mt-12 text-red-600 font-bold flex items-center gap-2">
          <LogOut size={18} /> SAIR / TROCAR USUÁRIO
        </button>
      </div>
    );
  }

  if (currentScreen === 'HEADER') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title={`Nº BOPM: ${boData.numeroBopm}`} icon={Shield} screen="HEADER" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <h2 className="text-lg font-bold text-blue-900 mb-6 border-b-2 border-blue-900">DADOS DO FATO</h2>

          <Input
            label="Nº CICC (PM + 10 DÍGITOS)"
            value={boData.numeroCicc}
            onChange={(v) => setBoData({ ...boData, numeroCicc: v })}
            placeholder="EX: PM0123456789"
          />

          {/* BUG 1 CORRIGIDO: dataFato e horaFato são campos separados no estado */}
          <div className="flex items-end gap-2 mb-2">
            <div className="flex-1 grid grid-cols-2 gap-4">
              <Input
                label="DATA DO FATO"
                type="date"
                value={boData.dataFato}
                onChange={(v) => setBoData({ ...boData, dataFato: v })}
                error={headerErrors.dataFato}
              />
              <Input
                label="HORA DO FATO"
                type="time"
                value={boData.horaFato}
                onChange={(v) => setBoData({ ...boData, horaFato: v })}
                error={headerErrors.horaFato}
              />
            </div>
            {/* Melhoria: botão para preencher data/hora atual */}
            <button
              onClick={fillCurrentDateTime}
              title="Usar data/hora atual"
              className="mb-4 p-3 bg-blue-900 text-orange-500 rounded-lg flex items-center gap-1 text-xs font-bold shrink-0 active:scale-95"
            >
              <Clock size={16} /> AGORA
            </button>
          </div>

          <h2 className="text-lg font-bold text-blue-900 mt-6 mb-4 border-b-2 border-blue-900">LOCALIZAÇÃO</h2>
          <Input
            label="RUA"
            value={boData.localizacao.rua}
            onChange={(v) => setBoData({ ...boData, localizacao: { ...boData.localizacao, rua: v } })}
            error={headerErrors.rua}
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Nº"
              value={boData.localizacao.numero}
              onChange={(v) => setBoData({ ...boData, localizacao: { ...boData.localizacao, numero: v } })}
            />
            <div className="col-span-2">
              <Input
                label="BAIRRO"
                value={boData.localizacao.bairro}
                onChange={(v) => setBoData({ ...boData, localizacao: { ...boData.localizacao, bairro: v } })}
                error={headerErrors.bairro}
              />
            </div>
          </div>
          <Input
            label="REFERÊNCIA"
            value={boData.localizacao.ref}
            onChange={(v) => setBoData({ ...boData, localizacao: { ...boData.localizacao, ref: v } })}
          />

          <h2 className="text-lg font-bold text-blue-900 mt-6 mb-4 border-b-2 border-blue-900">NATUREZA</h2>
          <select
            className={`w-full p-3 bg-white border-2 rounded-lg text-black uppercase mb-1
              ${headerErrors.natureza ? 'border-red-500' : 'border-blue-900'}`}
            value={boData.natureza}
            onChange={(e) => setBoData({ ...boData, natureza: e.target.value })}
          >
            <option value="">SELECIONE UMA NATUREZA...</option>
            {NATUREZAS_DB.map((n) => <option key={n} value={n}>{n}</option>)}
            <option value="OUTROS">OUTROS (ESPECIFICAR)</option>
          </select>
          {headerErrors.natureza && (
            <p className="text-red-600 text-xs mb-2 font-bold flex items-center gap-1">
              <AlertCircle size={12} /> {headerErrors.natureza}
            </p>
          )}
          {boData.natureza === 'OUTROS' && (
            <Input
              label="ESPECIFIQUE A NATUREZA"
              value={boData.naturezaEspec}
              onChange={(v) => setBoData({ ...boData, naturezaEspec: v })}
              error={headerErrors.naturezaEspec}
            />
          )}
        </div>

        {/* Melhoria: validateHeader() bloqueia avanço com campos obrigatórios vazios */}
        <NavBar
          onBack={() => setCurrentScreen('WELCOME')}
          onNext={() => { if (validateHeader()) setCurrentScreen('EQUIPE'); }}
        />
      </div>
    );
  }

  if (currentScreen === 'EQUIPE') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title="EQUIPE DA GUARNIÇÃO" icon={Shield} screen="EQUIPE" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <div className="bg-white p-4 rounded-lg border-l-8 border-blue-900 mb-6 shadow">
            <p className="text-xs font-bold text-gray-500">UNIDADE FIXA</p>
            <p className="text-lg font-bold text-blue-900">18º BPM</p>
          </div>

          <Input label="VIATURA (PREFIXO)" value={boData.guarnicao.vtr}
            onChange={(v) => setBoData({ ...boData, guarnicao: { ...boData.guarnicao, vtr: v } })}
            placeholder="EX: 1801"
          />
          {/* BUG 2 CORRIGIDO: readOnly tratado no componente, onChange não é chamado */}
          <Input
            label="COMANDANTE (POSTO + NOME + MAT)"
            value={`${user.posto} ${user.nome} - ${user.matricula}`}
            readOnly
          />
          <Input label="MOTORISTA" value={boData.guarnicao.motorista}
            onChange={(v) => setBoData({ ...boData, guarnicao: { ...boData.guarnicao, motorista: v } })}
          />
          <Input label="PATRULHEIRO 1" value={boData.guarnicao.patrulheiro1}
            onChange={(v) => setBoData({ ...boData, guarnicao: { ...boData.guarnicao, patrulheiro1: v } })}
          />
          <Input label="PATRULHEIRO 2 (OPCIONAL)" value={boData.guarnicao.patrulheiro2}
            onChange={(v) => setBoData({ ...boData, guarnicao: { ...boData.guarnicao, patrulheiro2: v } })}
          />
        </div>

        <NavBar onBack={() => setCurrentScreen('HEADER')} onNext={() => setCurrentScreen('LISTA_ENVOLVIDOS')} />
      </div>
    );
  }

  if (currentScreen === 'LISTA_ENVOLVIDOS') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title="ENVOLVIDOS" icon={User} screen="LISTA_ENVOLVIDOS" />

        <div className="p-6 flex-1 overflow-y-auto pb-28">
          <div className="grid grid-cols-1 gap-3 mb-8">
            <Button onClick={() => addEnvolvido('ACUSADO')}><Plus size={18} /> ADICIONAR ACUSADO</Button>
            <Button onClick={() => addEnvolvido('VÍTIMA')}><Plus size={18} /> ADICIONAR VÍTIMA</Button>
            <Button onClick={() => addEnvolvido('TESTEMUNHA')}><Plus size={18} /> ADICIONAR TESTEMUNHA</Button>
          </div>

          <h3 className="text-blue-900 font-bold mb-4">LISTA DE ENVOLVIDOS:</h3>
          {boData.envolvidos.length === 0 ? (
            <p className="text-gray-400 italic">NENHUM ENVOLVIDO ADICIONADO.</p>
          ) : (
            <div className="space-y-3">
              {boData.envolvidos.map((env, i) => (
                <div
                  key={i}
                  className={`bg-white p-4 rounded-lg shadow border-l-8 flex justify-between items-center
                    ${env.tipo === 'ACUSADO' ? 'border-red-600' : env.tipo === 'VÍTIMA' ? 'border-yellow-500' : 'border-green-600'}`}
                >
                  <div>
                    <p className="text-[10px] font-bold text-gray-500">{env.tipo}</p>
                    <p className="font-bold text-blue-900">{env.nome || '(SEM NOME)'}</p>
                    <p className="text-xs text-gray-600">CPF: {env.cpf || 'N/A'}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTempEnvolvido(env); setEnvolvidoEditIndex(i); setCurrentScreen('FORM_ENVOLVIDO'); }}
                      className="p-2 text-blue-900"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => removeEnvolvido(i)} className="p-2 text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <NavBar onBack={() => setCurrentScreen('EQUIPE')} onNext={() => setCurrentScreen('LISTA_APREENSOES')} />
      </div>
    );
  }

  if (currentScreen === 'FORM_ENVOLVIDO') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title={`CADASTRO DE ${tempEnvolvido.tipo}`} icon={User} screen="FORM_ENVOLVIDO" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <Input label="NOME COMPLETO" value={tempEnvolvido.nome}
            onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, nome: v })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="CPF" value={tempEnvolvido.cpf}
              onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, cpf: v })}
              placeholder="000.000.000-00"
            />
            <Input label="RG" value={tempEnvolvido.rg}
              onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, rg: v })}
            />
          </div>
          <Input label="DATA DE NASCIMENTO" type="date" value={tempEnvolvido.nascimento}
            onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, nascimento: v })}
          />
          <Input label="NOME DA MÃE" value={tempEnvolvido.mae}
            onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, mae: v })}
          />
          <Input label="ENDEREÇO" value={tempEnvolvido.endereco}
            onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, endereco: v })}
          />
          <Input label="TELEFONE" value={tempEnvolvido.telefone}
            onChange={(v) => setTempEnvolvido({ ...tempEnvolvido, telefone: v })}
            placeholder="(00) 00000-0000"
          />

          <div className="mt-6 p-8 border-4 border-dashed border-blue-900 rounded-xl flex flex-col items-center justify-center bg-gray-100 cursor-pointer active:bg-gray-300">
            <Camera size={48} className="text-orange-500 mb-2" />
            <p className="text-xs font-bold text-blue-900">CAPTURAR IMAGEM (OPCIONAL)</p>
          </div>
        </div>

        <NavBar
          onBack={() => setCurrentScreen('LISTA_ENVOLVIDOS')}
          onNext={saveEnvolvido}
          backLabel="Cancelar"
          nextLabel="Salvar"
        />
      </div>
    );
  }

  if (currentScreen === 'LISTA_APREENSOES') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title="APREENSÕES / OBJETOS" icon={Package} screen="LISTA_APREENSOES" />

        <div className="p-6 flex-1 overflow-y-auto pb-28">
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button onClick={() => addApreensao('ARMA')}><Shield size={16} /> ARMAS</Button>
            <Button onClick={() => addApreensao('DROGA')}><Package size={16} /> DROGAS</Button>
            <Button onClick={() => addApreensao('VEÍCULO')}><Package size={16} /> VEÍCULOS</Button>
            <Button onClick={() => addApreensao('OUTROS')}><Plus size={16} /> OUTROS</Button>
          </div>

          <h3 className="text-blue-900 font-bold mb-4">ITENS CADASTRADOS:</h3>
          {boData.apreensoes.length === 0 ? (
            <p className="text-gray-400 italic">NENHUM ITEM ADICIONADO.</p>
          ) : (
            <div className="space-y-3">
              {boData.apreensoes.map((item, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow border-l-8 border-orange-500 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500">{item.categoria}</p>
                    <p className="font-bold text-blue-900">{item.tipo || item.descricao || 'ITEM SEM DESCRIÇÃO'}</p>
                    <p className="text-xs text-gray-600">
                      {item.categoria === 'DROGA' && `${item.qtd} ${item.unidade}`}
                      {item.categoria === 'VEÍCULO' && `PLACA: ${item.placa}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setTempApreensao(item); setApreensaoEditIndex(i); setCurrentScreen('FORM_APREENSAO'); }}
                      className="p-2 text-blue-900"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button onClick={() => removeApreensao(i)} className="p-2 text-red-600">
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <NavBar onBack={() => setCurrentScreen('LISTA_ENVOLVIDOS')} onNext={() => setCurrentScreen('HISTORICO')} />
      </div>
    );
  }

  if (currentScreen === 'FORM_APREENSAO') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title={`CADASTRO DE ${tempApreensao.categoria}`} icon={Package} screen="FORM_APREENSAO" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          {tempApreensao.categoria === 'ARMA' && (
            <>
              <Input label="TIPO DE ARMA" value={tempApreensao.tipo}
                onChange={(v) => setTempApreensao({ ...tempApreensao, tipo: v })}
                placeholder="EX: PISTOLA, REVÓLVER"
              />
              <Input label="MARCA/MODELO" value={tempApreensao.marca}
                onChange={(v) => setTempApreensao({ ...tempApreensao, marca: v })}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="CALIBRE" value={tempApreensao.calibre}
                  onChange={(v) => setTempApreensao({ ...tempApreensao, calibre: v })}
                />
                <Input label="NUMERAÇÃO" value={tempApreensao.numeracao}
                  onChange={(v) => setTempApreensao({ ...tempApreensao, numeracao: v })}
                />
              </div>
            </>
          )}

          {tempApreensao.categoria === 'DROGA' && (
            <>
              <Input label="TIPO DE ENTORPECENTE" value={tempApreensao.tipo}
                onChange={(v) => setTempApreensao({ ...tempApreensao, tipo: v })}
                placeholder="EX: COCAÍNA, MACONHA"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input label="QUANTIDADE" type="number" value={tempApreensao.qtd}
                  onChange={(v) => setTempApreensao({ ...tempApreensao, qtd: v })}
                />
                <div className="mb-4">
                  <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">UNIDADE</label>
                  <select
                    className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black uppercase"
                    value={tempApreensao.unidade}
                    onChange={(e) => setTempApreensao({ ...tempApreensao, unidade: e.target.value })}
                  >
                    {UNIDADES_MEDIDA.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
            </>
          )}

          {tempApreensao.categoria === 'VEÍCULO' && (
            <>
              <Input label="PLACA" value={tempApreensao.placa}
                onChange={(v) => setTempApreensao({ ...tempApreensao, placa: v })}
              />
              <Input label="MARCA/MODELO" value={tempApreensao.marca}
                onChange={(v) => setTempApreensao({ ...tempApreensao, marca: v })}
              />
              <Input label="COR" value={tempApreensao.cor}
                onChange={(v) => setTempApreensao({ ...tempApreensao, cor: v })}
              />
              <Input label="ESTADO DO VEÍCULO" value={tempApreensao.estado}
                onChange={(v) => setTempApreensao({ ...tempApreensao, estado: v })}
              />
            </>
          )}

          {tempApreensao.categoria === 'OUTROS' && (
            <Input label="DESCRIÇÃO DO OBJETO" value={tempApreensao.descricao}
              onChange={(v) => setTempApreensao({ ...tempApreensao, descricao: v })}
            />
          )}

          <div className="mt-6 p-8 border-4 border-dashed border-blue-900 rounded-xl flex flex-col items-center justify-center bg-gray-100 cursor-pointer active:bg-gray-300">
            <Camera size={48} className="text-orange-500 mb-2" />
            <p className="text-xs font-bold text-blue-900">CAPTURAR IMAGEM (OPCIONAL)</p>
          </div>
        </div>

        <NavBar
          onBack={() => setCurrentScreen('LISTA_APREENSOES')}
          onNext={saveApreensao}
          backLabel="Cancelar"
          nextLabel="Salvar"
        />
      </div>
    );
  }

  if (currentScreen === 'HISTORICO') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title="RELATO DA OCORRÊNCIA" icon={FileText} screen="HISTORICO" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <label className="block text-sm font-bold text-blue-900 mb-4 uppercase">
            HISTÓRICO / NARRATIVA DOS FATOS:
          </label>
          <textarea
            className="w-full h-80 p-4 bg-white border-2 border-blue-900 rounded-lg text-black uppercase shadow-inner resize-none"
            placeholder="DESCREVA AQUI O RELATO DETALHADO..."
            value={boData.historico}
            onChange={(e) => setBoData({ ...boData, historico: up(e.target.value) })}
          />
          {/* Melhoria: contador de caracteres */}
          <p className="text-right text-xs text-gray-500 mt-1">{boData.historico.length} caracteres</p>
        </div>

        <NavBar onBack={() => setCurrentScreen('LISTA_APREENSOES')} onNext={() => setCurrentScreen('FINALIZACAO')} />
      </div>
    );
  }

  if (currentScreen === 'FINALIZACAO') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col font-sans">
        <TopBar title="ENCERRAMENTO" icon={CheckCircle} screen="FINALIZACAO" />

        <div className="p-6 flex-1 overflow-y-auto pb-24">
          <h3 className="text-blue-900 font-bold mb-4 border-b-2 border-blue-900">RECEPÇÃO NA UNIDADE</h3>
          <Input label="NOME DA AUTORIDADE RECEPTORA" value={boData.receptora.nome}
            onChange={(v) => setBoData({ ...boData, receptora: { ...boData.receptora, nome: v } })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="MATRÍCULA" type="number" value={boData.receptora.matricula}
              onChange={(v) => setBoData({ ...boData, receptora: { ...boData.receptora, matricula: v } })}
            />
            <div className="mb-4">
              <label className="block text-xs font-bold text-blue-900 mb-1 uppercase">CARGO</label>
              <select
                className="w-full p-3 bg-white border-2 border-blue-900 rounded-lg text-black uppercase"
                value={boData.receptora.cargo}
                onChange={(e) => setBoData({ ...boData, receptora: { ...boData.receptora, cargo: e.target.value } })}
              >
                <option value="DELEGADO">DELEGADO</option>
                <option value="ESCRIVÃO">ESCRIVÃO</option>
                <option value="AGENTE">AGENTE</option>
              </select>
            </div>
          </div>
          <Input label="UNIDADE DE DESTINO" value={boData.receptora.unidade}
            onChange={(v) => setBoData({ ...boData, receptora: { ...boData.receptora, unidade: v } })}
            placeholder="EX: CENTRAL DE FLAGRANTES"
          />

          <h3 className="text-blue-900 font-bold mt-6 mb-4 border-b-2 border-blue-900">ASSINATURA DO COMANDANTE</h3>
          <div className="w-full h-40 bg-white border-2 border-blue-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {boData.assinatura ? (
              <div className="text-blue-900 font-bold italic">ASSINADO DIGITALMENTE</div>
            ) : (
              <p className="text-gray-400 text-xs">ASSINE AQUI (SIMULADO)</p>
            )}
            <button
              onClick={() => setBoData({ ...boData, assinatura: !boData.assinatura })}
              className="absolute top-2 right-2 p-1 bg-orange-500 text-blue-900 rounded text-[10px] font-bold"
            >
              {boData.assinatura ? 'LIMPAR' : 'ASSINAR'}
            </button>
          </div>

          {/* BUG 6 CORRIGIDO: checkbox com estado e validação */}
          <label className="mt-8 flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmacaoMarcada}
              onChange={(e) => setConfirmacaoMarcada(e.target.checked)}
              className="w-6 h-6 border-2 border-blue-900 accent-blue-900"
            />
            <span className="text-[10px] font-bold text-blue-900 uppercase">
              CONFIRMO A ENTREGA DE ENVOLVIDOS E MATERIAIS CITADOS.
            </span>
          </label>
          {!confirmacaoMarcada && (
            <p className="text-orange-600 text-xs mt-2 font-bold">
              Marque a confirmação para finalizar o BOPM.
            </p>
          )}
        </div>

        <NavBar
          onBack={() => setCurrentScreen('HISTORICO')}
          onNext={() => setCurrentScreen('SUCESSO')}
          nextLabel="Finalizar"
          // BUG 6 CORRIGIDO: botão desabilitado enquanto checkbox não marcado
          nextDisabled={!confirmacaoMarcada}
        />
      </div>
    );
  }

  if (currentScreen === 'SUCESSO') {
    return (
      <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg border-4 border-white">
          <CheckCircle size={64} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-blue-900 mb-2">BOPM FINALIZADO!</h2>
        <p className="text-blue-900 mb-2">Nº {boData.numeroBopm}</p>
        <p className="text-blue-900 mb-8">O RELATÓRIO DO 18º BPM FOI GERADO COM SUCESSO.</p>

        <div className="w-full max-w-sm space-y-4">
          <Button onClick={() => alert('PDF GERADO. ABRINDO WHATSAPP...')}>
            <Send size={20} /> ENVIAR VIA WHATSAPP
          </Button>
          {/* BUG 5 CORRIGIDO: mantém o usuário logado para nova ocorrência */}
          <Button onClick={handleNovaOcorrencia}>
            <Plus size={20} /> NOVA OCORRÊNCIA
          </Button>
          <Button secondary onClick={handleLogout}>
            <LogOut size={18} /> SAIR
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default App;
