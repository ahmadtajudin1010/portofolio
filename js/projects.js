document.addEventListener('DOMContentLoaded', () => {
    // Logika Navbar Mobile untuk halaman projects.html
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

        // Menutup menu saat link diklik (untuk mobile)
        const navLinks = navList.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Hanya tutup jika lebar layar <= 768px dan menu sedang aktif
                if (window.innerWidth <= 768 && navList.classList.contains('active')) {
                    navList.classList.remove('active');
                    const toggleIcon = menuToggle.querySelector('i');
                    toggleIcon.classList.replace('fa-times', 'fa-bars');
                    menuToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    } else {
        console.error('Error: Elemen menu toggle atau nav list tidak ditemukan di HTML projects.html. Pastikan ID benar.');
    }

    // Logika animasi saat scroll (untuk elemen dengan kelas fade-in-slide-up)
    const animateElements = document.querySelectorAll('.fade-in-slide-up');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    }, {
        threshold: 0.1 // Memicu saat 10% dari elemen terlihat
    });

    animateElements.forEach(element => {
        observer.observe(element);
    });
});
