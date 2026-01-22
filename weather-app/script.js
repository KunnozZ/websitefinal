const API_KEY = 'ใส่_API_KEY_ของคุณที่นี่';

// 1. Setup Map
let map = L.map('map', { zoomControl: false }).setView([21.0285, 105.8542], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// 2. Main Search Function
document.getElementById('citySearch').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') fetchAllData(e.target.value);
});

async function fetchAllData(city) {
    try {
        // Current Weather
        const currRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`);
        const currData = await currRes.json();
        
        // Forecast (Hourly/Daily)
        const foreRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`);
        const foreData = await foreRes.json();

        updateMainUI(currData);
        updateHourlyUI(foreData.list);
        updateDailyUI(foreData.list);
        
        // Move Map
        map.setView([currData.coord.lat, currData.coord.lon], 12);
    } catch (err) {
        alert("ไม่พบเมืองที่ค้นหา");
    }
}

function updateMainUI(data) {
    document.getElementById('temp-main').innerText = `${Math.round(data.main.temp)}°`;
    document.getElementById('desc-main').innerText = data.weather[0].main;
    document.getElementById('humidity').innerText = `${data.main.humidity}%`;
    document.getElementById('visibility').innerText = `${(data.visibility / 1609).toFixed(1)} mi`;
    document.getElementById('feels-like').innerText = `${Math.round(data.main.feels_like)}°`;
    document.getElementById('wind-speed').innerText = data.wind.speed;
    document.getElementById('wind-dir').style.transform = `rotate(${data.wind.deg}deg)`;
    lucide.createIcons();
}

function updateHourlyUI(list) {
    const container = document.getElementById('hourly-list');
    container.innerHTML = '';
    list.slice(0, 7).forEach(item => {
        const time = new Date(item.dt * 1000).getHours() + ":00";
        container.innerHTML += `
            <div class="flex flex-col items-center gap-3 min-w-[70px] p-3 rounded-2xl bg-white/5">
                <span class="text-[10px] text-gray-400">${time}</span>
                <i data-lucide="cloud-rain" class="w-5 h-5 text-blue-400"></i>
                <span class="font-bold">${Math.round(item.main.temp)}°</span>
            </div>
        `;
    });
    lucide.createIcons();
}

function updateDailyUI(list) {
    const container = document.getElementById('daily-list');
    container.innerHTML = '';
    // ดึงค่าทุกๆ 8 ไอเท็ม (24 ชม. เพราะ API ส่งทุก 3 ชม.)
    for (let i = 0; i < list.length; i += 8) {
        const day = new Date(list[i].dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
        container.innerHTML += `
            <div class="flex flex-col items-center gap-2">
                <span class="text-[10px] text-gray-500 uppercase">${day}</span>
                <i data-lucide="cloud" class="w-5 h-5"></i>
                <span class="font-bold">${Math.round(list[i].main.temp)}°</span>
            </div>
        `;
    }
    lucide.createIcons();
}

// Initial Load
fetchAllData('Hanoi');