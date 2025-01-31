const btnCreateElem = document.getElementById("create-game");
btnCreateElem.addEventListener("click", () => createGame());

btnJoinElem = document.getElementById("join-game");
btnJoinElem.addEventListener("click", () => joinGame());

btnReadyElem = document.getElementById("start-game");
btnReadyElem.classList.add("hidden");

btnCancelElem = document.getElementById("cancel-game");
btnCancelElem.addEventListener("click", () => cancelSession());
btnCancelElem.classList.add("hidden");

btnConfirmJoin = document.getElementById("confirm-join");
btnConfirmJoin.classList.add("hidden");

inputGroup = document.getElementById("join-input");
inputField = document.getElementById("session-input");
inputField.value = "";

sessionIdDiv = document.getElementById("session-id");
sessionIdDiv.addEventListener("click", () => copySessionId());
sessionIdDiv.classList.add("hidden");

inputGroup.classList.add("hidden");

let createdSessionId = null;
let joinedSessionId = null;

function createGame () {
  btnReadyElem.classList.remove("hidden");
  btnReadyElem.classList.add("disabled");
  btnCancelElem.classList.remove("hidden");
  btnCreateElem.classList.add("hidden");
  btnJoinElem.classList.add("hidden");

  socket.send(JSON.stringify({ type: "createSession" }));
}

function joinGame() {
  btnReadyElem.classList.add("hidden");
  btnCreateElem.classList.add("hidden");
  btnJoinElem.classList.add("hidden");

  btnCancelElem.classList.remove("hidden");
  btnConfirmJoin.classList.remove("hidden");
  inputGroup.classList.remove("hidden");

  btnConfirmJoin.addEventListener('click', async () => {
    const sessionCode = inputField.value.trim();

    if (sessionCode.length) {
      socket.send(JSON.stringify({ type: "joinSession", code: sessionCode }));
      const joined = await findSession();

      if (joined) {
        btnReadyElem.classList.remove("hidden");
        inputGroup.classList.add("hidden");
        btnConfirmJoin.classList.add("hidden");
        joinedSessionId = sessionCode;
      } else {
        alert("Invalid session");
        joinedSessionId = null;
      }
    }
  });
}

async function findSession() {
  return new Promise((resolve) => {
    const handleMessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'sessionJoined') {
        socket.removeEventListener('message', handleMessage);
        resolve(true);
      } else if (data.type === 'sessionInvalid') {
        socket.removeEventListener('message', handleMessage);
        resolve(false);
      }
    };

    socket.addEventListener('message', handleMessage);
  });
}

function cancelSession () {
  btnReadyElem.classList.add("hidden");
  btnCreateElem.classList.remove("hidden");
  btnJoinElem.classList.remove("hidden");
  btnCancelElem.classList.add("hidden");
  sessionIdDiv.classList.add("hidden");

  btnConfirmJoin.classList.add("hidden");
  inputGroup.classList.add("hidden");

  if (createdSessionId) {
    console.log("Cancelled Session of code: " + createdSessionId);
    socket.send(JSON.stringify({ type: "cancelSession", code: createdSessionId }));
    createdSessionId = null;
  } else if (joinedSessionId) {
    console.log("Left Session of code: " + joinedSessionId);
    socket.send(JSON.stringify({ type: "leaveSession", code: joinedSessionId }));
    joinedSessionId = null;
  }
}

function copySessionId () {
  // var sessionIdText = sessionIdDiv.innerHTML.slice(9);
  // navigator.clipboard.writeText(sessionIdText);
  const textToCopy = "Hello, World!"; // Text to copy
  navigator.clipboard.writeText(textToCopy).then(() => {
      const tooltip = document.getElementById("tooltip");
      tooltip.classList.add("show");

      // Hide tooltip after 2 seconds
      setTimeout(() => {
          tooltip.classList.remove("show");
      }, 2000);
  }).catch(err => {
      console.error("Failed to copy text: ", err);
  });
}

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'sessionCreated') {
    createdSessionId = data.code;
    sessionIdDiv.classList.remove("hidden");
    console.log(sessionIdDiv)
    sessionIdDiv.children[0].innerText = `Session: ${createdSessionId}`
    socket.removeEventListener('message', () => {});
  }
});