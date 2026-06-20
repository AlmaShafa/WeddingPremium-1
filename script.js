document.addEventListener("DOMContentLoaded", () => {

    // --- 0. Menangani Nama Tamu dari URL ---
const urlParams = new URLSearchParams(window.location.search);
const guestName = urlParams.get('to'); // Mengambil data dari ?to=NamaTamu

const elGuest = document.getElementById('guest-name');

// Jika ada parameter 'to' di URL, maka ganti teksnya
if (elGuest && guestName) {
    elGuest.innerText = guestName.replace(/_/g, ' '); // Mengganti underscore dengan spasi
}
    
    // --- 1. UI Toggle (Buka Undangan & Musik) ---
    const btnOpen = document.getElementById('openInvitation');
    const cover = document.getElementById('cover');
    const mainContent = document.getElementById('main-content');
    const bgMusic = document.getElementById('bg-music');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = musicBtn ? musicBtn.querySelector('i') : null;
    let isPlaying = false;

    function adjustMusicBtn() {
        const mobileContainer = document.querySelector('.mobile-container');
        if(mobileContainer && musicBtn) {
            const rect = mobileContainer.getBoundingClientRect();
            musicBtn.style.right = (window.innerWidth - rect.right + 15) + 'px';
        }
    }
    window.addEventListener('resize', adjustMusicBtn);

    if (btnOpen) {
        btnOpen.addEventListener('click', () => {
            cover.style.transform = 'translateY(-100vh)';
            cover.style.opacity = '0';
            setTimeout(() => {
                cover.classList.add('hidden');
                mainContent.classList.remove('hidden');
                adjustMusicBtn();
                
                // Memicu trigger awal observer untuk animasi scroll (reveal) pertama
                triggerObserver();

                if (bgMusic) {
                    bgMusic.play().then(() => { 
                        isPlaying = true; 
                        if(musicIcon) musicIcon.classList.add('putar-terus');
                    }).catch(e => console.log("Autoplay di-block"));
                }
            }, 800);
        });
    }

    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (isPlaying) {
                bgMusic.pause();
                musicIcon.classList.remove('putar-terus');
            } else {
                bgMusic.play();
                musicIcon.classList.add('putar-terus');
            }
            isPlaying = !isPlaying;
        });
    }

    // --- 2. Fetch data.json ---
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderWeddingInfo(data);
            renderStreaming(data); // Fungsi render Live Stream baru
            renderPenutup(data);
            startCountdown(data.acara.tanggalCountdown);
            renderGallery(data.gallery);
            renderGifts(data.gifts);
            renderMobileBackground(data.backgroundMobile);
        })
        .catch(error => console.error("Gagal load JSON. Buka via Live Server!", error));
        // --- Tulis fungsinya di bagian bawah bersama fungsi render lainnya ---
    function renderMobileBackground(bgImageUrl) {
        if (!bgImageUrl) return;
        const mobileContainer = document.querySelector('.mobile-container');
        if (mobileContainer) {
            mobileContainer.style.backgroundImage = `url('${bgImageUrl}')`;
        }
    }

    function renderWeddingInfo(data) {
        const coupleNames = `${data.mempelai.wanita.namaPanggilan} & ${data.mempelai.pria.namaPanggilan}`;
        
        const updateText = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
        
        updateText('cover-names', coupleNames);
        updateText('intro-names', coupleNames);
        updateText('cover-date', data.acara.tanggalTeks);
        updateText('intro-date', data.acara.tanggalTeks);
        updateText('desktop-names', coupleNames);
        updateText('desktop-date', data.acara.tanggalTeks);
        updateText('nick-wanita', data.mempelai.wanita.namaPanggilan);
        updateText('full-wanita', data.mempelai.wanita.namaLengkap);
        updateText('ortu-wanita', data.mempelai.wanita.namaOrangTua);
        updateText('nick-pria', data.mempelai.pria.namaPanggilan);
        updateText('full-pria', data.mempelai.pria.namaLengkap);
        updateText('ortu-pria', data.mempelai.pria.namaOrangTua);

        // Mengubah gambar source secara dinamis berdasarkan data JSON
        const imgWanita = document.getElementById('foto-wanita');
        if (imgWanita && data.mempelai.wanita.foto) {
            imgWanita.src = data.mempelai.wanita.foto;
        }
        
        const imgPria = document.getElementById('foto-pria');
        if (imgPria && data.mempelai.pria.foto) {
            imgPria.src = data.mempelai.pria.foto;
        }

        document.querySelectorAll('.event-date-text').forEach(el => el.innerText = data.acara.tanggalTeks);
    }

    function renderStreaming(data) {
        if(data.streaming) {
            const elMsg = document.getElementById('stream-message');
            const elVideo = document.getElementById('stream-video');
            const elLink = document.getElementById('stream-link');

            if(elMsg) elMsg.innerText = data.streaming.pesan;
            if(elVideo) elVideo.innerHTML = `<iframe src="${data.streaming.url}" allowfullscreen></iframe>`;
            if(elLink) elLink.href = data.streaming.url;
        }
    }

    function renderPenutup(data) {
        const tySection = document.getElementById('thank-you-cover');
        if (tySection) {
            tySection.style.backgroundImage = `url('${data.penutup.bgImage}')`;
            const coupleNames = `${data.mempelai.wanita.namaPanggilan} & ${data.mempelai.pria.namaPanggilan}`;
            const elNames = document.getElementById('ty-names');
            const elMsg = document.getElementById('ty-message');
            
            if(elNames) elNames.innerText = coupleNames;
            if(elMsg) elMsg.innerText = data.penutup.pesan;
        }
    }

    function startCountdown(targetDateString) {
        const el = document.getElementById("countdown");
        if(!el) return;
        const targetDate = new Date(targetDateString).getTime();
        setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            if (distance < 0) { el.innerHTML = "Acara Telah Berlangsung"; return; }
            document.getElementById("days").innerText = Math.floor(distance / (1000 * 60 * 60 * 24)).toString().padStart(2, '0');
            document.getElementById("hours").innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)).toString().padStart(2, '0');
            document.getElementById("minutes").innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
            document.getElementById("seconds").innerText = Math.floor((distance % (1000 * 60)) / 1000).toString().padStart(2, '0');
        }, 1000);
    }

    function renderGallery(galleryData) {
        const container = document.getElementById('gallery-container');
        if(!container) return;
        galleryData.forEach(item => {
            if (item.type === 'video') {
                container.innerHTML += `<div class="video-item"><iframe src="${item.url}" allowfullscreen></iframe></div>`;
            } else {
                // Menangkap class orientation portrait atau landscape dari data.json
                let imgClass = item.orientation === 'landscape' ? 'landscape' : '';
                container.innerHTML += `<img src="${item.url}" class="${imgClass}" alt="Gallery">`;
            }
        });
    }

    function renderGifts(giftsData) {
        const container = document.getElementById('gift-list');
        if(!container) return;
        giftsData.forEach(gift => {
            if (gift.type === 'bank') {
                container.innerHTML += `
                    <div class="bank-card">
                        <div class="bank-header">
                            <div class="chip-icon"></div>
                            <img src="${gift.logo}" alt="Bank Logo" class="bank-logo-img">
                        </div>
                        <p class="acc-number">${gift.accountNumber}</p>
                        <p class="acc-name">${gift.accountName}</p>
                        <button class="btn-copy" onclick="copyText('${gift.accountNumber}')"><i class="fa-regular fa-copy"></i> Salin</button>
                    </div>`;
            }
            else if (gift.type === 'address') {
                container.innerHTML += `
                    <div class="bank-card address-card">
                        <i class="${gift.icon}"></i>
                        <p style="font-weight: 600; margin-bottom: 5px;">Alamat Pengiriman Kado:</p>
                        <p><strong>Nama:</strong> ${gift.recipient}</p>
                        <p><strong>Telp:</strong> ${gift.phone}</p>
                        <p><strong>Alamat:</strong> ${gift.addressText}</p>
                        <button class="btn-copy" onclick="copyText('${gift.addressText}')">
                            <i class="fa-regular fa-copy"></i> Salin Alamat
                        </button>
                    </div>`;
            }
        });
    }

    // --- 3. Toggle Fitur (Gift & Wishes) ---
    const toggleGiftBtn = document.getElementById('toggle-gift');
    const giftList = document.getElementById('gift-list');
    toggleGiftBtn.addEventListener('click', () => {
        giftList.classList.toggle('hidden');
    });

    const toggleWishesBtn = document.getElementById('toggle-wishes');
    const wishesContainer = document.getElementById('wishes-container');
    toggleWishesBtn.addEventListener('click', () => {
        wishesContainer.classList.toggle('hidden');
    });

    // --- 5. RSVP Form to Google Sheets ---
    // ---> GANTI URL INI DENGAN URL WEB APP MILIK ANDA <---
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxVmci1q0Jvqo3euxRq2rvuLQrf3jXgiBqI42mhISzcTw50DAhlIFOc2KhZWAhXJ0Ck/exec'; 
    
    const form = document.forms['submit-to-google-sheet'];
    const btnSubmit = document.getElementById('btn-submit');
    const wishesList = document.getElementById('wishes-list');
    const countWishes = document.getElementById('count-wishes');
    
    const attendanceSelect = document.getElementById('attendance');
    const jumlahSelect = document.getElementById('jumlah');

    if (attendanceSelect && jumlahSelect) {
        attendanceSelect.addEventListener('change', () => {
            if (attendanceSelect.value === 'Tidak Hadir') {
                jumlahSelect.style.display = 'none';
                jumlahSelect.removeAttribute('required');
                jumlahSelect.innerHTML = `<option value="0" selected>0</option>`; 
            } else {
                jumlahSelect.style.display = 'block';
                jumlahSelect.setAttribute('required', 'true');
                jumlahSelect.innerHTML = `
                    <option value="" disabled selected>Jumlah Kehadiran</option>
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4">4 Orang</option>
                `;
            }
        });
    }

    let totalUcapan = 0;

    form.addEventListener('submit', e => {
        e.preventDefault(); 
        
        btnSubmit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Mengirim...';
        btnSubmit.disabled = true;

        fetch(scriptURL, { method: 'POST', body: new FormData(form)})
            .then(response => {
                btnSubmit.innerHTML = 'Kirim Ucapan';
                btnSubmit.disabled = false;

                const name = document.getElementById('name').value;
                const attendance = document.getElementById('attendance').value;
                const jumlah = document.getElementById('jumlah').value;
                const message = document.getElementById('message').value;

                let statusTeks = attendance;
                if (attendance === 'Hadir' && jumlah && jumlah !== "0") {
                    statusTeks += ` (${jumlah} Orang)`;
                }

                const wishItem = document.createElement('div');
                wishItem.classList.add('wish-item');
                wishItem.innerHTML = `<h4>${name} <span><i class="fa-solid fa-check"></i> ${statusTeks}</span></h4><p>${message}</p>`;

                wishesList.insertBefore(wishItem, wishesList.firstChild);
                
                totalUcapan++;
                countWishes.innerText = totalUcapan;
                form.reset();
                
                jumlahSelect.style.display = 'block';
                jumlahSelect.setAttribute('required', 'true');
            })
            .catch(error => {
                console.error('Error!', error.message);
                alert('Gagal mengirim ucapan. Pastikan koneksi internet stabil.');
                btnSubmit.innerHTML = 'Kirim Ucapan';
                btnSubmit.disabled = false;
            });
    });

    // --- 6. Mengambil Ucapan Saat Web Dibuka (doGet) ---
    function loadWishes() {
        wishesList.innerHTML = '<p style="text-align:center; font-size:12px;"><i class="fa-solid fa-spinner fa-spin"></i> Memuat ucapan...</p>';
        
        fetch(scriptURL) 
            .then(response => response.json())
            .then(data => {
                wishesList.innerHTML = ''; 
                totalUcapan = data.length;
                countWishes.innerText = totalUcapan;

                data.forEach(item => {
                    let statusTeks = item.kehadiran;
                    if (item.kehadiran === 'Hadir' && item.jumlah && item.jumlah !== "0") {
                        statusTeks += ` (${item.jumlah} Orang)`;
                    }

                    const wishItem = document.createElement('div');
                    wishItem.classList.add('wish-item');
                    wishItem.innerHTML = `<h4>${item.nama} <span><i class="fa-solid fa-check"></i> ${statusTeks}</span></h4><p>${item.pesan}</p>`;
                    
                    wishesList.appendChild(wishItem);
                });
            })
            .catch(error => {
                console.error('Error memuat ucapan:', error);
                wishesList.innerHTML = '<p style="text-align:center; font-size:12px; color:red;">Gagal memuat daftar ucapan.</p>';
            });
    }

    loadWishes();

});

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Berhasil disalin: " + text);
    }).catch(err => console.error('Gagal menyalin: ', err));
}

    // --- 5. Animasi Scroll (Reveal) ---
    function triggerObserver() {
        const reveals = document.querySelectorAll('.reveal');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 }); // Akan muncul jika elemen sudah terlihat 10%
        
        reveals.forEach(reveal => {
            observer.observe(reveal);
        });
    }

function copyText(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert("Berhasil disalin: " + text);
    }).catch(err => console.error('Gagal menyalin: ', err));
}
