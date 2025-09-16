import { personality } from "./config.js";
import { sendMessage } from "./api.js";

const chatBox = document.getElementById("chat-box");
        const modeSelector = document.getElementById("mode-selector");
        const customSelector = document.getElementById("custom-selector");
        const messageForm = document.getElementById("message-form");
        const messageInput = document.getElementById("message-input");
        const typingIndicator = document.getElementById("typing-indicator");
        const statusText = document.getElementById("statusText");
        const sidebar = document.getElementById("sidebar");
        const sidebarOverlay = document.getElementById("sidebarOverlay");
        const toggleSidebar = document.getElementById("toggleSidebar");
        const closeSidebar = document.getElementById("closeSidebar");
        const newChatBtn = document.getElementById("newChatBtn");
        const chatList = document.getElementById("chatList");

        // --- State ---
        let chatHistory = [];
        let chatSessions = JSON.parse(localStorage.getItem('chatSessions')) || [];
        let currentChatId = null;

        // --- Utility Functions ---
        function generateId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function formatTime(timestamp) {
            return new Date(timestamp).toLocaleString();
        }

        function truncateText(text, maxLength = 50) {
            return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
        }

        // --- Chat History Management ---
        function saveCurrentChat() {
            if (!currentChatId || chatHistory.length === 0) return;
            
            const chatIndex = chatSessions.findIndex(chat => chat.id === currentChatId);
            const chatData = {
                id: currentChatId,
                title: chatHistory[0]?.content || 'New Chat',
                messages: [...chatHistory],
                timestamp: Date.now(),
                mode: modeSelector.value,
                customMode: customSelector.value
            };

            if (chatIndex >= 0) {
                chatSessions[chatIndex] = chatData;
            } else {
                chatSessions.unshift(chatData);
            }

            localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
            renderChatList();
        }

        function loadChat(chatId) {
            const chat = chatSessions.find(c => c.id === chatId);
            if (!chat) return;

            currentChatId = chatId;
            chatHistory = [...chat.messages];
            modeSelector.value = chat.mode || 'Standard';
            customSelector.value = chat.customMode || 'custom1';
            
            toggleCustomSelector();
            renderAllMessages();
            renderChatList();
        }

        window.deleteChat = function(chatId, event) {
    event.stopPropagation();
    if (confirm('Are you sure you want to delete this chat?')) {
        chatSessions = chatSessions.filter(chat => chat.id !== chatId);
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));

        if (currentChatId === chatId) {
            startNewChat();
        }
        renderChatList();
    }
};

        window.editChat = function(chatId, event) {
        event.stopPropagation();
        const chat = chatSessions.find(c => c.id === chatId);
        if (!chat) return;

        const newTitle = prompt("Enter new chat title:", chat.title);
        if (newTitle && newTitle.trim()) {
        chat.title = newTitle.trim();
        localStorage.setItem('chatSessions', JSON.stringify(chatSessions));
        renderChatList();
        }
        };

        function startNewChat() {
            saveCurrentChat();
            currentChatId = generateId();
            chatHistory = [];
            clearChatDisplay();
            statusText.textContent = 'Ready to help';
            renderChatList();
        }

        function clearChatDisplay() {
            const maxWidth = chatBox.querySelector('.max-w-4xl');
            if (maxWidth) {
                maxWidth.innerHTML = `
                    <div class="text-center py-12">
                        <div class="w-16 h-16 chat-gradient rounded-full flex items-center justify-center mx-auto mb-4">
                            <i class="fas fa-comments text-white text-2xl"></i>
                        </div>
                        <h3 class="text-xl font-semibold text-slate-700 mb-2">Start a conversation</h3>
                        <p class="text-slate-500">Ask me anything about investments, market analysis, or financial advice.</p>
                    </div>
                `;
            }
        }

        // --- Message Management ---
        function renderMessage(message, sender, messageId = null) {
            const maxWidth = chatBox.querySelector('.max-w-4xl');
            if (!maxWidth) return;

            // Remove welcome message if it exists
            const welcomeDiv = maxWidth.querySelector('.text-center.py-12');
            if (welcomeDiv) {
                welcomeDiv.remove();
            }

            const messageElement = document.createElement("div");
            messageElement.className = "flex gap-3 mb-4 message-animation";
            messageElement.setAttribute('data-message-id', messageId || generateId());

            const isUser = sender === 'user';
            const avatar = isUser 
                ? '<div class="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center"><i class="fas fa-user text-white text-sm"></i></div>'
                : '<div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center"><i class="fas fa-robot text-white text-sm"></i></div>';

            const messageClass = isUser 
                ? 'bg-primary-600 text-white ml-auto' 
                : 'bg-white border border-slate-200';

            messageElement.innerHTML = `
                ${!isUser ? avatar : ''}
                <div class="flex-1 ${isUser ? 'flex justify-end' : ''}">
                    <div class="relative group max-w-2xl ${messageClass} rounded-2xl px-4 py-3 shadow-sm">
                        <div class="message-content">${message}</div>
                        <div class="message-actions absolute -top-2 right-2 hidden group-hover:flex gap-1 bg-white rounded-lg shadow-md border border-slate-200 p-1">
                        </div>
                    </div>
                </div>
                ${isUser ? avatar : ''}
            `;

            maxWidth.appendChild(messageElement);
            chatBox.scrollTop = chatBox.scrollHeight;
        }

        function renderAllMessages() {
            const maxWidth = chatBox.querySelector('.max-w-4xl');
            if (maxWidth) {
                maxWidth.innerHTML = '';
            }

            chatHistory.forEach((msg, index) => {
                renderMessage(msg.content, msg.role, `msg-${index}`);
            });
        }

function renderChatList() {
    chatList.innerHTML = '';
    
    chatSessions.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = `p-3 rounded-lg cursor-pointer transition-colors hover:bg-slate-100 border-l-4 ${
            chat.id === currentChatId ? 'bg-primary-50 border-primary-500' : 'border-transparent'
        } group`;
        
        chatItem.innerHTML = `
            <div class="flex items-start justify-between gap-2">
                <div class="flex-1 min-w-0">
                    <h3 class="font-medium text-slate-800 truncate">${truncateText(chat.title)}</h3>
                    <p class="text-sm text-slate-500 mt-1">${formatTime(chat.timestamp)}</p>
                    <span class="inline-block px-2 py-1 text-xs bg-slate-100 text-slate-600 rounded mt-1">${chat.mode}</span>
                </div>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="editChat('${chat.id}', event)" class="text-slate-400 hover:text-blue-600 p-1">
                        <i class="fas fa-edit text-xs"></i>
                    </button>
                    <button onclick="deleteChat('${chat.id}', event)" class="text-slate-400 hover:text-red-600 p-1">
                        <i class="fas fa-trash text-xs"></i>
                    </button>
                </div>
            </div>
        `;
        
        chatItem.addEventListener('click', () => loadChat(chat.id));
        chatList.appendChild(chatItem);
    });
}

        // --- UI Functions ---
        function toggleCustomSelector() {
            const value = modeSelector.value;
            customSelector.classList.toggle("hidden", !(value === "Negotiation" || value === "Data-Driven"));
        }

        function toggleSidebarVisibility() {
            sidebar.classList.toggle('-translate-x-full');
            sidebarOverlay.classList.toggle('hidden');
        }

        // --- Message Handling ---
        async function handleSendMessage(event) {
            event.preventDefault();
            const userMessage = messageInput.value.trim();
            if (!userMessage) return;

            // Initialize new chat if needed
            if (!currentChatId) {
                currentChatId = generateId();
            }

            messageInput.disabled = true;
            const submitBtn = messageForm.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.disabled = true;
            
            messageInput.value = "";
            renderMessage(userMessage, "user");
            chatHistory.push({ role: "user", content: userMessage });
            
            typingIndicator.classList.remove("hidden");
            statusText.textContent = "Thinking...";

            const mode = modeSelector.value;
            const customMode = customSelector.value;

            const personality = {
                Standard: {
                    description: "คุณคือนักลงทุนที่เน้นการสอนและแนะนำ ... (ไม่เกิน 3 บรรทัด)",
                },
                Negotiation: {
                    description: "คุณคือนักลงทุนในสถานการณ์การต่อรองจริง ... (ไม่เกิน 3 บรรทัด)",
                },
                "Data-Driven": {
                    description: "Data-driven investor mode.",
                },
            };

            try {
                const messages = [
                    {
                        role: "system",
                        content: (personality[mode] && personality[mode].description) || personality.Standard.description,
                    },
                    { role: "user", content: userMessage },
                ];

                const res = await fetch("http://localhost:3222/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages }),
                });

                const data = await res.json();
                let aiReply = "";
                
                if (data && data.reply) {
                    if (typeof data.reply === "string") aiReply = data.reply;
                    else if (typeof data.reply === "object" && data.reply.content) aiReply = data.reply.content;
                    else aiReply = String(data.reply);
                } else {
                    aiReply = "No reply from server.";
                }

                chatHistory.push({ role: "assistant", content: aiReply });
                typingIndicator.classList.add("hidden");
                statusText.textContent = "Ready to help";
                renderMessage(aiReply, "ai");
                saveCurrentChat();
            } catch (error) {
                typingIndicator.classList.add("hidden");
                statusText.textContent = "Connection error";
                renderMessage("An error occurred. Please try again.", "ai");
                console.error(error);
            } finally {
                messageInput.disabled = false;
                if (submitBtn) submitBtn.disabled = false;
                messageInput.focus();
            }
        }

        // --- Event Listeners ---
        document.addEventListener("DOMContentLoaded", () => {
            toggleCustomSelector();
            typingIndicator.classList.add("hidden");
            renderChatList();
            
            // Start new chat if no current chat
            if (!currentChatId && chatSessions.length === 0) {
                currentChatId = generateId();
            }
        });

        modeSelector.addEventListener("change", toggleCustomSelector);
        messageForm.addEventListener("submit", handleSendMessage);
        toggleSidebar.addEventListener("click", toggleSidebarVisibility);
        closeSidebar.addEventListener("click", toggleSidebarVisibility);
        sidebarOverlay.addEventListener("click", toggleSidebarVisibility);
        newChatBtn.addEventListener("click", startNewChat);

        // Auto-resize input and handle Enter key
        messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
            }
        });
