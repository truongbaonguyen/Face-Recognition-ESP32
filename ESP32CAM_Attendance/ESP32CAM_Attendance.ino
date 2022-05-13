#include "esp_camera.h"
#include <WiFi.h>
#include <ArduinoWebsockets.h>
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"
#include <HTTPClient.h>

const char* ssid = "BEAR FAMILY | 2.4G";
const char* password = "bearhome";
const char* websocket_server_host = "192.168.1.13";
const uint16_t websocket_server_port = 8888;
String serverName = "http://192.168.1.13:3000/info";

String old_message = "";

unsigned long lastTime = 0;
unsigned long timerDelay = 50;
//
using namespace websockets;
WebsocketsClient client;
//
//
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();
  lcd.begin(16, 2);
  old_message = "";

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 10000000;
  config.pixel_format = PIXFORMAT_JPEG;
  //init with high specs to pre-allocate larger buffers
  if(psramFound()){
    config.frame_size = FRAMESIZE_VGA;
    config.jpeg_quality = 40;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_SVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }


  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

 

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");

  Serial.print("Camera Ready! Use 'http://");
  Serial.print(WiFi.localIP());
  Serial.println("' to connect");

  while(!client.connect(websocket_server_host, websocket_server_port, "/")){
    delay(500);
    Serial.print(".");
  }
  Serial.println("WebServer Connected!");
}

void LCD_display(int x1, int x2, String line1, String line2)
{
  lcd.clear();
  lcd.noCursor();
  lcd.setCursor(x1, 0);
  lcd.print(line1);
  lcd.setCursor(x2, 1);
  lcd.print(line2);
}

void Send_Picture () {
  camera_fb_t *fb = esp_camera_fb_get();
  if(!fb){
    Serial.println("Camera capture failed");
    esp_camera_fb_return(fb);
    return;
  }

  if(fb->format != PIXFORMAT_JPEG){
    Serial.println("Non-JPEG data not implemented");
    return;
  }

  client.sendBinary((const char*) fb->buf, fb->len);
  esp_camera_fb_return(fb);
}

void Receive_Message() {
    //Send an HTTP POST request every 10 minutes
  if ((millis() - lastTime) > timerDelay) {
    //Check WiFi connection status
    if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;

      String serverPath = serverName;
      
      // Your Domain name with URL path or IP address with path
      http.begin(serverPath.c_str());
      
      // Send HTTP GET request
      int httpResponseCode = http.GET();
      
      if (httpResponseCode>0) {
        //Serial.print("HTTP Response code: ");
        //Serial.println(httpResponseCode);
        String payload = http.getString();
        //Serial.println(payload);
        String message = payload.substring(8, payload.length() - 2);
        if (message != old_message) {
          if (message == "{}") {
          Serial.println("CHAO BAN");
          Serial.println("MOI DIEM DANH!");
          }
          else if (message == "NoClass") {
            Serial.println("HIEN TAI");
            Serial.println("KHONG CO LOP");
            delay(3000);
          }
          else if (message == "NoStudent") {
            Serial.println("SINH VIEN KHONG");
            Serial.println("THUOC LOP NAY!");
            delay(3000);
          }
          else {
            Serial.println(message);
            Serial.println("DA DIEM DANH!");
            delay(3000);
          }
        }
        old_message = message;
      }
      else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      // Free resources
      http.end();
    }
    else {
      Serial.println("WiFi Disconnected");
    }
    lastTime = millis();
  }
}




void loop() {
  Send_Picture();
  Receive_Message();
}
