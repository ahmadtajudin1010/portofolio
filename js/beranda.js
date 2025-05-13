// Tunggu sampai DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    // --- Logika Navbar Mobile ---
    const menuToggle = document.getElementById('menu-toggle');
    const navList = document.getElementById('nav-list');

    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            navList.classList.toggle('active');
            const toggleIcon = menuToggle.querySelector('i');
            if (navList.classList.contains('active')) {
                toggleIcon.classList.remove('fa-bars');
                toggleIcon.classList.add('fa-times');
                menuToggle.setAttribute('aria-expanded', 'true');
            } else {
                toggleIcon.classList.remove('fa-times');
                toggleIcon.classList.add('fa-bars');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });

        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Gunakan window.innerWidth untuk memastikan ini hanya berlaku di mobile
                if (window.innerWidth <= 768 && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    const toggleIcon = menuToggle.querySelector('i');
                    toggleIcon.classList.remove('fa-times');
                    toggleIcon.classList.add('fa-bars');
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

        // Buka jendela chat saat trigger di klik
        chatTrigger.addEventListener('click', () => {
            chatWindow.classList.add('open');
        });

        // Tutup jendela chat saat tombol close di klik
        closeChatButton.addEventListener('click', () => {
            chatWindow.classList.remove('open');
        });

        // Fungsi untuk menambahkan pesan ke chat body
        function addMessage(message, sender) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(sender === 'user' ? 'user-message' : 'ai-message');
            messageElement.textContent = message;
            chatBody.appendChild(messageElement);
            // Scroll ke pesan terbaru
            chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Fungsi untuk menangani pengiriman pesan
        function handleSendMessage() {
            const userMessage = chatInput.value.trim();
            if (userMessage) { // Pastikan pesan tidak kosong
                addMessage(userMessage, 'user'); // Tambahkan pesan pengguna

                // --- Logika Respons AI Sederhana (Ganti dengan logika AI sungguhan nanti) ---
                // Contoh respons sederhana berdasarkan input
                let aiResponse = "Maaf, saya tidak mengerti. Bisa ulangi?";
                if (userMessage.toLowerCase().includes("halo") || userMessage.toLowerCase().includes("hai")) {
                    aiResponse = "Halo juga! Ada yang bisa saya bantu terkait portofolio ini?";
                } else if (userMessage.toLowerCase().includes("proyek")) {
                    aiResponse = "Saya punya beberapa proyek menarik di bagian 'Proyek Pilihan'. Silakan cek!";
                } else if (userMessage.toLowerCase().includes("keahlian")) {
                     aiResponse = "Anda bisa melihat daftar keahlian saya di bagian 'Keahlian Saya'.";
                } else if (userMessage.toLowerCase().includes("kontak")) {
                     aiResponse = "Anda bisa menghubungi saya melalui email di bagian 'Hubungi Saya'.";
                } else if (userMessage.toLowerCase().includes("nama")) {
                     aiResponse = "Saya adalah AI bantuan untuk portofolio ini. Pemilik portofolio ini bernama [Nama Lengkap Anda]."; // Ganti dengan nama Anda
                }
                 // Tambahkan delay singkat sebelum respons AI muncul
                 setTimeout(() => {
                     addMessage(aiResponse, 'ai'); // Tambahkan respons AI
                 }, 500); // Delay 500ms


                chatInput.value = ''; // Kosongkan input setelah mengirim
            }
        }

        // Kirim pesan saat tombol Kirim diklik
        sendChatButton.addEventListener('click', handleSendMessage);

        // Kirim pesan saat tombol Enter ditekan di input field
        chatInput.addEventListener('keypress', (event) => {
            // Cek jika tombol yang ditekan adalah Enter (kode 13)
            if (event.key === 'Enter') {
                event.preventDefault(); // Mencegah baris baru di input
                handleSendMessage(); // Panggil fungsi kirim pesan
            }
        });

    } else {
        console.error('Error: Elemen chat (window, header, body, input, atau tombol) tidak ditemukan di HTML. Pastikan ID benar.');
    }

    // --- Logika Animasi Saat Refresh (Untuk Hero Section) ---
    const heroElements = document.querySelectorAll('#hero .fade-in-slide-up');
    // Beri sedikit delay agar animasi terlihat setelah halaman dimuat
    setTimeout(() => {
        heroElements.forEach((element, index) => {
            // Tambahkan delay per elemen untuk efek berurutan
            element.style.transitionDelay = `${index * 0.1}s`; // Delay 0.1s antar elemen
            element.classList.add('is-visible');
        });
    }, 100); // Mulai animasi setelah 100ms


    // --- Logika Animasi Scroll (Intersection Observer) ---

    // Ambil semua section yang memiliki class 'animate-on-scroll'
    const animateSections = document.querySelectorAll('.animate-on-scroll');

    // Buat Intersection Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Ambil semua elemen di dalam section ini yang memiliki class 'fade-in-slide-up'
            const animatedElements = entry.target.querySelectorAll('.fade-in-slide-up');

            if (entry.isIntersecting) {
                // Jika elemen terlihat (masuk viewport)
                animatedElements.forEach((element, index) => {
                    // Tambahkan delay per elemen untuk efek berurutan saat muncul
                     element.style.transitionDelay = `${index * 0.1}s`; // Delay 0.1s antar elemen
                    element.classList.add('is-visible');
                });
            } else {
                // Jika elemen tidak terlihat (keluar viewport)
                 animatedElements.forEach(element => {
                    // Hapus delay saat menghilang agar transisi lebih cepat/bersamaan (opsional)
                    element.style.transitionDelay = '0s';
                    element.classList.remove('is-visible');
                });
            }
        });
    }, {
        // Opsi observer
        threshold: 0.1 // Memicu saat 10% dari elemen terlihat
    });

    // Amati setiap section dengan class 'animate-on-scroll'
    animateSections.forEach(section => {
        observer.observe(section);
    });

});
