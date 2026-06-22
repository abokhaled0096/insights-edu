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
const char* ssid     = "Mm";
const char* password = "12345678";

// ========================
// Web Server on Port 80
// ========================
WebServer server(80);

// ============================================================
// AI-Thinker ESP32-CAM Pin Definitions (hardcoded, no macros)
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

#define LED_GPIO_NUM       4

bool cameraReady = false;

// ============================================================
// /capture - Capture and return a JPEG frame
// ============================================================
void handleCapture() {
  if (!cameraReady) {
    server.send(503, "text/plain", "Camera not initialized");
    return;
  }

  // Flush stale frame from single-buffer mode
  camera_fb_t* stale = esp_camera_fb_get();
  if (stale) {
    esp_camera_fb_return(stale);
  }

  camera_fb_t* fb = esp_camera_fb_get();

  if (!fb) {
    server.send(500, "text/plain", "Camera capture failed");
    return;
  }

  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send_P(200, "image/jpeg", (const char*)fb->buf, fb->len);

  esp_camera_fb_return(fb);
}

// ============================================================
// / - Health check endpoint
// ============================================================
void handleRoot() {
  String status = cameraReady ? "Camera: OK" : "Camera: FAILED";
  server.send(200, "text/plain", "InsightsEdu ESP32-CAM Active\n" + status);
}

// ============================================================
// Initialize Camera with AI-Thinker config
// ============================================================
bool startCamera() {
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
  config.xclk_freq_hz = 10000000;  // 10MHz — safer for AI-Thinker clones
  config.pixel_format = PIXFORMAT_JPEG;
  config.grab_mode    = CAMERA_GRAB_LATEST;

  if (psramFound()) {
    Serial.println("PSRAM found — using 2 frame buffers, VGA");
    config.frame_size   = FRAMESIZE_VGA;
    config.jpeg_quality = 10;
    config.fb_count     = 2;
    config.fb_location  = CAMERA_FB_IN_PSRAM;
  } else {
    Serial.println("No PSRAM — using 1 frame buffer, QVGA");
    config.frame_size   = FRAMESIZE_QVGA;
    config.jpeg_quality = 16;
    config.fb_count     = 1;
    config.fb_location  = CAMERA_FB_IN_DRAM;
  }

  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed: 0x%x\n", err);

    // Power-cycle the sensor and retry once
    if (PWDN_GPIO_NUM != -1) {
      pinMode(PWDN_GPIO_NUM, OUTPUT);
      digitalWrite(PWDN_GPIO_NUM, HIGH);
      delay(200);
      digitalWrite(PWDN_GPIO_NUM, LOW);
      delay(200);
    }

    err = esp_camera_init(&config);
    if (err != ESP_OK) {
      Serial.printf("Camera retry also failed: 0x%x\n", err);
      return false;
    }
  }

  // Apply sensor tuning
  sensor_t* s = esp_camera_sensor_get();
  if (s) {
    s->set_brightness(s, 1);
    s->set_saturation(s, -1);
    s->set_whitebal(s, 1);
    s->set_awb_gain(s, 1);
    s->set_wb_mode(s, 0);
    s->set_aec2(s, 1);
    s->set_gain_ctrl(s, 1);
    s->set_agc_gain(s, 0);
    s->set_exposure_ctrl(s, 1);
    if (s->id.PID == OV2640_PID) {
      Serial.println("OV2640 sensor detected");
    }
  }

  Serial.println("Camera initialized successfully");
  return true;
}

// ============================================================
// setup()
// ============================================================
void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println();
  Serial.println("=== InsightsEdu ESP32-CAM ===");

  // Turn off flash LED at boot
  pinMode(LED_GPIO_NUM, OUTPUT);
  digitalWrite(LED_GPIO_NUM, LOW);

  // Power-down pin: ensure camera is powered on
  if (PWDN_GPIO_NUM != -1) {
    pinMode(PWDN_GPIO_NUM, OUTPUT);
    digitalWrite(PWDN_GPIO_NUM, LOW);
    delay(100);
  }

  cameraReady = startCamera();

  if (!cameraReady) {
    Serial.println("WARNING: Camera is NOT available. /capture will return 503.");
  }

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
    Serial.println("WiFi connection failed!");
    return;
  }

  server.on("/", handleRoot);
  server.on("/capture", handleCapture);

  server.begin();
  Serial.println("HTTP server started on port 80");
  Serial.println("Capture URL: http://" + WiFi.localIP().toString() + "/capture");
}

// ============================================================
// loop()
// ============================================================
void loop() {
  server.handleClient();
}
