// ============================================
// SUPABASE CONFIG — instancia unica global
// ============================================
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const SUPABASE_URL = 'https://hefpzigrxyyhvtgkyspr.supabase.co'
const SUPABASE_KEY = 'sb_publishable_Af0DdLvEB9NuDE69aIPr_w_3a55KPLk'
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Expoe como global para os outros modulos reutilizarem
window._supabase = supabase;

// ============================================
// ESTADO GLOBAL
// ============================================
const AppState = {
    currentPage: 'dashboard',
    user: null,
    oficina: {
        nome: '',
        nomeExibicao: '',
        subtitulo: '',
        endereco: 'Rua das Oficinas, 123 - Centro',
        telefone: '(31) 99999-9999',
        cnpj: '00.000.000/0000-00',
        email: 'contato@fastcar.com.br',
        site: '',
        corPrimaria: '#27ae60',
        rodapePDF: 'Obrigado pela preferencia!',
        logo: 'logo-default.png'
    },
    data: {
        clientes: [],
        veiculos: [],
        ordensServico: [],
        agendamentos: [],
        contasReceber: [],
        contasPagar: [],
        contasFixas: []
    }
};

// ============================================
// CARREGAR TODOS OS DADOS DO SUPABASE
// ============================================
async function loadFromSupabase() {
    try {
        // Clientes
        const { data: clientes, error: errClientes } = await supabase.from('clientes').select('*').order('nome');
        if (errClientes) throw errClientes;
        AppState.data.clientes = clientes || [];

        // Veiculos
        const { data: veiculos, error: errVeiculos } = await supabase.from('veiculos').select('*').order('modelo');
        if (errVeiculos) throw errVeiculos;
        AppState.data.veiculos = (veiculos || []).map(v => ({ ...v, clienteId: v.cliente_id }));

        // Ordens de Servico com servicos
        const { data: ordensServico, error: errOS } = await supabase
            .from('ordens_servico').select('*, os_servicos(*)').order('created_at', { ascending: false });
        if (errOS) throw errOS;
        AppState.data.ordensServico = (ordensServico || []).map(os => ({
            ...os,
            clienteId: os.cliente_id,
            veiculoId: os.veiculo_id,
            valorTotal: os.valor_total,
            dataConclusao: os.data_conclusao,
            servicos: (os.os_servicos || []).map(s => ({ id: s.id, descricao: s.descricao, valor: s.valor }))
        }));

        // Agendamentos
        const { data: agendamentos, error: errAG } = await supabase
            .from('agendamentos').select('*').order('data', { ascending: true });
        if (errAG) throw errAG;
        AppState.data.agendamentos = (agendamentos || []).map(a => ({
            ...a,
            clienteId: a.cliente_id,
            veiculoId: a.veiculo_id,
            tipoServico: a.tipo_servico
        }));

        // Contas a Pagar
        const { data: contasPagar, error: errCP } = await supabase
            .from('contas_pagar').select('*').order('vencimento', { ascending: true });
        if (errCP) throw errCP;
        AppState.data.contasPagar = contasPagar || [];

        // Contas a Receber
        const { data: contasReceber, error: errCR } = await supabase
            .from('contas_receber').select('*').order('vencimento', { ascending: true });
        if (errCR) throw errCR;
        AppState.data.contasReceber = (contasReceber || []).map(c => ({
            ...c,
            osId: c.os_id,
            osNumero: c.os_numero,
            pagadorTipo: c.pagador_tipo,
            pagadorNome: c.pagador_nome,
            formaPagamento: c.forma_pagamento,
            parcelasTotal: c.parcelas_total,
            parcelasRecebidas: c.parcelas_recebidas,
            valorRecebido: c.valor_recebido
        }));

        // Contas Fixas
        const { data: contasFixas, error: errCF } = await supabase
            .from('contas_fixas').select('*').order('dia_vencimento', { ascending: true });
        if (errCF) throw errCF;
        AppState.data.contasFixas = (contasFixas || []).map(c => ({
            ...c,
            valorMensal: c.valor_mensal,
            diaVencimento: c.dia_vencimento,
            pagoEsteMes: c.pago_este_mes
        }));

        console.log('Dados carregados do Supabase:', {
            clientes: AppState.data.clientes.length,
            veiculos: AppState.data.veiculos.length,
            os: AppState.data.ordensServico.length,
            agendamentos: AppState.data.agendamentos.length,
            contasPagar: AppState.data.contasPagar.length,
            contasReceber: AppState.data.contasReceber.length,
            contasFixas: AppState.data.contasFixas.length
        });

    } catch (e) {
        console.error('Erro ao carregar dados do Supabase:', e);
        showToast('Erro ao carregar dados!', 'error');
    }
}

// no-op para nao quebrar chamadas legadas
function saveToLocalStorage() {}
function loadFromLocalStorage() {}

// ============================================
// INICIALIZACAO
// ============================================
async function initApp() {
    console.log('Iniciando CheckAuto...');

    if (!checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    await loadFromSupabase();

    if (typeof aplicarWhiteLabel === 'function') aplicarWhiteLabel();
    updateDashboard();
    updateOficinaNome();
    renderRecentOS();
    updateUserInfo();
    renderClientes();
    renderVeiculos();
    renderOrdensServico();

    if (typeof initFinanceiro === 'function') {
        try { await initFinanceiro(); } catch (e) { console.error('Erro financeiro:', e); }
    }

    if (typeof setupDashboardCards === 'function') setupDashboardCards();

    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => e.preventDefault());
    });

    console.log('CheckAuto inicializado com Supabase!');
}

function checkAuth() {
    const user = localStorage.getItem('checkauto_user') || sessionStorage.getItem('checkauto_user');
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
        if (userNameEl) userNameEl.textContent = AppState.user.nome;
        if (userRoleEl) userRoleEl.textContent = AppState.user.role;
    }
}

// ============================================
// NAVEGACAO
// ============================================
function navigateTo(page) {
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    const activeLink = document.querySelector(`[onclick="navigateTo('${page}')"]`);
    if (activeLink) activeLink.classList.add('active');

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    const pageElement = document.getElementById(`page-${page}`);
    if (pageElement) {
        pageElement.classList.add('active');
        AppState.currentPage = page;

        if (page === 'ordens-servico') renderOrdensServico();
        else if (page === 'agendamento') renderAgendamentos();
        else if (page === 'financeiro' && typeof renderFinanceiroDashboard === 'function') {
            renderFinanceiroDashboard();
            renderContasPagar();
            renderContasReceber();
            renderContasFixas();
            renderFluxoCaixa();
        }
        if (page === 'configuracoes' && typeof initConfiguracoes === 'function') initConfiguracoes();
    }

    if (window.innerWidth <= 768) toggleSidebar();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// ============================================
// DASHBOARD
// ============================================
function updateDashboard() {
    const { ordensServico, clientes, veiculos, agendamentos } = AppState.data;

    const el = (id) => document.getElementById(id);
    if (el('osAbertas')) el('osAbertas').textContent = ordensServico.filter(os => os.status !== 'concluida').length;
    if (el('osHoje')) el('osHoje').textContent = ordensServico.filter(os => isToday(os.data)).length;
    if (el('totalClientes')) el('totalClientes').textContent = clientes.length;
    if (el('totalVeiculos')) el('totalVeiculos').textContent = veiculos.length;

    const contasReceberList = AppState.data.contasReceber || [];
    const contasPagarList = AppState.data.contasPagar || [];

    const totalReceber = contasReceberList
        .filter(c => ['aberta', 'parcial', 'atrasada', 'pendente'].includes(c.status || 'aberta'))
        .reduce((sum, c) => sum + Math.max(0, Number(c.valor || 0) - Number(c.valorRecebido || c.valor_recebido || 0)), 0);

    const totalPagarDireto = contasPagarList
        .filter(c => ['aberta', 'atrasada', 'pendente'].includes(c.status || 'aberta'))
        .reduce((sum, c) => sum + Number(c.valor || 0), 0);

    const totalPagarFixas = (AppState.data.contasFixas || [])
        .filter(c => !(c.pagoEsteMes || c.pago_este_mes))
        .reduce((sum, c) => sum + Number(c.valorMensal || c.valor_mensal || 0), 0);

    const totalPagar = totalPagarDireto + totalPagarFixas;

    if (el('contasReceber')) el('contasReceber').textContent = formatMoney(totalReceber);
    if (el('contasPagar')) el('contasPagar').textContent = formatMoney(totalPagar);

    const agendamentosHojeCount = (agendamentos || []).filter(a => isToday(a.data) && a.status !== 'atendido').length;
    if (el('agendamentosHoje')) el('agendamentosHoje').textContent = agendamentosHojeCount;

    const faturamento = ordensServico
        .filter(os => isCurrentMonth(os.data) && os.status === 'concluida')
        .reduce((sum, os) => sum + Number(os.valorTotal || os.valor_total || 0), 0);
    if (el('faturamentoMes')) el('faturamentoMes').textContent = formatMoney(faturamento);
}

function renderRecentOS() {
    const tbody = document.getElementById('recentOSTable');
    if (!tbody) return;
    const ordensServico = AppState.data.ordensServico.slice(0, 5);
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
            <td><button class="btn-icon" onclick="viewOS('${os.id}')" title="Ver detalhes"><i class="fas fa-eye"></i></button></td>
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
    const nomeExibicao = AppState.oficina.nomeExibicao || AppState.oficina.nome || 'CheckAuto';
    const subtitulo = AppState.oficina.subtitulo || 'Sistema de Gestao';
    const el = (id) => document.getElementById(id);
    if (el('oficinaNome')) el('oficinaNome').textContent = nomeExibicao;
    if (el('sidebarNomeSistema')) el('sidebarNomeSistema').textContent = nomeExibicao;
    if (el('oficinaSubtitulo')) el('oficinaSubtitulo').textContent = subtitulo;
}

async function logout() {
    if (confirm('Deseja realmente sair do sistema?')) {
        await supabase.auth.signOut();
        localStorage.removeItem('checkauto_user');
        sessionStorage.removeItem('checkauto_user');
        window.location.href = 'login.html';
    }
}

// ============================================
// HELPERS
// ============================================
function formatMoney(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
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

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:12px 20px;border-radius:8px;color:#fff;font-weight:500;z-index:9999;animation:fadeIn .3s ease';
    const colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db', warning: '#f39c12' };
    toast.style.background = colors[type] || colors.info;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

// ============================================
// EXPORTS GLOBAIS
// ============================================
window.AppState = AppState;
window.supabase = supabase;
window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.isToday = isToday;
window.isCurrentMonth = isCurrentMonth;
window.saveToLocalStorage = saveToLocalStorage;
window.loadFromSupabase = loadFromSupabase;
window.navigateTo = navigateTo;
window.toggleSidebar = toggleSidebar;
window.logout = logout;
window.getStatusBadge = getStatusBadge;
window.updateDashboard = updateDashboard;
window.renderRecentOS = renderRecentOS;
window.updateOficinaNome = updateOficinaNome;
window.showToast = showToast;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
