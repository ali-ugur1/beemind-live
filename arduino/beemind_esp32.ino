#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <WiFi.h>
#include <HTTPClient.h>

// WiFi aglari
const char* wifiList[][2] = {
  {"AUgur", "ugrugr42"},
  {"UGUR_HOME", "jSKDcrKK"},
  {"TTNET_ZyXEL_HFHY", "5D6721f39C3Ef"}
};
const int wifiCount = 3;

// Backend API - hangi WiFi'ya baglanirsa ona gore ayarlanacak
String serverUrl = "";

// DHT22
#define DHT_PIN 4
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// BMP280
Adafruit_BMP280 bmp;

// Piezo
#define PIEZO_PIN 34

#define UYKU_SURESI_DK 5

void connectWiFi() {
  for (int i = 0; i < wifiCount; i++) {
    WiFi.disconnect(true);
    delay(100);
    WiFi.mode(WIFI_STA);
    delay(100);

    Serial.print(wifiList[i][0]);
    Serial.print(" deneniyor");
    WiFi.begin(wifiList[i][0], wifiList[i][1]);

    int deneme = 0;
    while (WiFi.status() != WL_CONNECTED && deneme < 15) {
      delay(500);
      Serial.print(".");
      deneme++;
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("\nBaglandi! IP: ");
      Serial.println(WiFi.localIP());

      if (i == 0) {
        // AUgur (telefon hotspot)
        serverUrl = "http://172.20.10.3:3000/api/sensor-data";
      } else {
        // UGUR_HOME veya TTNET (ev WiFi - ayni sabit IP)
        serverUrl = "http://192.168.1.100:3000/api/sensor-data";
      }
      return;
    }
    Serial.println(" basarisiz");
    WiFi.disconnect(true);
    delay(500);
  }
  Serial.println("Hicbir WiFi'a baglanamadi!");
}

void uyu() {
  Serial.print("Uyuyorum... ");
  Serial.print(UYKU_SURESI_DK);
  Serial.println(" dakika sonra uyanacagim.");
  Serial.flush();
  WiFi.disconnect(true);
  WiFi.mode(WIFI_OFF);
  esp_sleep_enable_timer_wakeup(UYKU_SURESI_DK * 60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

void setup() {
  Serial.begin(115200);
  Serial.println("BeeMind uyaniyor...");

  dht.begin();

  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 bulunamadi!");
    uyu();
  }

  delay(2000);
  float sicaklik = dht.readTemperature();
  float nem = dht.readHumidity();
  float basinc = bmp.readPressure() / 100.0;

  int titresim_max = 0;
  unsigned long baslangic = millis();
  while (millis() - baslangic < 3000) {
    int okunan = analogRead(PIEZO_PIN);
    if (okunan > titresim_max) titresim_max = okunan;
    delay(1);
  }

  Serial.println("=== BeeMind Kovan Verileri ===");
  Serial.print("Sicaklik: "); Serial.print(sicaklik);
  Serial.print(" C | Nem: "); Serial.print(nem);
  Serial.print(" % | Basinc: "); Serial.print(basinc);
  Serial.print(" hPa | Titresim: "); Serial.println(titresim_max);

  connectWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl.c_str());
    http.addHeader("Content-Type", "application/json");

    String json = "{";
    json += "\"hiveId\":\"hive-001\",";
    json += "\"temperature\":" + String(sicaklik) + ",";
    json += "\"humidity\":" + String(nem) + ",";
    json += "\"pressure\":" + String(basinc) + ",";
    json += "\"vibration\":" + String(titresim_max);
    json += "}";

    int httpCode = http.POST(json);
    if (httpCode > 0) {
      Serial.println("-> Veri gonderildi!");
    } else {
      Serial.println("-> Gonderim hatasi");
    }
    http.end();
  }

  uyu();
}

void loop() {
}
