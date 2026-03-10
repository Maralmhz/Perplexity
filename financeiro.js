// MODULO FINANCEIRO - FASE 6
let editingContaPagarId = null;
let editingContaReceberId = null;
let editingContaFixaId = null;
let financeiroAbaAtual = 'pagar';

function ensureFinanceiroData() {
    if (!AppState.data.contasPagar || !Array.isArray(AppState.data.contasPagar)) {
        AppState.data.contasPagar = [];
    }
    if (!AppState.data.contasReceber || !Array.isArray(AppState.data.contasReceber)) {
        AppState.data.contasReceber = [];
    }
    if (!AppState.data.contasFixas || !Array.isArray(AppState.data.contasFixas)) {
        AppState.data.contasFixas = [];
    }
}

function seedFinanceiroData() {
    ensureFinanceiroData();

    if (AppState.data.contasPagar.length || AppState.data.contasReceber.length || AppState.data.contasFixas.length) {
        return;
    }

    console.log('[Financeiro] Inserindo dados de exemplo da Fase 6');

    AppState.data.contasPagar = [
        { id: Date.now() + 1, fornecedor: 'Auto Pecas Central', valor: 1250.90, vencimento: '2026-03-08', status: 'aberta', categoria: 'Pecas', observacao: 'Compra mensal' },
        { id: Date.now() + 2, fornecedor: 'Energia Oficina', valor: 680.30, vencimento: '2026-03-12', status: 'aberta', categoria: 'Utilidades', observacao: '' },
        { id: Date.now() + 3, fornecedor: 'Fornecedor Lubrax', valor: 920.50, vencimento: '2026-03-15', status: 'aberta', categoria: 'Lubrificantes', observacao: '' },
        { id: Date.now() + 4, fornecedor: 'Aluguel Galpao', valor: 3000.00, vencimento: '2026-03-05', status: 'paga', categoria: 'Estrutura', observacao: '' },
        { id: Date.now() + 5, fornecedor: 'Internet Fibra', valor: 179.90, vencimento: '2026-03-10', status: 'aberta', categoria: 'Servicos', observacao: '' }
    ];

    AppState.data.contasReceber = [
        { id: Date.now() + 6, osId: 'OS-001', cliente: 'Joao Silva', valor: 850.00, vencimento: '2026-03-10', status: 'aberta', observacao: '' },
        { id: Date.now() + 7, osId: 'OS-002', cliente: 'Maria Santos', valor: 1200.00, vencimento: '2026-03-15', status: 'aberta', observacao: '' },
        { id: Date.now() + 8, osId: 'OS-005', cliente: 'Carlos Eduardo', valor: 320.00, vencimento: '2026-03-02', status: 'recebida', observacao: 'Pago no pix' }
    ];

    AppState.data.contasFixas = [
        { id: Date.now() + 9, descricao: 'Aluguel', valorMensal: 3000.00, diaVencimento: 5, categoria: 'estrutura', pagoEsteMes: true },
        { id: Date.now() + 10, descricao: 'Energia', valorMensal: 800.00, diaVencimento: 12, categoria: 'estrutura', pagoEsteMes: false },
        { id: Date.now() + 11, descricao: 'Agua', valorMensal: 210.00, diaVencimento: 14, categoria: 'estrutura', pagoEsteMes: true },
        { id: Date.now() + 12, descricao: 'Internet', valorMensal: 179.90, diaVencimento: 10, categoria: 'servicos', pagoEsteMes: true },
        { id: Date.now() + 13, descricao: 'Sistema ERP', valorMensal: 299.90, diaVencimento: 20, categoria: 'servicos', pagoEsteMes: false },
        { id: Date.now() + 14, descricao: 'Contabilidade', valorMensal: 650.00, diaVencimento: 8, categoria: 'tributos', pagoEsteMes: false }
    ];
}

function initFinanceiro() {
    ensureFinanceiroData();
    seedFinanceiroData();
    renderFinanceiroDashboard();
    renderContasPagar();
    renderContasReceber();
    renderContasFixas();
    renderFluxoCaixa();
    console.log('[Financeiro] Modulo inicializado');
}

function renderFinanceiroDashboard() {
    ensureFinanceiroData();
    const totalPagar = AppState.data.contasPagar.filter(c => c.status === 'aberta').reduce((sum, c) => sum + Number(c.valor || 0), 0);
    const totalReceber = AppState.data.contasReceber.filter(c => c.status === 'aberta').reduce((sum, c) => sum + Number(c.valor || 0), 0);
    const saldo = calcularSaldo();

    const totalPagarEl = document.getElementById('totalPagar');
    const totalReceberEl = document.getElementById('totalReceber');
    const saldoEl = document.getElementById('saldoFinanceiro');

    if (totalPagarEl) totalPagarEl.textContent = formatMoney(totalPagar);
    if (totalReceberEl) totalReceberEl.textContent = formatMoney(totalReceber);
    if (saldoEl) saldoEl.textContent = formatMoney(saldo);
}

function getBadgeFinanceiro(status, vencimento) {
    const vencida = status === 'aberta' && vencimento && new Date(vencimento + 'T00:00:00') < new Date();
    if (vencida) return '<span class="badge badge-danger">Vencida</span>';
    if (status === 'paga' || status === 'recebida') return '<span class="badge badge-success">Liquidada</span>';
    return '<span class="badge badge-warning">Aberta</span>';
}

function renderContasPagar() {
    const tbody = document.getElementById('contasPagarTableBody');
    if (!tbody) return;
    const contas = filtrarContas('pagar', true);

    if (!contas.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma conta a pagar encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = contas.map(conta => `
        <tr>
            <td><strong>${conta.fornecedor}</strong><br><small>${conta.categoria || '-'}</small></td>
            <td>${formatMoney(conta.valor)}</td>
            <td>${formatDate(conta.vencimento)}</td>
            <td>${getBadgeFinanceiro(conta.status, conta.vencimento)}</td>
            <td>
                <button class="btn-icon" onclick="openContaPagarModal(${conta.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-success" onclick="pagarConta(${conta.id})" title="Marcar como paga"><i class="fas fa-check"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderContasReceber() {
    const tbody = document.getElementById('contasReceberTableBody');
    if (!tbody) return;
    const contas = filtrarContas('receber', true);

    if (!contas.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhuma conta a receber encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = contas.map(conta => `
        <tr>
            <td><strong>${conta.osId || '-'}</strong><br><small>${conta.cliente || '-'}</small></td>
            <td>${formatMoney(conta.valor)}</td>
            <td>${formatDate(conta.vencimento)}</td>
            <td>${getBadgeFinanceiro(conta.status, conta.vencimento)}</td>
            <td>
                <button class="btn-icon" onclick="openContaReceberModal(${conta.id})" title="Editar"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-success" onclick="receberConta(${conta.id})" title="Marcar como recebida"><i class="fas fa-hand-holding-usd"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderContasFixas() {
    const tbody = document.getElementById('contasFixasTableBody');
    if (!tbody) return;
    const contas = filtrarContas('fixas', true);

    if (!contas.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Nenhuma conta fixa encontrada</td></tr>';
        return;
    }

    tbody.innerHTML = contas.map(conta => `
        <tr>
            <td><strong>${conta.descricao}</strong></td>
            <td>${formatMoney(conta.valorMensal)}</td>
            <td>${conta.diaVencimento}</td>
            <td><input type="checkbox" ${conta.pagoEsteMes ? 'checked' : ''} onchange="toggleContaFixaPaga(${conta.id}, this.checked)"></td>
            <td>${conta.categoria || '-'}</td>
            <td>
                <button class="btn-icon" onclick="openContaFixaModal(${conta.id})" title="Editar"><i class="fas fa-edit"></i></button>
            </td>
        </tr>
    `).join('');
}

function renderFluxoCaixa() {
    const tbody = document.getElementById('fluxoCaixaTableBody');
    if (!tbody) return;
    const fluxo = filtrarContas('fluxo', true);

    if (!fluxo.length) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum movimento de fluxo encontrado</td></tr>';
        return;
    }

    let saldoAcumulado = 0;
    tbody.innerHTML = fluxo.map(item => {
        saldoAcumulado += Number(item.entrada || 0) - Number(item.saida || 0);
        return `
            <tr>
                <td>${formatDate(item.data)}</td>
                <td>${item.entrada ? formatMoney(item.entrada) : '-'}</td>
                <td>${item.saida ? formatMoney(item.saida) : '-'}</td>
                <td>${formatMoney(saldoAcumulado)}</td>
                <td>${item.observacao || '-'}</td>
            </tr>
        `;
    }).join('');
}

function openContaPagarModal(editId = null) {
    ensureFinanceiroData();
    const modal = document.getElementById('contaPagarModal');
    const title = document.getElementById('contaPagarModalTitle');
    const form = document.getElementById('contaPagarForm');
    if (!modal || !title || !form) return;

    if (editId) {
        const conta = AppState.data.contasPagar.find(c => c.id === editId);
        if (!conta) return;
        editingContaPagarId = editId;
        title.textContent = 'Editar Conta a Pagar';
        document.getElementById('contaPagarFornecedor').value = conta.fornecedor || '';
        document.getElementById('contaPagarValor').value = formatMoneyInput(conta.valor);
        document.getElementById('contaPagarCategoria').value = conta.categoria || '';
        document.getElementById('contaPagarVencimento').value = conta.vencimento || '';
        document.getElementById('contaPagarObs').value = conta.observacao || '';
    } else {
        editingContaPagarId = null;
        title.textContent = 'Nova Conta a Pagar';
        form.reset();
    }

    modal.classList.add('active');
}

function closeContaPagarModal() {
    const modal = document.getElementById('contaPagarModal');
    const form = document.getElementById('contaPagarForm');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    editingContaPagarId = null;
}

function salvarContaPagar() {
    const form = document.getElementById('contaPagarForm');
    if (form && !form.reportValidity()) return;

    const conta = {
        fornecedor: document.getElementById('contaPagarFornecedor').value.trim(),
        valor: parseMoneyInput(document.getElementById('contaPagarValor').value),
        categoria: document.getElementById('contaPagarCategoria').value.trim(),
        vencimento: document.getElementById('contaPagarVencimento').value,
        observacao: document.getElementById('contaPagarObs').value.trim(),
        status: 'aberta'
    };

    if (editingContaPagarId) {
        const idx = AppState.data.contasPagar.findIndex(c => c.id === editingContaPagarId);
        if (idx !== -1) {
            conta.status = AppState.data.contasPagar[idx].status;
            AppState.data.contasPagar[idx] = { ...AppState.data.contasPagar[idx], ...conta };
        }
        console.log('[Financeiro] Conta a pagar atualizada', editingContaPagarId);
    } else {
        AppState.data.contasPagar.push({ id: Date.now(), ...conta });
        console.log('[Financeiro] Conta a pagar criada');
    }

    persistAndRefreshFinanceiro('Conta a pagar salva com sucesso!');
    closeContaPagarModal();
}

function openContaReceberModal(editId = null) {
    ensureFinanceiroData();
    popularSelectOS();
    const modal = document.getElementById('contaReceberModal');
    const title = document.getElementById('contaReceberModalTitle');
    const form = document.getElementById('contaReceberForm');
    if (!modal || !title || !form) return;

    if (editId) {
        const conta = AppState.data.contasReceber.find(c => c.id === editId);
        if (!conta) return;
        editingContaReceberId = editId;
        title.textContent = 'Editar Conta a Receber';
        document.getElementById('contaReceberOS').value = conta.osId || '';
        document.getElementById('contaReceberValor').value = formatMoneyInput(conta.valor);
        document.getElementById('contaReceberVencimento').value = conta.vencimento || '';
        document.getElementById('contaReceberObs').value = conta.observacao || '';
    } else {
        editingContaReceberId = null;
        title.textContent = 'Nova Conta a Receber';
        form.reset();
    }

    modal.classList.add('active');
}

function closeContaReceberModal() {
    const modal = document.getElementById('contaReceberModal');
    const form = document.getElementById('contaReceberForm');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    editingContaReceberId = null;
}

function salvarContaReceber() {
    const form = document.getElementById('contaReceberForm');
    if (form && !form.reportValidity()) return;

    const osId = document.getElementById('contaReceberOS').value;
    const osData = AppState.data.ordensServico.find(os => os.id === osId || os.numero === osId);

    const conta = {
        osId: osData ? osData.id : osId,
        cliente: osData ? osData.cliente : 'Cliente nao informado',
        valor: parseMoneyInput(document.getElementById('contaReceberValor').value),
        vencimento: document.getElementById('contaReceberVencimento').value,
        observacao: document.getElementById('contaReceberObs').value.trim(),
        status: 'aberta'
    };

    if (editingContaReceberId) {
        const idx = AppState.data.contasReceber.findIndex(c => c.id === editingContaReceberId);
        if (idx !== -1) {
            conta.status = AppState.data.contasReceber[idx].status;
            AppState.data.contasReceber[idx] = { ...AppState.data.contasReceber[idx], ...conta };
        }
        console.log('[Financeiro] Conta a receber atualizada', editingContaReceberId);
    } else {
        AppState.data.contasReceber.push({ id: Date.now(), ...conta });
        console.log('[Financeiro] Conta a receber criada');
    }

    persistAndRefreshFinanceiro('Conta a receber salva com sucesso!');
    closeContaReceberModal();
}

function openContaFixaModal(editId = null) {
    ensureFinanceiroData();
    const modal = document.getElementById('contaFixaModal');
    const title = document.getElementById('contaFixaModalTitle');
    const form = document.getElementById('contaFixaForm');
    if (!modal || !title || !form) return;

    if (editId) {
        const conta = AppState.data.contasFixas.find(c => c.id === editId);
        if (!conta) return;
        editingContaFixaId = editId;
        title.textContent = 'Editar Conta Fixa';
        document.getElementById('contaFixaDescricao').value = conta.descricao || '';
        document.getElementById('contaFixaValor').value = formatMoneyInput(conta.valorMensal);
        document.getElementById('contaFixaDia').value = conta.diaVencimento || '';
        document.getElementById('contaFixaCategoria').value = conta.categoria || '';
    } else {
        editingContaFixaId = null;
        title.textContent = 'Nova Conta Fixa';
        form.reset();
    }

    modal.classList.add('active');
}

function closeContaFixaModal() {
    const modal = document.getElementById('contaFixaModal');
    const form = document.getElementById('contaFixaForm');
    if (modal) modal.classList.remove('active');
    if (form) form.reset();
    editingContaFixaId = null;
}

function salvarContaFixa() {
    const form = document.getElementById('contaFixaForm');
    if (form && !form.reportValidity()) return;

    const conta = {
        descricao: document.getElementById('contaFixaDescricao').value.trim(),
        valorMensal: parseMoneyInput(document.getElementById('contaFixaValor').value),
        diaVencimento: Number(document.getElementById('contaFixaDia').value),
        categoria: document.getElementById('contaFixaCategoria').value,
        pagoEsteMes: false
    };

    if (editingContaFixaId) {
        const idx = AppState.data.contasFixas.findIndex(c => c.id === editingContaFixaId);
        if (idx !== -1) {
            conta.pagoEsteMes = AppState.data.contasFixas[idx].pagoEsteMes;
            AppState.data.contasFixas[idx] = { ...AppState.data.contasFixas[idx], ...conta };
        }
        console.log('[Financeiro] Conta fixa atualizada', editingContaFixaId);
    } else {
        AppState.data.contasFixas.push({ id: Date.now(), ...conta });
        console.log('[Financeiro] Conta fixa criada');
    }

    persistAndRefreshFinanceiro('Conta fixa salva com sucesso!');
    closeContaFixaModal();
}

function pagarConta(id) {
    const conta = AppState.data.contasPagar.find(c => c.id === id);
    if (!conta) return;
    conta.status = 'paga';
    persistAndRefreshFinanceiro('Conta marcada como paga!');
}

function receberConta(id) {
    const conta = AppState.data.contasReceber.find(c => c.id === id);
    if (!conta) return;
    conta.status = 'recebida';
    persistAndRefreshFinanceiro('Conta marcada como recebida!');
}

function toggleContaFixaPaga(id, checked) {
    const conta = AppState.data.contasFixas.find(c => c.id === id);
    if (!conta) return;
    conta.pagoEsteMes = checked;
    persistAndRefreshFinanceiro('Status da conta fixa atualizado!');
}

function calcularSaldo() {
    const entradas = AppState.data.contasReceber
        .filter(c => c.status === 'aberta' || c.status === 'recebida')
        .reduce((sum, c) => sum + Number(c.valor || 0), 0);
    const saidas = AppState.data.contasPagar
        .filter(c => c.status === 'aberta' || c.status === 'paga')
        .reduce((sum, c) => sum + Number(c.valor || 0), 0);
    return entradas - saidas;
}

function showFinanceiroTab(tab, event) {
    financeiroAbaAtual = tab;
    document.querySelectorAll('#page-financeiro .checklist-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#page-financeiro .tab-content').forEach(content => content.classList.remove('active'));

    if (event && event.target) {
        event.target.classList.add('active');
    }

    const content = document.getElementById(`financeiro-tab-${tab}`);
    if (content) content.classList.add('active');
}

function filtrarContas(tab = financeiroAbaAtual, returnData = false) {
    const inicioEl = document.getElementById(`filtro${capitalize(tab)}Inicio`);
    const fimEl = document.getElementById(`filtro${capitalize(tab)}Fim`);
    const statusEl = document.getElementById(`filtro${capitalize(tab)}Status`);
    const buscaEl = document.getElementById(`filtro${capitalize(tab)}Busca`);

    const inicio = inicioEl ? inicioEl.value : '';
    const fim = fimEl ? fimEl.value : '';
    const status = statusEl ? statusEl.value : 'todos';
    const busca = (buscaEl ? buscaEl.value : '').toLowerCase();

    let resultado = [];

    if (tab === 'pagar') {
        resultado = AppState.data.contasPagar.filter(conta => {
            const dataOk = (!inicio || conta.vencimento >= inicio) && (!fim || conta.vencimento <= fim);
            const statusOk = status === 'todos' || conta.status === status;
            const buscaOk = !busca || `${conta.fornecedor} ${conta.categoria}`.toLowerCase().includes(busca);
            return dataOk && statusOk && buscaOk;
        });
    } else if (tab === 'receber') {
        resultado = AppState.data.contasReceber.filter(conta => {
            const dataOk = (!inicio || conta.vencimento >= inicio) && (!fim || conta.vencimento <= fim);
            const statusOk = status === 'todos' || conta.status === status;
            const buscaOk = !busca || `${conta.osId} ${conta.cliente}`.toLowerCase().includes(busca);
            return dataOk && statusOk && buscaOk;
        });
    } else if (tab === 'fixas') {
        resultado = AppState.data.contasFixas.filter(conta => {
            const dataRef = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(conta.diaVencimento).padStart(2, '0')}`;
            const dataOk = (!inicio || dataRef >= inicio) && (!fim || dataRef <= fim);
            const statusConta = conta.pagoEsteMes ? 'pago' : 'pendente';
            const statusOk = status === 'todos' || status === statusConta;
            const buscaOk = !busca || `${conta.descricao} ${conta.categoria}`.toLowerCase().includes(busca);
            return dataOk && statusOk && buscaOk;
        });
    } else if (tab === 'fluxo') {
        const movimentos = [];
        AppState.data.contasReceber.forEach(c => movimentos.push({ data: c.vencimento, entrada: c.valor, saida: 0, observacao: `Recebimento ${c.osId} - ${c.cliente}` }));
        AppState.data.contasPagar.forEach(c => movimentos.push({ data: c.vencimento, entrada: 0, saida: c.valor, observacao: `Pagamento ${c.fornecedor}` }));

        resultado = movimentos
            .filter(m => {
                const dataOk = (!inicio || m.data >= inicio) && (!fim || m.data <= fim);
                const statusMov = m.entrada > 0 ? 'entrada' : 'saida';
                const statusOk = status === 'todos' || statusMov === status;
                const buscaOk = !busca || (m.observacao || '').toLowerCase().includes(busca);
                return dataOk && statusOk && buscaOk;
            })
            .sort((a, b) => a.data.localeCompare(b.data));
    }

    if (returnData) return resultado;

    if (tab === 'pagar') renderContasPagar();
    if (tab === 'receber') renderContasReceber();
    if (tab === 'fixas') renderContasFixas();
    if (tab === 'fluxo') renderFluxoCaixa();
}

function popularSelectOS() {
    const select = document.getElementById('contaReceberOS');
    if (!select) return;
    const options = ['<option value="">Selecione uma OS</option>'];

    (AppState.data.ordensServico || []).forEach(os => {
        options.push(`<option value="${os.id}">${os.numero} - ${os.cliente}</option>`);
    });

    select.innerHTML = options.join('');
}

function parseMoneyInput(value) {
    if (!value) return 0;
    const cleaned = String(value).replace(/\s/g, '').replace('R$', '').replace(/\./g, '').replace(',', '.');
    return Number(cleaned) || 0;
}

function formatMoneyInput(value) {
    return formatMoney(Number(value || 0));
}

function capitalize(value) {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function persistAndRefreshFinanceiro(message) {
    saveToLocalStorage();
    renderFinanceiroDashboard();
    renderContasPagar();
    renderContasReceber();
    renderContasFixas();
    renderFluxoCaixa();
    updateDashboard();
    showToast(message, 'success');
}
