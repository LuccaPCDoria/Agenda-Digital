// ==============================================
// INICIALIZAÇÃO DO USUÁRIO
// ==============================================

// Recupera o usuário logado da sessionStorage
const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

// Redireciona para a tela de login se não houver usuário na sessão
if (!usuario) window.location.href = "index.html";

// Preenche os campos de nome e e-mail na interface com dados do usuário
document.getElementById("usuarioNome").textContent =
    usuario.user_metadata?.nome || "Usuário";
document.getElementById("emailUsuario").textContent = usuario.email;

// ==============================================
// BOTÃO DE SAIR
// ==============================================

document.getElementById("logoutBtn").addEventListener("click", () => {
    sessionStorage.removeItem("usuarioLogado");
    window.location.href = "index.html";
});

// ==============================================
// BOTÃO DA RETRAÇÃO/EXPANSÃO DA BARRA LATERAL
// ==============================================

// Alterna a sidebar entre aberta e fechada
document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("sidebar-fechada");
});

// ==============================================
// FUNÇÃO PARA FORMATAR DATA
// ==============================================

function dataAtualFormatada() {
    var data = new Date(),
        dia = data.getDate().toString(),
        diaF = dia.length == 1 ? "0" + dia : dia,
        mes = (data.getMonth() + 1).toString(), //+1 pois no getMonth Janeiro começa com zero.
        mesF = mes.length == 1 ? "0" + mes : mes,
        anoF = data.getFullYear();
    return diaF + "/" + mesF + "/" + anoF;
}
// ==============================================
// SCRIPT DE LEMBRETES
// ==============================================

if ("Notification" in window && Notification.permission !== "granted") {
    Notification.requestPermission();
}

async function verificarLembretesHoje() {
    const hoje = new Date().toISOString().split("T")[0];
    const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", usuario.id)
        .eq("tipo", "lembrete")
        .eq("prazo", hoje);

    data.forEach((lembrete) => {
        if (Notification.permission === "granted") {
            new Notification("🔔 Lembrete de hoje", {
                body: lembrete.titulo,
                icon: "https://cdn-icons-png.flaticon.com/512/1827/1827392.png",
            });
        }
    });
}

verificarLembretesHoje();
// ==============================================
// SCRIPT DE TAREFAS
// ==============================================

import { supabase } from "./supabase.js";

// Referências dos elementos
const formTarefa = document.getElementById("novaTarefaForm");
const listaTarefas = document.getElementById("listaTarefas");

// Carregar tarefas do Supabase
async function carregarTarefas() {
    const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", usuario.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Erro ao carregar tarefas:", error.message);
        return;
    }

    listaTarefas.innerHTML = "";

    data.forEach((tarefa) => {
        const item = document.createElement("li");
        item.innerHTML = `
        <label class="checkbox-wrapper">
        <input type="checkbox" id="exemploCheckbox" ${
            tarefa.status ? "checked" : ""
        } data-id="${tarefa.id}" />
        <span class="checkmark"></span>
        ${tarefa.titulo} <small>[${tarefa.prioridade}]</small>
        
        </label>
        <button data-del="${tarefa.id}">🗑️</button>
    
    `;
        listaTarefas.appendChild(item);
    });
}

// Criar nova tarefa
formTarefa.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloTarefa").value;
    const prioridade = document.getElementById("prioridadeTarefa").value;

    const { error } = await supabase.from("tasks").insert([
        {
            user_id: usuario.id,
            titulo,
            prioridade,
            status: false,
        },
    ]);

    if (error) {
        alert("Erro ao adicionar tarefa: " + error.message);
    } else {
        formTarefa.reset();
        carregarTarefas();
    }
});

// Atualizar status
listaTarefas.addEventListener("change", async (e) => {
    if (e.target.tagName === "INPUT") {
        const id = e.target.dataset.id;
        const status = e.target.checked;

        await supabase.from("tasks").update({ status }).eq("id", id);
    }
});

// Deletar tarefa
listaTarefas.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        const id = e.target.dataset.del;
        await supabase.from("tasks").delete().eq("id", id);
        carregarTarefas();
    }
});

// Carregar ao iniciar
carregarTarefas();

// ==============================================
// SCRIPT DE METAS
// ==============================================

const formMeta = document.getElementById("novaMetaForm");
const listaMetas = document.getElementById("listaMetas");

formMeta.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloMeta").value;
    const tipo = document.getElementById("tipoMeta").value;
    const prazo = document.getElementById("prazoMeta").value;

    await supabase.from("goals").insert([
        {
            user_id: usuario.id,
            titulo,
            tipo,
            prazo,
            feito: false,
        },
    ]);

    formMeta.reset();
    carregarMetas();
});

async function carregarMetas() {
    const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", usuario.id)
        .order("prazo", { ascending: true });

    listaMetas.innerHTML = "";
    data.forEach((meta) => {
        const li = document.createElement("li");
        li.innerHTML = `
        <label class="checkbox-wrapper">
        <input type="checkbox" id="exemploCheckbox" ${
            meta.feito ? "checked" : ""
        } data-id-meta="${meta.id}"/>
        <span class="checkmark"></span>
        ${meta.titulo} <small>(${meta.tipo} - ${meta.prazo})</small>
        </label>
        <button data-del="${meta.id}">🗑️</button>
    `;
        listaMetas.appendChild(li);
    });
}

listaMetas.addEventListener("change", async (e) => {
    const id = e.target.dataset.idMeta;
    const feito = e.target.checked;
    await supabase.from("goals").update({ feito }).eq("id", id);
});

// Deletar tarefa
listaMetas.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        const id = e.target.dataset.del;
        await supabase.from("goals").delete().eq("id", id);
        carregarMetas();
    }
});

carregarMetas();

// ==============================================
// SCRIPT DE AGENDA
// ==============================================

const formAgenda = document.getElementById("novaAgendaForm");
const listaAgenda = document.getElementById("listaAgenda");
document
    .getElementById("dataAgenda")
    .addEventListener("change", carregarAgenda);

async function carregarAgenda() {
    const data =
        document.getElementById("dataAgenda").value ||
        new Date().toISOString().split("T")[0];

    const { data: compromissos, error } = await supabase
        .from("schedule")
        .select("*")
        .eq("user_id", usuario.id)
        .eq("data", data)
        .order("hora_ini", { ascending: true });

    listaAgenda.innerHTML = "";
    compromissos.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `

        <label class="checkbox-wrapper">
        
            <p><strong> ${item.data}: <br> ${item.hora_ini} - ${item.hora_fim}</strong> - ${item.titulo}</p>
        </label>
        <button data-del-agenda="${item.id}" >🗑️</button>
    `;
        listaAgenda.appendChild(li);
    });
}

formAgenda.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloCompromisso").value;
    const hora_ini = document.getElementById("horaInicio").value;
    const hora_fim = document.getElementById("horaFim").value;
    const data = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("schedule").insert([
        {
            user_id: usuario.id,
            titulo,
            hora_ini,
            hora_fim,
            data,
        },
    ]);

    if (error) return alert("Erro ao agendar: " + error.message);
    formAgenda.reset();
    carregarAgenda();
});

listaAgenda.addEventListener("click", async (e) => {
    if (e.target.dataset.delAgenda) {
        await supabase
            .from("schedule")
            .delete()
            .eq("id", e.target.dataset.delAgenda);
        carregarAgenda();
    }
});

carregarAgenda();

// ==============================================
// SCRIPT DE NOTAS
// ==============================================

// NOTAS - Referências
const formNota = document.getElementById("novaNotaForm");
const listaNotas = document.getElementById("listaNotas");

// Carregar notas
async function carregarNotas() {
    const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("user_id", usuario.id)
        .order("created_at", { ascending: false });

    if (error) return console.error("Erro ao carregar notas:", error.message);

    listaNotas.innerHTML = "";
    data.forEach((nota) => {
        const card = document.createElement("div");
        card.classList.add("nota-card");
        card.innerHTML = `
      <h3>${nota.titulo}</h3>
      <p>${nota.conteudo}</p>
      <button data-del-nota="${nota.id}">🗑️ Excluir</button>
    `;
        listaNotas.appendChild(card);
    });
}

// Criar nova nota
formNota.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloNota").value;
    const conteudo = document.getElementById("conteudoNota").value;

    const { error } = await supabase.from("notes").insert([
        {
            user_id: usuario.id,
            titulo,
            conteudo,
        },
    ]);

    if (error) return alert("Erro ao salvar nota: " + error.message);
    formNota.reset();
    carregarNotas();
});

// Deletar nota
listaNotas.addEventListener("click", async (e) => {
    if (e.target.dataset.delNota) {
        const id = e.target.dataset.delNota;
        await supabase.from("notes").delete().eq("id", id);
        carregarNotas();
    }
});

// Carregar ao iniciar
carregarNotas();

// ==============================================
// SCRIPT PARA TROCAR AS SEÇÕES
// ==============================================

// TROCA DE SEÇÃO
const links = document.querySelectorAll("a[data-section]");
const secoes = document.querySelectorAll("section");

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("data-section");

        // Remove destaque de todos
        links.forEach((l) => l.classList.remove("active"));

        // Adiciona ao clicado
        link.classList.add("active");

        // Oculta/exibe seções
        secoes.forEach((secao) => (secao.style.display = "none"));
        document.getElementById(id).style.display = "block";
    });
});

// ==============================================
// SCRIPT DO MODO ESCURO
// ==============================================

// ==============================================
// SCRIPT DO MODO ESCURO
// ==============================================
const btnToggle = document.getElementById("theme-toggle");
const icon = btnToggle.querySelector(".theme-icon");
const label = btnToggle.querySelector(".theme-label");

btnToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");

    // Atualiza o ícone
    icon.textContent = dark ? "☀️" : "🌙";

    // Atualiza o texto (somente se sidebar não estiver retraída)
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar.classList.contains("sidebar-fechada")) {
        label.textContent = dark ? "Modo Claro" : "Modo Escuro";
    }
});
// Ativar dashboard na sessão inicial
document.getElementById("dashboardSection").style.display = "block";
