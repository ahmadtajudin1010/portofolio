// Tanggal target peluncuran (contoh: 1 Januari 2026)
const launchDate = new Date('January 1, 2026 00:00:00').getTime();

const countdownElement = document.getElementById('countdown');
const backButton = document.getElementById('backButton'); // Ambil elemen tombol

// Update hitung mundur setiap 1 detik
const updateCountdown = setInterval(() => {
    const now = new Date().getTime();
    const distance = launchDate - now;

    // Perhitungan waktu untuk hari, jam, menit, dan detik
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    countdownElement.innerHTML = `${days} hari ${hours} jam ${minutes} menit ${seconds} detik`;

    // Jika hitungan mundur selesai
    if (distance < 0) {
        clearInterval(updateCountdown);
        countdownElement.innerHTML = "Situs telah diluncurkan!";
    }
}, 1000);

// Tambahkan event listener untuk tombol kembali
backButton.addEventListener('click', () => {
    window.history.back(); // Fungsi ini akan membawa pengguna ke halaman sebelumnya
});