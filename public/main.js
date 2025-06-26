const headers = { "Content-Type": "application/json" };
marked.setOptions({
  breaks: true,
});

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

document.getElementById("msg").addEventListener("keydown", function (e) {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    const message = val("msg");
    if (message) send();
  }
});

async function loadChats() {
  const res = await fetch("/chats");
  const chats = await res.json();
  chats.reverse().forEach((c) => {
    addToChat("Du", c.message);
    addToChat("Claude", c.response);
  });
}

function addToChat(sender, text) {
  const chat = document.getElementById("chatbox");
  const msg = document.createElement("div");
  msg.classList.add("chat-message");

  if (sender === "AI") {
    msg.innerHTML = `<strong>${sender}:</strong><br>` + marked.parse(text);
    msg.querySelectorAll("pre code").forEach((block) => {
      hljs.highlightElement(block);
    });
  } else {
    msg.innerHTML = `<strong>${sender}:</strong><br>` + text;
  }

  chat.appendChild(msg);
  chat.scrollTop = chat.scrollHeight;
}

function val(id) {
  return document.getElementById(id).value.trim();
}
hljs.highlightAll();
