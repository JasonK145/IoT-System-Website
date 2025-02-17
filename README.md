1、运行前端 
- npm run dev

2、运行后端
- python3 manage.py runserver

3、运行 mqtt_to_django.py
- python3 mqtt_to_django.py 

4、开啟 mosquitto, 运行 mqtt server
- brew services start mosquitto
- java -jar iotclient-1.0.0.jar


注意事項
1、登錄頁面
- 密码要求在6字节以上，帳號要求email的格式

2、設備管理頁面
- 修改前要先關掉 mqtt server, 否則無法修改2

3、地圖頁面
- 地圖用到外部API，可能需要使用VPN

-----------------------------------------------------------------------------
已線下驗收
实驗報告、开发体会和小结都在一個pdf
前端代碼為BS_frontend
后端代碼為BS_Django

