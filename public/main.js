const headers = { "Content-Type": "application/json" };

async function register() {
  const username = val("username"),
    password = val("password");
  if (!username || !password) {
    alert("Bitte Benutzername und Passwort eingeben");
    return;
  }
  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  alert(res.ok ? "Registrierung erfolgreich" : "Registrierung fehlgeschlagen");
}

async function login() {
  const username = val("username"),
    password = val("password");
  const res = await fetch("/login", {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  if (res.ok) {
    document.getElementById("auth").style.display = "none";
    document.getElementById("chat").style.display = "block";
    loadChats();
  } else alert("Login fehlgeschlagen");
}

async function send() {
  const message = val("msg");
  addToChat("Du", message);
  document.getElementById("msg").value = "";
  const res = await fetch("/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ message }),
  });
  const data = await res.json();
  addToChat("Claude", data.reply);
}

async function loadChats() {
  const res = await fetch("/chats");
  const chats = await res.json();
  chats.reverse().forEach((c) => {
    addToChat("Du", c.message);
    addToChat("Claude", c.response);
  });
}

function addToChat(sender, text) {
  const box = document.getElementById("chatbox");
  const el = document.createElement("div");
  el.innerHTML = `<span class="msg-${
    sender === "Du" ? "user" : "ai"
  }">${sender}: ${text}</span>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}

function val(id) {
  return document.getElementById(id).value.trim();
}
