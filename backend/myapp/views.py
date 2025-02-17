from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import logout
from .models import UserProfile, LocationHistory
from .models import DeviceData
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import serializers
from rest_framework import generics
import jwt

from django.db import IntegrityError
import logging
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import JSONParser
from django.db.models import Max
# ---------------------------------------------------- 登錄頁面 -----------------------------------------------------
class LoginView(APIView):
    def post(self, request, format=None):
        data = request.data
        username = data.get('id', None)
        password = data.get('password', None)

        user = authenticate(username=username, password=password)
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Successful login!',
                'token': str(refresh.access_token),
            })
        else:
            return Response("Wrong username or password.")

class CreateAccVIew(APIView):
    def post(self, request, format=None):
        data = request.data
        username = data.get('id', None)
        password = data.get('password', None)
        age = data.get('age', None)

        user_exists = User.objects.filter(username=username).exists()

        if not user_exists:
            user = User.objects.create_user(username=username, password=password)
            user.save()
            user_profile = UserProfile(user=user, age=age)
            user_profile.save()

            return Response("Successful Create Account!")
        else:
            return Response("User already exists!")
        
class ResetPassword(APIView):
    def post(self, request, format=None):
        data = request.data
        username = data.get('id', None)
        password = data.get('password', None)

        user_exists = User.objects.filter(username=username).exists()

        if user_exists:
            user = User.objects.get(username=username)
            user.set_password(password)
            user.save()
            return Response("Successful Reset Password!")
        else:
            return Response("Wrong username！")

class LogoutView(APIView):
    def get(self, request):
        logout(request)
        return Response({"message": "Successful logout!"}, status=status.HTTP_200_OK)
    
#--------------------------------------------------------------------------------------------------------------------------

class UserView(APIView):
    def get(self, request, *args, **kwargs):
        auth_header = request.META.get('HTTP_AUTHORIZATION', " ")
        parts = auth_header.split(' ')
        if len(parts) < 2:
            return Response({"detail": "Authorization header is missing or malformed."}, status=status.HTTP_400_BAD_REQUEST)
        
        token = parts[1]
        try:
            payload = jwt.decode(token, 'jason', algorithms=['HS256'])
        except jwt.DecodeError:
            return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            user = User.objects.get(id=payload['user_id'])
            try:
                user_profile = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                user_profile = UserProfile.objects.create(user=user, age=18)  # 创建一个新的 UserProfile 对象
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name':user.first_name,
            'last_name':user.last_name,
            'age':user_profile.age,
            'major':user_profile.major,
            'phone':user_profile.phoneID,
        }
        return Response(data)

class UserUploadView(APIView):
    def post(self, request, format=None):
        data = request.data
        value = data.get('value', None)
        type = data.get('type', None)
        username = data.get('user', None)

        try:
            user = User.objects.get(username=username)
            try:
                upload = UserProfile.objects.get(user=user)
            except UserProfile.DoesNotExist:
                upload = UserProfile(user=user)
        
            if type == 'age':
                value = int(value)
                upload.age = value
            elif type == 'major':
                upload.major = value
            elif type == 'phone':
                value = int(value)
                upload.phoneID = value
            elif type == 'first_name':
                user.first_name = value
            elif type == 'last_name':
                user.last_name = value
            elif type == 'email':
                user.email = value
            elif type == 'username':
                user.username = value

            user.save()
            upload.save()
            return Response({'success': True}, status=status.HTTP_200_OK)
        
        except User.DoesNotExist:
            return Response({'error': 'User does not exist'}, status=status.HTTP_404_NOT_FOUND)

#------------------------------------------------------------------------------------------------------------------------------------
# MQTT 部分
class LocationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHistory
        fields = ['device', 'lat', 'lng', 'timestamp'] 

    def create(self, validated_data):
        return LocationHistory.objects.create(**validated_data)

class MQTTDataView(APIView):
    def get(self, request, *args, **kwargs):
        device_data_list = DeviceData.objects.all()
        serializer = DeviceDataSerializer(device_data_list, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        # 解析 JSON 数据
        data = JSONParser().parse(request)
        client_id = data.get('clientId')
        try:
            device_data = DeviceData.objects.get(clientId=client_id)
            serializer = DeviceDataSerializer(device_data, data=data, partial=True)  # 使用partial=True允许部分更新
        except DeviceData.DoesNotExist:
            serializer = DeviceDataSerializer(data=data)

        if serializer.is_valid():
            serializer.save()
            if 'lat' in data and 'lng' in data:
                location_data = {
                    'device': device_data.id,
                    'lat': data['lat'],
                    'lng': data['lng']
                }
                location_serializer = LocationHistorySerializer(data=location_data)
                if location_serializer.is_valid():
                    location_serializer.save()
                else:
                    return Response(location_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_201_CREATED if not device_data else status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class DeviceDataSerializer(serializers.ModelSerializer):
    client_id = serializers.CharField(source='clientId', required=False)
    latitude = serializers.FloatField(source='lat', required=False, allow_null=True)
    longitude = serializers.FloatField(source='lng', required=False, allow_null=True)

    class Meta:
        model = DeviceData
        fields = '__all__' 

class DeviceDataList(generics.ListAPIView):
    queryset = DeviceData.objects.all()
    serializer_class = DeviceDataSerializer

class CreateDeviceMQTT(APIView):
    def post(self, request, *args, **kwargs):
        serializer = DeviceDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class GetMaxClientId(APIView):
    def get(self, request, format=None):
        device_count = DeviceData.objects.count()  # 获取设备总数
        print(device_count)
        return Response({'deviceCount': device_count}, status=status.HTTP_200_OK)
    
#----------------------------------------------------------------------------------------------------------------------------------------
# 設備管理

class DeviceDataList(APIView):
    def get(self, request, format=None):
        devices = DeviceData.objects.all()
        serializer = DeviceDataSerializer(devices, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class CreateDevice(APIView):
    def post(self, request, format=None):
        serializer = DeviceDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteDevice(APIView):
    def delete(self, request, pk, format=None):
        print(pk)
        print(type(pk))
        try:
            device = DeviceData.objects.get(timestamp=pk)
        except DeviceData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        device.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
class UpdateDevice(APIView):
    def put(self, request, pk, format=None):
        try:
            device = DeviceData.objects.get(timestamp=pk)
        except DeviceData.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        
        serializer = DeviceDataSerializer(device, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

#-----------------------------------------------------------------------------------------------------------------
# LocalHistory
class DeviceLocationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHistory
        fields = ('lat', 'lng', 'timestamp')

class DeviceLocationHistoryView(APIView):
    def get(self, request, device_id, *args, **kwargs):
        # 根据device_id获取单个设备
        try:
            device = DeviceData.objects.get(clientId=device_id)
        except DeviceData.DoesNotExist:
            return Response({"error": "设备未找到"}, status=status.HTTP_404_NOT_FOUND)

        location_history = device.location_history.all().order_by('-timestamp')[:10]
        serializer = DeviceLocationHistorySerializer(location_history, many=True)
        
        # 返回设备的位置历史记录
        return Response(serializer.data, status=status.HTTP_200_OK)