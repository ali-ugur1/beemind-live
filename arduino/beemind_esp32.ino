#include <DHT.h>
#include <Wire.h>
#include <Adafruit_BMP280.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <esp_sleep.h>

// WiFi aglari
const char* wifiList[][2] = {
  {"AUgur", "ugrugr42"},
  {"UGUR_HOME", "jSKDcrKK"},
  {"TTNET_ZyXEL_HFHY", "5D6721f39C3Ef"}
};
const int wifiCount = 3;

// Backend API
String serverUrl = "";

// DHT22
#define DHT_PIN 4
#define DHT_TYPE DHT22
DHT dht(DHT_PIN, DHT_TYPE);

// BMP280
Adafruit_BMP280 bmp;
bool bmpOk = false;

// Piezo
#define PIEZO_PIN 34

// Pil voltaji (opsiyonel - voltage divider varsa)
#define BATTERY_PIN 35

// Ayarlar
#define UYKU_SURESI_DK 5
#define WIFI_TIMEOUT_MS 8000
#define HTTP_TIMEOUT_MS 5000
#define DHT_MAX_DENEME 3
#define PIEZO_ORNEK_SURE_MS 3000

// RTC memory - deep sleep arasi korunur
RTC_DATA_ATTR int bootSayisi = 0;
RTC_DATA_ATTR int basarisizGonderim = 0;

// Sensor verileri
struct SensorData {
  float sicaklik = NAN;
  float nem = NAN;
  float basinc = NAN;
  int titresim_max = 0;
  int titresim_ort = 0;
  float pil_voltaji = NAN;
  bool dht_ok = false;
  bool bmp_ok = false;
};

void connectWiFi() {
  for (int i = 0; i < wifiCount; i++) {
    WiFi.mode(WIFI_STA);
    WiFi.setSleep(false);

    Serial.print(wifiList[i][0]);
    Serial.print(" deneniyor");
    WiFi.begin(wifiList[i][0], wifiList[i][1]);

    unsigned long basla = millis();
    while (WiFi.status() != WL_CONNECTED && (millis() - basla) < WIFI_TIMEOUT_MS) {
      delay(250);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.print("\nBaglandi! IP: ");
      Serial.print(WiFi.localIP());
      Serial.print(" | RSSI: ");
      Serial.print(WiFi.RSSI());
      Serial.println(" dBm");

      if (i == 0) {
        serverUrl = "http://172.20.10.3:3000/api/sensor-data";
      } else {
        serverUrl = "http://192.168.1.100:3000/api/sensor-data";
      }
      return;
    }
    Serial.println(" basarisiz");
    WiFi.disconnect(true, true);
    delay(200);
  }
  Serial.println("Hicbir WiFi'a baglanilamadi!");
}

void uyu() {
  Serial.print("Uyuyorum... ");
  Serial.print(UYKU_SURESI_DK);
  Serial.println(" dk sonra uyanacagim.");
  Serial.flush();

  WiFi.disconnect(true, true);
  WiFi.mode(WIFI_OFF);
  btStop();

  esp_sleep_enable_timer_wakeup((uint64_t)UYKU_SURESI_DK * 60ULL * 1000000ULL);
  esp_deep_sleep_start();
}

// DHT22 bazen hata verir - birkac deneme yap
bool dhtOku(float &sicaklik, float &nem) {
  for (int i = 0; i < DHT_MAX_DENEME; i++) {
    sicaklik = dht.readTemperature();
    nem = dht.readHumidity();
    if (!isnan(sicaklik) && !isnan(nem)) {
      return true;
    }
    Serial.println("DHT okuma hatasi, tekrar...");
    delay(2000);
  }
  return false;
}

// Piezo'yu daha duzgun ornekle
void piezoOku(int &maxDeger, int &ortDeger) {
  maxDeger = 0;
  long toplam = 0;
  long sayac = 0;
  unsigned long baslangic = millis();

  while (millis() - baslangic < PIEZO_ORNEK_SURE_MS) {
    int okunan = analogRead(PIEZO_PIN);
    if (okunan > maxDeger) maxDeger = okunan;
    toplam += okunan;
    sayac++;
    delayMicroseconds(500);
  }
  ortDeger = (sayac > 0) ? (toplam / sayac) : 0;
}

// Pil voltaji (voltage divider: 2x gerekli cogu LiPo setup'inda)
float pilVoltajiOku() {
  int raw = analogRead(BATTERY_PIN);
  // ESP32 ADC: 0-4095 -> 0-3.3V, divider 2x varsayildi
  return (raw / 4095.0) * 3.3 * 2.0;
}

String jsonOlustur(const SensorData &d, int wakeReason) {
  String json = "{";
  json += "\"hiveId\":\"hive-001\",";
  json += "\"bootCount\":" + String(bootSayisi) + ",";
  json += "\"wakeReason\":" + String(wakeReason) + ",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";

  if (d.dht_ok) {
    json += "\"temperature\":" + String(d.sicaklik, 2) + ",";
    json += "\"humidity\":" + String(d.nem, 2) + ",";
  } else {
    json += "\"temperature\":null,";
    json += "\"humidity\":null,";
  }

  if (d.bmp_ok) {
    json += "\"pressure\":" + String(d.basinc, 2) + ",";
  } else {
    json += "\"pressure\":null,";
  }

  json += "\"vibrationMax\":" + String(d.titresim_max) + ",";
  json += "\"vibrationAvg\":" + String(d.titresim_ort) + ",";

  if (!isnan(d.pil_voltaji)) {
    json += "\"batteryVoltage\":" + String(d.pil_voltaji, 2) + ",";
  }

  json += "\"failedUploads\":" + String(basarisizGonderim);
  json += "}";
  return json;
}

bool veriGonder(const String &json) {
  HTTPClient http;
  http.setTimeout(HTTP_TIMEOUT_MS);
  http.setConnectTimeout(HTTP_TIMEOUT_MS);

  if (!http.begin(serverUrl)) {
    Serial.println("HTTP begin hatasi");
    return false;
  }
  http.addHeader("Content-Type", "application/json");

  int httpCode = http.POST(json);
  bool basarili = (httpCode >= 200 && httpCode < 300);

  Serial.print("-> HTTP ");
  Serial.print(httpCode);
  if (basarili) {
    Serial.println(" Veri gonderildi!");
  } else {
    Serial.print(" Gonderim hatasi: ");
    Serial.println(http.errorToString(httpCode));
  }

  http.end();
  return basarili;
}

void setup() {
  Serial.begin(115200);
  delay(100);

  bootSayisi++;
  int wakeReason = esp_sleep_get_wakeup_cause();

  Serial.println("\n=== BeeMora uyaniyor ===");
  Serial.print("Boot #"); Serial.println(bootSayisi);
  Serial.print("Wake reason: "); Serial.println(wakeReason);

  SensorData veri;

  // DHT22 baslat
  dht.begin();

  // BMP280 baslat
  Wire.begin();
  bmpOk = bmp.begin(0x76) || bmp.begin(0x77);
  if (bmpOk) {
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                    Adafruit_BMP280::SAMPLING_X2,
                    Adafruit_BMP280::SAMPLING_X16,
                    Adafruit_BMP280::FILTER_X16,
                    Adafruit_BMP280::STANDBY_MS_500);
    veri.bmp_ok = true;
  } else {
    Serial.println("BMP280 bulunamadi!");
  }

  // Sensor isinma suresi
  delay(2000);

  // DHT oku
  veri.dht_ok = dhtOku(veri.sicaklik, veri.nem);

  // BMP oku
  if (veri.bmp_ok) {
    veri.basinc = bmp.readPressure() / 100.0;
    if (isnan(veri.basinc) || veri.basinc < 300 || veri.basinc > 1100) {
      veri.bmp_ok = false;
    }
  }

  // Piezo oku
  piezoOku(veri.titresim_max, veri.titresim_ort);

  // Pil voltaji
  veri.pil_voltaji = pilVoltajiOku();

  // Ozet yazdir
  Serial.println("=== Kovan Verileri ===");
  if (veri.dht_ok) {
    Serial.print("Sicaklik: "); Serial.print(veri.sicaklik); Serial.print(" C | ");
    Serial.print("Nem: "); Serial.print(veri.nem); Serial.println(" %");
  } else {
    Serial.println("DHT22 okunamadi!");
  }
  if (veri.bmp_ok) {
    Serial.print("Basinc: "); Serial.print(veri.basinc); Serial.println(" hPa");
  }
  Serial.print("Titresim max/ort: ");
  Serial.print(veri.titresim_max); Serial.print(" / "); Serial.println(veri.titresim_ort);
  Serial.print("Pil: "); Serial.print(veri.pil_voltaji); Serial.println(" V");

  // En az bir sensor calisiyor mu?
  if (!veri.dht_ok && !veri.bmp_ok) {
    Serial.println("Tum sensorler hatali, veri gondermiyorum.");
    basarisizGonderim++;
    uyu();
  }

  // WiFi baglan ve gonder
  connectWiFi();

  if (WiFi.status() == WL_CONNECTED) {
    String json = jsonOlustur(veri, wakeReason);
    Serial.println(json);

    if (veriGonder(json)) {
      basarisizGonderim = 0;
    } else {
      basarisizGonderim++;
    }
  } else {
    basarisizGonderim++;
  }

  uyu();
}

void loop() {
  // Deep sleep kullanildigi icin loop calismaz
}