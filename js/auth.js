// Konfigurasi Firebase Anda (SUDAH DIGANTI DENGAN KONFIGURASI DARI FIREBASE CONSOLE ANDA)
const firebaseConfig = {
    apiKey: "AIzaSyBBBG_rOV2fHwvzbx_CCJLnC-6JB38hMuM",
    authDomain: "firebas-25218.firebaseapp.com",
    projectId: "firebas-25218",
    storageBucket: "firebas-25218.firebasestorage.app",
    messagingSenderId: "1067329309535",
    appId: "1:1067329309535:web:a1d24343fc0dee741fc4ea",
    measurementId: "G-TXT7HPGHRT" // Measurement ID ini opsional untuk Analytics
};

// Inisialisasi Firebase
// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Dapatkan instance autentikasi Firebase

// --- Elemen Modal dan Form ---
const authButton = document.getElementById('auth-button');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const closeButtons = document.querySelectorAll('.close-button'); // Ambil semua tombol tutup

const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const switchToRegisterLink = document.getElementById('switch-to-register');

const registerForm = document.getElementById('register-form');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
const registerMessage = document.getElementById('register-message');
const switchToLoginLink = document.getElementById('switch-to-login');

// --- Fungsi untuk Mengatur Status Tombol Auth di Header ---
// Mengganti teks tombol header berdasarkan status login
const updateAuthButton = (user) => {
    if (authButton) { // Pastikan tombol ada
        if (user) {
            // Pengguna login: Tampilkan email atau "Logout"
            authButton.textContent = `Logout (${user.email})`;
            authButton.onclick = async () => {
                console.log('Logout button clicked.'); // Log untuk debugging
                try {
                    await signOut(auth);
                    console.log('Pengguna berhasil logout');
                    // Teks tombol akan diperbarui oleh onAuthStateChanged
                } catch (error) {
                    console.error('Error saat logout:', error);
                    // Mungkin tampilkan pesan error di suatu tempat
                }
            };
        } else {
            // Pengguna belum login: Tampilkan "Login / Daftar"
            authButton.textContent = 'Login / Daftar';
            authButton.onclick = () => {
                console.log('Login / Daftar button clicked. Opening login modal.'); // Log untuk debugging
                loginModal.classList.add('open'); // Buka modal login saat diklik
            };
        }
    }
};

// Listener untuk memantau perubahan status autentikasi
onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged triggered. User:', user ? user.email : 'null'); // Log untuk debugging
    updateAuthButton(user);
    if (user) {
        // Sembunyikan modal jika pengguna login saat modal terbuka
        loginModal.classList.remove('open');
        registerModal.classList.remove('open');
    }
});

// --- Event Listener untuk Menutup Modal ---
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Close button clicked.'); // Log untuk debugging
        loginModal.classList.remove('open');
        registerModal.classList.remove('open');
        authMessage.textContent = ''; // Bersihkan pesan
        registerMessage.textContent = ''; // Bersihkan pesan
        authForm.reset(); // Reset form login
        registerForm.reset(); // Reset form daftar
    });
});

// Menutup modal jika klik di luar area konten modal
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        console.log('Clicked outside login modal. Closing.'); // Log untuk debugging
        loginModal.classList.remove('open');
        authMessage.textContent = ''; // Bersihkan pesan
        authForm.reset(); // Reset form
    }
    if (event.target === registerModal) {
        console.log('Clicked outside register modal. Closing.'); // Log untuk debugging
        registerModal.classList.remove('open');
        registerMessage.textContent = ''; // Bersihkan pesan
        registerForm.reset(); // Reset form
    }
});

// --- Beralih antara Login dan Daftar ---
if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => {
        console.log('Switch to register link clicked.'); // Log untuk debugging
        loginModal.classList.remove('open');
        registerModal.classList.add('open');
        authMessage.textContent = ''; // Bersihkan pesan login
        authForm.reset(); // Reset form login
    });
}

if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => {
        console.log('Switch to login link clicked.'); // Log untuk debugging
        registerModal.classList.remove('open');
        loginModal.classList.add('open');
        registerMessage.textContent = ''; // Bersihkan pesan daftar
        registerForm.reset(); // Reset form daftar
    });
}


// --- Penanganan Form Login ---
if (authForm) {
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah reload halaman
        authMessage.textContent = ''; // Bersihkan pesan sebelumnya

        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Login berhasil!';
            authMessage.classList.remove('error');
            authMessage.classList.add('success');
            setTimeout(() => {
                loginModal.classList.remove('open'); // Tutup modal setelah login
                authForm.reset(); // Reset form
            }, 1500);
        } catch (error) {
            console.error('Error saat login:', error.code, error.message);
            authMessage.classList.remove('success');
            authMessage.classList.add('error');
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                    authMessage.textContent = 'Email atau password salah.';
                    break;
                case 'auth/invalid-email':
                    authMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/too-many-requests':
                    authMessage.textContent = 'Terlalu banyak percobaan login. Coba lagi nanti.';
                    break;
                default:
                    authMessage.textContent = 'Login gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}

// --- Penanganan Form Daftar ---
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Mencegah reload halaman
        registerMessage.textContent = ''; // Bersihkan pesan sebelumnya

        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Password tidak cocok.';
            registerMessage.classList.remove('success');
            registerMessage.classList.add('error');
            return;
        }

        if (password.length < 6) {
            registerMessage.textContent = 'Password minimal 6 karakter.';
            registerMessage.classList.remove('success');
            registerMessage.classList.add('error');
            return;
        }

        try {
            await createUserWithEmailAndPassword(auth, email, password);
            registerMessage.textContent = 'Pendaftaran berhasil! Silakan login.';
            registerMessage.classList.remove('error');
            registerMessage.classList.add('success');
            setTimeout(() => {
                registerModal.classList.remove('open'); // Tutup modal daftar
                loginModal.classList.add('open'); // Buka modal login
                registerForm.reset(); // Reset form daftar
            }, 1500);
        } catch (error) {
            console.error('Error saat daftar:', error.code, error.message);
            registerMessage.classList.remove('success');
            registerMessage.classList.add('error');
            switch (error.code) {
                case 'auth/email-already-in-use':
                    registerMessage.textContent = 'Email sudah terdaftar. Silakan login.';
                    break;
                case 'auth/invalid-email':
                    registerMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/weak-password':
                    registerMessage.textContent = 'Password terlalu lemah (minimal 6 karakter).';
                    break;
                default:
                    registerMessage.textContent = 'Pendaftaran gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}
