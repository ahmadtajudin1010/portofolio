// Mengimpor fungsi-fungsi Firebase yang diperlukan
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
    getAuth,
    signInAnonymously, // Meskipun tidak digunakan secara langsung, ini tetap diimpor untuk potensi penggunaan di masa depan jika diaktifkan
    signInWithCustomToken,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    updateProfile,
    updateEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Pastikan variabel global __app_id dan __firebase_config tersedia dari lingkungan Canvas
// Fallback ke nilai default jika tidak terdefinisi (misalnya saat pengujian lokal)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Deklarasi variabel global untuk user ID dan Firebase instances
let userId = null;
let firestoreDb = null;
let firebaseAuth = null;
let isAuthReady = false; // Status kesiapan autentikasi

// Mendapatkan elemen DOM
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const profileModal = document.getElementById('profile-modal');

const authButtonLogin = document.getElementById('auth-button-login');
const authButtonProfile = document.getElementById('auth-button-profile');
const authButtonLogout = document.getElementById('auth-button-logout');

const authEmailInput = document.getElementById('auth-email');
const authPasswordInput = document.getElementById('auth-password');
const authForm = document.getElementById('auth-form');
const authMessage = document.getElementById('auth-message');

const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const registerConfirmPasswordInput = document.getElementById('register-confirm-password');
const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const rolePembeliRadio = document.getElementById('role-pembeli');
const rolePenjualRadio = document.getElementById('role-penjual');

const switchToRegisterLink = document.getElementById('switch-to-register');
const switchToLoginLink = document.getElementById('switch-to-login');

const signInWithGoogleBtn = document.getElementById('sign-in-with-google-btn');

// Elemen profil
const headerProfilePhoto = document.getElementById('header-profile-photo');
const profilePhotoDisplay = document.getElementById('profile-photo-display');
const profileEmail = document.getElementById('profile-email');
const profileRole = document.getElementById('profile-role');
const profileDisplayName = document.getElementById('profile-display-name');

const editProfileBtn = document.getElementById('edit-profile-btn');
const changePasswordBtn = document.getElementById('change-password-btn');
const deleteAccountBtn = document.getElementById('delete-account-btn');

const profileDisplay = document.getElementById('profile-display');
const profileEditForm = document.getElementById('profile-edit-form');
const changePasswordForm = document.getElementById('change-password-form');
const deleteAccountConfirmation = document.getElementById('delete-account-confirmation');

const profilePhotoPreview = document.getElementById('profile-photo-preview');
const profilePhotoInput = document.getElementById('profile-photo-input');
const editDisplayNameInput = document.getElementById('edit-display-name');
const editEmailInput = document.getElementById('edit-email');
const editProfileMessage = document.getElementById('edit-profile-message');
const saveProfileChangesBtn = profileEditForm.querySelector('button[type="submit"]');
const cancelEditProfileBtn = document.getElementById('cancel-edit-btn');

const currentPasswordReauthInput = document.getElementById('current-password-reauth');
const newPasswordInput = document.getElementById('new-password');
const confirmNewPasswordInput = document.getElementById('confirm-new-password');
const changePasswordMessage = document.getElementById('change-password-message');
const cancelPasswordChangeBtn = document.getElementById('cancel-password-change-btn');

const deletePasswordReauthInput = document.getElementById('delete-password-reauth');
const confirmDeleteAccountBtn = document.getElementById('confirm-delete-account-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const deleteAccountMessage = document.getElementById('delete-account-message');

const resetPasswordLink = document.getElementById('reset-password-link');
const resetPasswordLinkContainer = document.getElementById('reset-password-link-container');


// Fungsi untuk menampilkan/menyembunyikan modal
function showModal(modal) {
    // Sembunyikan semua modal terlebih dahulu
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    profileModal.classList.add('hidden');
    // Tampilkan modal yang diminta
    modal.classList.remove('hidden');
}

function hideAllModals() {
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    profileModal.classList.add('hidden');
    // Reset form dan pesan error setiap kali modal disembunyikan
    resetAuthForms();
}

function resetAuthForms() {
    if (authForm) authForm.reset();
    if (authMessage) authMessage.textContent = '';
    if (registerForm) registerForm.reset();
    if (registerMessage) registerMessage.textContent = '';
    if (profileEditForm) profileEditForm.reset();
    if (editProfileMessage) editProfileMessage.textContent = '';
    if (changePasswordForm) changePasswordForm.reset();
    if (changePasswordMessage) changePasswordMessage.textContent = '';
    if (deletePasswordReauthInput) deletePasswordReauthInput.value = '';
    if (deleteAccountMessage) deleteAccountMessage.textContent = '';

    // Pastikan hanya tampilan utama profil yang terlihat saat modal profil dibuka kembali
    if (profileDisplay) profileDisplay.classList.remove('hidden');
    if (profileEditForm) profileEditForm.classList.add('hidden');
    if (changePasswordForm) changePasswordForm.classList.add('hidden');
    if (deleteAccountConfirmation) deleteAccountConfirmation.classList.add('hidden');
}

// Event Listeners untuk tombol-tombol dan modal
if (authButtonLogin) {
    authButtonLogin.addEventListener('click', () => showModal(loginModal));
}
if (authButtonProfile) {
    authButtonProfile.addEventListener('click', () => {
        showModal(profileModal);
        updateProfileModalUI(auth.currentUser); // Perbarui UI modal profil saat dibuka
    });
}
if (authButtonLogout) {
    authButtonLogout.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log("Pengguna berhasil logout.");
            // onAuthStateChanged akan menangani pembaruan UI
        } catch (error) {
            console.error("Error logout:", error);
            // Tampilkan pesan error kepada pengguna jika perlu
        }
    });
}

// Menangani klik pada tombol close di semua modal
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', hideAllModals);
});

// Menangani klik di luar modal untuk menutupnya (opsional, tergantung UX)
// Contoh untuk login modal:
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        hideAllModals();
    }
});
registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
        hideAllModals();
    }
});
profileModal.addEventListener('click', (e) => {
    if (e.target === profileModal) {
        hideAllModals();
    }
});

// Switch antara Login dan Register
if (switchToRegisterLink) {
    switchToRegisterLink.addEventListener('click', () => {
        hideAllModals();
        showModal(registerModal);
    });
}
if (switchToLoginLink) {
    switchToLoginLink.addEventListener('click', () => {
        hideAllModals();
        showModal(loginModal);
    });
}

// Fungsi untuk menyimpan data pengguna ke Firestore
async function saveUserData(user, role, displayName = null, photoURL = null) {
    if (!firestoreDb) {
        console.error("Firestore DB belum diinisialisasi.");
        return;
    }
    const userRef = doc(firestoreDb, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
    try {
        await setDoc(userRef, {
            email: user.email,
            role: role,
            displayName: displayName || user.email.split('@')[0], // Default display name
            photoURL: photoURL || user.photoURL || 'https://placehold.co/150x150/CCCCCC/000000?text=P',
            createdAt: new Date().toISOString()
        }, { merge: true }); // Menggunakan merge: true agar tidak menimpa data yang sudah ada
        console.log("Data pengguna disimpan ke Firestore:", user.uid);
    } catch (error) {
        console.error("Error menyimpan data pengguna ke Firestore:", error);
    }
}

// Fungsi untuk mendapatkan data peran pengguna dari Firestore
async function getUserRoleFromFirestore(uid) {
    if (!firestoreDb) {
        console.error("Firestore DB belum diinisialisasi.");
        return null;
    }
    const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${uid}/profile`, 'data');
    try {
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
            return docSnap.data().role;
        } else {
            console.warn("Data profil pengguna tidak ditemukan di Firestore untuk UID:", uid);
            return null;
        }
    } catch (error) {
        console.error("Error mendapatkan peran pengguna dari Firestore:", error);
        return null;
    }
}

// Login dengan Email dan Password
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = authEmailInput.value;
        const password = authPasswordInput.value;
        authMessage.textContent = ''; // Hapus pesan sebelumnya

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Pengguna berhasil login:", userCredential.user.email);
            hideAllModals(); // Sembunyikan modal setelah login berhasil
            // onAuthStateChanged akan menangani pembaruan UI
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            let errorMessage = "Terjadi kesalahan saat login.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Alamat email tidak valid.';
            } else if (error.code === 'auth/user-disabled') {
                errorMessage = 'Akun Anda telah dinonaktifkan.';
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = 'Email atau password salah.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            }
            authMessage.textContent = errorMessage;
        }
    });
}

// Daftar dengan Email dan Password
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = registerEmailInput.value;
        const password = registerPasswordInput.value;
        const confirmPassword = registerConfirmPasswordInput.value;
        const userType = document.querySelector('input[name="userType"]:checked').value;
        registerMessage.textContent = ''; // Hapus pesan sebelumnya

        if (password !== confirmPassword) {
            registerMessage.textContent = 'Konfirmasi password tidak cocok.';
            return;
        }
        if (password.length < 6) {
            registerMessage.textContent = 'Password harus minimal 6 karakter.';
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            console.log("Pengguna berhasil daftar:", userCredential.user.email);

            // Simpan data peran pengguna ke Firestore
            await saveUserData(userCredential.user, userType);

            hideAllModals(); // Sembunyikan modal setelah daftar berhasil
            // onAuthStateChanged akan menangani pembaruan UI
        } catch (error) {
            console.error("Daftar Error:", error.code, error.message);
            let errorMessage = "Terjadi kesalahan saat pendaftaran.";
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email ini sudah terdaftar.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'Alamat email tidak valid.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password terlalu lemah.';
            }
            registerMessage.textContent = errorMessage;
        }
    });
}

// Login dengan Google
if (signInWithGoogleBtn) {
    signInWithGoogleBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Login dengan Google berhasil:", user.email);

            // Periksa apakah pengguna baru atau sudah ada
            const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
            const docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                // Pengguna baru, simpan data default dan peran default (misalnya 'pembeli')
                await saveUserData(user, 'pembeli', user.displayName, user.photoURL);
            }
            
            hideAllModals(); // Sembunyikan modal setelah login berhasil
            // onAuthStateChanged akan menangani pembaruan UI
        } catch (error) {
            console.error("Login Google Error:", error.code, error.message);
            let errorMessage = "Terjadi kesalahan saat login dengan Google.";
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Jendela pop-up Google ditutup.';
            } else if (error.code === 'auth/cancelled-popup-request') {
                errorMessage = 'Permintaan pop-up Google dibatalkan.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            }
            authMessage.textContent = errorMessage;
        }
    });
}

// Fungsi untuk memperbarui UI modal profil
async function updateProfileModalUI(user) {
    if (user) {
        profileEmail.textContent = user.email || 'N/A';
        profileDisplayName.textContent = user.displayName || 'Nama Tidak Disetel';
        
        // Ambil peran dari Firestore
        const role = await getUserRoleFromFirestore(user.uid);
        profileRole.textContent = role || 'N/A';

        // Perbarui foto profil
        const photoUrl = user.photoURL || 'https://placehold.co/150x150/CCCCCC/000000?text=P';
        profilePhotoDisplay.src = photoUrl;
        profilePhotoPreview.src = photoUrl; // Juga perbarui pratinjau di form edit

        // Reset form dan tampilan
        profileDisplay.classList.remove('hidden');
        profileEditForm.classList.add('hidden');
        changePasswordForm.classList.add('hidden');
        deleteAccountConfirmation.classList.add('hidden');
        resetAuthForms(); // Pastikan semua pesan error dan input direset
    }
}

// Event Listener untuk tombol Edit Profil
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        profileEditForm.classList.remove('hidden');
        // Isi form edit dengan data saat ini
        editDisplayNameInput.value = auth.currentUser.displayName || '';
        editEmailInput.value = auth.currentUser.email || '';
    });
}

// Event Listener untuk tombol Batal di form edit profil
if (cancelEditProfileBtn) {
    cancelEditProfileBtn.addEventListener('click', () => {
        profileDisplay.classList.remove('hidden');
        profileEditForm.classList.add('hidden');
        editProfileMessage.textContent = ''; // Hapus pesan error
    });
}

// Event Listener untuk input foto profil
if (profilePhotoInput) {
    profilePhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                profilePhotoPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

// Submit form Edit Profil
if (profileEditForm) {
    profileEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            editProfileMessage.textContent = "Tidak ada pengguna yang login.";
            return;
        }

        const newDisplayName = editDisplayNameInput.value;
        const newEmail = editEmailInput.value;
        const photoFile = profilePhotoInput.files[0]; // File foto yang baru dipilih

        let changesMade = false;
        const promises = [];

        // Update Display Name
        if (newDisplayName !== user.displayName) {
            promises.push(updateProfile(user, { displayName: newDisplayName }));
            changesMade = true;
        }

        // Update Email (membutuhkan re-autentikasi jika sudah lama login)
        if (newEmail !== user.email) {
             try {
                // Re-autentikasi diperlukan jika email diubah dan sesi sudah tua
                // Untuk kesederhanaan, kita abaikan re-autentikasi di sini,
                // tapi di aplikasi nyata Anda akan membutuhkan modal konfirmasi password
                // sebelum memanggil updateEmail jika user.reauthenticateWithCredential diperlukan.
                promises.push(updateEmail(user, newEmail));
                changesMade = true;
            } catch (error) {
                if (error.code === 'auth/requires-recent-login') {
                    editProfileMessage.textContent = "Harap login ulang untuk mengubah email Anda.";
                    console.error("Error updating email: requires recent login");
                    return; // Stop here and ask for re-authentication
                } else {
                    throw error; // Re-throw other errors
                }
            }
        }

        // Handle Photo Upload (Placeholder - ini akan memerlukan Cloud Storage)
        if (photoFile) {
            // Ini adalah placeholder. Untuk implementasi nyata, Anda akan
            // mengunggah foto ke Firebase Storage dan kemudian memperbarui
            // profile.photoURL dengan URL unduhan.
            // Contoh:
            // const storageRef = ref(firebaseStorage, `profile_pictures/${user.uid}/${photoFile.name}`);
            // await uploadBytes(storageRef, photoFile);
            // const photoURL = await getDownloadURL(storageRef);
            // promises.push(updateProfile(user, { photoURL: photoURL }));
            // changesMade = true;
            console.warn("Upload foto profil memerlukan Firebase Storage. Fitur ini belum diimplementasikan.");
        }

        try {
            if (changesMade) {
                await Promise.all(promises);
                // Perbarui data di Firestore juga
                if (firestoreDb) {
                     const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
                     await setDoc(userDocRef, {
                         displayName: newDisplayName,
                         email: newEmail, // Pastikan email diperbarui juga di Firestore
                         photoURL: user.photoURL // Ini akan menjadi URL baru jika diunggah
                     }, { merge: true });
                 }
                editProfileMessage.textContent = "Profil berhasil diperbarui!";
                editProfileMessage.classList.remove('text-red-500');
                editProfileMessage.classList.add('text-green-500');
                updateProfileModalUI(user); // Perbarui UI modal profil
                // Setelah beberapa detik, kembali ke tampilan utama profil
                setTimeout(() => {
                    editProfileMessage.textContent = '';
                    editProfileMessage.classList.remove('text-green-500');
                    editProfileMessage.classList.add('text-red-500'); // Kembali ke default warna merah
                    profileDisplay.classList.remove('hidden');
                    profileEditForm.classList.add('hidden');
                }, 2000);
            } else {
                editProfileMessage.textContent = "Tidak ada perubahan yang dilakukan.";
                editProfileMessage.classList.remove('text-red-500');
                editProfileMessage.classList.add('text-gray-500');
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            let errorMessage = "Gagal memperbarui profil.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Alamat email baru tidak valid.';
            } else if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Email baru sudah digunakan oleh akun lain.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            } else if (error.code === 'auth/requires-recent-login') {
                 errorMessage = 'Untuk alasan keamanan, silakan login ulang untuk memperbarui email Anda.';
             }
            editProfileMessage.textContent = errorMessage;
            editProfileMessage.classList.remove('text-green-500');
            editProfileMessage.classList.add('text-red-500');
        }
    });
}

// Event Listener untuk tombol Ubah Password
if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        changePasswordForm.classList.remove('hidden');
    });
}

// Event Listener untuk tombol Batal di form ubah password
if (cancelPasswordChangeBtn) {
    cancelPasswordChangeBtn.addEventListener('click', () => {
        profileDisplay.classList.remove('hidden');
        changePasswordForm.classList.add('hidden');
        changePasswordMessage.textContent = ''; // Hapus pesan error
    });
}

// Submit form Ubah Password
if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            changePasswordMessage.textContent = "Tidak ada pengguna yang login.";
            return;
        }

        const currentPassword = currentPasswordReauthInput.value;
        const newPassword = newPasswordInput.value;
        const confirmNewPassword = confirmNewPasswordInput.value;
        changePasswordMessage.textContent = '';

        if (newPassword !== confirmNewPassword) {
            changePasswordMessage.textContent = 'Konfirmasi password baru tidak cocok.';
            return;
        }
        if (newPassword.length < 6) {
            changePasswordMessage.textContent = 'Password baru harus minimal 6 karakter.';
            return;
        }

        try {
            // Re-autentikasi pengguna sebelum mengubah password
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            
            await updatePassword(user, newPassword);
            changePasswordMessage.textContent = "Password berhasil diubah!";
            changePasswordMessage.classList.remove('text-red-500');
            changePasswordMessage.classList.add('text-green-500');
            // Bersihkan form
            changePasswordForm.reset();
            // Kembali ke tampilan utama profil setelah beberapa detik
            setTimeout(() => {
                changePasswordMessage.textContent = '';
                changePasswordMessage.classList.remove('text-green-500');
                changePasswordMessage.classList.add('text-red-500'); // Kembali ke default warna merah
                profileDisplay.classList.remove('hidden');
                changePasswordForm.classList.add('hidden');
            }, 2000);

        } catch (error) {
            console.error("Error changing password:", error);
            let errorMessage = "Gagal mengubah password.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Password saat ini salah.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Untuk alasan keamanan, silakan login ulang untuk mengubah password Anda.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'Password baru terlalu lemah.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            }
            changePasswordMessage.textContent = errorMessage;
            changePasswordMessage.classList.remove('text-green-500');
            changePasswordMessage.classList.add('text-red-500');
        }
    });
}


// Event Listener untuk tombol Hapus Akun
if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', () => {
        profileDisplay.classList.add('hidden');
        deleteAccountConfirmation.classList.remove('hidden');
    });
}

// Event Listener untuk tombol Batal di konfirmasi hapus akun
if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener('click', () => {
        profileDisplay.classList.remove('hidden');
        deleteAccountConfirmation.classList.add('hidden');
        deleteAccountMessage.textContent = ''; // Hapus pesan error
        deletePasswordReauthInput.value = ''; // Kosongkan input password
    });
}

// Konfirmasi Hapus Akun
if (confirmDeleteAccountBtn) {
    confirmDeleteAccountBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) {
            deleteAccountMessage.textContent = "Tidak ada pengguna yang login.";
            return;
        }

        const passwordToDelete = deletePasswordReauthInput.value;
        deleteAccountMessage.textContent = '';

        try {
            // Re-autentikasi pengguna sebelum menghapus akun
            const credential = EmailAuthProvider.credential(user.email, passwordToDelete);
            await reauthenticateWithCredential(user, credential);
            
            // Hapus data pengguna dari Firestore terlebih dahulu (opsional, tergantung kebijakan data)
            if (firestoreDb) {
                const userDocRef = doc(firestoreDb, `artifacts/${appId}/users/${user.uid}/profile`, 'data');
                await deleteDoc(userDocRef); // Menghapus dokumen profil pengguna
                console.log("Data pengguna dihapus dari Firestore.");
            }

            // Hapus akun pengguna dari Firebase Authentication
            await deleteUser(user);
            console.log("Akun berhasil dihapus!");
            hideAllModals(); // Sembunyikan modal
            // onAuthStateChanged akan menangani pembaruan UI (kembali ke tampilan login)
        } catch (error) {
            console.error("Error deleting account:", error);
            let errorMessage = "Gagal menghapus akun.";
            if (error.code === 'auth/wrong-password') {
                errorMessage = 'Password salah. Tidak dapat menghapus akun.';
            } else if (error.code === 'auth/requires-recent-login') {
                errorMessage = 'Untuk alasan keamanan, silakan login ulang untuk menghapus akun Anda.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            }
            deleteAccountMessage.textContent = errorMessage;
        }
    });
}


// Reset Password
if (resetPasswordLink) {
    resetPasswordLink.addEventListener('click', async () => {
        const email = authEmailInput.value; // Ambil email dari input login
        if (!email) {
            authMessage.textContent = 'Masukkan email Anda di kolom login untuk mereset password.';
            return;
        }
        authMessage.textContent = '';

        try {
            await sendPasswordResetEmail(auth, email);
            authMessage.textContent = 'Link reset password telah dikirim ke email Anda.';
            authMessage.classList.remove('text-red-500');
            authMessage.classList.add('text-green-500');
            resetPasswordLinkContainer.style.display = 'none'; // Sembunyikan link setelah dikirim
        } catch (error) {
            console.error("Error sending password reset email:", error);
            let errorMessage = "Gagal mengirim link reset password.";
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Alamat email tidak valid.';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'Tidak ada akun dengan email ini.';
            } else if (error.code === 'auth/network-request-failed') {
                errorMessage = 'Kesalahan jaringan. Harap periksa koneksi internet Anda.';
            }
            authMessage.textContent = errorMessage;
            authMessage.classList.remove('text-green-500');
            authMessage.classList.add('text-red-500');
        }
    });
}


// Listener untuk perubahan status autentikasi Firebase
onAuthStateChanged(auth, async (user) => {
    console.log("onAuthStateChanged triggered, user:", user);
    isAuthReady = true; // Set status siap setelah pemeriksaan autentikasi awal

    // Dapatkan referensi ke kontainer tombol autentikasi
    const authButtonsContainer = document.getElementById('auth-buttons-container');
    if (authButtonsContainer) {
        // Pastikan kontainer terlihat setelah autentikasi siap
        authButtonsContainer.style.opacity = '1'; // Pastikan terlihat
        authButtonsContainer.style.display = 'flex'; // Gunakan flexbox
    }

    if (user) {
        // Pengguna login
        userId = user.uid; // Set userId global
        firestoreDb = db; // Set firestoreDb global
        firebaseAuth = auth; // Set firebaseAuth global

        authButtonLogin.style.display = 'none';
        authButtonProfile.style.display = 'flex'; // Tampilkan ikon profil
        authButtonLogout.style.display = 'block'; // Tampilkan tombol logout

        // Perbarui foto profil di header
        if (headerProfilePhoto) {
            headerProfilePhoto.src = user.photoURL || 'https://placehold.co/32x32/CCCCCC/000000?text=P';
        }

        // Perbarui UI modal profil saat pengguna login
        await updateProfileModalUI(user);

        // Langganan ke data profil pengguna di Firestore secara real-time
        // Pastikan firestoreDb sudah diinisialisasi
        if (firestoreDb && userId) {
            const userProfileDocRef = doc(firestoreDb, `artifacts/${appId}/users/${userId}/profile`, 'data');
            onSnapshot(userProfileDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    console.log("Data profil real-time:", userData);
                    // Perbarui elemen UI yang relevan dengan data real-time
                    if (profileEmail) profileEmail.textContent = userData.email || 'N/A';
                    if (profileDisplayName) profileDisplayName.textContent = userData.displayName || 'Nama Tidak Disetel';
                    if (profileRole) profileRole.textContent = userData.role || 'N/A';
                    if (headerProfilePhoto) headerProfilePhoto.src = userData.photoURL || 'https://placehold.co/32x32/CCCCCC/000000?text=P';
                    if (profilePhotoDisplay) profilePhotoDisplay.src = userData.photoURL || 'https://placehold.co/150x150/CCCCCC/000000?text=P';
                    if (profilePhotoPreview) profilePhotoPreview.src = userData.photoURL || 'https://placehold.co/120x120/CCCCCC/000000?text=P';
                } else {
                    console.warn("Data profil real-time tidak ditemukan.");
                }
            }, (error) => {
                console.error("Error fetching real-time profile data:", error);
            });
        }
        resetPasswordLinkContainer.style.display = 'none'; // Sembunyikan link reset password jika sudah login

    } else {
        // Pengguna logout atau belum login
        userId = null; // Reset userId global
        firestoreDb = null; // Reset firestoreDb global
        firebaseAuth = null; // Reset firebaseAuth global

        authButtonLogin.style.display = 'block'; // Tampilkan tombol login/daftar
        authButtonProfile.style.display = 'none'; // Sembunyikan ikon profil
        authButtonLogout.style.display = 'none'; // Sembunyikan tombol logout
        
        if (headerProfilePhoto) {
            headerProfilePhoto.src = 'https://placehold.co/32x32/CCCCCC/000000?text=P'; // Atur ulang gambar default
        }
        resetPasswordLinkContainer.style.display = 'block'; // Tampilkan link reset password jika logout
    }
});

// Fungsi inisialisasi otentikasi awal
// Ini akan dipanggil sekali saat skrip dimuat.
async function initializeAuth() {
    console.log(`__app_id: ${appId}`);
    const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : '';

    if (initialAuthToken && initialAuthToken.trim() !== '') {
        try {
            // Coba login dengan token kustom jika disediakan
            await signInWithCustomToken(auth, initialAuthToken);
            console.log("Login dengan token kustom berhasil.");
        } catch (error) {
            console.error("Error selama autentikasi Firebase awal:", error);
            // Tangani error, misal token tidak valid
            let errorMessage = "A Firebase Error: " + error.code + ". Ini berarti operasi autentikasi (seperti Anonymous Auth atau signInWithCustomToken) dibatasi oleh pengaturan keamanan Firebase Anda. Pastikan Anonymous Authentication diaktifkan di Firebase Console (Authentication > Sign-in method tab) atau bahwa token kustom Anda valid dan domain aplikasi Anda terdaftar di daftar domain yang diizinkan di Firebase.";
            console.error(errorMessage);
        }
    } else {
        console.log("__initial_auth_token not provided or empty. Not attempting anonymous sign-in.");
        // Tidak melakukan apa-apa; UI akan dihandle oleh onAuthStateChanged jika tidak ada pengguna
        // atau jika pengguna perlu login secara eksplisit.
    }
}

// Panggil inisialisasi autentikasi saat skrip dimuat
initializeAuth();

// Ekspor instance Firebase dan userId jika Anda ingin menggunakannya di file lain
export { db as firestoreDb, auth as firebaseAuth, userId };
