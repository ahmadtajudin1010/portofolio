// Konfigurasi Firebase Anda (PASTIKAN UNTUK MENGGANTI INI DENGAN KONFIGURASI DARI FIREBASE CONSOLE ANDA)
const firebaseConfig = {
    // === PENTING: GANTI NILAI apiKey INI DENGAN API KEY ASLI DARI PROYEK FIREBASE ANDA ===
    // Contoh yang VALID: apiKey: "AIzaSyC0d34G4m1ng-1234567890abcdef",
    apiKey: "AIzaSyBBBG_rOV2fHwvzbx_CCJLnC-6JB38hMuM", // <--- GANTI BAGIAN INI SAJA!
    authDomain: "firebas-25218.firebaseapp.com",
    projectId: "firebas-25218",
    storageBucket: "firebas-25218.firebasestorage.app",
    messagingSenderId: "1067329309535",
    appId: "1:1067329309535:web:a1d24343fc0dee741fc4ea",
    measurementId: "G-TXT7HPGHRT" // Measurement ID ini opsional untuk Analytics
};

// Global variables provided by Canvas environment
// __app_id: The current app ID (string)
// __firebase_config: Firebase config (stringified JSON)
// __initial_auth_token: Firebase custom auth token (string)

// Inisialisasi Firebase
// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    signInWithCustomToken, // Import untuk token kustom
    signInAnonymously, // Import untuk login anonim
    updateEmail, // Untuk mengubah email
    updatePassword, // Untuk mengubah password
    reauthenticateWithCredential, // Untuk re-autentikasi
    EmailAuthProvider, // Untuk membuat kredensial email
    deleteUser // Untuk menghapus akun
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Dapatkan instance autentikasi Firebase
const db = getFirestore(app); // Dapatkan instance Firestore


// --- Elemen Modal dan Form ---
const authButtonLogin = document.getElementById('auth-button-login');
const authButtonProfile = document.getElementById('auth-button-profile'); // Tombol Profil Saya
const authButtonLogout = document.getElementById('auth-button-logout');   // Tombol Logout

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const profileModal = document.getElementById('profile-modal'); // Modal Profil Baru
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

// Mendapatkan elemen radio button untuk peran
const rolePembeli = document.getElementById('role-pembeli');
const rolePenjual = document.getElementById('role-penjual');

// Elemen Profil
const profileEmailSpan = document.getElementById('profile-email');
const profileRoleSpan = document.getElementById('profile-role');
const profileDisplay = document.getElementById('profile-display');

// Elemen Edit Profil
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const editEmailInput = document.getElementById('edit-email');
const editProfileMessage = document.getElementById('edit-profile-message');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Elemen Ubah Password
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordReauthInput = document.getElementById('current-password-reauth');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const changePasswordMessage = document.getElementById('change-password-message');
const cancelPasswordChangeBtn = document.getElementById('cancel-password-change-btn');

// Elemen Hapus Akun
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteAccountConfirmation = document.getElementById('delete-account-confirmation');
const deletePasswordReauthInput = document.getElementById('delete-password-reauth');
const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account-btn');
const deleteAccountMessage = document.getElementById('delete-account-message');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');


// --- Fungsi untuk Mengatur Tampilan Tombol Auth di Header ---
const updateAuthButtonsVisibility = async (user) => {
    if (user) {
        authButtonLogin.style.display = 'none'; // Sembunyikan Login/Daftar
        authButtonProfile.style.display = 'inline-block'; // Tampilkan Profil Saya
        authButtonLogout.style.display = 'inline-block'; // Tampilkan Logout

        // Perbarui teks tombol Profil Saya dengan email/peran
        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        let userRole = 'Pengguna'; // Default role
        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                userRole = docSnap.data().userType === 'penjual' ? 'Penjual' : 'Pembeli';
            }
        } catch (error) {
            console.error("Error fetching user role:", error);
        }
        authButtonProfile.textContent = `Profil Saya (${userRole})`;

    } else {
        authButtonLogin.style.display = 'inline-block'; // Tampilkan Login/Daftar
        authButtonProfile.style.display = 'none'; // Sembunyikan Profil Saya
        authButtonLogout.style.display = 'none'; // Sembunyikan Logout
    }
};

// --- Fungsi untuk Memuat Data Profil ke Modal ---
const loadProfileData = async (user) => {
    if (user) {
        profileEmailSpan.textContent = user.email;

        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                profileRoleSpan.textContent = data.userType === 'penjual' ? 'Penjual' : 'Pembeli';
            } else {
                profileRoleSpan.textContent = 'Tidak Ditemukan';
            }
        } catch (error) {
            console.error("Error loading profile data:", error);
            profileRoleSpan.textContent = 'Error';
        }
    }
};

// Inisialisasi otentikasi dengan custom token atau anonim
const initializeAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log('Signed in with custom token.');
        } else {
            await signInAnonymously(auth);
            console.log('Signed in anonymously.');
        }
    } catch (error) {
        console.error('Error during initial Firebase authentication:', error);
    }
};

// Panggil inisialisasi otentikasi saat script dimuat
initializeAuth();

// Listener untuk memantau perubahan status autentikasi
onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged triggered. User:', user ? user.email || user.uid : 'null'); // Log untuk debugging
    updateAuthButtonsVisibility(user); // Memperbarui visibilitas tombol
    if (user) {
        // Sembunyikan semua modal jika pengguna login
        loginModal.classList.remove('open');
        registerModal.classList.remove('open');
        profileModal.classList.remove('open'); // Pastikan modal profil juga tertutup
        loadProfileData(user); // Muat data profil saat login
    }
});


// --- Event Listener untuk Menutup Modal ---
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Close button clicked.');
        loginModal.classList.remove('open');
        registerModal.classList.remove('open');
        profileModal.classList.remove('open'); // Tutup modal profil

        // Reset semua form dan pesan
        authMessage.textContent = '';
        registerMessage.textContent = '';
        editProfileMessage.textContent = '';
        changePasswordMessage.textContent = '';
        deleteAccountMessage.textContent = '';

        authForm.reset();
        registerForm.reset();
        profileEditForm.reset();
        changePasswordForm.reset();
        deletePasswordReauthInput.value = ''; // Reset password untuk hapus akun

        // Pastikan tampilan awal profil setelah menutup modal
        profileDisplay.style.display = 'block';
        profileEditForm.style.display = 'none';
        changePasswordForm.style.display = 'none';
        deleteAccountConfirmation.style.display = 'none';
    });
});

// Menutup modal jika klik di luar area konten modal
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        loginModal.classList.remove('open');
        authMessage.textContent = '';
        authForm.reset();
    }
    if (event.target === registerModal) {
        registerModal.classList.remove('open');
        registerMessage.textContent = '';
        registerForm.reset();
    }
    if (event.target === profileModal) {
        profileModal.classList.remove('open');
        editProfileMessage.textContent = '';
        changePasswordMessage.textContent = '';
        deleteAccountMessage.textContent = '';
        profileEditForm.reset();
        changePasswordForm.reset();
        deletePasswordReauthInput.value = '';
        profileDisplay.style.display = 'block';
        profileEditForm.style.display = 'none';
        changePasswordForm.style.display = 'none';
        deleteAccountConfirmation.style.display = 'none';
    }
});

// --- PENTING: Mencegah penutupan modal saat mengklik di dalam konten modal ---
// Tambahkan event listener ke setiap konten modal
const modalContents = document.querySelectorAll('.auth-modal-content');
modalContents.forEach(content => {
    content.addEventListener('click', (event) => {
        event.stopPropagation(); // Mencegah klik di dalam konten modal menyebar ke window
    });
});


// --- Beralih antara Login dan Daftar ---
if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => {
        loginModal.classList.remove('open');
        registerModal.classList.add('open');
        authMessage.textContent = '';
        authForm.reset();
    });
}

if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => {
        registerModal.classList.remove('open');
        loginModal.classList.add('open');
        registerMessage.textContent = '';
        registerForm.reset();
    });
}


// --- Penanganan Form Login ---
if (authForm) {
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';

        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Login berhasil!';
            authMessage.classList.remove('error');
            authMessage.classList.add('success');
            setTimeout(() => {
                loginModal.classList.remove('open');
                authForm.reset();
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
                case 'auth/api-key-not-valid': // Tambahkan penanganan eksplisit untuk error API Key
                    authMessage.textContent = 'Konfigurasi Firebase API Key tidak valid. Silakan periksa konsol Firebase Anda.';
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
        event.preventDefault();
        registerMessage.textContent = '';

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

        let userType = 'pembeli';
        if (rolePenjual.checked) {
            userType = 'penjual';
        } else if (rolePembeli.checked) {
            userType = 'pembeli';
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const userId = user.uid;
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

            await setDoc(doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId), {
                userType: userType,
                email: user.email,
                createdAt: new Date()
            });

            registerMessage.textContent = 'Pendaftaran berhasil! Silakan login.';
            registerMessage.classList.remove('error');
            registerMessage.classList.add('success');
            setTimeout(() => {
                registerModal.classList.remove('open');
                loginModal.classList.add('open');
                registerForm.reset();
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
                case 'auth/api-key-not-valid': // Tambahkan penanganan eksplisit untuk error API Key
                    registerMessage.textContent = 'Konfigurasi Firebase API Key tidak valid. Silakan periksa konsol Firebase Anda.';
                    break;
                default:
                    registerMessage.textContent = 'Pendaftaran gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}

// --- Penanganan Tombol di Header ---
if (authButtonLogin) {
    authButtonLogin.addEventListener('click', () => {
        loginModal.classList.add('open');
    });
}

if (authButtonLogout) {
    authButtonLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('Pengguna berhasil logout');
            // onAuthStateChanged akan menangani pembaruan UI
        } catch (error) {
            console.error('Error saat logout:', error);
            // Anda bisa menambahkan pesan error di UI jika perlu
        }
    });
}

if (authButtonProfile) {
    authButtonProfile.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            loadProfileData(user); // Muat data terbaru saat modal dibuka
            profileModal.classList.add('open');
            // Pastikan form edit/password/delete tersembunyi saat pertama kali buka profil
            profileDisplay.style.display = 'block';
            profileEditForm.style.display = 'none';
            changePasswordForm.style.display = 'none';
            deleteAccountConfirmation.style.display = 'none';
            editProfileMessage.textContent = '';
            changePasswordMessage.textContent = '';
            deleteAccountMessage.textContent = '';
        } else {
            // Jika tidak ada user, arahkan ke login modal (walaupun seharusnya tombol profil tidak terlihat)
            loginModal.classList.add('open');
        }
    });
}

// --- Fungsionalitas Profil ---

// Tombol Edit Profil
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        profileDisplay.style.display = 'none';
        profileEditForm.style.display = 'flex'; // Menggunakan flex karena form punya flex-direction column
        editEmailInput.value = auth.currentUser.email; // Isi email saat ini
        editProfileMessage.textContent = '';
    });
}

// Tombol Batal Edit Profil
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        profileEditForm.style.display = 'none';
        profileDisplay.style.display = 'block';
        editProfileMessage.textContent = '';
        profileEditForm.reset();
    });
}

// Submit Form Edit Profil (Hanya email yang bisa diedit di sini untuk demo)
if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        editProfileMessage.textContent = '';
        const newEmail = editEmailInput.value;
        const user = auth.currentUser;

        if (!user) {
            editProfileMessage.textContent = 'Anda tidak terautentikasi.';
            editProfileMessage.classList.add('error');
            return;
        }

        if (newEmail === user.email) {
            editProfileMessage.textContent = 'Email baru sama dengan email saat ini.';
            editProfileMessage.classList.add('error');
            return;
        }

        try {
            // Memperbarui email di Firebase Authentication
            await updateEmail(user, newEmail);

            // Memperbarui email di Firestore juga
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            await setDoc(userProfileRef, { email: newEmail }, { merge: true }); // Merge agar tidak menimpa data lain

            editProfileMessage.textContent = 'Email berhasil diperbarui!';
            editProfileMessage.classList.remove('error');
            editProfileMessage.classList.add('success');
            profileEmailSpan.textContent = newEmail; // Perbarui tampilan di profil

            setTimeout(() => {
                profileEditForm.style.display = 'none';
                profileDisplay.style.display = 'block';
            }, 1500);

        } catch (error) {
            console.error('Error saat memperbarui email:', error.code, error.message);
            editProfileMessage.classList.remove('success');
            editProfileMessage.classList.add('error');
            switch (error.code) {
                case 'auth/invalid-email':
                    editProfileMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/email-already-in-use':
                    editProfileMessage.textContent = 'Email ini sudah digunakan oleh akun lain.';
                    break;
                case 'auth/requires-recent-login':
                    editProfileMessage.textContent = 'Tindakan ini memerlukan login ulang Anda. Silakan logout dan login kembali, lalu coba ubah email.';
                    break;
                default:
                    editProfileMessage.textContent = 'Gagal memperbarui email. Silakan coba lagi.';
                    break;
            }
        }
    });
}


// Tombol Ubah Password
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        profileDisplay.style.display = 'none';
        changePasswordForm.style.display = 'flex';
        changePasswordMessage.textContent = '';
        currentPasswordReauthInput.value = '';
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
    });
}

// Tombol Batal Ubah Password
if (cancelPasswordChangeBtn) {
    cancelPasswordChangeBtn.addEventListener('click', () => {
        changePasswordForm.style.display = 'none';
        profileDisplay.style.display = 'block';
        changePasswordMessage.textContent = '';
        changePasswordForm.reset();
    });
}

// Submit Form Ubah Password
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        changePasswordMessage.textContent = '';
        const currentPassword = currentPasswordReauthInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNew = confirmNewPasswordInput.value;
        const user = auth.currentUser;

        if (!user) {
            changePasswordMessage.textContent = 'Anda tidak terautentikasi.';
            changePasswordMessage.classList.add('error');
            return;
        }

        if (newPassword !== confirmNew) {
            changePasswordMessage.textContent = 'Password baru tidak cocok.';
            changePasswordMessage.classList.add('error');
            return;
        }

        if (newPassword.length < 6) {
            changePasswordMessage.textContent = 'Password baru minimal 6 karakter.';
            changePasswordMessage.classList.add('error');
            return;
        }

        // Re-autentikasi pengguna
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            // Ubah password setelah re-autentikasi berhasil
            await updatePassword(user, newPassword);

            changePasswordMessage.textContent = 'Password berhasil diperbarui!';
            changePasswordMessage.classList.remove('error');
            changePasswordMessage.classList.add('success');

            setTimeout(() => {
                changePasswordForm.style.display = 'none';
                profileModal.classList.remove('open'); // Tutup modal profil setelah ganti password
                changePasswordForm.reset();
            }, 1500);

        } catch (error) {
            console.error('Error saat mengubah password:', error.code, error.message);
            changePasswordMessage.classList.remove('success');
            changePasswordMessage.classList.add('error');
            switch (error.code) {
                case 'auth/wrong-password':
                    changePasswordMessage.textContent = 'Password saat ini salah.';
                    break;
                case 'auth/requires-recent-login':
                    changePasswordMessage.textContent = 'Untuk keamanan, silakan login ulang Anda dan coba lagi.';
                    break;
                case 'auth/weak-password':
                    changePasswordMessage.textContent = 'Password terlalu lemah (minimal 6 karakter).';
                    break;
                default:
                    changePasswordMessage.textContent = 'Gagal mengubah password. Silakan coba lagi.';
                    break;
            }
        }
    });
}

// Tombol Hapus Akun
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        profileDisplay.style.display = 'none';
        deleteAccountConfirmation.style.display = 'block';
        deleteAccountMessage.textContent = '';
        deletePasswordReauthInput.value = ''; // Pastikan input password kosong
    });
}

// Tombol Batal Hapus Akun
if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        deleteAccountConfirmation.style.display = 'none';
        profileDisplay.style.display = 'block';
        deleteAccountMessage.textContent = '';
        deletePasswordReauthInput.value = '';
    });
}

// Konfirmasi Hapus Akun
if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener('click', async () => {
        deleteAccountMessage.textContent = '';
        const passwordToDelete = deletePasswordReauthInput.value;
        const user = auth.currentUser;

        if (!user) {
            deleteAccountMessage.textContent = 'Anda tidak terautentikasi.';
            deleteAccountMessage.classList.add('error');
            return;
        }

        if (!passwordToDelete) {
            deleteAccountMessage.textContent = 'Masukkan password Anda untuk konfirmasi.';
            deleteAccountMessage.classList.add('error');
            return;
        }

        try {
            // Re-autentikasi pengguna sebelum menghapus
            const credential = EmailAuthProvider.credential(user.email, passwordToDelete);
            await reauthenticateWithCredential(user, credential);

            // Hapus dokumen profil dari Firestore terlebih dahulu
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            try {
                await deleteDoc(userProfileRef);
                console.log('Dokumen profil Firestore berhasil dihapus.');
            } catch (firestoreError) {
                console.warn('Gagal menghapus dokumen profil Firestore, mungkin tidak ada:', firestoreError);
                // Lanjutkan menghapus akun Auth meskipun dokumen profil gagal dihapus
            }

            // Hapus akun pengguna dari Firebase Authentication
            await deleteUser(user);

            deleteAccountMessage.textContent = 'Akun berhasil dihapus!';
            deleteAccountMessage.classList.remove('error');
            deleteAccountMessage.classList.add('success');

            setTimeout(() => {
                profileModal.classList.remove('open'); // Tutup modal profil
                // onAuthStateChanged akan menangani pembaruan UI (kembali ke "Login / Daftar")
            }, 1500);

        } catch (error) {
            console.error('Error saat menghapus akun:', error.code, error.message);
            deleteAccountMessage.classList.remove('success');
            deleteAccountMessage.classList.add('error');
            switch (error.code) {
                case 'auth/wrong-password':
                    deleteAccountMessage.textContent = 'Password salah.';
                    break;
                case 'auth/requires-recent-login':
                    deleteAccountMessage.textContent = 'Untuk keamanan, silakan login ulang dan coba lagi.';
                    break;
                default:
                    deleteAccountMessage.textContent = 'Gagal menghapus akun. Silakan coba lagi.';
                    break;
            }
        }
    });
}
