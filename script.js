
document.addEventListener("DOMContentLoaded", () => {
    const conversa = document.getElementById("conversa");
    const campoMensagem = document.getElementById("mensagem");
    const btnEnviar = document.getElementById("btnenviar");
    const btnFalar = document.getElementById("btnfalar");
    const formulario = document.getElementById("formulario-chat");
    const status = document.getElementById("status");
    const cards = document.querySelectorAll(".card-sugestao");

    // =====================================
    // PERGUNTAS E RESPOSTAS
    // =====================================

    const respostas = [
        {
            palavras: [
                "olá", "ola", "oi", "bom dia",
                "boa tarde", "boa noite"
            ],
            resposta: "Olá! Como posso ajudar você?"
        },
        {
            palavras: [
                "qual é o seu nome",
                "qual seu nome",
                "quem é você",
                "quem e voce"
            ],
            resposta: "Sou um assistente virtual criado para responder a perguntas específicas."
        },
        {
            palavras: [
                "o que você faz",
                "o que voce faz",
                "como você funciona",
                "como voce funciona"
            ],
            resposta: "Leio sua pergunta, procuro uma resposta cadastrada e mostro o resultado nesta conversa. Você pode digitar ou usar o microfone."
        },
        {
            palavras: [
                "o que é inteligência artificial",
                "o que e inteligencia artificial",
                "inteligência artificial",
                "inteligencia artificial"
            ],
            resposta: "Inteligência artificial é uma área da computação que desenvolve sistemas capazes de realizar tarefas como reconhecer fala, interpretar textos e identificar padrões."
        },
        {
            palavras: [
                "como funciona o microfone",
                "como usar o microfone",
                "como faço uma pergunta por voz",
                "como faco uma pergunta por voz"
            ],
            resposta: "Clique em Falar, permita o acesso ao microfone se o navegador solicitar e diga sua pergunta. O texto reconhecido aparecerá na conversa."
        },
        {
            palavras: [
                "como você responde em áudio",
                "como voce responde em audio",
                "resposta em áudio",
                "resposta em audio"
            ],
            resposta: "Depois de responder, uso a síntese de voz do navegador para ler a resposta em voz alta. A disponibilidade depende do navegador e das vozes instaladas."
        },
        {
            palavras: [
                "obrigado", "obrigada", "valeu"
            ],
            resposta: "De nada! Estou à disposição."
        },
        {
            palavras: [
                "tchau", "até logo", "ate logo", "adeus"
            ],
            resposta: "Até logo! Tenha um bom dia."
        }
    ];

    // =====================================
    // NORMALIZAÇÃO DO TEXTO
    // =====================================

    function normalizar(texto) {
        return texto
            .toLocaleLowerCase("pt-BR")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[?!.,;:]/g, "")
            .trim()
            .replace(/\s+/g, " ");
    }

    // =====================================
    // ENCONTRAR A RESPOSTA
    // =====================================

    function obterResposta(pergunta) {
        const perguntaNormalizada = normalizar(pergunta);

        for (const item of respostas) {
            for (const palavra of item.palavras) {
                const termo = normalizar(palavra);

                // Evita, por exemplo, reconhecer "oi"
                // dentro de outra palavra.
                if (termo.length <= 3) {
                    const palavrasSeparadas = new RegExp(
                        "(^|\\s)" + termo + "(\\s|$)"
                    );

                    if (palavrasSeparadas.test(perguntaNormalizada)) {
                        return item.resposta;
                    }
                } else if (
                    perguntaNormalizada === termo ||
                    perguntaNormalizada.includes(termo)
                ) {
                    return item.resposta;
                }
            }
        }

        return "desculpe, não entendi sua pergunta";
    }

    // =====================================
    // ADICIONAR MENSAGENS AO CHAT
    // =====================================

    function adicionarMensagem(texto, tipo) {
        const mensagem = document.createElement("div");

        mensagem.classList.add("mensagem", tipo);
        mensagem.textContent = texto;

        conversa.appendChild(mensagem);
        conversa.scrollTop = conversa.scrollHeight;

        return mensagem;
    }

    // =====================================
    // RESPOSTA EM ÁUDIO
    // =====================================

    function falarTexto(texto) {
        if (!("speechSynthesis" in window)) {
            status.textContent =
                "Seu navegador não oferece reprodução de voz.";
            return;
        }

        window.speechSynthesis.cancel();

        const fala = new SpeechSynthesisUtterance(texto);

        fala.lang = "pt-BR";
        fala.rate = 1;
        fala.pitch = 1;

        fala.onerror = () => {
            status.textContent =
                "Não foi possível reproduzir o áudio.";
        };

        window.speechSynthesis.speak(fala);
    }

    // =====================================
    // PROCESSAR UMA PERGUNTA
    // =====================================

    function processarPergunta(pergunta) {
        const texto = pergunta.trim();

        if (!texto) {
            status.textContent = "Digite ou fale uma pergunta.";
            return;
        }

        // Exibe a pergunta enviada pelo usuário.
        adicionarMensagem(texto, "usuario");

        // Busca uma resposta cadastrada.
        const resposta = obterResposta(texto);

        // Exibe a resposta do assistente.
        adicionarMensagem(resposta, "bot");

        // Lê a resposta em voz alta.
        falarTexto(resposta);

        campoMensagem.value = "";
        status.textContent = "";
        campoMensagem.focus();
    }

    // =====================================
    // ENVIO PELO FORMULÁRIO
    // =====================================

    formulario.addEventListener("submit", (evento) => {
        evento.preventDefault();
        processarPergunta(campoMensagem.value);
    });

    // =====================================
    // CARDS CLICÁVEIS
    // =====================================

    cards.forEach((card) => {
        card.addEventListener("click", () => {
            const pergunta = card.dataset.pergunta;

            if (pergunta) {
                processarPergunta(pergunta);
            }
        });
    });

    // =====================================
    // RECONHECIMENTO DE VOZ
    // =====================================

    const ReconhecimentoVoz =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    if (!ReconhecimentoVoz) {
        btnFalar.addEventListener("click", () => {
            status.textContent =
                "Reconhecimento de voz indisponível. Tente usar o Google Chrome ou Microsoft Edge.";
        });

        return;
    }

    const reconhecimento = new ReconhecimentoVoz();

    reconhecimento.lang = "pt-BR";
    reconhecimento.continuous = false;
    reconhecimento.interimResults = false;
    reconhecimento.maxAlternatives = 1;

    let ouvindo = false;

    btnFalar.addEventListener("click", () => {
        if (ouvindo) {
            return;
        }

        try {
            ouvindo = true;
            btnFalar.disabled = true;
            status.textContent = "🎙️ Ouvindo... fale agora.";

            reconhecimento.start();
        } catch (erro) {
            ouvindo = false;
            btnFalar.disabled = false;

            status.textContent =
                "Não foi possível iniciar o microfone. Tente novamente.";
        }
    });

    // Converte a pergunta falada em texto e responde.
    reconhecimento.addEventListener("result", (evento) => {
        const perguntaFalada =
            evento.results[0][0].transcript.trim();

        campoMensagem.value = perguntaFalada;

        // A pergunta reconhecida será mostrada no chat.
        // A resposta aparecerá em texto e será falada.
        processarPergunta(perguntaFalada);
    });

    reconhecimento.addEventListener("error", (evento) => {
        if (evento.error === "not-allowed") {
            status.textContent =
                "Permita o acesso ao microfone nas configurações do navegador.";
        } else if (evento.error === "no-speech") {
            status.textContent =
                "Nenhuma fala detectada. Clique no microfone e tente novamente.";
        } else {
            status.textContent =
                "Ocorreu um erro no reconhecimento de voz. Tente novamente.";
        }
    });

    reconhecimento.addEventListener("end", () => {
        ouvindo = false;
        btnFalar.disabled = false;

        if (status.textContent === "🎙️ Ouvindo... fale agora.") {
            status.textContent = "";
        }
    });
});
