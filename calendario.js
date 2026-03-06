// COMPONENTE DE CALENDARIO
let calendarioAtual = {
    mes: new Date().getMonth(),
    ano: new Date().getFullYear()
};

function renderCalendario() {
    const container = document.getElementById('calendarioContainer');
    if (!container) return;
    
    const { mes, ano } = calendarioAtual;
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const diasNoMes = new Date(ano, mes + 1, 0).getDate();
    
    const meses = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    
    let html = `
        <div class="calendario-header">
            <button class="btn-nav" onclick="mesAnterior()">
                <i class="fas fa-chevron-left"></i>
            </button>
            <h3>${meses[mes]} ${ano}</h3>
            <button class="btn-nav" onclick="proximoMes()">
                <i class="fas fa-chevron-right"></i>
            </button>
        </div>
        
        <div class="calendario-grid">
            <div class="dia-semana">Dom</div>
            <div class="dia-semana">Seg</div>
            <div class="dia-semana">Ter</div>
            <div class="dia-semana">Qua</div>
            <div class="dia-semana">Qui</div>
            <div class="dia-semana">Sex</div>
            <div class="dia-semana">Sab</div>
    `;
    
    // Espacos vazios antes do primeiro dia
    for (let i = 0; i < primeiroDia; i++) {
        html += '<div class="dia-vazio"></div>';
    }
    
    // Dias do mes
    for (let dia = 1; dia <= diasNoMes; dia++) {
        const dataCompleta = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const agendamentos = AppState.data.agendamentos.filter(a => a.data === dataCompleta);
        const hoje = new Date().toISOString().split('T')[0] === dataCompleta;
        
        const statusCounts = {
            pendente: agendamentos.filter(a => a.status === 'pendente').length,
            confirmado: agendamentos.filter(a => a.status === 'confirmado').length
        };
        
        html += `
            <div class="dia-calendario ${hoje ? 'hoje' : ''}" onclick="verAgendamentosDia('${dataCompleta}')">
                <div class="dia-numero">${dia}</div>
                ${agendamentos.length > 0 ? `
                    <div class="agendamentos-indicador">
                        ${statusCounts.pendente > 0 ? `<span class="badge-mini badge-warning">${statusCounts.pendente}</span>` : ''}
                        ${statusCounts.confirmado > 0 ? `<span class="badge-mini badge-success">${statusCounts.confirmado}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function mesAnterior() {
    calendarioAtual.mes--;
    if (calendarioAtual.mes < 0) {
        calendarioAtual.mes = 11;
        calendarioAtual.ano--;
    }
    renderCalendario();
}

function proximoMes() {
    calendarioAtual.mes++;
    if (calendarioAtual.mes > 11) {
        calendarioAtual.mes = 0;
        calendarioAtual.ano++;
    }
    renderCalendario();
}

function verAgendamentosDia(data) {
    const agendamentos = AppState.data.agendamentos.filter(a => a.data === data);
    
    if (agendamentos.length === 0) {
        showToast('Nenhum agendamento neste dia', 'info');
        return;
    }
    
    const modal = document.getElementById('modalDiaAgendamentos');
    const content = document.getElementById('diaAgendamentosContent');
    const titulo = document.getElementById('diaAgendamentosTitulo');
    
    titulo.textContent = `Agendamentos - ${formatDate(data)}`;
    
    content.innerHTML = agendamentos
        .sort((a, b) => a.hora.localeCompare(b.hora))
        .map(ag => {
            const cliente = AppState.data.clientes.find(c => c.id === ag.clienteId);
            const veiculo = AppState.data.veiculos.find(v => v.id === ag.veiculoId);
            return `
                <div class="agendamento-card" onclick="viewAgendamento(${ag.id})">
                    <div class="agendamento-hora">${ag.hora}</div>
                    <div class="agendamento-info">
                        <strong>${cliente?.nome || 'N/A'}</strong>
                        <p>${veiculo?.modelo || 'N/A'} - ${veiculo?.placa || ''}</p>
                        <p>${ag.tipoServico}</p>
                    </div>
                    <div class="agendamento-status">
                        ${getAgendamentoStatusBadge(ag.status)}
                    </div>
                </div>
            `;
        }).join('');
    
    modal.style.display = 'flex';
}

function closeDiaAgendamentosModal() {
    document.getElementById('modalDiaAgendamentos').style.display = 'none';
}