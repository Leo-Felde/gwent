const btnCreateElem = document.getElementById("create-game");
btnCreateElem.addEventListener("click", () => createGame(), false);

btnJoinElem = document.getElementById("join-game");
btnJoinElem.addEventListener("click", () => joinGame(), false);

btnReadyElem = document.getElementById("start-game");
btnReadyElem.classList.add("hidden");

btnCancelElem = document.getElementById("cancel-game");
btnCancelElem.addEventListener("click", () => cancelSession(), false);
btnCancelElem.classList.add("hidden");

btnConfirmJoin = document.getElementById("confirm-join");
btnConfirmJoin.classList.add("hidden");

inputGroup = document.getElementById("join-input");
inputField = document.getElementById("session-input");

sessionIdDiv = document.getElementById("session-id");
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

socket.addEventListener('message', (event) => {
  const data = JSON.parse(event.data);

  if (data.type === 'sessionCreated') {
    console.log("Your session was created with the code: " + data.code);
    createdSessionId = data.code;
    sessionIdDiv.classList.remove("hidden");
    sessionIdDiv.innerHTML = `Session: ${createdSessionId}`
  }
});