// GERENCIAMENTO DE ESTADO GLOBAL
const AppState = {
    currentPage: 'dashboard',
    user: null,
    oficina: {
        nome: 'OFICINA FASTCAR',
        endereco: 'Rua das Oficinas, 123 - Centro',
        telefone: '(31) 99999-9999',
        cnpj: '00.000.000/0000-00',
        logo: 'https://via.placeholder.com/40'
    },
    data: {
        ordensServico: [
            {
                id: 'OS-001',
                numero: '000001',
                cliente: 'Joao Silva',
                veiculo: 'Fiat Uno - ABC-1234',
                status: 'em_andamento',
                data: '2026-03-06',
                valorTotal: 850.00,
                descricao: 'Troca de oleo e filtro'
            },
            {
                id: 'OS-002',
                numero: '000002',
                cliente: 'Maria Santos',
                veiculo: 'Honda Civic - XYZ-5678',
                status: 'aguardando',
                data: '2026-03-06',
                valorTotal: 1200.00,
                descricao: 'Revisao completa'
            },
            {
                id: 'OS-003',
                numero: '000003',
                cliente: 'Pedro Costa',
                veiculo: 'VW Gol - DEF-9012',
                status: 'concluida',
                data: '2026-03-05',
                valorTotal: 450.00,
                descricao: 'Alinhamento e balanceamento'
            },
            {
                id: 'OS-004',
                numero: '000004',
                cliente: 'Ana Paula',
                veiculo: 'Toyota Corolla - GHI-3456',
                status: 'em_andamento',
                data: '2026-03-04',
                valorTotal: 2500.00,
                descricao: 'Troca de embreagem'
            },
            {
                id: 'OS-005',
                numero: '000005',
                cliente: 'Carlos Eduardo',
                veiculo: 'Chevrolet Onix - JKL-7890',
                status: 'concluida',
                data: '2026-03-01',
                valorTotal: 320.00,
                descricao: 'Troca de pastilhas de freio'
            }
        ],
        clientes: [
            { id: 1, nome: 'Joao Silva', cpf: '123.456.789-00', telefone: '(31) 99999-1111' },
            { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', telefone: '(31) 99999-2222' },
            { id: 3, nome: 'Pedro Costa', cpf: '111.222.333-44', telefone: '(31) 99999-3333' },
            { id: 4, nome: 'Ana Paula', cpf: '444.555.666-77', telefone: '(31) 99999-4444' },
            { id: 5, nome: 'Carlos Eduardo', cpf: '777.888.999-00', telefone: '(31) 99999-5555' }
        ],
        veiculos: [
            { id: 1, placa: 'ABC-1234', modelo: 'Fiat Uno', clienteId: 1 },
            { id: 2, placa: 'XYZ-5678', modelo: 'Honda Civic', clienteId: 2 },
            { id: 3, placa: 'DEF-9012', modelo: 'VW Gol', clienteId: 3 },
            { id: 4, placa: 'GHI-3456', modelo: 'Toyota Corolla', clienteId: 4 },
            { id: 5, placa: 'JKL-7890', modelo: 'Chevrolet Onix', clienteId: 5 }
        ],
        agendamentos: [
            { id: 1, clienteId: 1, veiculoId: 1, data: '2026-03-06', hora: '14:00', servico: 'Revisao', status: 'confirmado' },
            { id: 2, clienteId: 2, veiculoId: 2, data: '2026-03-06', hora: '16:00', servico: 'Troca de oleo', status: 'confirmado' }
        ],
        financeiro: {
            contasReceber: [
                { id: 1, descricao: 'OS-001', valor: 850.00, vencimento: '2026-03-10', status: 'pendente' },
                { id: 2, descricao: 'OS-002', valor: 1200.00, vencimento: '2026-03-15', status: 'pendente' }
            ],
            contasPagar: [
                { id: 1, descricao: 'Fornecedor de Pecas', valor: 3500.00, vencimento: '2026-03-12', status: 'pendente' },
                { id: 2, descricao: 'Aluguel', valor: 2000.00, vencimento: '2026-03-08', status: 'pendente' }
            ]
        }
    }
};

function initApp() {
    console.log('Perplexity v3.0 - FASE 3: Clientes e Veiculos');
    
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadFromLocalStorage();
    updateDashboard();
    updateOficinaNome();
    renderRecentOS();
    updateUserInfo();
    renderClientes();
    renderVeiculos();
    
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
        });
    });
    
    console.log('Sistema inicializado - FASE 3 ativa!');
}

function checkAuth() {
    const user = localStorage.getItem('perplexity_user') || sessionStorage.getItem('perplexity_user');
    if (!user) return false;
    try {
        AppState.user = JSON.parse(user);
        return true;
    } catch (e) {
        return false;
    }
}

function updateUserInfo() {
    if (AppState.user) {
        const userNameEl = document.querySelector('.user-name');
        const userRoleEl = document.querySelector('.user-role');
        if (userNameEl) userNameEl.textContent = AppState.user.name;
        if (userRoleEl) userRoleEl.textContent = AppState.user.role;
    }
}

function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`[onclick="navigateTo('${page}')"]`);
    if (activeLink) activeLink.classList.add('active');
    
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.add('active');
        AppState.currentPage = page;
    }
    
    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
    
    console.log('Navegando para:', page);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function updateDashboard() {
    const { ordensServico, clientes, veiculos, agendamentos, financeiro } = AppState.data;
    
    const osAbertasEl = document.getElementById('osAbertas');
    const osHojeEl = document.getElementById('osHoje');
    const totalClientesEl = document.getElementById('totalClientes');
    const totalVeiculosEl = document.getElementById('totalVeiculos');
    
    if (osAbertasEl) osAbertasEl.textContent = ordensServico.filter(os => os.status !== 'concluida').length;
    if (osHojeEl) osHojeEl.textContent = ordensServico.filter(os => isToday(os.data)).length;
    if (totalClientesEl) totalClientesEl.textContent = clientes.length;
    if (totalVeiculosEl) totalVeiculosEl.textContent = veiculos.length;
    
    const totalReceber = financeiro.contasReceber.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
    const totalPagar = financeiro.contasPagar.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.valor, 0);
    
    const contasReceberEl = document.getElementById('contasReceber');
    const contasPagarEl = document.getElementById('contasPagar');
    
    if (contasReceberEl) contasReceberEl.textContent = formatMoney(totalReceber);
    if (contasPagarEl) contasPagarEl.textContent = formatMoney(totalPagar);
    
    const agendamentosHojeEl = document.getElementById('agendamentosHoje');
    if (agendamentosHojeEl) agendamentosHojeEl.textContent = agendamentos.filter(a => isToday(a.data)).length;
    
    const faturamento = ordensServico
        .filter(os => isCurrentMonth(os.data) && os.status === 'concluida')
        .reduce((sum, os) => sum + os.valorTotal, 0);
    
    const faturamentoMesEl = document.getElementById('faturamentoMes');
    if (faturamentoMesEl) faturamentoMesEl.textContent = formatMoney(faturamento);
}

function renderRecentOS() {
    const tbody = document.getElementById('recentOSTable');
    if (!tbody) return;
    
    const ordensServico = AppState.data.ordensServico.slice().reverse().slice(0, 5);
    
    if (ordensServico.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma OS registrada ainda</td></tr>';
        return;
    }
    
    tbody.innerHTML = ordensServico.map(os => `
        <tr>
            <td><strong>${os.numero}</strong></td>
            <td>${os.cliente}</td>
            <td>${os.veiculo}</td>
            <td>${getStatusBadge(os.status)}</td>
            <td>${formatDate(os.data)}</td>
            <td>
                <button class="btn-icon" title="Ver detalhes">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getStatusBadge(status) {
    const badges = {
        'aguardando': '<span class="badge badge-warning">Aguardando</span>',
        'em_andamento': '<span class="badge badge-info">Em Andamento</span>',
        'concluida': '<span class="badge badge-success">Concluida</span>',
        'cancelada': '<span class="badge badge-danger">Cancelada</span>'
    };
    return badges[status] || status;
}

function updateOficinaNome() {
    const nomeElement = document.getElementById('oficinaNome');
    if (nomeElement && AppState.oficina.nome) {
        nomeElement.textContent = AppState.oficina.nome;
    }
}

function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        localStorage.removeItem('perplexity_user');
        sessionStorage.removeItem('perplexity_user');
        window.location.href = 'login.html';
    }
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('perplexity_data');
    
    if (!savedData) {
        console.log('Primeira execucao - Salvando dados de exemplo');
        saveToLocalStorage();
        return;
    }
    
    try {
        const parsed = JSON.parse(savedData);
        if (!parsed.ordensServico || parsed.ordensServico.length === 0) {
            console.log('LocalStorage vazio - Usando dados de exemplo');
            saveToLocalStorage();
        } else {
            AppState.data = parsed;
            console.log('Dados carregados do LocalStorage');
        }
    } catch (e) {
        console.error('Erro ao carregar dados:', e);
        saveToLocalStorage();
    }
}

function saveToLocalStorage() {
    try {
        localStorage.setItem('perplexity_data', JSON.stringify(AppState.data));
        console.log('Dados salvos');
    } catch (e) {
        console.error('Erro ao salvar dados:', e);
    }
}

function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value || 0);
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
}

function isToday(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isCurrentMonth(dateString) {
    if (!dateString) return false;
    const date = new Date(dateString + 'T00:00:00');
    const today = new Date();
    return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

setInterval(saveToLocalStorage, 30000);