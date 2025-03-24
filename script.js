// API settings - in a real app, this would be secured with a backend proxy
const apiKey = "5d62977e1c32efad5b54aae59bca2157"; // This key may not be valid
const apiUrl = "https://api.openweathermap.org/data/2.5/weather?units=metric&q=";

// DOM elements
const searchInput = document.getElementById("search-input");
const searchButton = document.getElementById("search-button");
const weatherIcon = document.getElementById("weather-icon");
const city = document.getElementById("city");
const temperature = document.getElementById("temperature");
const description = document.getElementById("description");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const weatherInfo = document.querySelector(".weather-info");
const weatherDisplay = document.querySelector(".weather-display");
const details = document.querySelector(".details");
const errorMessage = document.getElementById("error-message");
const apiKeyReminder = document.getElementById("api-key-reminder");

// Make sure weather info is visible by default
weatherInfo.style.display = "block";

// Hide API key reminder
apiKeyReminder.style.display = "none";

// Dummy data to use when API fails (for demo purposes)
const dummyWeatherData = {
    "London": {
        name: "London",
        main: { temp: 15, humidity: 70 },
        weather: [{ description: "cloudy", icon: "04d" }],
        wind: { speed: 8 }
    },
    "New York": {
        name: "New York",
        main: { temp: 22, humidity: 65 },
        weather: [{ description: "clear sky", icon: "01d" }],
        wind: { speed: 5 }
    },
    "Tokyo": {
        name: "Tokyo",
        main: { temp: 28, humidity: 80 },
        weather: [{ description: "light rain", icon: "10d" }],
        wind: { speed: 4 }
    },
    "Paris": {
        name: "Paris",
        main: { temp: 18, humidity: 60 },
        weather: [{ description: "few clouds", icon: "02d" }],
        wind: { speed: 6 }
    },
    "Sydney": {
        name: "Sydney",
        main: { temp: 25, humidity: 55 },
        weather: [{ description: "sunny", icon: "01d" }],
        wind: { speed: 9 }
    }
};

// Add more cities to the dummy data
dummyWeatherData["Iligan City"] = {
    name: "Iligan City",
    main: { temp: 32, humidity: 75 },
    weather: [{ description: "scattered clouds", icon: "03d" }],
    wind: { speed: 3 }
};

dummyWeatherData["Manila"] = {
    name: "Manila",
    main: { temp: 33, humidity: 80 },
    weather: [{ description: "thunderstorm", icon: "11d" }],
    wind: { speed: 4 }
};

async function checkWeather(cityName) {
    // Hide any previous error messages
    errorMessage.style.display = "none";
    
    if (!cityName) {
        errorMessage.textContent = "Please enter a city name";
        errorMessage.style.display = "block";
        return;
    }
    
    // Show loading state
    city.textContent = "Loading...";
    temperature.textContent = "--°C";
    description.textContent = "--";
    humidity.textContent = "--%";
    windSpeed.textContent = "-- km/h";
    
    try {
        let data;
        let usedDummyData = false;
        
        try {
            // First try API
            const encodedCityName = encodeURIComponent(cityName);
            const response = await fetch(`${apiUrl}${encodedCityName}&appid=${apiKey}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            
            data = await response.json();
            
            if (!data || !data.main) {
                throw new Error("Invalid data received from weather API");
            }
        } 
        catch (apiError) {
            console.warn("API error, using dummy data instead:", apiError);
            
            // If API fails, use dummy data as fallback
            const cityKey = findBestMatchingCity(cityName);
            
            if (!cityKey) {
                throw new Error("City not found in our database");
            }
            
            data = dummyWeatherData[cityKey];
            usedDummyData = true;
        }
        
        // Update UI with weather data (real or dummy)
        city.textContent = data.name + (usedDummyData ? " (Demo)" : "");
        temperature.textContent = Math.round(data.main.temp) + "°C";
        description.textContent = data.weather[0].description;
        humidity.textContent = data.main.humidity + "%";
        windSpeed.textContent = data.wind.speed + " km/h";
        
        // Update weather icon
        const iconCode = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
        
        // Show weather info
        weatherInfo.style.display = "block";
        weatherDisplay.style.display = "block";
        details.style.display = "flex";
    } 
    catch (error) {
        console.error("Error fetching weather data:", error);
        
        // Display error message
        errorMessage.textContent = `Could not find weather data for: ${cityName}. Please try another city.`;
        errorMessage.style.display = "block";
        
        // Show a not found state
        city.textContent = "City not found";
        temperature.textContent = "--°C";
        description.textContent = "--";
        humidity.textContent = "--%";
        windSpeed.textContent = "-- km/h";
    }
}

// Helper function to find the best matching city in our dummy data
function findBestMatchingCity(searchTerm) {
    // Simple matching - convert to lowercase and check if the city name contains the search term
    searchTerm = searchTerm.toLowerCase();
    
    // Try exact match first
    for (const cityKey in dummyWeatherData) {
        if (cityKey.toLowerCase() === searchTerm) {
            return cityKey;
        }
    }
    
    // Then try partial match
    for (const cityKey in dummyWeatherData) {
        if (cityKey.toLowerCase().includes(searchTerm) || 
            searchTerm.includes(cityKey.toLowerCase())) {
            return cityKey;
        }
    }
    
    // Special case for "Iligan city, philippines" and similar searches
    if (searchTerm.includes("iligan")) {
        return "Iligan City";
    }
    
    return null;
}

// Event listeners
searchButton.addEventListener("click", () => {
    checkWeather(searchInput.value.trim());
});

searchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        checkWeather(searchInput.value.trim());
    }
});

// Initialize
window.addEventListener("load", () => {
    searchInput.focus();
    
    // Try to load a default city
    checkWeather("London");
    
    // Clear the search field after loading default city
    searchInput.value = "";
});

// Remove console logs meant for developers
// console.log("To use this weather app, you need to replace 'YOUR_API_KEY' with an actual OpenWeatherMap API key.");
// console.log("Get a free API key at: https://openweathermap.org/api"); 