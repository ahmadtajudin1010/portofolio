document.addEventListener('DOMContentLoaded', () => {
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
