document.addEventListener('DOMContentLoaded', () => {

    // --- Logika Navbar Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            const toggleIcon = menuToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                toggleIcon.classList.replace('fa-bars', 'fa-times');
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                toggleIcon.classList.replace('fa-times', 'fa-bars');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768 && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    const toggleIcon = menuToggle.querySelector('i');
                    toggleIcon.classList.replace('fa-times', 'fa-bars');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    } else {
        console.error('Error: Elemen menu toggle atau nav list tidak ditemukan di HTML. Pastikan ID benar.');
    }

    // --- Logika Chat AI ---
    const chatTrigger = document.getElementById('chat-trigger');
    const chatWindow = document.getElementById('chat-window');
    const closeChatButton = document.getElementById('close-chat');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat');
    const chatBody = document.getElementById('chat-body');

    // Pastikan elemen chat ditemukan
    if (chatTrigger && chatWindow && closeChatButton && chatInput && sendChatButton && chatBody) {

        chatTrigger.addEventListener('click', () => {
            chatWindow.classList.add('open');
            chatInput.focus();
        });

        closeChatButton.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });

        function addMessage(message, sender) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message', `${sender}-message`);
            messageElement.textContent = message;
            chatBody.appendChild(messageElement);
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Fungsi handleSendMessage yang BARU (ini yang mengirim ke backend)
        function handleSendMessage() {
            const userMessage = chatInput.value.trim();
            if (userMessage) {
                addMessage(userMessage, 'user');
                chatInput.value = '';

                addMessage('AI sedang mengetik...', 'ai'); // Indikator mengetik

                // PENTING: Ganti 'http://localhost:3000' dengan alamat IP komputer Anda
                // Contoh: Jika IP Anda 192.168.1.5, ubah menjadi 'http://192.168.1.5:3000/chat'
                fetch('http://localhost:3000/chat', { // <--- PASTIKAN UNTUK MENGGANTI INI SAAT TES DI HP
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ message: userMessage }),
                })
                .then(response => {
                    const typingMessage = chatBody.querySelector('.ai-message:last-child');
                    if (typingMessage && typingMessage.textContent === 'AI sedang mengetik...') {
                        typingMessage.remove(); // Hapus indikator mengetik
                    }
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.error || 'Terjadi kesalahan pada server AI.');
                        });
                    }
                    return response.json();
                })
                .then(data => {
                    addMessage(data.reply, 'ai');
                })
                .catch(error => {
                    console.error('Kesalahan saat mengirim pesan ke backend:', error);
                    const typingMessage = chatBody.querySelector('.ai-message:last-child');
                    if (typingMessage && typingMessage.textContent === 'AI sedang mengetik...') {
                        typingMessage.remove();
                    }
                    addMessage('Maaf, ada masalah saat berkomunikasi dengan AI. Silakan coba lagi.', 'ai');
                });
            }
        }
        // Akhir fungsi handleSendMessage

        // Event listeners untuk tombol kirim dan Enter pada input chat
        sendChatButton.addEventListener('click', handleSendMessage);

        chatInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleSendMessage();
            }
        });

    } else {
        console.error('Error: Elemen chat tidak ditemukan di HTML. Pastikan ID benar.');
    }

    // --- Logika Animasi Saat Refresh (Untuk Hero Section) ---
    const heroElements = document.querySelectorAll('#hero .fade-in-slide-up');
    setTimeout(() => {
        heroElements.forEach((element, index) => {
            element.style.transitionDelay = `${index * 0.1}s`;
            element.classList.add('is-visible');
        });
    }, 100);

    // --- Logika Animasi Scroll (Intersection Observer) ---
    const animateSections = document.querySelectorAll('.animate-on-scroll');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const animatedElements = entry.target.querySelectorAll('.fade-in-slide-up');
            if (entry.isIntersecting) {
                animatedElements.forEach((element, index) => {
                    element.style.transitionDelay = `${index * 0.1}s`;
                    element.classList.add('is-visible');
                });
            }
        });
    }, {
        threshold: 0.1 // Memicu saat 10% dari elemen terlihat
    });

    animateSections.forEach(section => {
        observer.observe(section);
    });

});