// TeamPrompt Extension — Side Panel Script (thin wrapper around shared-ui.js)

document.addEventListener("DOMContentLoaded", () => {
  TeamPromptUI.init({
    loginView: document.getElementById("login-view"),
    mainView: document.getElementById("main-view"),
    detailView: document.getElementById("detail-view"),
    emailInput: document.getElementById("login-email"),
    passwordInput: document.getElementById("login-password"),
    loginBtn: document.getElementById("login-btn"),
    loginError: document.getElementById("login-error"),
    webLoginLink: document.getElementById("web-login-link"),
    logoutBtn: document.getElementById("logout-btn"),
    searchInput: document.getElementById("search-input"),
    promptList: document.getElementById("prompt-list"),
    statusText: document.getElementById("status-text"),
    detailTitle: document.getElementById("detail-title"),
    detailContent: document.getElementById("detail-content"),
    templateFields: document.getElementById("template-fields"),
    backBtn: document.getElementById("back-btn"),
    copyBtn: document.getElementById("copy-btn"),
    insertBtn: document.getElementById("insert-btn"),
  });
});
