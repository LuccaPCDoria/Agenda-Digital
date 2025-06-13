import { supabase } from "./supabase.js";

const form = document.getElementById("authForm");
const nomeField = document.getElementById("nome");
const formTitle = document.getElementById("formTitle");
const toggleMode = document.getElementById("toggleMode");

let cadastro = false;

toggleMode.addEventListener("click", (e) => {
    e.preventDefault();
    cadastro = !cadastro;
    nomeField.style.display = cadastro ? "block" : "none";
    formTitle.textContent = cadastro ? "Cadastro" : "Login";
    toggleMode.innerHTML = cadastro
        ? 'Já tem conta? <a href="#">Entrar</a>'
        : 'Ainda não tem conta? <a href="#">Cadastre-se</a>';
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    if (cadastro) {
        const nome = document.getElementById("nome").value;
        const { data, error } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome },
            },
        });
        if (error) return alert("Erro no cadastro: " + error.message);
        alert("Cadastro realizado! Confirme seu e-mail.");
    } else {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha,
        });
        if (error) return alert("Erro no login: " + error.message);
        sessionStorage.setItem("usuarioLogado", JSON.stringify(data.user));
        window.location.href = "dashboard.html";
    }
});
