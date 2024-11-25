// Variáveis globais
let currentSlide = 0;
let slideIndex = 1;

// Adicionar variável global para o carrinho
let carrinhoItems = [];
let carrinhoAberto = false;

// Função para carregar produtos
async function carregarProdutos(categoria = 'todos') {
    atualizarCategoriaAtiva(categoria);
    try {
        const produtosContainer = document.getElementById('produtos-container');
        if (!produtosContainer) {
            console.error('Container de produtos não encontrado');
            return;
        }

        let query = supabaseClient
            .from('produtos')
            .select('*');

        if (categoria !== 'todos') {
            query = query.eq('categoria', categoria);
        }

        // Aplicar ordenação
        const ordenarPor = document.getElementById('ordernarPor')?.value;
        if (ordenarPor) {
            switch (ordenarPor) {
                case 'menor-preco':
                    query = query.order('preco', { ascending: true });
                    break;
                case 'maior-preco':
                    query = query.order('preco', { ascending: false });
                    break;
                case 'mais-vendidos':
                    query = query.order('num_avaliacoes', { ascending: false });
                    break;
                case 'novidades':
                    query = query.eq('destaque', 'NOVO');
                    break;
                case 'promocoes':
                    query = query.not('preco_original', 'is', null);
                    break;
            }
        }

        const { data: produtos, error } = await query;

        if (error) throw error;

        produtosContainer.innerHTML = '';

        produtos.forEach(produto => {
            const card = `
                <div class="bg-white rounded-lg shadow-md overflow-hidden product-card">
                    <img src="${produto.url_imagem}" alt="${produto.nome}" class="w-full h-48 object-cover">
                    <div class="p-4">
                        <h3 class="text-lg font-semibold">${produto.nome}</h3>
                        <p class="text-gray-600 text-sm">${produto.descricao}</p>
                        <div class="mt-4 flex justify-between items-center">
                            <div>
                                <span class="text-pink-500 font-bold">R$ ${produto.preco.toFixed(2)}</span>
                                ${produto.preco_original ? `<span class="text-gray-400 line-through text-sm ml-2">R$ ${produto.preco_original.toFixed(2)}</span>` : ''}
                            </div>
                            <button onclick="adicionarAoCarrinho(${produto.id})" class="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-colors">
                                carrinho
                            </button>
                        </div>
                    </div>
                </div>
            `;
            produtosContainer.innerHTML += card;
        });

    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        alert('Erro ao carregar produtos');
    }
}

// Função para adicionar ao carrinho
async function adicionarAoCarrinho(produtoId) {
    try {
        // Busca os dados do produto no Supabase
        const { data: produto, error } = await supabaseClient
            .from('produtos')
            .select('*')
            .eq('id', produtoId)
            .single();

        if (error) throw error;
        if (!produto) throw new Error('Produto não encontrado');

        // Recupera o carrinho atual do localStorage
        const carrinhoAtual = JSON.parse(localStorage.getItem('carrinho')) || [];

        // Verifica se o produto já existe no carrinho
        const itemExistente = carrinhoAtual.find(item => item.id === produto.id);

        if (itemExistente) {
            // Se existe, aumenta a quantidade
            itemExistente.quantidade += 1;
        } else {
            // Se não existe, adiciona o novo item
            carrinhoAtual.push({
                id: produto.id,
                nome: produto.nome,
                preco: produto.preco,
                preco_original: produto.preco_original,
                imagem: produto.url_imagem,
                quantidade: 1
            });
        }

        // Salva o carrinho atualizado no localStorage
        localStorage.setItem('carrinho', JSON.stringify(carrinhoAtual));

        // Atualiza a interface do carrinho
        atualizarCarrinho();
        
        // Abre o carrinho para mostrar o item adicionado
        abrirCarrinho();

        // Feedback visual para o usuário
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500';
        toast.textContent = 'Produto adicionado ao carrinho!';
        document.body.appendChild(toast);

        // Remove o toast após 3 segundos
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }, 3000);

        // Adicione esta linha após atualizar o localStorage
        atualizarContadorCarrinho();

    } catch (erro) {
        console.error('Erro ao adicionar ao carrinho:', erro);
        alert('Erro ao adicionar produto ao carrinho');
    }
}

// Carregar produtos quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarProdutos();
    mostrarSlides(slideIndex);
});

// Tornar funções disponíveis globalmente
window.carregarProdutos = carregarProdutos;
window.adicionarAoCarrinho = adicionarAoCarrinho;
window.aplicarFiltros = aplicarFiltros;

function mudarSlide(n) {
    mostrarSlides(slideIndex += n);
}

function slideAtual(n) {
    mostrarSlides(slideIndex = n);
}

function mostrarSlides(n) {
    let i;
    let slides = document.getElementsByClassName("slide");
    let dots = document.getElementsByClassName("dot");
    
    if (n > slides.length) {slideIndex = 1}    
    if (n < 1) {slideIndex = slides.length}
    
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";  
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    
    slides[slideIndex-1].style.display = "block";  
    dots[slideIndex-1].className += " active";
}

// Mudança automática de slides a cada 8 segundos (alterado de 5000 para 8000 milissegundos)
setInterval(function() {
    mudarSlide(1);
}, 5000);

function aplicarFiltros() {
    const categoriaAtual = document.querySelector('.category-btn.active')?.getAttribute('data-category') || 'todos';
    carregarProdutos(categoriaAtual);
}

// Adicione esta função ao seu script.js
function atualizarCategoriaAtiva(categoria) {
    // Remove a classe active de todos os botões
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona a classe active ao botão clicado
    const botaoAtivo = document.querySelector(`.category-btn[onclick*="${categoria}"]`);
    if (botaoAtivo) {
        botaoAtivo.classList.add('active');
    }
}

function nextSlide() {
  currentSlide = (currentSlide + 1) % slides.length;
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

function prevSlide() {
  currentSlide = (currentSlide - 1 + slides.length) % slides.length;
  slider.style.transform = `translateX(-${currentSlide * 100}%)`;
}

// Adicionar novas funções para o carrinho
function abrirCarrinho() {
    document.getElementById('carrinho-sidebar').classList.remove('translate-x-full');
}


function fecharCarrinho() {
    document.getElementById('carrinho-sidebar').classList.add('translate-x-full');
}

function atualizarCarrinho() {
    const carrinhoConteudo = document.getElementById('carrinho-conteudo');
    const carrinhoQuantidade = document.getElementById('carrinho-quantidade');
    const carrinhoTotal = document.getElementById('carrinho-total');
    
    // Verifica se os elementos existem
    if (!carrinhoConteudo || !carrinhoQuantidade || !carrinhoTotal) {
        console.error('Elementos do carrinho não encontrados');
        return;
    }
    
    // Recupera os itens do carrinho do localStorage
    const itensCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    
    // Atualiza o contador de itens
    carrinhoQuantidade.textContent = itensCarrinho.length;
    
    // Limpa o conteúdo atual do carrinho
    carrinhoConteudo.innerHTML = '';
    
    let total = 0;
    
    // Adiciona cada item ao carrinho
    itensCarrinho.forEach((item, index) => {
        total += item.preco * item.quantidade;
        
        carrinhoConteudo.innerHTML += `
            <div class="flex items-center p-4 border-b border-gray-200">
                <img src="${item.imagem}" alt="${item.nome}" class="w-20 h-20 object-cover rounded">
                <div class="ml-4 flex-1">
                    <h3 class="font-semibold">${item.nome}</h3>
                    <p class="text-gray-600">R$ ${item.preco.toFixed(2)}</p>
                    <div class="flex items-center mt-2">
                        <button onclick="alterarQuantidade(${index}, -1)" class="text-pink-500">-</button>
                        <span class="mx-2">${item.quantidade}</span>
                        <button onclick="alterarQuantidade(${index}, 1)" class="text-pink-500">+</button>
                        <button onclick="removerItem(${index})" class="ml-4 text-red-500">Remover</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    carrinhoTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// Função para atualizar o contador do carrinho
function atualizarContadorCarrinho() {
    const contador = document.getElementById('carrinho-quantidade');
    if (!contador) {
        console.error('Elemento contador do carrinho não encontrado');
        return;
    }

    const itensCarrinho = JSON.parse(localStorage.getItem('carrinho')) || [];
    const totalItens = itensCarrinho.reduce((total, item) => total + item.quantidade, 0);
    
    contador.textContent = totalItens;
    
    // Mostra/esconde o contador baseado na quantidade de itens
    if (totalItens > 0) {
        contador.style.display = 'inline-flex';
    } else {
        contador.style.display = 'none';
    }
}

// Atualiza as funções existentes para chamar atualizarContadorCarrinho
function alterarQuantidade(index, delta) {
    // ... código existente ...
    
    // Adicione esta linha após atualizar o localStorage
    atualizarContadorCarrinho();
}

function removerItem(index) {
    // ... código existente ...
    
    // Adicione esta linha após atualizar o localStorage
    atualizarContadorCarrinho();
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se todos os elementos necessários existem
    const elementos = [
        'carrinho-conteudo',
        'carrinho-quantidade',
        'carrinho-total',
        'carrinho-sidebar'
    ];
    
    const elementosFaltando = elementos.filter(id => !document.getElementById(id));
    
    if (elementosFaltando.length > 0) {
        console.error('Elementos faltando:', elementosFaltando);
        return;
    }
    
    atualizarCarrinho();
    atualizarContadorCarrinho();
});