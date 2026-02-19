// TeamPrompt Extension — Side Panel Entrypoint

import { initSharedUI, type UIElements } from "../../lib/ui-init";

document.addEventListener("DOMContentLoaded", () => {
  const elements: UIElements = {
    loginView: document.getElementById("login-view")!,
    mainView: document.getElementById("main-view")!,
    detailView: document.getElementById("detail-view")!,
    emailInput: document.getElementById("login-email") as HTMLInputElement,
    passwordInput: document.getElementById("login-password") as HTMLInputElement,
    loginBtn: document.getElementById("login-btn") as HTMLButtonElement,
    loginError: document.getElementById("login-error")!,
    signupBtn: document.getElementById("signup-btn") as HTMLButtonElement,
    webLoginBtn: document.getElementById("web-login-btn") as HTMLAnchorElement,
    logoutBtn: document.getElementById("logout-btn") as HTMLButtonElement,
    searchInput: document.getElementById("search-input") as HTMLInputElement,
    promptList: document.getElementById("prompt-list")!,
    statusText: document.getElementById("status-text")!,
    detailTitle: document.getElementById("detail-title")!,
    detailContent: document.getElementById("detail-content")!,
    templateFields: document.getElementById("template-fields")!,
    backBtn: document.getElementById("back-btn") as HTMLButtonElement,
    copyBtn: document.getElementById("copy-btn") as HTMLButtonElement,
    insertBtn: document.getElementById("insert-btn") as HTMLButtonElement,
  };

  initSharedUI(elements);
});
