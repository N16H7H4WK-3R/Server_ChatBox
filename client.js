let currentUser = null;
const ws = new WebSocket("ws://64.227.156.150:8765");

ws.onopen = () => {
    console.log("Connected to WebSocket server");
};

function createMessageItem(content, sender, isSelf) {
    const li = document.createElement("li");
    li.classList.add("mb-2");
    li.classList.add("border");
    li.classList.add("rounded");
    li.classList.add("p-2");

    const div = document.createElement("div");
    div.classList.add("d-flex");
    div.classList.add(isSelf ? "justify-content-end" : "justify-content-start");
    div.classList.add("align-items-center");

    const messageP = document.createElement("p");
    messageP.textContent = content;
    messageP.classList.add("m-0");

    if (isSelf) {
        const img = document.createElement("img");
        img.src =
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR1afMYs4XDwG9x7WeYWKNBQLZMBAWBS1ekA&s";
        img.alt = "Avatar";
        img.classList.add("rounded-circle");
        img.classList.add("ms-3");
        img.classList.add("image_style");
        const nameP = document.createElement("p");
        nameP.textContent = sender;
        nameP.classList.add("small", "text-muted", "m-1", "me-auto");
        nameP.style.fontSize = "0.6rem";
        div.appendChild(nameP);
        div.appendChild(messageP);
        div.appendChild(img);
    } else {
        const img = document.createElement("img");
        img.src =
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQR1afMYs4XDwG9x7WeYWKNBQLZMBAWBS1ekA&s";
        img.alt = "Avatar";
        img.classList.add("rounded-circle");
        img.classList.add("me-3");
        img.classList.add("image_style");
        const nameP = document.createElement("p");
        nameP.textContent = sender;
        nameP.classList.add("small", "text-muted", "m-1", "ms-auto");
        nameP.style.fontSize = "0.6rem";
        div.appendChild(img);
        div.appendChild(messageP);
        div.appendChild(nameP);
    }
    li.appendChild(div);

    return li;
}

// Function to send a new message
function sendMessage() {
    const messageInput = document.getElementById("message-input");

    if (messageInput.value.trim() === "") {
        return;
    }

    const messageContent = messageInput.value.trim();
    const sender = "You";
    const messageItem = createMessageItem(messageContent, sender, true);

    // Append message to the UI
    const messageList = document.querySelector(".list-unstyled");
    messageList.appendChild(messageItem);

    // Send message to the WebSocket server
    ws.send(JSON.stringify({ type: "new_message", message: messageContent }));

    messageInput.value = "";
}

// Handle incoming messages from the WebSocket server
ws.onmessage = function (event) {
    const data = JSON.parse(event.data);

    if (data.type === "new_message") {
        const messageContent = {
            message: data.message,
            sender: data.sender,
        };
        const messageItem = createMessageItem(
            messageContent.message,
            messageContent.sender,
            false
        );

        // Append incoming message to the UI
        const messageList = document.querySelector(".list-unstyled");
        messageList.appendChild(messageItem);
    } else if (data.type === "chat_history") {
        const chatHistory = data.chat_history;
        const messageList = document.querySelector(".list-unstyled");
        chatHistory.reverse().forEach((msg) => {
            const messageItem = createMessageItem(
                msg.message,
                msg.remote_address,
                false
            );
            messageList.appendChild(messageItem);
        });
    } else if (data.type === "time_interval_messages") {
        const messages = data.messages;
        const messageList = document.querySelector(".list-unstyled");
        messageList.innerHTML = ""; // Clear current messages
        messages.forEach((msg) => {
            const messageItem = createMessageItem(
                msg.message,
                msg.remote_address,
                false
            );
            messageList.appendChild(messageItem);
        });
    } else if (data.type === "total_clients") {
        updateTotalClients(data.total_clients);
    }
};

// Handle WebSocket connection errors
ws.onerror = function (event) {
    console.error("WebSocket error observed:", event);
};

function updateTotalClients(total) {
    const totalClientsElement = document.getElementById("totalClients");
    totalClientsElement.textContent = `Total connected clients: ${total}`;
}

function getMessagesByTimeInterval() {
    const startTime = document.getElementById("start-time").value;
    const endTime = document.getElementById("end-time").value;

    if (!startTime || !endTime) {
        alert("Please select both start and end time.");
        return;
    }

    ws.send(
        JSON.stringify({
            type: "get_messages_by_time_interval",
            start_time: startTime,
            end_time: endTime,
        })
    );
}
