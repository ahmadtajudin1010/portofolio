// Konfigurasi Firebase Anda (PASTIKAN UNTUK MENGGANTI INI DENGAN KONFIGURASI DARI FIREBASE CONSOLE ANDA)
const firebaseConfig = {
    // === PENTING: PASTIKAN NILAI apiKey INI ADALAH KUNCI API ASLI DARI PROYEK FIREBASE ANDA ===
    apiKey: "AIzaSyBBBG_rOV2fHwvzbx_CCJLnC-6JB38hMuM", // <--- INI KUNCI API YANG BENAR DAN ASLI DARI FIREBASE CONSOLE ANDA!
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
    updateEmail, // Untuk mengubah email
    updatePassword, // Untuk mengubah password
    reauthenticateWithCredential, // Untuk re-autentikasi
    EmailAuthProvider, // Untuk membuat kredensial email
    deleteUser, // Untuk menghapus akun
    GoogleAuthProvider, // Import untuk Google Auth Provider
    signInWithPopup, // Import untuk signInWithPopup (login dengan popup)
    updateProfile // Import untuk updateProfile (mengubah profil Auth)
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc // Import untuk updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
// Hapus import untuk Firebase Storage karena tidak digunakan lagi
// import { 
//     getStorage, 
//     ref, 
//     uploadBytes, 
//     getDownloadURL,
//     deleteObject // Import untuk menghapus file dari Storage
// } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";


// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Dapatkan instance autentikasi Firebase
const db = getFirestore(app); // Dapatkan instance Firestore
// Hapus inisialisasi Storage karena tidak digunakan lagi
// const storage = getStorage(app); // Dapatkan instance Storage


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
const profilePhotoDisplay = document.getElementById('profile-photo-display'); // img untuk tampilan profil
const profileEmailSpan = document.getElementById('profile-email');
const profileRoleSpan = document.getElementById('profile-role');
const profileDisplay = document.getElementById('profile-display');

// Elemen Edit Profil
const editProfileBtn = document.getElementById('edit-profile-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const profilePhotoPreview = document.getElementById('profile-photo-preview'); // img untuk pratinjau di form edit
const profilePhotoInput = document.getElementById('profile-photo-input'); // input file
const editEmailInput = document.getElementById('edit-email');
const editProfileMessage = document.getElementById('edit-profile-message');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Elemen Ubah Password
const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordReauthInput = document.getElementById('current-password-reauth');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document = document.getElementById('confirm-new-password');
const changePasswordMessage = document.getElementById('change-password-message');
const cancelPasswordChangeBtn = document.getElementById('cancel-password-change-btn');

// Elemen Hapus Akun
const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteAccountConfirmation = document.getElementById('delete-account-confirmation');
const deletePasswordReauthInput = document.getElementById('delete-password-reauth');
const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account-btn');
const deleteAccountMessage = document.getElementById('delete-account-message');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');

// --- Elemen Baru untuk Login Google ---
const signInWithGoogleBtn = document.getElementById('sign-in-with-google-btn'); // ID tombol untuk login Google


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
        let photoURL = user.photoURL || 'https://placehold.co/100x100/CCCCCC/000000?text=Foto'; // Default photo URL

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                userRole = data.userType === 'penjual' ? 'Penjual' : 'Pembeli';
                // Ambil photoURL dari Firestore jika ada
                if (data.photoURL) {
                    photoURL = data.photoURL;
                }
            } else {
                console.warn(`Dokumen profil untuk user ${userId} tidak ditemukan di Firestore. Membuat dengan peran default 'Pembeli'.`);
                // Jika dokumen profil tidak ada, buat secara otomatis dengan peran 'pembeli'
                await setDoc(userProfileRef, {
                    userType: 'pembeli', // Tetapkan 'pembeli' sebagai peran default jika profil kosong
                    email: user.email || 'N/A', // Gunakan email pengguna atau 'N/A'
                    displayName: user.displayName || 'Pengguna Baru', // Gunakan nama tampilan atau default
                    photoURL: user.photoURL || null, // Simpan foto URL dari Auth jika ada, atau null
                    createdAt: new Date()
                });
                userRole = 'Pembeli (Otomatis)'; // Informasikan bahwa peran diatur otomatis
                photoURL = user.photoURL || photoURL; // Gunakan foto Auth jika ada
            }
        } catch (error) {
            console.error("Error fetching or creating user role/photo in Firestore:", error);
            userRole = 'Error (Lihat Konsol)'; // Pesan lebih informatif
        }
        authButtonProfile.textContent = `Profil Saya (${userRole})`;
        if (profilePhotoDisplay) {
            profilePhotoDisplay.src = photoURL; // Set foto profil di tampilan utama modal
        }

    } else {
        authButtonLogin.style.display = 'inline-block'; // Tampilkan Login/Daftar
        authButtonProfile.style.display = 'none'; // Sembunyikan Profil Saya
        authButtonLogout.style.display = 'none'; // Sembunyikan Logout
        // Reset foto profil ke default saat logout
        if (profilePhotoDisplay) {
            profilePhotoDisplay.src = 'https://placehold.co/100x100/CCCCCC/000000?text=Foto';
        }
    }
};

// --- Fungsi untuk Memuat Data Profil ke Modal ---
const loadProfileData = async (user) => {
    if (user) {
        profileEmailSpan.textContent = user.email;

        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        let currentPhotoURL = 'https://placehold.co/100x100/CCCCCC/000000?text=Foto'; // Default placeholder

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                profileRoleSpan.textContent = data.userType === 'penjual' ? 'Penjual' : 'Pembeli';
                if (data.photoURL) {
                    currentPhotoURL = data.photoURL;
                }
            } else {
                profileRoleSpan.textContent = 'Tidak Ditemukan (Membuat Profil...)'; // Pesan lebih spesifik
                // Jika profil tidak ada, pastikan juga foto profilenya diupdate ke default
            }
        } catch (error) {
            console.error("Error loading profile data from Firestore:", error); // Pesan error lebih jelas
            profileRoleSpan.textContent = 'Error (Lihat Konsol)'; // Pesan lebih informatif
        }

        // Set foto profil di tampilan profil dan pratinjau edit
        if (profilePhotoDisplay) profilePhotoDisplay.src = currentPhotoURL;
        if (profilePhotoPreview) profilePhotoPreview.src = currentPhotoURL;

    }
};

// Inisialisasi otentikasi. Tidak akan melakukan login anonim otomatis.
const initializeAuth = async () => {
    try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log('Signed in with custom token.');
        } else {
            console.log('No custom token found or anonymous login not desired. User will be prompted to login/register.');
            // Tidak ada signInAnonymously() di sini
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
        profilePhotoInput.value = ''; // Reset input file foto

        // Pastikan tampilan awal profil setelah menutup modal
        profileDisplay.style.display = 'block';
        profileEditForm.style.display = 'none';
        changePasswordForm.style.display = 'none';
        deleteAccountConfirmation.style.display = 'none';
        
        // Reset pratinjau foto profil
        if (profilePhotoPreview) profilePhotoPreview.src = 'https://placehold.co/100x100/CCCCCC/000000?text=Foto';
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
        profilePhotoInput.value = ''; // Reset input file foto
        profileDisplay.style.display = 'block';
        profileEditForm.style.display = 'none';
        changePasswordForm.style.display = 'none';
        deleteAccountConfirmation.style.display = 'none';
        // Reset pratinjau foto profil
        if (profilePhotoPreview) profilePhotoPreview.src = 'https://placehold.co/100x100/CCCCCC/000000?text=Foto';
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


// --- Penanganan Form Login Email/Password ---
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
                case 'auth/api-key-not-valid':
                    authMessage.textContent = 'Konfigurasi Firebase API Key tidak valid. Silakan periksa konsol Firebase Anda.';
                    break;
                default:
                    authMessage.textContent = 'Login gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}

// --- Penanganan Form Daftar Email/Password ---
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

        let userType = 'pembeli'; // Peran default untuk pendaftaran email/password baru
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
                case 'auth/api-key-not-valid':
                    registerMessage.textContent = 'Konfigurasi Firebase API Key tidak valid. Silakan periksa konsol Firebase Anda.';
                    break;
                default:
                    registerMessage.textContent = 'Pendaftaran gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}

// --- Penanganan Login dengan Google ---
if (signInWithGoogleBtn) {
    signInWithGoogleBtn.addEventListener('click', async () => {
        authMessage.textContent = ''; // Bersihkan pesan error sebelumnya
        const provider = new GoogleAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            const userId = user.uid;
            const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
            const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

            // Periksa apakah pengguna baru atau sudah ada di Firestore (bukan hanya Auth)
            const docSnap = await getDoc(userProfileRef);
            if (!docSnap.exists()) {
                // Pengguna baru atau pengguna lama tanpa profil Firestore, simpan profil dengan peran default (misal: 'pembeli')
                await setDoc(userProfileRef, {
                    userType: 'pembeli', // Tetapkan 'pembeli' sebagai peran default untuk login Google baru/profil kosong
                    email: user.email,
                    displayName: user.displayName, // Simpan nama tampilan dari Google
                    photoURL: user.photoURL || null, // Simpan URL foto dari Google Auth, atau null jika tidak ada
                    createdAt: new Date()
                });
                console.log('Profil pengguna Google baru/kosong disimpan ke Firestore dengan peran "Pembeli".');
            } else {
                console.log('Profil pengguna Google sudah ada di Firestore.');
                // Jika profil sudah ada, pastikan photoURL di Firestore diperbarui dari Auth
                if (user.photoURL && docSnap.data().photoURL !== user.photoURL) {
                    await updateDoc(userProfileRef, { photoURL: user.photoURL });
                    console.log('PhotoURL pengguna Google diperbarui di Firestore.');
                }
            }

            authMessage.textContent = 'Login dengan Google berhasil!';
            authMessage.classList.remove('error');
            authMessage.classList.add('success');
            setTimeout(() => {
                loginModal.classList.remove('open');
            }, 1500);
        } catch (error) {
            console.error('Error saat login dengan Google:', error.code, error.message);
            authMessage.classList.remove('success');
            authMessage.classList.add('error');
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    authMessage.textContent = 'Login Google dibatalkan.';
                    break;
                case 'auth/cancelled-popup-request':
                    authMessage.textContent = 'Permintaan login Google sudah ada yang tertunda.';
                    break;
                case 'auth/account-exists-with-different-credential':
                    authMessage.textContent = 'Akun dengan email ini sudah ada dengan kredensial berbeda.';
                    break;
                default:
                    authMessage.textContent = 'Login Google gagal. Silakan coba lagi.';
                    break;
            }
        }
    });
}


// --- Penanganan Tombol di Header ---
if (authButtonLogin) {
    authButtonLogin.addEventListener('click', () => {
        loginModal.classList.add('open');
        authMessage.textContent = ''; // Bersihkan pesan saat modal dibuka
        authForm.reset();
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
            profilePhotoInput.value = ''; // Reset input file saat modal dibuka
            // Set pratinjau foto ke foto yang sudah ada saat membuka profil
            if (profilePhotoPreview && profilePhotoDisplay) {
                profilePhotoPreview.src = profilePhotoDisplay.src;
            }
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
        // Set pratinjau foto ke foto yang saat ini ditampilkan di profil
        if (profilePhotoPreview && profilePhotoDisplay) {
            profilePhotoPreview.src = profilePhotoDisplay.src;
        }
    });
}

// Pratinjau gambar saat file dipilih
if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (profilePhotoPreview) {
                    profilePhotoPreview.src = e.target.result;
                }
            };
            reader.readAsDataURL(file);
        } else {
            // Jika tidak ada file yang dipilih, kembali ke foto yang ada atau placeholder
            if (profilePhotoPreview && profilePhotoDisplay) {
                profilePhotoPreview.src = profilePhotoDisplay.src;
            }
        }
    });
}

// Tombol Batal Edit Profil
if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        profileEditForm.style.display = 'none';
        profileDisplay.style.display = 'block';
        editProfileMessage.textContent = '';
        profileEditForm.reset();
        profilePhotoInput.value = ''; // Reset input file
        // Kembalikan pratinjau foto ke foto yang ada di tampilan profil
        if (profilePhotoPreview && profilePhotoDisplay) {
            profilePhotoPreview.src = profilePhotoDisplay.src;
        }
    });
}

// Submit Form Edit Profil (Email dan Foto Profil)
if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        editProfileMessage.textContent = 'Menyimpan perubahan...';
        editProfileMessage.classList.remove('error', 'success');
        editProfileMessage.classList.add('info'); // Gaya baru untuk 'info'
        
        const newEmail = editEmailInput.value;
        const user = auth.currentUser;
        const file = profilePhotoInput.files[0]; // Ambil file yang dipilih

        if (!user) {
            editProfileMessage.textContent = 'Anda tidak terautentikasi.';
            editProfileMessage.classList.remove('info');
            editProfileMessage.classList.add('error');
            return;
        }

        let photoURLToSave = user.photoURL || null; // Ambil URL foto yang sudah ada di Auth
        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
        
        try {
            // Konversi dan simpan foto sebagai Base64 jika ada file baru
            if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                await new Promise((resolve, reject) => {
                    reader.onload = () => {
                        photoURLToSave = reader.result; // Ini adalah string Base64
                        resolve();
                    };
                    reader.onerror = error => reject(error);
                });
                console.log('Foto profil berhasil dikonversi ke Base64.');
            }

            // 1. Perbarui Email di Firebase Authentication (jika berubah)
            if (newEmail !== user.email && newEmail) { // Pastikan email tidak kosong
                await updateEmail(user, newEmail);
                console.log('Email di Auth berhasil diperbarui.');
            }

            // 2. Perbarui Profil di Firebase Authentication (untuk displayName dan photoURL)
            // Ini akan memastikan photoURL di Auth juga diperbarui
            await updateProfile(user, {
                photoURL: photoURLToSave // Simpan string Base64 di photoURL Auth
            });
            console.log('Profil pengguna di Auth berhasil diperbarui.');

            // 3. Perbarui data di Firestore
            const updateData = {
                email: newEmail,
                photoURL: photoURLToSave, // Simpan string Base64 di Firestore
                updatedAt: new Date()
            };
            await updateDoc(userProfileRef, updateData);
            console.log('Data profil di Firestore berhasil diperbarui.');

            editProfileMessage.textContent = 'Profil berhasil diperbarui!';
            editProfileMessage.classList.remove('error', 'info');
            editProfileMessage.classList.add('success');
            profileEmailSpan.textContent = newEmail; // Perbarui tampilan email
            if (profilePhotoDisplay) profilePhotoDisplay.src = photoURLToSave; // Perbarui tampilan foto

            setTimeout(() => {
                profileEditForm.style.display = 'none';
                profileDisplay.style.display = 'block';
                profilePhotoInput.value = ''; // Reset input file
                // Pastikan pratinjau kembali ke foto yang baru diunggah
                if (profilePhotoPreview && profilePhotoDisplay) {
                    profilePhotoPreview.src = profilePhotoDisplay.src;
                }
            }, 1500);

        } catch (error) {
            console.error('Error saat memperbarui profil:', error.code, error.message);
            editProfileMessage.classList.remove('info', 'success');
            editProfileMessage.classList.add('error');
            let errorMessage = 'Gagal memperbarui profil. Silakan coba lagi.';
            // Error khusus untuk ukuran Base64 jika melebihi batas Firestore
            if (error.code === 'resource-exhausted') { // Contoh error code jika melebihi batas
                errorMessage = 'Foto terlalu besar! Ukuran dokumen Firestore terbatas 1MB. Silakan pilih foto yang lebih kecil.';
            }
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email ini sudah digunakan oleh akun lain.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Tindakan ini memerlukan login ulang Anda. Silakan logout dan login kembali, lalu coba ubah email.';
                    break;
                default:
                    errorMessage = `Error: ${error.message}`; // Tampilkan pesan error spesifik jika tidak ditangani
                    break;
            }
            editProfileMessage.textContent = errorMessage;
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
                // Tidak perlu menghapus dari Storage lagi
                // const docSnap = await getDoc(userProfileRef);
                // if (docSnap.exists() && docSnap.data().photoURL) {
                //     const photoURL = docSnap.data().photoURL;
                //     const photoRef = ref(storage, photoURL); // Buat referensi dari URL
                //     await deleteObject(photoRef);
                //     console.log('Foto profil Storage berhasil dihapus.');
                // }
                await deleteDoc(userProfileRef);
                console.log('Dokumen profil Firestore berhasil dihapus.');
            } catch (firestoreError) {
                console.warn('Gagal menghapus dokumen profil Firestore, mungkin tidak ada atau error izin:', firestoreError);
                // Lanjutkan menghapus akun Auth meskipun ada error di sini
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
