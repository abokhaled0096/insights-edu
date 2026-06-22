// ============================================================
// InsightsEdu - ESP32-CAM Module (AI-Thinker Board)
// Hosts a local webserver on port 80 with /capture endpoint
// Returns VGA JPEG frames for face recognition
// ============================================================

#include "esp_camera.h"
#include <WiFi.h>
#include <WebServer.h>

// ========================
// WiFi Hotspot Credentials
// ========================
const char* ssid     = "CS";
const char* password = "123456789";

// ========================
// Static IP Configuration (10.123.127.x subnet - Mobile hotspot)
// ========================
IPAddress staticIP(10, 123, 127, 184);  // Fixed IP for the Camera
IPAddress gateway(10, 123, 127, 208);   // Phone Gateway
IPAddress subnet(255, 255, 255, 0);
IPAddress dns(8, 8, 8, 8);

// ========================
// Web Server on Port 80
// ========================
WebServer server(80);

// ============================================================
// AI-Thinker ESP32-CAM Pin Definitions
// ============================================================
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27

#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

// Built-in LED (flash)
#define LED_GPIO_NUM       4

// ============================================================
// /capture - Capture and return a JPEG frame
// ============================================================
void handleCapture() {
  camera_fb_t* fb = esp_camera_fb_get();

  if (!fb) {
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  server.sendHeader("Content-Type", "image/jpeg");
  server.sendHeader("Content-Length", String(fb->len));
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);

  esp_camera_fb_return(fb);
}

// ============================================================
// / - Health check endpoint
// ============================================================
void handleRoot() {
  server.send(200, "text/plain", "InsightsEdu ESP32-CAM Active");
}

// ============================================================
// Initialize Camera with AI-Thinker config
// ============================================================
void startCamera() {
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;  // Lowered to 10MHz for stability with cheap OV2640 modules
  config.pixel_format = PIXFORMAT_JPEG;

  // VGA resolution with good quality
  config.frame_size   = FRAMESIZE_VGA;  // 640x480
  config.jpeg_quality = 10;             // 0-63, lower = better quality
  config.fb_count     = 1;

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x\n", err);
    return;
  }

  Serial.println("Camera initialized successfully");
}

// ============================================================
// setup() - Runs once on boot
// ============================================================
void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("=== InsightsEdu ESP32-CAM ===");

  // Initialize LED
  pinMode(LED_GPIO_NUM, OUTPUT);
  digitalWrite(LED_GPIO_NUM, LOW);

  // Start camera
  startCamera();

  // Apply static IP before connecting
  WiFi.config(staticIP, gateway, subnet, dns);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println();
    Serial.println("WiFi connection failed! Will retry in background.");
  }

  // Register HTTP endpoints
  server.on("/", handleRoot);
  server.on("/capture", handleCapture);

  // Start server
  server.begin();
  Serial.println("HTTP server started on port 80");
  Serial.println("Capture URL: http://" + staticIP.toString() + "/capture");
}

// ============================================================
// loop() - Main loop with non-blocking WiFi auto-reconnect
// ============================================================
void loop() {
  // Non-blocking WiFi auto-reconnect
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("WiFi lost. Reconnecting...");
    WiFi.disconnect();
    WiFi.config(staticIP, gateway, subnet, dns);
    WiFi.begin(ssid, password);

    unsigned long startAttempt = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - startAttempt < 10000) {
      delay(500);
      Serial.print(".");
    }

    if (WiFi.status() == WL_CONNECTED) {
      Serial.println();
      Serial.print("Reconnected! IP: ");
      Serial.println(WiFi.localIP());
    } else {
      Serial.println();
      Serial.println("Reconnect failed. Will retry next loop.");
    }
  }

  server.handleClient();
}
