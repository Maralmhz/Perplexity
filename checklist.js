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
        'Capo',
        'Porta',
        'Vidro',
        'Macaneta',
        'Spoiler',
        'Grade frontal',
        'Para-choque',
        'Amortecedor',
        'Pastilha de freio',
        'Disco de freio',
        'Bateria',
        'Filtro de oleo',
        'Filtro de ar',
        'Correia dentada',
        'Vela de ignicao',
        'Oleo motor',
        'Pneu',
        'Alinhamento',
        'Balanceamento',
        'Suspensao',
        'Cambio',
        'Embreagem',
        'Radiador',
        'Bomba dagua',
        'Alternador',
        'Motor de partida'
    ],
    servicosComuns: [
        'Mao de obra',
        'Pintura',
        'Funilaria',
        'Mecanica geral',
        'Troca de oleo',
        'Revisao',
        'Alinhamento',
        'Balanceamento',
        'Diagnostico',
        'Instalacao',
        'Remocao',
        'Polimento',
        'Lavagem',
        'Higienizacao',
        'Eletrica',
        'Suspensao',
        'Freios',
        'Cambio',
        'Embreagem',
        'Ar condicionado'
    ],
    preCadastroCliente: null,
    preCadastroVeiculo: null
};

// FUNÇÃO DE PRÉ-CADASTRO AUTOMÁTICO
function criarPreCadastroAutomatico() {
    const nome = document.getElementById('checklistClienteNome')?.value.trim();
    const cpf = document.getElementById('checklistClienteCPF')?.value.trim();
    const placa = document.getElementById('checklistVeiculoPlaca')?.value.trim().toUpperCase();
    const modelo = document.getElementById('checklistVeiculoModelo')?.value.trim();
    
    if (!nome || !placa) {
        console.log('Nome ou placa vazios, aguardando preenchimento...');
        return;
    }
    
    // Criar ou atualizar cliente
    let cliente = AppState.data.clientes.find(c => 
        c.cpf === cpf || c.nome.toLowerCase() === nome.toLowerCase()
    );
    
    if (!cliente && nome) {
        cliente = {
            id: Date.now(),
            nome: nome,
            cpf: cpf || '',
            telefone: '',
            email: '',
            endereco: '',
            dataCadastro: new Date().toISOString(),
            origem: 'checklist'
        };
        
        AppState.data.clientes.push(cliente);
        ChecklistState.preCadastroCliente = cliente.id;
        saveToLocalStorage();
        renderClientes();
        
        console.log('✅ Cliente pré-cadastrado:', cliente);
        showToast(`Cliente "${nome}" pré-cadastrado! Complete os dados na aba Clientes.`);
    }
    
    // Criar ou atualizar veículo
    let veiculo = AppState.data.veiculos.find(v => v.placa === placa);
    
    if (!veiculo && placa && cliente) {
        veiculo = {
            id: Date.now() + 1,
            placa: placa,
            modelo: modelo || 'Não informado',
            clienteId: cliente.id,
            chassis: '',
            ano: '',
            cor: '',
            dataCadastro: new Date().toISOString(),
            origem: 'checklist'
        };
        
        AppState.data.veiculos.push(veiculo);
        ChecklistState.preCadastroVeiculo = veiculo.id;
        saveToLocalStorage();
        renderVeiculos();
        
        console.log('✅ Veículo pré-cadastrado:', veiculo);
        showToast(`Veículo "${placa}" pré-cadastrado! Complete os dados na aba Veículos.`);
    }
    
    // Gerar número da OS
    if (placa) {
        const hoje = new Date();
        const dia = String(hoje.getDate()).padStart(2, '0');
        const mes = String(hoje.getMonth() + 1).padStart(2, '0');
        const ano = String(hoje.getFullYear()).slice(-2);
        const placaLimpa = placa.replace(/[^A-Z0-9]/g, '');
        const numeroOS = `${placaLimpa}-${dia}${mes}${ano}`;
        document.getElementById('checklistNumeroOS').textContent = numeroOS;
    }
}

function initChecklist(osId = null, veiculoId = null, clienteId = null) {
    console.log('Inicializando checklist...', { osId, veiculoId, clienteId });
    
    if (osId) {
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
    setupPreCadastro();
    atualizarResumoFinanceiro();
}

function setupPreCadastro() {
    // Listener para criar pré-cadastro quando preencher nome do cliente
    const inputNome = document.getElementById('checklistClienteNome');
    const inputCPF = document.getElementById('checklistClienteCPF');
    const inputPlaca = document.getElementById('checklistVeiculoPlaca');
    const inputModelo = document.getElementById('checklistVeiculoModelo');
    
    if (inputNome) {
        inputNome.addEventListener('blur', criarPreCadastroAutomatico);
    }
    if (inputCPF) {
        inputCPF.addEventListener('blur', criarPreCadastroAutomatico);
    }
    if (inputPlaca) {
        inputPlaca.addEventListener('blur', criarPreCadastroAutomatico);
        inputPlaca.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase();
        });
    }
    if (inputModelo) {
        inputModelo.addEventListener('blur', criarPreCadastroAutomatico);
    }
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
        tipoCombustivel: [],
        itens: {
            estepe: false,
            macaco: false,
            chaveRoda: false,
            triangulo: false,
            extintor: false,
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
            direcaoHidraulica: false,
            alarme: false
        },
        luzesAvarias: [],
        inspecaoVisual: {
            lataria: '',
            pneus: '',
            vidros: '',
            interior: ''
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
        dataRegulacao: null
    };
}

function setupAutoComplete() {
    setupAutoCompleteGenerico('.input-peca-desc', ChecklistState.pecasComuns);
    setupAutoCompleteGenerico('.input-servico-desc', ChecklistState.servicosComuns);
}

function setupAutoCompleteGenerico(seletor, lista) {
    document.addEventListener('input', (e) => {
        if (!e.target.matches(seletor)) return;
        
        const valor = removerAcentos(e.target.value.toLowerCase());
        if (valor.length < 2) return;
        
        const sugestoes = lista.filter(item => 
            removerAcentos(item.toLowerCase()).includes(valor)
        );
        
        mostrarSugestoes(e.target, sugestoes);
    });
}

function removerAcentos(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function mostrarSugestoes(input, sugestoes) {
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
        
        if ((e.key === 'Tab' || e.key === 'Enter') && 
            (target.classList.contains('input-peca-desc') || 
             target.classList.contains('input-peca-valor') ||
             target.classList.contains('input-servico-desc') ||
             target.classList.contains('input-servico-valor'))) {
            
            if (e.key === 'Enter') {
                e.preventDefault();
                
                if (target.classList.contains('input-peca-valor')) {
                    adicionarLinhaPeca();
                } else if (target.classList.contains('input-servico-valor')) {
                    adicionarLinhaServico();
                } else {
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
    const primeiroInput = novaLinha.querySelector('.input-servico-desc');
    if (primeiroInput) primeiroInput.focus();
    atualizarResumoFinanceiro();
}

function adicionarLinhaPeca() {
    const tbody = document.getElementById('tabelaPecas');
    const novaLinha = criarLinhaPeca();
    tbody.appendChild(novaLinha);
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
    
    const elTotalServicos = document.getElementById('totalServicos');
    const elTotalPecas = document.getElementById('totalPecas');
    const elTotalRegulado = document.getElementById('totalRegulado');
    const elTotalPendente = document.getElementById('totalPendente');
    const elTotalGeral = document.getElementById('totalGeral');
    
    if (elTotalServicos) elTotalServicos.textContent = formatMoney(totalServicos);
    if (elTotalPecas) elTotalPecas.textContent = formatMoney(totalPecas);
    if (elTotalRegulado) elTotalRegulado.textContent = formatMoney(totalRegulado);
    if (elTotalPendente) elTotalPendente.textContent = formatMoney(totalPendente);
    if (elTotalGeral) elTotalGeral.textContent = formatMoney(totalGeral);
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

function toggleLuzPainel(luz) {
    const btn = event.target.closest('.luz-painel-btn');
    btn.classList.toggle('active');
}

function toggleCombustivel(tipo) {
    const btn = event.target.closest('.combustivel-btn');
    btn.classList.toggle('active');
}

function salvarChecklist() {
    // Garantir pré-cadastro antes de salvar
    criarPreCadastroAutomatico();
    
    const checklist = {
        ...ChecklistState.checklistAtual,
        clienteId: ChecklistState.preCadastroCliente,
        veiculoId: ChecklistState.preCadastroVeiculo,
        numeroOS: document.getElementById('checklistNumeroOS')?.textContent,
        hodometro: document.getElementById('hodometro')?.value,
        nivelCombustivel: parseInt(document.getElementById('nivelCombustivel')?.value),
        observacoes: document.getElementById('observacoes')?.value,
        itens: coletarItensChecklist(),
        inspecaoVisual: {
            lataria: document.getElementById('inspecaoLataria')?.value || '',
            pneus: document.getElementById('inspecaoPneus')?.value || '',
            vidros: document.getElementById('inspecaoVidros')?.value || '',
            interior: document.getElementById('inspecaoInterior')?.value || ''
        },
        assinaturaCliente: document.getElementById('canvasAssinaturaCliente')?.toDataURL(),
        assinaturaTecnico: document.getElementById('canvasAssinaturaTecnico')?.toDataURL(),
        status: 'completo'
    };
    
    const servicosEPecas = {
        servicos: coletarServicos(),
        pecas: coletarPecas(),
        statusRegulacao: document.getElementById('statusRegulacao')?.value,
        seguradora: document.getElementById('seguradora')?.value,
        regulador: document.getElementById('regulador')?.value,
        dataRegulacao: document.getElementById('dataRegulacao')?.value
    };
    
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