// เปลี่ยนเป็น API Key ของคุณ
const API_KEY = 'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}';

// 1. นาฬิกา Real-time
function updateTime() {
    const now = new Date();
    document.getElementById('real-time-clock').innerText = now.toLocaleTimeString('th-TH');
    document.getElementById('current-date').innerText = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
}
setInterval(updateTime, 1000);

// 2. ตั้งค่าแผนที่
let map = L.map('map', { zoomControl: false }).setView([13.7, 100.5], 10);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png').addTo(map);
let marker = L.marker([13.7, 100.5]).addTo(map);

// 3. ฟังก์ชันดึงข้อมูลอากาศ
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=th`);
        const data = await response.json();
        updateUI(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

// 4. อัปเดตหน้าจอและเปลี่ยน Background
function updateUI(data) {
    // อัปเดตข้อความ
    document.getElementById('city-name').innerText = data.name;
    document.getElementById('main-temp').innerText = Math.round(data.main.temp);
    document.getElementById('weather-status').innerText = data.weather[0].description;
    document.getElementById('humidity').innerText = data.main.humidity;
    document.getElementById('wind').innerText = data.wind.speed;
    document.getElementById('visibility').innerText = data.visibility / 1000;
    document.getElementById('feels-like').innerText = Math.round(data.main.feels_like);

    // เปลี่ยน Background ตามสภาพอากาศ
    const mainWeather = data.weather[0].main.toLowerCase();
    document.body.className = ''; // ล้าง class เก่า
    if (mainWeather.includes('rain')) {
        document.body.classList.add('weather-rain');
    } else if (mainWeather.includes('cloud')) {
        document.body.classList.add('weather-cloudy');
    } else {
        document.body.classList.add('weather-clear');
    }

    // อัปเดตแผนที่
    const { lat, lon } = data.coord;
    map.setView([lat, lon], 12);
    marker.setLatLng([lat, lon]);

    lucide.createIcons(); // รีโหลดไอคอนใหม่
}

// 5. ระบบค้นหา
document.getElementById('cityInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather(e.target.value);
    }
});

// 6. ถามตำแหน่งปัจจุบันเมื่อเปิดเว็บครั้งแรก
window.onload = () => {
    updateTime();
    lucide.createIcons();
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric&lang=th`)
                .then(res => res.json())
                .then(data => updateUI(data));
        }, () => {
            fetchWeather('Bangkok'); // ถ้าผู้ใช้ไม่ให้พิกัด ให้โชว์กรุงเทพแทน
        });
    }
};