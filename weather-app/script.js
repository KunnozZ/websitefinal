const API_KEY = 'https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&exclude={part}&appid={API key}';

// 1. ตั้งค่าแผนที่เริ่มต้น
let map = L.map('map').setView([13.7563, 100.5018], 6); // เริ่มที่ไทย

// ชั้นแผนที่พื้นฐาน (ถนน)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// ตัวแปรเก็บ Weather Layer ปัจจุบัน
let weatherLayer;
let marker;

// 2. ฟังก์ชันเปลี่ยน Layer อากาศ (ฝน, เมฆ, ลม, อุณหภูมิ)
function changeLayer(layerType) {
    // ลบ Layer เก่าออกก่อนถ้ามี
    if (weatherLayer) {
        map.removeLayer(weatherLayer);
    }

    // เพิ่ม Layer ใหม่จาก OpenWeatherMap
    weatherLayer = L.tileLayer(`https://tile.openweathermap.org/map/${layerType}/{z}/{x}/{y}.png?appid=${API_KEY}`, {
        opacity: 0.7,
        zIndex: 10
    }).addTo(map);

    // เปลี่ยนสีปุ่มที่กดให้เป็น Active (Optional)
    const buttons = document.querySelectorAll('.btn-layer');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// 3. ฟังก์ชันดึงข้อมูลอากาศและอัปเดต UI
async function fetchWeather(city) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric&lang=th`);
        const data = await response.json();

        if (data.cod !== 200) return alert("ไม่พบเมือง");

        // อัปเดตตัวเลขใน Sidebar
        document.getElementById('temp-main').innerText = `${Math.round(data.main.temp)}°`;
        document.getElementById('desc-main').innerText = data.weather[0].description;
        document.getElementById('humidity').innerText = `${data.main.humidity}%`;
        document.getElementById('feels-like').innerText = `${Math.round(data.main.feels_like)}°`;
        document.getElementById('visibility').innerText = `${(data.visibility / 1000).toFixed(1)} km`;

        // เลื่อนแผนที่ไปที่เมืองนั้น
        const { lat, lon } = data.coord;
        map.setView([lat, lon], 10);

        // ปักหมุดใหม่
        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(`📍 ตำแหน่งของคุณ: ${data.name}`)
            .openPopup();

    } catch (err) {
        console.error("Error:", err);
    }
}

// 4. ระบบค้นหา
document.getElementById('citySearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchWeather(e.target.value);
    }
});

// เริ่มต้น: ดึงข้อมูลกรุงเทพ และเปิด Layer ฝนไว้ก่อน
window.onload = () => {
    lucide.createIcons();
    fetchWeather('Bangkok');
    changeLayer('precipitation_new'); // เปิดชั้นข้อมูลฝนเป็นค่าเริ่มต้น
};