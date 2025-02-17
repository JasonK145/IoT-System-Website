import paho.mqtt.client as mqtt
import requests
import json

# Django 应用程序的 API 端点
DJANGO_API_ENDPOINT = 'http://localhost:8000/mqtt-data/'

# MQTT 服务器配置
MQTT_HOST = 'localhost'
MQTT_PORT = 1883
MQTT_TOPIC = 'testapp'

# 当连接到 MQTT 服务器时调用
def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe(MQTT_TOPIC)

# 当接收到 MQTT 消息时调用
def on_message(client, userdata, msg):
    print(f"Received a message on {msg.topic}: {msg.payload}")

    try:
        payload = json.loads(msg.payload)
        payload['clientName'] = payload['clientId']
        payload['clientType'] = 'Map Device'
        print('=============================================')
        print(payload)
        print('=============================================')
    except ValueError as e:
        print(f"Invalid JSON: {e}")
        return

    # 将接收到的 MQTT 消息转发到 Django API
    try:
        response = requests.post(
            DJANGO_API_ENDPOINT,
            json=payload  # 使用json参数自动设置Content-Type为application/json
        )
        print(f"Data posted to Django API, status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"HTTP Request failed: {e}")

# 设置 MQTT 客户端
client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message

# 连接到 MQTT 服务器
client.connect(MQTT_HOST, MQTT_PORT, 60)

# 开始监听消息
client.loop_forever()