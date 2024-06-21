let currentUser = null;
const websocketURL = "wss://64.227.156.150:8765";
let ws;

function connectWebSocket() {
    ws = new WebSocket(websocketURL);

    ws.onopen = () => {
        showToast("Server Connection Successful", "success");
    };

    ws.onmessage = function (event) {
        handleMessage(event);
    };

    ws.onerror = function (event) {
        showToast("WebSocket error observed", "danger");
    };

    ws.onclose = function () {
        showToast("WebSocket connection closed. Reconnecting...", "warning");
        setTimeout(connectWebSocket, 5000); // Try to reconnect after 5 seconds
    };
}

function handleMessage(event) {
    const data = JSON.parse(event.data);

    if (data.type === "new_message") {
        const messageItem = createMessageItem(data.message, data.sender, false);
        appendMessageToUI(messageItem);
    } else if (data.type === "chat_history") {
        const chatHistory = data.chat_history;
        const messageList = document.querySelector(".list-unstyled");
        chatHistory.reverse().forEach((msg) => {
            const messageItem = createMessageItem(msg.message, msg.remote_address, false);
            messageList.appendChild(messageItem);
        });
    } else if (data.type === "time_interval_messages") {
        const messages = data.messages;
        const messageList = document.querySelector(".list-unstyled");
        messageList.innerHTML = ""; // Clear current messages
        messages.forEach((msg) => {
            const messageItem = createMessageItem(msg.message, msg.remote_address, false);
            messageList.appendChild(messageItem);
        });
    } else if (data.type === "total_clients") {
        updateTotalClients(data.total_clients);
    }
}

function createMessageItem(content, sender, isSelf) {
    const li = document.createElement("li");
    li.classList.add("mb-2", "border", "rounded", "p-2");

    const div = document.createElement("div");
    div.classList.add("d-flex", isSelf ? "justify-content-end" : "justify-content-start", "align-items-center");

    const messageP = document.createElement("p");
    messageP.textContent = content;
    messageP.classList.add("m-0");

    const img = document.createElement("img");
    img.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR1afMYs4XDwG9x7WeYWKNBQLZMBAWBS1ekA&s";
    img.alt = "Avatar";
    img.classList.add("rounded-circle", isSelf ? "ms-3" : "me-3", "image_style");

    const nameP = document.createElement("p");
    nameP.textContent = sender;
    nameP.classList.add("small", "text-muted", "m-1", isSelf ? "me-auto" : "ms-auto");
    nameP.style.fontSize = "0.6rem";

    if (isSelf) {
        div.appendChild(nameP);
        div.appendChild(messageP);
        div.appendChild(img);
    } else {
        div.appendChild(img);
        div.appendChild(messageP);
        div.appendChild(nameP);
    }
    li.appendChild(div);

    return li;
}

function sendMessage() {
    const messageInput = document.getElementById("message-input");

    if (messageInput.value.trim() === "") {
        return;
    }

    const messageContent = messageInput.value.trim();
    const sender = "You";
    const messageItem = createMessageItem(messageContent, sender, true);

    appendMessageToUI(messageItem);

    ws.send(JSON.stringify({ type: "new_message", message: messageContent }));

    messageInput.value = "";
}

function appendMessageToUI(messageItem) {
    const messageList = document.querySelector(".list-unstyled");
    messageList.appendChild(messageItem);
}

function updateTotalClients(total) {
    const totalClientsElement = document.getElementById("totalClients");
    totalClientsElement.textContent = `Total connected clients: ${total}`;
}

function getMessagesByTimeInterval() {
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (!startTime || !endTime) {
        showToast("Please select both start and end time.", "warning");
        return;
    }

    ws.send(JSON.stringify({
        type: "get_messages_by_time_interval",
        start_time: startTime,
        end_time: endTime,
    }));
}

function showToast(message, type) {
    const toastContainer = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0`;
    toast.role = 'alert';
    toast.ariaLive = 'assertive';
    toast.ariaAtomic = 'true';

    const toastContent = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    toast.innerHTML = toastContent;
    toastContainer.appendChild(toast);

    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();

    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

// Initialize WebSocket connection
connectWebSocket();
