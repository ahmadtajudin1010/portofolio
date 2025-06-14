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
const authButtonsContainer = document.getElementById('auth-buttons-container');
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
const newPasswordInput = document = document.getElementById('new-password');
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
    if (user) {
        authButtonLogin.style.display = 'none';
        authButtonProfile.style.display = 'flex'; // Gunakan flex untuk menampung gambar saja
        authButtonLogout.style.display = 'inline-block';

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
                await setDoc(userProfileRef, {
                    userType: 'pembeli',
                    email: user.email || 'N/A',
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || null,
                    createdAt: new Date()
                });
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
        authButtonLogin.style.display = 'inline-block';
        authButtonProfile.style.display = 'none';
        authButtonLogout.style.display = 'none';
        if (headerProfilePhoto) {
            headerProfilePhoto.src = 'https://placehold.co/32x32/CCCCCC/000000?text=P';
        }
    }
};

/**
 * Memuat data profil ke modal profil.
 * @param {Object} user - Objek pengguna Firebase saat ini.
 */
const loadProfileData = async (user) => {
    if (user) {
        profileEmailSpan.textContent = user.email;
        profileDisplayNameSpan.textContent = user.displayName || 'Nama Tidak Disetel'; // Tampilkan nama dari Auth

        const userId = user.uid;
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;
        const userProfileRef = doc(db, `artifacts/${appId}/users/${userId}/profiles`, userId);

        let currentPhotoURL = user.photoURL || 'https://placehold.co/120x120/CCCCCC/000000?text=Foto';
        let currentDisplayName = user.displayName || '';

        try {
            const docSnap = await getDoc(userProfileRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                profileRoleSpan.textContent = data.userType === 'penjual' ? 'Penjual' : 'Pembeli';
                if (data.photoURL) {
                    currentPhotoURL = data.photoURL;
                }
                if (data.displayName) { // Ambil display name dari Firestore
                    currentDisplayName = data.displayName;
                    profileDisplayNameSpan.textContent = currentDisplayName; // Update display name di UI
                }
            } else {
                profileRoleSpan.textContent = 'Tidak Ditemukan (Membuat Profil...)';
            }
        } catch (error) {
            console.error("Error loading profile data from Firestore:", error);
            profileRoleSpan.textContent = 'Error (Lihat Konsol)';
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
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    profileModal.classList.add('hidden');

    authMessage.textContent = '';
    authMessage.className = 'text-red-500 text-sm mt-4 text-center';
    registerMessage.textContent = '';
    registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
    editProfileMessage.textContent = '';
    editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
    changePasswordMessage.textContent = '';
    changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
    deleteAccountMessage.textContent = '';
    deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';

    authForm.reset();
    registerForm.reset();
    profileEditForm.reset();
    changePasswordForm.reset();
    deletePasswordReauthInput.value = '';
    profilePhotoInput.value = '';

    if (resetPasswordLinkContainer) {
        resetPasswordLinkContainer.style.display = 'none';
    }

    profileDisplay.classList.remove('hidden');
    profileEditForm.classList.add('hidden');
    changePasswordForm.classList.add('hidden');
    deleteAccountConfirmation.classList.add('hidden');

    if (profilePhotoPreview) profilePhotoPreview.src = 'https://placehold.co/120x120/CCCCCC/000000?text=Foto';
};


// --- Inisialisasi & Listener Auth ---

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

// Listener utama untuk memantau perubahan status autentikasi Firebase
onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged triggered. User:', user ? user.email || user.uid : 'null');
    updateAuthButtonsVisibility(user); // Panggil untuk memperbarui UI header

    if (authButtonsContainer) {
        authButtonsContainer.style.opacity = '1';
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
    if (event.target === loginModal || event.target === registerModal || event.target === profileModal) {
        closeAllModalsAndResetForms();
    }
});


// --- Penanganan Login/Daftar & Peralihan Modal ---

if (authButtonLogin) {
    authButtonLogin.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
        authMessage.textContent = '';
        authForm.reset();
        if (resetPasswordLinkContainer) {
            resetPasswordLinkContainer.style.display = 'none';
        }
    });
}

if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => {
        loginModal.classList.add('hidden');
        registerModal.classList.remove('hidden');
        authMessage.textContent = '';
        authForm.reset();
    });
}

if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => {
        registerModal.classList.add('hidden');
        loginModal.classList.remove('hidden');
        registerMessage.textContent = '';
        registerForm.reset();
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        authMessage.textContent = '';
        if (resetPasswordLinkContainer) {
            resetPasswordLinkContainer.style.display = 'none';
        }

        const email = authEmailInput.value;
        const password = authPasswordInput.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            authMessage.textContent = 'Login berhasil!';
            authMessage.className = 'text-green-500 text-sm mt-4 text-center';
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat login:', error.code, error.message);
            authMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    authMessage.textContent = 'Login gagal: Tolong daftar jika tidak punya akun dan tolong reset password jika lupa.';
                    if (resetPasswordLinkContainer) {
                        resetPasswordLinkContainer.style.display = 'block';
                    }
                    break;
                case 'auth/invalid-email':
                    authMessage.textContent = 'Format email tidak valid.';
                    break;
                case 'auth/too-many-requests':
                    authMessage.textContent = 'Terlalu banyak percobaan login. Coba lagi nanti.';
                    break;
                default:
                    authMessage.textContent = `Login gagal: ${error.message}`;
                    break;
            }
        }
    });
}

if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', async () => {
        const email = authEmailInput.value;
        if (email) {
            authMessage.textContent = 'Mengirim link reset password...';
            authMessage.className = 'text-blue-500 text-sm mt-4 text-center';
            try {
                await sendPasswordResetEmail(auth, email);
                authMessage.textContent = 'Link reset password telah dikirim ke email Anda!';
                authMessage.className = 'text-green-500 text-sm mt-4 text-center';
                if (resetPasswordLinkContainer) {
                    resetPasswordLinkContainer.style.display = 'none';
                }
            } catch (error) {
                console.error('Error mengirim reset password:', error.code, error.message);
                authMessage.className = 'text-red-500 text-sm mt-4 text-center';
                switch (error.code) {
                    case 'auth/invalid-email':
                    case 'auth/user-not-found':
                        authMessage.textContent = 'Email tidak terdaftar atau tidak valid. Silakan coba email lain.';
                        break;
                    default:
                        authMessage.textContent = `Gagal mengirim link reset password: ${error.message}`;
                        break;
                }
            }
        } else {
            authMessage.textContent = 'Masukkan email Anda di kolom login untuk mereset password.';
            authMessage.className = 'text-red-500 text-sm mt-4 text-center';
        }
    });
}


// Daftar Email/Password
if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        registerMessage.textContent = '';
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Password tidak cocok.';
            registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }
        if (password.length < 6) {
            registerMessage.textContent = 'Password minimal 6 karakter.';
            registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }

        const userType = rolePenjual.checked ? 'penjual' : 'pembeli';
        const appId = typeof __app_id !== 'undefined' ? __app_id : firebaseConfig.projectId;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Set displayName awal berdasarkan bagian email sebelum '@'
            const initialDisplayName = email.split('@')[0]; 

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


            registerMessage.textContent = 'Pendaftaran berhasil! Anda akan otomatis login.';
            registerMessage.className = 'text-green-500 text-sm mt-4 text-center';
            setTimeout(() => {
                registerModal.classList.add('hidden');
                registerForm.reset();
            }, 1500);
        } catch (error) {
            console.error('Error saat daftar:', error.code, error.message);
            registerMessage.className = 'text-red-500 text-sm mt-4 text-center';
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
                    registerMessage.textContent = `Pendaftaran gagal: ${error.message}`;
                    break;
            }
        }
    });
}

// Login dengan Google
if (signInWithGoogleBtn) {
    signInWithGoogleBtn.addEventListener('click', async () => {
        authMessage.textContent = '';
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
                await updateProfile(user, { displayName: googleDisplayName });
            } else {
                console.log('Profil Google sudah ada di Firestore.');
                // Perbarui photoURL dan displayName jika ada perubahan dari Google Auth
                // Ambil display name dari Firestore, jika ada, kalau tidak dari Auth
                let updatedDisplayName = docSnap.data().displayName || user.displayName; 
                if (user.displayName && docSnap.data().displayName !== user.displayName) {
                    updatedDisplayName = user.displayName;
                }
                
                if (user.photoURL && docSnap.data().photoURL !== user.photoURL || 
                    updatedDisplayName !== docSnap.data().displayName) {
                    await updateDoc(userProfileRef, { 
                        photoURL: user.photoURL || null,
                        displayName: updatedDisplayName
                    });
                    console.log('PhotoURL/DisplayName pengguna Google diperbarui di Firestore.');
                }
            }

            authMessage.textContent = 'Login dengan Google berhasil!';
            authMessage.className = 'text-green-500 text-sm mt-4 text-center';
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat login dengan Google:', error.code, error.message);
            authMessage.className = 'text-red-500 text-sm mt-4 text-center';
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
                    authMessage.textContent = `Login Google gagal: ${error.message}`;
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
            profileModal.classList.remove('hidden');
            profileDisplay.classList.remove('hidden');
            profileEditForm.classList.add('hidden');
            changePasswordForm.classList.add('hidden');
            deleteAccountConfirmation.classList.add('hidden');
            editProfileMessage.textContent = '';
            changePasswordMessage.textContent = '';
            deleteAccountMessage.textContent = '';
            profilePhotoInput.value = '';
        } else {
            loginModal.classList.remove('hidden');
        }
    });
}


// --- Fungsionalitas Edit Profil (Email & Foto Base64, Nama) ---

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        profileEditForm.classList.remove('hidden');
        const user = auth.currentUser;
        if (user) {
            editEmailInput.value = user.email;
            editDisplayNameInput.value = user.displayName || ''; // Isi input nama dengan nama Auth saat ini
        }
        editProfileMessage.textContent = '';
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
        profileEditForm.classList.add('hidden');
        profileDisplay.classList.remove('hidden');
        editProfileMessage.textContent = '';
        profileEditForm.reset();
        profilePhotoInput.value = '';
        if (profilePhotoPreview && profilePhotoDisplay) {
            profilePhotoPreview.src = profilePhotoDisplay.src;
        }
    });
}

if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        editProfileMessage.textContent = 'Menyimpan perubahan...';
        editProfileMessage.className = 'text-blue-500 text-sm mt-4 text-center';
        
        const newEmail = editEmailInput.value;
        const newDisplayName = editDisplayNameInput.value.trim(); // Ambil nama baru
        const user = auth.currentUser;
        const file = profilePhotoInput.files[0];

        if (!user) {
            editProfileMessage.textContent = 'Anda tidak terautentikasi.';
            editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
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

            editProfileMessage.textContent = 'Profil berhasil diperbarui!';
            editProfileMessage.className = 'text-green-500 text-sm mt-4 text-center';
            profileEmailSpan.textContent = newEmail;
            profileDisplayNameSpan.textContent = newDisplayName; // Update nama tampilan di UI
            if (profilePhotoDisplay) profilePhotoDisplay.src = photoURLToSave;
            if (headerProfilePhoto) headerProfilePhoto.src = photoURLToSave; // Update foto di header

            setTimeout(() => {
                profileEditForm.classList.add('hidden');
                profileDisplay.classList.remove('hidden');
                profilePhotoInput.value = '';
                if (profilePhotoPreview && profilePhotoDisplay) {
                    profilePhotoPreview.src = profilePhotoDisplay.src;
                }
            }, 1500);

        } catch (error) {
            console.error('Error saat memperbarui profil:', error.code, error.message);
            editProfileMessage.className = 'text-red-500 text-sm mt-4 text-center';
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
            editProfileMessage.textContent = errorMessage;
        }
    });
}


// --- Fungsionalitas Ubah Password ---

if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        changePasswordForm.classList.remove('hidden');
        changePasswordMessage.textContent = '';
        currentPasswordReauthInput.value = '';
        newPasswordInput.value = '';
        confirmNewPasswordInput.value = '';
    });
}

if (cancelPasswordChangeBtn) {
    cancelPasswordChangeBtn.addEventListener('click', () => {
        changePasswordForm.classList.add('hidden');
        profileDisplay.classList.remove('hidden');
        changePasswordMessage.textContent = '';
        changePasswordForm.reset();
    });
}

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
            changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }
        if (newPassword !== confirmNew) {
            changePasswordMessage.textContent = 'Password baru tidak cocok.';
            changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }
        if (newPassword.length < 6) {
            changePasswordMessage.textContent = 'Password baru minimal 6 karakter.';
            changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }

        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);

            changePasswordMessage.textContent = 'Password berhasil diperbarui!';
            changePasswordMessage.className = 'text-green-500 text-sm mt-4 text-center';
            setTimeout(closeAllModalsAndResetForms, 1500);
        } catch (error) {
            console.error('Error saat mengubah password:', error.code, error.message);
            changePasswordMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/wrong-password':
                    changePasswordMessage.textContent = 'Password saat ini salah.';
                    break;
                case 'auth/requires-recent-login':
                    changePasswordMessage.textContent = 'Untuk keamanan, silakan login ulang dan coba lagi.';
                    break;
                default:
                    changePasswordMessage.textContent = `Gagal mengubah password: ${error.message}`;
                    break;
            }
        }
    });
}


// --- Fungsionalitas Hapus Akun ---

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        deleteAccountConfirmation.classList.remove('hidden');
        deleteAccountMessage.textContent = '';
        deletePasswordReauthInput.value = '';
    });
}

if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        deleteAccountConfirmation.classList.add('hidden');
        profileDisplay.classList.remove('hidden');
        deleteAccountMessage.textContent = '';
        deletePasswordReauthInput.value = '';
    });
}

if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener('click', async () => {
        deleteAccountMessage.textContent = '';
        const passwordToDelete = deletePasswordReauthInput.value;
        const user = auth.currentUser;

        if (!user) {
            deleteAccountMessage.textContent = 'Anda tidak terautentikasi.';
            deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
            return;
        }
        if (!passwordToDelete) {
            deleteAccountMessage.textContent = 'Masukkan password Anda untuk konfirmasi.';
            deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
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
            deleteAccountMessage.textContent = 'Akun berhasil dihapus!';
            deleteAccountMessage.className = 'text-green-500 text-sm mt-4 text-center';
            setTimeout(closeAllModalsAndResetForms, 1500);

        } catch (error) {
            console.error('Error saat menghapus akun:', error.code, error.message);
            deleteAccountMessage.className = 'text-red-500 text-sm mt-4 text-center';
            switch (error.code) {
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    deleteAccountMessage.textContent = 'Gagal menghapus akun: tolong ganti password jika tidak tau.';
                    break;
                case 'auth/requires-recent-login':
                    deleteAccountMessage.textContent = 'Untuk keamanan, silakan login ulang dan coba lagi.';
                    break;
                default:
                    deleteAccountMessage.textContent = `Gagal menghapus akun: ${error.message}`;
                    break;
            }
        }
    });
}
