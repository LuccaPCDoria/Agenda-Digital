// ==============================================
// INICIALIZAÇÃO DO USUÁRIO
// ==============================================

const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));
if (!usuario) window.location.href = "index.html";

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

document.getElementById("toggleSidebarBtn").addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("sidebar-fechada");
});

// ==============================================
// IMPORTAÇÃO DO SUPABASE
// ==============================================

import { supabase } from "./supabase.js";

// ==============================================
// SCRIPT DE TAREFAS E METAS (UNIFICADO)
// ==============================================

const formTarefa = document.getElementById("novaTarefaForm");
const listaTarefas = document.getElementById("listaTarefas");

async function carregarTarefas() {
    const { data, error } = await supabase
        .from("tarefas")
        .select("*")
        .eq("user_id", usuario.id)
        .order("created_at", { ascending: false });

    if (error) return console.error("Erro ao carregar tarefas:", error.message);
    listaTarefas.innerHTML = "";

    data.forEach((tarefa) => {
        const item = document.createElement("li");
        item.innerHTML = `
        <label class="checkbox-wrapper">
          <input type="checkbox" ${tarefa.status ? "checked" : ""} data-id="${
            tarefa.id
        }" />
          <span class="checkmark"></span>
          ${tarefa.titulo} <small>[${tarefa.prioridade || "normal"} | ${
            tarefa.tipo
        }]</small>
        </label>
        <button data-del="${tarefa.id}">🗑️</button>
        `;
        listaTarefas.appendChild(item);
    });
}

formTarefa.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloTarefa").value;
    const prioridade = document.getElementById("prioridadeTarefa").value;
    const tipo = document.getElementById("tipoTarefa").value;
    const prazo = document.getElementById("prazoTarefa").value;

    const { error } = await supabase.from("tarefas").insert([
        {
            user_id: usuario.id,
            titulo,
            prioridade,
            tipo,
            prazo,
            status: false,
        },
    ]);

    if (error) return alert("Erro ao adicionar: " + error.message);
    formTarefa.reset();
    carregarTarefas();
});

listaTarefas.addEventListener("change", async (e) => {
    if (e.target.tagName === "INPUT") {
        const id = e.target.dataset.id;
        const status = e.target.checked;
        await supabase.from("tarefas").update({ status }).eq("id", id);
    }
});

listaTarefas.addEventListener("click", async (e) => {
    if (e.target.tagName === "BUTTON") {
        const id = e.target.dataset.del;
        await supabase.from("tarefas").delete().eq("id", id);
        carregarTarefas();
    }
});

carregarTarefas();

// ==============================================
// SCRIPT DE NOTAS
// ==============================================

const formNota = document.getElementById("novaNotaForm");
const listaNotas = document.getElementById("listaNotas");

async function carregarNotas() {
    const { data, error } = await supabase
        .from("notas")
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

formNota.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("tituloNota").value;
    const conteudo = document.getElementById("conteudoNota").value;

    const { error } = await supabase.from("notas").insert([
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

listaNotas.addEventListener("click", async (e) => {
    if (e.target.dataset.delNota) {
        const id = e.target.dataset.delNota;
        await supabase.from("notas").delete().eq("id", id);
        carregarNotas();
    }
});

carregarNotas();

// ==============================================
// TROCA DE SEÇÕES
// ==============================================

const links = document.querySelectorAll("a[data-section]");
const secoes = document.querySelectorAll("section");

links.forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("data-section");
        links.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        secoes.forEach((secao) => (secao.style.display = "none"));
        document.getElementById(id).style.display = "block";
    });
});

// ==============================================
// MODO ESCURO INTELIGENTE
// ==============================================

const btnToggle = document.getElementById("theme-toggle");
const icon = btnToggle.querySelector(".theme-icon");
const label = btnToggle.querySelector(".theme-label");

btnToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const dark = document.body.classList.contains("dark-mode");
    icon.textContent = dark ? "☀️" : "🌙";

    const sidebar = document.querySelector(".sidebar");
    if (!sidebar.classList.contains("sidebar-fechada")) {
        label.textContent = dark ? "Modo Claro" : "Modo Escuro";
    }
});

// ==============================================
// MOSTRA A SEÇÃO DASHBOARD AO INICIAR
// ==============================================

document.getElementById("dashboardSection").style.display = "block";
