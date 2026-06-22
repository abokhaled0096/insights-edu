// ============================================================
// InsightsEdu - ESP32 + RFID (RC522) + TFT Display
// Scans RFID cards, displays status on TFT, and POSTs
// student code to Flask server for attendance
// ============================================================

#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <TFT_eSPI.h>

// WiFi Credentials
const char* ssid     = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Flask Server Endpoint
const char* serverUrl = "http://192.168.137.1:5000/scan-card";

// RFID Pins
#define SS_PIN   5
#define RST_PIN  22

MFRC522 rfid(SS_PIN, RST_PIN);
TFT_eSPI tft = TFT_eSPI();

#define COLOR_BG      TFT_BLACK
#define COLOR_PRIMARY 0xFCA0
#define COLOR_WHITE   TFT_WHITE
#define COLOR_GREEN   TFT_GREEN
#define COLOR_RED     TFT_RED

void showTitle() {
  tft.fillScreen(COLOR_BG);
  tft.setTextColor(COLOR_PRIMARY);
  tft.setTextSize(2);
  tft.setCursor(10, 10);
  tft.println("InsightsEdu");
  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 40);
  tft.println("Attendance System");
  tft.drawLine(0, 55, tft.width(), 55, COLOR_PRIMARY);
}

void showStatus(const char* msg, uint16_t color) {
  tft.fillRect(0, 65, tft.width(), 70, COLOR_BG);
  tft.setTextColor(color);
  tft.setTextSize(2);
  tft.setCursor(10, 80);
  tft.println(msg);
}

void showCardId(String cardId) {
  tft.fillRect(0, 140, tft.width(), 30, COLOR_BG);
  tft.setTextColor(COLOR_WHITE);
  tft.setTextSize(1);
  tft.setCursor(10, 145);
  tft.print("Card: ");
  tft.println(cardId);
}

String getCardUID() {
  String cardID = "";
  for (byte i = 0; i < rfid.uid.size; i++) {
    if (rfid.uid.uidByte[i] < 0x10) cardID += "0";
    cardID += String(rfid.uid.uidByte[i], HEX);
  }
  cardID.toUpperCase();
  return cardID;
}

bool sendToServer(String studentCode) {
  if (WiFi.status() != WL_CONNECTED) {
    showStatus("No WiFi!", COLOR_RED);
    return false;
  }
  HTTPClient http;
  http.begin(serverUrl);
  http.addHeader("Content-Type", "application/json");
  String body = "{\"studentCode\":\"" + studentCode + "\"}";
  Serial.print("POST: "); Serial.println(body);
  int httpCode = http.POST(body);
  String response = http.getString();
  Serial.print("Response: "); Serial.println(response);
  http.end();
  if (httpCode == 200) return true;
  return false;
}

void setup() {
  Serial.begin(115200);
  Serial.println("=== InsightsEdu RFID + TFT ===");
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(COLOR_BG);
  showTitle();
  showStatus("Starting...", COLOR_WHITE);
  SPI.begin();
  rfid.PCD_Init();
  Serial.println("RFID reader initialized");
  WiFi.begin(ssid, password);
  showStatus("WiFi...", COLOR_PRIMARY);
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500); Serial.print("."); attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println(); Serial.print("IP: "); Serial.println(WiFi.localIP());
    showStatus("Ready!", COLOR_GREEN);
  } else {
    Serial.println("WiFi failed!");
    showStatus("WiFi Error", COLOR_RED);
  }
  delay(1000);
  showTitle();
  showStatus("Scan card...", COLOR_WHITE);
}

void loop() {
  if (!rfid.PICC_IsNewCardPresent()) { delay(100); return; }
  if (!rfid.PICC_ReadCardSerial()) { delay(100); return; }
  String cardUID = getCardUID();
  Serial.print("Card: "); Serial.println(cardUID);
  showStatus("Scanning...", COLOR_PRIMARY);
  showCardId(cardUID);
  bool success = sendToServer(cardUID);
  if (success) {
    showStatus("Success!", COLOR_GREEN);
  } else {
    showStatus("Failed!", COLOR_RED);
  }
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  delay(3000);
  showTitle();
  showStatus("Scan card...", COLOR_WHITE);
}
