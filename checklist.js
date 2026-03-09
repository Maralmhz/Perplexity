// GERENCIAMENTO DE CHECKLISTS
const ChecklistState = {
    checklistAtual: null,
    pecasComuns: [
        'Parachoque dianteiro',
        'Parachoque traseiro',
        'Farol',
        'Lanterna',
        'Retrovisor',
        'Para-lama',
        'Capô',
        'Porta',
        'Vidro',
        'Maçaneta',
        'Spoiler',
        'Grade frontal',
        'Para-choque',
        'Amortecedor',
        'Pastilha de freio',
        'Disco de freio',
        'Bateria',
        'Filtro de óleo',
        'Filtro de ar',
        'Correia dentada',
        'Vela de ignição',
        'Óleo motor',
        'Pneu',
        'Alinhamento',
        'Balanceamento'
    ],
    servicosComuns: [
        'Mão de obra',
        'Pintura',
        'Funilaria',
        'Mecânica geral',
        'Troca de óleo',
        'Revisão',
        'Alinhamento',
        'Balanceamento',
        'Diagnóstico',
        'Instalação',
        'Remoção',
        'Polimento',
        'Lavagem',
        'Higienização',
        'Elétrica'
    ]
};

function initChecklist(osId = null, veiculoId = null, clienteId = null) {
    console.log('Inicializando checklist...', { osId, veiculoId, clienteId });
    
    if (osId) {
        // Carrega checklist existente
        const checklistExistente = AppState.data.checklists?.find(c => c.osId === osId);
        if (checklistExistente) {
            ChecklistState.checklistAtual = checklistExistente;
            preencherFormularioChecklist();
        } else {
            criarNovoChecklist(osId, veiculoId, clienteId);
        }
    } else {
        criarNovoChecklist(null, veiculoId, clienteId);
    }
    
    setupAutoComplete();
    setupNavigacaoTeclado();
    setupUploadFotos();
    setupAssinaturaCanvas();
    atualizarResumoFinanceiro();
}

function criarNovoChecklist(osId = null, veiculoId = null, clienteId = null) {
    ChecklistState.checklistAtual = {
        id: Date.now(),
        osId: osId,
        veiculoId: veiculoId,
        clienteId: clienteId,
        dataEntrada: new Date().toISOString(),
        hodometro: '',
        nivelCombustivel: 4,
        itens: {
            estepe: false,
            macaco: false,
            chaveRoda: false,
            triangulo: false,
            gasolina: false,
            etanol: false,
            radio: false,
            antena: false,
            acendedor: false,
            vidroEletrico: false,
            travaEletrica: false,
            buzina: false,
            bateria: false,
            rodasLiga: false,
            protetorCarter: false,
            chaveSegredo: false,
            tapetes: false,
            ar: false,
            abs: false,
            airbag: false,
            automatico: false,
            tracao4x4: false
        },
        observacoes: '',
        fotos: [],
        assinaturaCliente: null,
        assinaturaTecnico: null,
        status: 'rascunho'
    };
    
    ChecklistState.servicosEPecas = {
        servicos: [],
        pecas: [],
        statusRegulacao: 'pendente',
        seguradora: '',
        regulador: '',
        dataRegulacao: null,
        documentoRegulacao: null,
        fotoVistoria: null
    };
}

function setupAutoComplete() {
    // Autocomplete para PEÇAS
    const inputsPecas = document.querySelectorAll('.input-peca-desc');
    inputsPecas.forEach(input => {
        input.addEventListener('input', (e) => {
            const valor = e.target.value.toLowerCase();
            if (valor.length < 2) return;
            
            const sugestoes = ChecklistState.pecasComuns.filter(p => 
                p.toLowerCase().includes(valor)
            );
            
            mostrarSugestoes(e.target, sugestoes);
        });
    });
    
    // Autocomplete para SERVIÇOS
    const inputsServicos = document.querySelectorAll('.input-servico-desc');
    inputsServicos.forEach(input => {
        input.addEventListener('input', (e) => {
            const valor = e.target.value.toLowerCase();
            if (valor.length < 2) return;
            
            const sugestoes = ChecklistState.servicosComuns.filter(s => 
                s.toLowerCase().includes(valor)
            );
            
            mostrarSugestoes(e.target, sugestoes);
        });
    });
}

function mostrarSugestoes(input, sugestoes) {
    // Remove sugestões anteriores
    const suggestoesExistentes = input.parentElement.querySelector('.autocomplete-sugestoes');
    if (suggestoesExistentes) {
        suggestoesExistentes.remove();
    }
    
    if (sugestoes.length === 0) return;
    
    const divSugestoes = document.createElement('div');
    divSugestoes.className = 'autocomplete-sugestoes';
    divSugestoes.style.cssText = `
        position: absolute;
        background: white;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        width: ${input.offsetWidth}px;
        margin-top: 2px;
    `;
    
    sugestoes.slice(0, 5).forEach(sugestao => {
        const div = document.createElement('div');
        div.textContent = sugestao;
        div.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
        `;
        div.addEventListener('mouseenter', () => {
            div.style.background = '#f5f5f5';
        });
        div.addEventListener('mouseleave', () => {
            div.style.background = 'white';
        });
        div.addEventListener('click', () => {
            input.value = sugestao;
            divSugestoes.remove();
            input.focus();
        });
        divSugestoes.appendChild(div);
    });
    
    input.parentElement.style.position = 'relative';
    input.parentElement.appendChild(divSugestoes);
    
    // Remove ao clicar fora
    setTimeout(() => {
        document.addEventListener('click', function removerSugestoes(e) {
            if (!divSugestoes.contains(e.target) && e.target !== input) {
                divSugestoes.remove();
                document.removeEventListener('click', removerSugestoes);
            }
        });
    }, 100);
}

function setupNavigacaoTeclado() {
    document.addEventListener('keydown', (e) => {
        const target = e.target;
        
        // TAB ou ENTER em inputs de peças/serviços
        if ((e.key === 'Tab' || e.key === 'Enter') && 
            (target.classList.contains('input-peca-desc') || 
             target.classList.contains('input-peca-valor') ||
             target.classList.contains('input-servico-desc') ||
             target.classList.contains('input-servico-valor'))) {
            
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // Se está no valor, adiciona nova linha
                if (target.classList.contains('input-peca-valor')) {
                    adicionarLinhaPeca();
                } else if (target.classList.contains('input-servico-valor')) {
                    adicionarLinhaServico();
                } else {
                    // Move para o próximo campo (valor)
                    const proximoCampo = target.parentElement.parentElement.querySelector(
                        target.classList.contains('input-peca-desc') ? '.input-peca-valor' : '.input-servico-valor'
                    );
                    if (proximoCampo) proximoCampo.focus();
                }
            }
        }
    });
}

function adicionarLinhaServico() {
    const tbody = document.getElementById('tabelaServicos');
    const novaLinha = criarLinhaServico();
    tbody.appendChild(novaLinha);
    setupAutoComplete();
    const primeiroInput = novaLinha.querySelector('.input-servico-desc');
    if (primeiroInput) primeiroInput.focus();
    atualizarResumoFinanceiro();
}

function adicionarLinhaPeca() {
    const tbody = document.getElementById('tabelaPecas');
    const novaLinha = criarLinhaPeca();
    tbody.appendChild(novaLinha);
    setupAutoComplete();
    const primeiroInput = novaLinha.querySelector('.input-peca-desc');
    if (primeiroInput) primeiroInput.focus();
    atualizarResumoFinanceiro();
}

function criarLinhaServico(servico = null) {
    const tr = document.createElement('tr');
    const id = servico?.id || Date.now();
    
    tr.innerHTML = `
        <td>
            <input type="text" class="input-servico-desc" 
                   placeholder="Descrição do serviço" 
                   value="${servico?.descricao || ''}" 
                   data-id="${id}">
        </td>
        <td>
            <input type="text" class="input-servico-valor" 
                   placeholder="0,00" 
                   value="${servico?.valor || ''}" 
                   data-id="${id}"
                   oninput="formatarValorInput(this); atualizarResumoFinanceiro();">
        </td>
        <td style="text-align: center;">
            <input type="checkbox" ${servico?.regulado ? 'checked' : ''} 
                   onchange="atualizarResumoFinanceiro()">
        </td>
        <td style="text-align: center;">
            <button class="btn-icon btn-danger" onclick="removerLinhaServico(this)" title="Remover">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

function criarLinhaPeca(peca = null) {
    const tr = document.createElement('tr');
    const id = peca?.id || Date.now();
    
    tr.innerHTML = `
        <td>
            <input type="text" class="input-peca-desc" 
                   placeholder="Descrição da peça" 
                   value="${peca?.descricao || ''}" 
                   data-id="${id}">
        </td>
        <td>
            <input type="text" class="input-peca-valor" 
                   placeholder="0,00" 
                   value="${peca?.valor || ''}" 
                   data-id="${id}"
                   oninput="formatarValorInput(this); atualizarResumoFinanceiro();">
        </td>
        <td style="text-align: center;">
            <input type="checkbox" ${peca?.regulado ? 'checked' : ''} 
                   onchange="atualizarResumoFinanceiro()">
        </td>
        <td style="text-align: center;">
            <button class="btn-icon btn-danger" onclick="removerLinhaPeca(this)" title="Remover">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return tr;
}

function removerLinhaServico(btn) {
    if (confirm('Remover este serviço?')) {
        btn.closest('tr').remove();
        atualizarResumoFinanceiro();
    }
}

function removerLinhaPeca(btn) {
    if (confirm('Remover esta peça?')) {
        btn.closest('tr').remove();
        atualizarResumoFinanceiro();
    }
}

function formatarValorInput(input) {
    let valor = input.value.replace(/\D/g, '');
    if (valor === '') {
        input.value = '';
        return;
    }
    valor = (parseInt(valor) / 100).toFixed(2);
    input.value = valor;
}

function atualizarResumoFinanceiro() {
    const servicos = coletarServicos();
    const pecas = coletarPecas();
    
    const totalServicos = servicos.reduce((sum, s) => sum + (parseFloat(s.valor) || 0), 0);
    const totalPecas = pecas.reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
    
    const servicosRegulados = servicos.filter(s => s.regulado).reduce((sum, s) => sum + (parseFloat(s.valor) || 0), 0);
    const pecasReguladas = pecas.filter(p => p.regulado).reduce((sum, p) => sum + (parseFloat(p.valor) || 0), 0);
    
    const totalRegulado = servicosRegulados + pecasReguladas;
    const totalPendente = (totalServicos + totalPecas) - totalRegulado;
    const totalGeral = totalServicos + totalPecas;
    
    document.getElementById('totalServicos').textContent = formatMoney(totalServicos);
    document.getElementById('totalPecas').textContent = formatMoney(totalPecas);
    document.getElementById('totalRegulado').textContent = formatMoney(totalRegulado);
    document.getElementById('totalPendente').textContent = formatMoney(totalPendente);
    document.getElementById('totalGeral').textContent = formatMoney(totalGeral);
}

function coletarServicos() {
    const linhas = document.querySelectorAll('#tabelaServicos tr');
    const servicos = [];
    
    linhas.forEach(linha => {
        const desc = linha.querySelector('.input-servico-desc')?.value;
        const valor = linha.querySelector('.input-servico-valor')?.value;
        const regulado = linha.querySelector('input[type="checkbox"]')?.checked;
        
        if (desc && valor) {
            servicos.push({
                descricao: desc,
                valor: parseFloat(valor) || 0,
                regulado: regulado || false
            });
        }
    });
    
    return servicos;
}

function coletarPecas() {
    const linhas = document.querySelectorAll('#tabelaPecas tr');
    const pecas = [];
    
    linhas.forEach(linha => {
        const desc = linha.querySelector('.input-peca-desc')?.value;
        const valor = linha.querySelector('.input-peca-valor')?.value;
        const regulado = linha.querySelector('input[type="checkbox"]')?.checked;
        
        if (desc && valor) {
            pecas.push({
                descricao: desc,
                valor: parseFloat(valor) || 0,
                regulado: regulado || false
            });
        }
    });
    
    return pecas;
}

function setupUploadFotos() {
    const inputFotos = document.getElementById('inputFotos');
    if (!inputFotos) return;
    
    inputFotos.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                comprimirEAdicionarFoto(file);
            }
        });
    });
}

function comprimirEAdicionarFoto(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            
            const fotoComprimida = canvas.toDataURL('image/jpeg', 0.7);
            adicionarFotoNaGaleria(fotoComprimida, file.name);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function adicionarFotoNaGaleria(dataUrl, nome) {
    const galeria = document.getElementById('galeriaFotos');
    const div = document.createElement('div');
    div.className = 'foto-preview';
    div.style.cssText = 'position: relative; display: inline-block; margin: 5px;';
    
    div.innerHTML = `
        <img src="${dataUrl}" style="width: 120px; height: 90px; object-fit: cover; border-radius: 4px;">
        <button onclick="removerFoto(this)" style="position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer;">
            ×
        </button>
    `;
    
    galeria.appendChild(div);
    
    if (!ChecklistState.checklistAtual.fotos) {
        ChecklistState.checklistAtual.fotos = [];
    }
    ChecklistState.checklistAtual.fotos.push({ url: dataUrl, nome: nome });
}

function removerFoto(btn) {
    btn.parentElement.remove();
}

function setupAssinaturaCanvas() {
    setupCanvas('canvasAssinaturaCliente');
    setupCanvas('canvasAssinaturaTecnico');
}

function setupCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let desenhando = false;
    
    canvas.addEventListener('mousedown', () => desenhando = true);
    canvas.addEventListener('mouseup', () => desenhando = false);
    canvas.addEventListener('mouseleave', () => desenhando = false);
    
    canvas.addEventListener('mousemove', (e) => {
        if (!desenhando) return;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    });
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        ctx.beginPath();
        ctx.moveTo(x, y);
    });
}

function limparAssinatura(canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function salvarChecklist() {
    // Coleta dados do checklist
    const checklist = {
        ...ChecklistState.checklistAtual,
        hodometro: document.getElementById('hodometro')?.value,
        nivelCombustivel: parseInt(document.getElementById('nivelCombustivel')?.value),
        observacoes: document.getElementById('observacoes')?.value,
        itens: coletarItensChecklist(),
        assinaturaCliente: document.getElementById('canvasAssinaturaCliente')?.toDataURL(),
        assinaturaTecnico: document.getElementById('canvasAssinaturaTecnico')?.toDataURL(),
        status: 'completo'
    };
    
    // Coleta peças e serviços
    const servicosEPecas = {
        servicos: coletarServicos(),
        pecas: coletarPecas(),
        statusRegulacao: document.getElementById('statusRegulacao')?.value,
        seguradora: document.getElementById('seguradora')?.value,
        regulador: document.getElementById('regulador')?.value,
        dataRegulacao: document.getElementById('dataRegulacao')?.value
    };
    
    // Salva no AppState
    if (!AppState.data.checklists) {
        AppState.data.checklists = [];
    }
    
    const index = AppState.data.checklists.findIndex(c => c.id === checklist.id);
    if (index >= 0) {
        AppState.data.checklists[index] = checklist;
    } else {
        AppState.data.checklists.push(checklist);
    }
    
    if (!AppState.data.servicosEPecas) {
        AppState.data.servicosEPecas = [];
    }
    const indexSP = AppState.data.servicosEPecas.findIndex(sp => sp.checklistId === checklist.id);
    servicosEPecas.checklistId = checklist.id;
    if (indexSP >= 0) {
        AppState.data.servicosEPecas[indexSP] = servicosEPecas;
    } else {
        AppState.data.servicosEPecas.push(servicosEPecas);
    }
    
    saveToLocalStorage();
    showToast('Checklist salvo com sucesso!');
}

function coletarItensChecklist() {
    const itens = {};
    const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    checkboxes.forEach(cb => {
        itens[cb.id] = cb.checked;
    });
    return itens;
}

function gerarPDF() {
    showToast('Gerando PDF... (em desenvolvimento)');
    // Implementar geração de PDF com pdfmake
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('page-checklist')) {
            initChecklist();
        }
    });
} else {
    if (document.getElementById('page-checklist')) {
        initChecklist();
    }
}