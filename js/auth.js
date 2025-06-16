// firebaseConfig Anda. PASTIKAN INI ADALAH KONFIGURASI DARI FIREBASE CONSOLE ANDA.
// const firebaseConfig = { ... };

// === PENTING: Gunakan konfigurasi Firebase yang sesuai dengan proyek Anda ===
const firebaseConfig = {
    apiKey: "AIzaSyBBBG_rOV2fHwvzbx_CCJLnC-6JB38hMuM", 
    authDomain: "firebas-25218.firebaseapp.com",
    projectId: "firebas-25218",
    storageBucket: "firebas-25218.firebasestorage.app",
    messagingSenderId: "1067329309535",
    appId: "1:1067329309535:web:a1d24343fc0dee741fc4ea",
    measurementId: "G-TXT7HPGHRT"
};

// Impor fungsi yang diperlukan dari Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser,
    sendPasswordResetEmail,
    signInWithCustomToken,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc,
    updateDoc,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Inisialisasi aplikasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// --- Elemen UI yang akan berinteraksi ---
const authButtonLogin = document.getElementById('auth-button-login');
const authButtonProfile = document.getElementById('auth-button-profile');
const authButtonLogout = document.getElementById('auth-button-logout');
const authButtonsContainer = document.getElementById('auth-buttons-container'); // Pastikan ini ada di HTML sekarang!
const headerProfilePhoto = document.getElementById('header-profile-photo'); // Elemen untuk foto di header

const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const profileModal = document.getElementById('profile-modal');

const closeButtons = document.querySelectorAll('.close-button');

const authForm = document.getElementById('auth-form');
const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authMessage = document.getElementById('auth-message');
const switchToRegisterLink = document.getElementById('switch-to-register');
const signInWithGoogleBtn = document.getElementById('sign-in-with-google-btn');

const resetPasswordLinkContainer = document.getElementById('reset-password-link-container');
const resetPasswordLink = document.getElementById('reset-password-link');

const registerForm = document.getElementById('register-form');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
const rolePembeli = document.getElementById('role-pembeli');
const rolePenjual = document.getElementById('role-penjual');
const registerMessage = document.getElementById('register-message');
const switchToLoginLink = document.getElementById('switch-to-login');

const profilePhotoDisplay = document.getElementById('profile-photo-display');
const profileEmailSpan = document.getElementById('profile-email');
const profileRoleSpan = document.getElementById('profile-role');
const profileDisplayNameSpan = document.getElementById('profile-display-name'); // Elemen untuk menampilkan nama
const profileDisplay = document.getElementById('profile-display');

const editProfileBtn = document.getElementById('edit-profile-btn');
const profileEditForm = document.getElementById('profile-edit-form');
const profilePhotoPreview = document.getElementById('profile-photo-preview');
const profilePhotoInput = document.getElementById('profile-photo-input');
const editDisplayNameInput = document.getElementById('edit-display-name'); // Elemen untuk input nama
const editEmailInput = document.getElementById('edit-email');
const editProfileMessage = document.getElementById('edit-profile-message');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const changePasswordBtn = document.getElementById('change-password-btn');
const changePasswordForm = document.getElementById('change-password-form');
const currentPasswordReauthInput = document.getElementById('current-password-reauth');
const newPasswordInput = document.getElementById('new-password'); // Diperbaiki: Hapus `document = ` yang salah
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const changePasswordMessage = document.getElementById('change-password-message');
const cancelPasswordChangeBtn = document.getElementById('cancel-password-change-btn');

const deleteAccountBtn = document.getElementById('delete-account-btn');
const deleteAccountConfirmation = document.getElementById('delete-account-confirmation');
const deletePasswordReauthInput = document.getElementById('delete-password-reauth');
const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account-btn');
const deleteAccountMessage = document.getElementById('delete-account-message');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');


// --- Fungsi Bantuan ---

/**
 * Mengatur visibilitas tombol login/profil/logout di header.
 * Memuat data profil pengguna dari Firestore jika login.
 * @param {Object} user - Objek pengguna Firebase saat ini.
 */
const updateAuthButtonsVisibility = async (user) => {
    // Pastikan authButtonsContainer ada sebelum mencoba mengubah opacity atau display
    if (!authButtonsContainer) {
        console.error("Elemen 'auth-buttons-container' tidak ditemukan di DOM saat updateAuthButtonsVisibility!");
        return; 
    }

    if (user) {
        // Hanya tampilkan tombol-tombol jika user sudah diinisialisasi
        if (authButtonLogin) authButtonLogin.style.display = 'none';
        if (authButtonProfile) authButtonProfile.style.display = 'flex'; // Gunakan flex untuk menampung gambar saja
        if (authButtonLogout) authButtonLogout.style.display = 'inline-block';

        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        let photoURL = user.photoURL || 'https://placehold.co/32x32/CCCCCC/000000?text=P'; // Ukuran dan teks default untuk header

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.photoURL) {
                    photoURL = data.photoURL;
                }
            } else {
                console.warn(`Dokumen profil untuk user ${userId} tidak ditemukan di Firestore. Membuat dengan peran default 'Pembeli'.`);
                // Buat profil default jika tidak ada (penting untuk menjaga konsistensi data)
                // Menggunakan displayName dari Firebase Auth atau bagian email sebelum '@'
                const initialDisplayName = user.displayName || user.email.split('@')[0];
                await setDoc(userProfileRef, {
                    userType: 'pembeli',
                    email: user.email || 'N/A',
                    displayName: initialDisplayName,
                    photoURL: user.photoURL || null,
                    createdAt: new Date()
                });
                // Perbarui juga displayName di Firebase Authentication jika belum ada
                if (!user.displayName) {
                    await updateProfile(user, { displayName: initialDisplayName });
                }
                photoURL = user.photoURL || photoURL; // Gunakan foto dari Auth jika ada, atau default
            }
        } catch (error) {
            console.error("Error fetching or creating user role/photo in Firestore:", error);
            // Tetap gunakan placeholder jika terjadi error
        }
        
        // Update foto di tombol header
        if (headerProfilePhoto) {
            headerProfilePhoto.src = photoURL;
        }

    } else {
        // Jika tidak ada user (logged out)
        if (authButtonLogin) authButtonLogin.style.display = 'inline-block';
        if (authButtonProfile) authButtonProfile.style.display = 'none';
        if (authButtonLogout) authButtonLogout.style.display = 'none';
        if (headerProfilePhoto) {
            headerProfilePhoto.src = 'https://placehold.co/32x32/CCCCCC/000000?text=P';
        }
    }
};

/**
 * Memuat data profil ke modal profil.
 * @param {Object} user - Objek pengguna Firebase saat ini.
 * Memuat data profil ke modal profil.
 */
const loadProfileData = async (user) => {
    if (user) {
        if (profileEmailSpan) profileEmailSpan.textContent = user.email;
        if (profileDisplayNameSpan) profileDisplayNameSpan.textContent = user.displayName || 'Nama Tidak Disetel'; // Tampilkan nama dari Auth

        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        let currentPhotoURL = user.photoURL || 'https://placehold.co/120x120/CCCCCC/000000?text=Foto';
        let currentDisplayName = user.displayName || '';

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (profileRoleSpan) profileRoleSpan.textContent = data.userType === 'penjual' ? 'Penjual' : 'Pembeli';
                if (data.photoURL) {
                    currentPhotoURL = data.photoURL;
                }
                if (data.displayName) { // Ambil display name dari Firestore
                    currentDisplayName = data.displayName;
                    if (profileDisplayNameSpan) profileDisplayNameSpan.textContent = currentDisplayName; // Update display name di UI
                } else if (user.displayName) {
                    currentDisplayName = user.displayName;
                    if (profileDisplayNameSpan) profileDisplayNameSpan.textContent = currentDisplayName;
                }
            } else {
                if (profileRoleSpan) profileRoleSpan.textContent = 'Tidak Ditemukan (Membuat Profil...)';
            }
        } catch (error) {
            console.error("Error loading profile data from Firestore:", error);
            if (profileRoleSpan) profileRoleSpan.textContent = 'Error (Lihat Konsol)';
        }

        if (profilePhotoDisplay) profilePhotoDisplay.src = currentPhotoURL;
        if (profilePhotoPreview) profilePhotoPreview.src = currentPhotoURL;
        if (editDisplayNameInput) editDisplayNameInput.value = currentDisplayName; // Set nilai input nama
        if (editEmailInput) editEmailInput.value = user.email; // Pastikan email juga terisi
    }
};

/**
 * Menutup semua modal dan mereset form.
 */
const closeAllModalsAndResetForms = () => {
    // Gunakan classList.add('hidden') untuk menyembunyikan modal
    if (loginModal) loginModal.classList.add('hidden');
    if (registerModal) registerModal.classList.add('hidden');
    if (profileModal) profileModal.classList.add('hidden');

    if (authMessage) {
        authMessage.textContent = '';
        authMessage.className = 'text-red-500 text-sm mt-4 text-center';
    }
    if (registerMessage) {
        registerMessage.textContent = '';
        registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
    }
    if (editProfileMessage) {
        editProfileMessage.textContent = '';
        editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
    }
    if (changePasswordMessage) {
        changePasswordMessage.textContent = '';
        changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
    }
    if (deleteAccountMessage) {
        deleteAccountMessage.textContent = '';
        deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
    }

    if (authForm) authForm.reset();
    if (registerForm) registerForm.reset();
    if (profileEditForm) profileEditForm.reset();
    if (changePasswordForm) changePasswordForm.reset();
    if (deletePasswordReauthInput) deletePasswordReauthInput.value = '';
    if (profilePhotoInput) profilePhotoInput.value = '';

    if (resetPasswordLinkContainer) {
        resetPasswordLinkContainer.style.display = 'none';
    }

    if (profileDisplay) profileDisplay.classList.remove('hidden');
    if (profileEditForm) profileEditForm.classList.add('hidden');
    if (changePasswordForm) changePasswordForm.classList.add('hidden');
    if (deleteAccountConfirmation) deleteAccountConfirmation.classList.add('hidden');

    if (profilePhotoPreview && profilePhotoDisplay) {
        profilePhotoPreview.src = profilePhotoDisplay.src; // Pastikan pratinjau kembali ke foto awal
    }
};


// --- Inisialisasi & Listener Auth ---

// Inisialisasi otentikasi dengan custom token atau anonim
const initializeAuth = async () => {
    try {
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        console.log(`__app_id: ${appId}`); // Log APP ID

        // Jika __initial_auth_token didefinisikan dan memiliki nilai (bukan undefined/null/kosong)
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            console.log('Attempting to sign in with custom token...');
            await signInWithCustomToken(auth, __initial_auth_token);
            console.log('Signed in with custom token successfully.');
        } else {
            console.log('__initial_auth_token not provided or empty. Attempting to sign in anonymously...');
            await signInAnonymously(auth);
            console.log('Signed in anonymously successfully.');
        }
    } catch (error) {
        console.error('Error during initial Firebase authentication:', error);
        // Tambahkan saran untuk mengaktifkan Anonymous Auth jika ini sering terjadi
        if (error.code === 'auth/admin-restricted-operation') {
            console.warn('Firebase Error: auth/admin-restricted-operation. Ini berarti operasi autentikasi (seperti Anonymous Auth atau signInWithCustomToken) dibatasi oleh pengaturan keamanan Firebase Anda. Pastikan Anonymous Authentication diaktifkan di Firebase Console (Authentication -> Sign-in method tab) atau bahwa token kustom Anda valid dan domain aplikasi Anda terdaftar di daftar domain yang diizinkan di Firebase.');
        } else if (error.code === 'auth/unauthorized-domain') {
            console.warn('Firebase Error: auth/unauthorized-domain. Domain aplikasi Anda tidak terdaftar di Firebase Console Anda. Tambahkan URL hosting Anda ke daftar "Authorized domains" di Authentication -> Settings.');
        }
    }
};

// Panggil inisialisasi otentikasi saat script dimuat
initializeAuth();

// Listener utama untuk memantau perubahan status autentikasi Firebase
onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged triggered. User:', user ? user.email || user.uid : 'null');
    updateAuthButtonsVisibility(user); // Panggil untuk memperbarui UI header

    // Pastikan authButtonsContainer ada sebelum mengubah opacity
    if (authButtonsContainer) {
        authButtonsContainer.style.opacity = '1';
        console.log("auth-buttons-container opacity set to 1.");
    } else {
        console.error("auth-buttons-container tidak ditemukan saat onAuthStateChanged!");
    }

    if (user) {
        closeAllModalsAndResetForms();
        loadProfileData(user);
    }
});


// --- Event Listener Tombol Umum ---

closeButtons.forEach(button => {
    button.addEventListener('click', closeAllModalsAndResetForms);
});

window.addEventListener('click', (event) => {
    // Pastikan event.target adalah modal itu sendiri, bukan konten di dalamnya
    if (event.target === loginModal || event.target === registerModal || event.target === profileModal) {
        closeAllModalsAndResetForms();
    }
});


// --- Penanganan Login/Daftar & Peralihan Modal ---

if (authButtonLogin) {
    authButtonLogin.addEventListener('click', () => {
        // Gunakan classList.remove('hidden') untuk menampilkan modal
        if (loginModal) loginModal.classList.remove('hidden');
        if (authMessage) authMessage.textContent = '';
        if (authForm) authForm.reset();
        if (resetPasswordLinkContainer) {
            resetPasswordLinkContainer.style.display = 'none';
        }
    });
}

if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => {
        if (loginModal) loginModal.classList.add('hidden');
        if (registerModal) registerModal.classList.remove('hidden');
        if (authMessage) authMessage.textContent = '';
        if (authForm) authForm.reset();
    });
}

if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => {
        if (registerModal) registerModal.classList.add('hidden');
        if (loginModal) loginModal.classList.remove('hidden');
        if (registerMessage) registerMessage.textContent = '';
        if (registerForm) registerForm.reset();
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (authMessage) authMessage.textContent = '';
        if (resetPasswordLinkContainer) {
            resetPasswordLinkContainer.style.display = 'none';
        }

        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            if (authMessage) {
                authMessage.textContent = 'Login berhasil!';
                authMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat login:', error.code, error.message);
            if (authMessage) authMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    if (authMessage) authMessage.textContent = 'Login gagal: Email atau password salah.';
                    if (resetPasswordLinkContainer) {
                        resetPasswordLinkContainer.style.display = 'block';
                    }
                    break;
                case 'auth/invalid-email':
                    if (authMessage) authMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/too-many-requests':
                    if (authMessage) authMessage.textContent = 'Terlalu banyak percobaan login. Coba lagi nanti.';
                    break;
                default:
                    if (authMessage) authMessage.textContent = `Login gagal: ${error.message}`;
                    break;
            }
        }
    });
}

if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', async () => {
        const email = authEmailInput.value;
        if (email) {
            if (authMessage) {
                authMessage.textContent = 'Mengirim link reset password...';
                authMessage.className = 'text-blue-500 text-sm mt-4 text-center';
            }
            try {
                await sendPasswordResetEmail(auth, email);
                if (authMessage) {
                    authMessage.textContent = 'Link reset password telah dikirim ke email Anda!';
                    authMessage.className = 'text-green-500 text-sm mt-4 text-center';
                }
                if (resetPasswordLinkContainer) {
                    resetPasswordLinkContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Error mengirim reset password:', error.code, error.message);
                if (authMessage) authMessage.className = 'text-red-500 text-sm mt-4 text-center';
                switch (error.code) {
                    case 'auth/invalid-email':
                    case 'auth/user-not-found':
                        if (authMessage) authMessage.textContent = 'Email tidak terdaftar atau tidak valid. Silakan coba email lain.';
                        break;
                    default:
                        if (authMessage) authMessage.textContent = `Gagal mengirim link reset password: ${error.message}`;
                        break;
                }
            }
        } else {
            if (authMessage) {
                authMessage.textContent = 'Masukkan email Anda di kolom login untuk mereset password.';
                authMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
        }
    });
}


// Daftar Email/Password
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (registerMessage) registerMessage.textContent = '';
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        if (password !== confirmPassword) {
            if (registerMessage) {
                registerMessage.textContent = 'Password tidak cocok.';
                registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }
        if (password.length < 6) {
            if (registerMessage) {
                registerMessage.textContent = 'Password minimal 6 karakter.';
                registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }

        const userType = rolePenjual.checked ? 'penjual' : 'pembeli';
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Set displayName awal berdasarkan bagian email sebelum '@'
            const initialDisplayName = user.email.split('@')[0]; 

            await setDoc(doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid), {
                userType: userType,
                email: user.email,
                displayName: initialDisplayName, // Simpan nama tampilan awal
                createdAt: new Date(),
                photoURL: null
            });

            // Perbarui juga displayName di Firebase Authentication
            await updateProfile(user, {
                displayName: initialDisplayName
            });


            if (registerMessage) {
                registerMessage.textContent = 'Pendaftaran berhasil! Anda akan otomatis login.';
                registerMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            setTimeout(() => {
                if (registerModal) registerModal.classList.add('hidden');
                if (registerForm) registerForm.reset();
            }, 1500);
        } catch (error) {
            console.error('Error saat daftar:', error.code, error.message);
            if (registerMessage) registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    if (registerMessage) registerMessage.textContent = 'Email sudah terdaftar. Silakan login.';
                    break;
                case 'auth/invalid-email':
                    if (registerMessage) registerMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/weak-password':
                    if (registerMessage) registerMessage.textContent = 'Password terlalu lemah (minimal 6 karakter).';
                    break;
                default:
                    if (registerMessage) registerMessage.textContent = `Pendaftaran gagal: ${error.message}`;
                    break;
            }
        }
    });
}

// Login dengan Google
if (signInWithGoogleBtn) {
    signInWithGoogleBtn.addEventListener('click', async () => {
        if (authMessage) authMessage.textContent = '';
        if (resetPasswordLinkContainer) {
            resetPasswordLinkContainer.style.display = 'none';
        }
        const provider = new GoogleAuthProvider();

        try {
            const userCredential = await signInWithPopup(auth, provider);
            const user = userCredential.user;
            const userId = user.uid;
            const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
            const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

            const docSnap = await getDoc(userProfileRef);
            if (!docSnap.exists()) {
                // Untuk user Google baru, set display name dari Google atau default email
                const googleDisplayName = user.displayName || user.email.split('@')[0];
                await setDoc(userProfileRef, {
                    userType: 'pembeli',
                    email: user.email,
                    displayName: googleDisplayName, // Simpan nama tampilan dari Google
                    photoURL: user.photoURL || null,
                    createdAt: new Date()
                });
                console.log('Profil Google baru disimpan ke Firestore.');
                // Pastikan juga di Firebase Auth di-update (ini sering otomatis dari Google)
                if (user.displayName !== googleDisplayName) { // Hanya update jika berbeda
                    await updateProfile(user, { displayName: googleDisplayName });
                }
            } else {
                console.log('Profil Google sudah ada di Firestore.');
                // Perbarui photoURL dan displayName jika ada perubahan dari Google Auth
                const data = docSnap.data();
                let updatedDisplayNameInFirestore = data.displayName;
                let updatedPhotoURLInFirestore = data.photoURL;

                // Perbarui displayName di Firestore jika Auth displayName berbeda dan Auth displayName ada
                if (user.displayName && data.displayName !== user.displayName) {
                    updatedDisplayNameInFirestore = user.displayName;
                }
                // Perbarui photoURL di Firestore jika Auth photoURL berbeda dan Auth photoURL ada
                if (user.photoURL && data.photoURL !== user.photoURL) {
                    updatedPhotoURLInFirestore = user.photoURL;
                }

                // Lakukan update Firestore hanya jika ada perubahan yang terdeteksi
                if (updatedDisplayNameInFirestore !== data.displayName || updatedPhotoURLInFirestore !== data.photoURL) {
                    await updateDoc(userProfileRef, { 
                        photoURL: updatedPhotoURLInFirestore || null,
                        displayName: updatedDisplayNameInFirestore
                    });
                    console.log('PhotoURL/DisplayName pengguna Google diperbarui di Firestore.');
                }
            }

            if (authMessage) {
                authMessage.textContent = 'Login dengan Google berhasil!';
                authMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat login dengan Google:', error.code, error.message);
            if (authMessage) authMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    if (authMessage) authMessage.textContent = 'Login Google dibatalkan.';
                    break;
                case 'auth/cancelled-popup-request':
                    if (authMessage) authMessage.textContent = 'Permintaan login Google sudah ada yang tertunda.';
                    break;
                case 'auth/account-exists-with-different-credential':
                    if (authMessage) authMessage.textContent = 'Akun dengan email ini sudah ada dengan kredensial berbeda.';
                    break;
                default:
                    if (authMessage) authMessage.textContent = `Login Google gagal: ${error.message}`;
                    break;
            }
        }
    });
}

// Logout
if (authButtonLogout) {
    authButtonLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('Pengguna berhasil logout');
        } catch (error) {
            console.error('Error saat logout:', error);
        }
    });
}

// Buka Modal Profil
if (authButtonProfile) {
    authButtonProfile.addEventListener('click', () => {
        const user = auth.currentUser;
        if (user) {
            loadProfileData(user);
            if (profileModal) profileModal.classList.remove('hidden');
            if (profileDisplay) profileDisplay.classList.remove('hidden');
            if (profileEditForm) profileEditForm.classList.add('hidden');
            if (changePasswordForm) changePasswordForm.classList.add('hidden');
            if (deleteAccountConfirmation) deleteAccountConfirmation.classList.add('hidden');
            if (editProfileMessage) editProfileMessage.textContent = '';
            if (changePasswordMessage) changePasswordMessage.textContent = '';
            if (deleteAccountMessage) deleteAccountMessage.textContent = '';
            if (profilePhotoInput) profilePhotoInput.value = '';
        } else {
            if (loginModal) loginModal.classList.remove('hidden');
        }
    });
}


// --- Fungsionalitas Edit Profil (Email & Foto Base64, Nama) ---

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (profileDisplay) profileDisplay.classList.add('hidden');
        if (profileEditForm) profileEditForm.classList.remove('hidden');
        const user = auth.currentUser;
        if (user) {
            if (editEmailInput) editEmailInput.value = user.email;
            if (editDisplayNameInput) editDisplayNameInput.value = user.displayName || ''; // Isi input nama dengan nama Auth saat ini
        }
        if (editProfileMessage) editProfileMessage.textContent = '';
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
            if (profilePhotoPreview && profilePhotoDisplay) {
                profilePhotoPreview.src = profilePhotoDisplay.src;
            }
        }
    });
}

if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
        if (profileEditForm) profileEditForm.classList.add('hidden');
        if (profileDisplay) profileDisplay.classList.remove('hidden');
        if (editProfileMessage) editProfileMessage.textContent = '';
        if (profileEditForm) profileEditForm.reset();
        if (profilePhotoInput) profilePhotoInput.value = '';
        if (profilePhotoPreview && profilePhotoDisplay) {
            profilePhotoPreview.src = profilePhotoDisplay.src;
        }
    });
}

if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (editProfileMessage) {
            editProfileMessage.textContent = 'Menyimpan perubahan...';
            editProfileMessage.className = 'text-blue-500 text-sm mt-4 text-center';
        }
        
        const newEmail = editEmailInput.value;
        const newDisplayName = editDisplayNameInput.value.trim(); // Ambil nama baru
        const user = auth.currentUser;
        const file = profilePhotoInput.files[0];

        if (!user) {
            if (editProfileMessage) {
                editProfileMessage.textContent = 'Anda tidak terautentikasi.';
                editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }

        let photoURLToSave = user.photoURL || null;
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
        
        try {
            if (file) {
                const reader = new FileReader();
                const fileReadPromise = new Promise((resolve, reject) => {
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = error => reject(error);
                });
                reader.readAsDataURL(file);
                photoURLToSave = await fileReadPromise;
                console.log('Foto profil berhasil dikonversi ke Base64.');
            }

            // Perbarui Email di Firebase Authentication (jika berubah)
            if (newEmail !== user.email && newEmail) {
                await updateEmail(user, newEmail);
                console.log('Email di Auth berhasil diperbarui.');
            }

            // Perbarui DisplayName di Firebase Authentication (jika berubah)
            if (newDisplayName !== user.displayName) {
                await updateProfile(user, {
                    displayName: newDisplayName
                });
                console.log('Nama tampilan di Auth berhasil diperbarui.');
            }
            
            // Perbarui PhotoURL di Firebase Authentication (jika berubah atau baru)
            if (photoURLToSave !== user.photoURL) {
                 await updateProfile(user, {
                    photoURL: photoURLToSave
                });
                console.log('Photo URL di Auth berhasil diperbarui.');
            }


            // Perbarui data di Firestore
            const updateData = {
                email: newEmail,
                displayName: newDisplayName, // Simpan nama tampilan di Firestore
                photoURL: photoURLToSave,
                updatedAt: new Date()
            };
            await updateDoc(userProfileRef, updateData);
            console.log('Data profil di Firestore berhasil diperbarui.');

            if (editProfileMessage) {
                editProfileMessage.textContent = 'Profil berhasil diperbarui!';
                editProfileMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            if (profileEmailSpan) profileEmailSpan.textContent = newEmail;
            if (profileDisplayNameSpan) profileDisplayNameSpan.textContent = newDisplayName; // Update nama tampilan di UI
            if (profilePhotoDisplay) profilePhotoDisplay.src = photoURLToSave;
            if (headerProfilePhoto) headerProfilePhoto.src = photoURLToSave; // Update foto di header

            setTimeout(() => {
                if (profileEditForm) profileEditForm.classList.add('hidden');
                if (profileDisplay) profileDisplay.classList.remove('hidden');
                if (profilePhotoInput) profilePhotoInput.value = '';
                if (profilePhotoPreview && profilePhotoDisplay) {
                    profilePhotoPreview.src = profilePhotoDisplay.src;
                }
            }, 1500);

        } catch (error) {
            console.error('Error saat memperbarui profil:', error.code, error.message);
            if (editProfileMessage) editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
            let errorMessage = 'Gagal memperbarui profil. Silakan coba lagi.';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid.';
                    break;
                case 'auth/email-already-in-use':
                    errorMessage = 'Email ini sudah digunakan oleh akun lain.';
                    break;
                case 'auth/requires-recent-login':
                    errorMessage = 'Tindakan ini memerlukan login ulang Anda. Silakan logout dan login kembali, lalu coba ubah email/nama.';
                    break;
                case 'custom/file-too-large':
                    errorMessage = error.message;
                    break;
                default:
                    if (error.message && error.message.includes('Function Document.prototype.update failed: document is too large')) {
                         errorMessage = 'Foto terlalu besar! Dokumen Firestore terbatas 1MB. Silakan pilih foto yang lebih kecil.';
                    } else {
                        errorMessage = `Error: ${error.message}`;
                    }
                    break;
            }
            if (editProfileMessage) editProfileMessage.textContent = errorMessage;
        }
    });
}


// --- Fungsionalitas Ubah Password ---

if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        if (profileDisplay) profileDisplay.classList.add('hidden');
        if (changePasswordForm) changePasswordForm.classList.remove('hidden');
        if (changePasswordMessage) changePasswordMessage.textContent = '';
        if (currentPasswordReauthInput) currentPasswordReauthInput.value = '';
        if (newPasswordInput) newPasswordInput.value = '';
        if (confirmNewPasswordInput) confirmNewPasswordInput.value = '';
    });
}

if (cancelPasswordChangeBtn) {
    cancelPasswordChangeBtn.addEventListener('click', () => {
        if (changePasswordForm) changePasswordForm.classList.add('hidden');
        if (profileDisplay) profileDisplay.classList.remove('hidden');
        if (changePasswordMessage) changePasswordMessage.textContent = '';
        if (changePasswordForm) changePasswordForm.reset();
    });
}

if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (changePasswordMessage) changePasswordMessage.textContent = '';
        const currentPassword = currentPasswordReauthInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNew = confirmNewPasswordInput.value;
        const user = auth.currentUser;

        if (!user) {
            if (changePasswordMessage) {
                changePasswordMessage.textContent = 'Anda tidak terautentikasi.';
                changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }
        if (newPassword !== confirmNew) {
            if (changePasswordMessage) {
                changePasswordMessage.textContent = 'Password baru tidak cocok.';
                changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }
        if (newPassword.length < 6) {
            if (changePasswordMessage) {
                changePasswordMessage.textContent = 'Password baru minimal 6 karakter.';
                changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            if (changePasswordMessage) {
                changePasswordMessage.textContent = 'Password berhasil diperbarui!';
                changePasswordMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat mengubah password:', error.code, error.message);
            if (changePasswordMessage) changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/wrong-password':
                    if (changePasswordMessage) changePasswordMessage.textContent = 'Password saat ini salah.';
                    break;
                case 'auth/requires-recent-login':
                    if (changePasswordMessage) changePasswordMessage.textContent = 'Untuk keamanan, silakan login ulang dan coba lagi.';
                    break;
                default:
                    if (changePasswordMessage) changePasswordMessage.textContent = `Gagal mengubah password: ${error.message}`;
                    break;
            }
        }
    });
}


// --- Fungsionalitas Hapus Akun ---

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        if (profileDisplay) profileDisplay.classList.add('hidden');
        if (deleteAccountConfirmation) deleteAccountConfirmation.classList.remove('hidden');
        if (deleteAccountMessage) deleteAccountMessage.textContent = '';
        if (deletePasswordReauthInput) deletePasswordReauthInput.value = '';
    });
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        if (deleteAccountConfirmation) deleteAccountConfirmation.classList.add('hidden');
        if (profileDisplay) profileDisplay.classList.remove('hidden');
        if (deleteAccountMessage) deleteAccountMessage.textContent = '';
        if (deletePasswordReauthInput) deletePasswordReauthInput.value = '';
    });
}

if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener('click', async () => {
        if (deleteAccountMessage) deleteAccountMessage.textContent = '';
        const passwordToDelete = deletePasswordReauthInput.value;
        const user = auth.currentUser;

        if (!user) {
            if (deleteAccountMessage) {
                deleteAccountMessage.textContent = 'Anda tidak terautentikasi.';
                deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }
        if (!passwordToDelete) {
            if (deleteAccountMessage) {
                deleteAccountMessage.textContent = 'Masukkan password Anda untuk konfirmasi.';
                deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
            }
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, passwordToDelete);
            await reauthenticateWithCredential(user, credential);

            const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
            const userProfileRef = doc(db, `artifacts/${appId}/users/${user.uid}/profiles`, user.uid);
            
            try {
                await deleteDoc(userProfileRef);
                console.log('Dokumen profil Firestore berhasil dihapus.');
            } catch (firestoreError) {
                console.warn('Gagal menghapus dokumen profil Firestore, mungkin tidak ada:', firestoreError);
            }

            await deleteUser(user);
            if (deleteAccountMessage) {
                deleteAccountMessage.textContent = 'Akun berhasil dihapus!';
                deleteAccountMessage.className = 'text-green-500 text-sm mt-4 text-center';
            }
            setTimeout(closeAllModalsAndResetForms, 1500);

        } catch (error) {
            console.error('Error saat menghapus akun:', error.code, error.message);
            if (deleteAccountMessage) deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    if (deleteAccountMessage) deleteAccountMessage.textContent = 'Gagal menghapus akun: password salah.';
                    break;
                case 'auth/requires-recent-login':
                    if (deleteAccountMessage) deleteAccountMessage.textContent = 'Untuk keamanan, silakan login ulang dan coba lagi.';
                    break;
                default:
                    if (deleteAccountMessage) deleteAccountMessage.textContent = `Gagal menghapus akun: ${error.message}`;
                    break;
            }
        }
    });
}
