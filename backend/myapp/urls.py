from django.urls import path
from .views import LoginView, CreateAccVIew, ResetPassword, UserView, LogoutView, UserUploadView
from .views import MQTTDataView, DeviceDataList, CreateDeviceMQTT, GetMaxClientId
from .views import DeviceDataList, CreateDevice, DeleteDevice, UpdateDevice, DeviceLocationHistoryView

urlpatterns = [
    path('api/login/', LoginView.as_view(), name='api_login'),
    path('createAcc/', CreateAccVIew().as_view(), name='createAcc'),
    path('resetPassword/', ResetPassword().as_view(), name='resetPassword'),
    
    #logout
    path('user/logout', LogoutView.as_view(), name='logout'),

    # UserPage
    path('user/',UserView().as_view(), name='user'),
    path('UserUpload/',UserUploadView.as_view(), name='upload'),
    
    # mqtt
    path('mqtt-data/', MQTTDataView.as_view(), name='mqtt-data'),
    path('api/device-data/', DeviceDataList.as_view(), name='device-data-list'),
    path('CreateDeviceMQTT/', CreateDeviceMQTT.as_view(), name='create-device-mqtt'),
    path('getMaxClientId/', GetMaxClientId.as_view(), name='get-max-client-id'),

    # device manage
    path('getDevice/', DeviceDataList.as_view(), name='device-list'),
    path('device/CreateDevice/', CreateDevice.as_view(), name = 'device-create'),
    path('device/<int:pk>/update/', UpdateDevice.as_view(), name='device-update'),
    path('device/<int:pk>/delete/', DeleteDevice.as_view(), name='device-delete'),

    # localHistory
    path('device-history/<str:device_id>/', DeviceLocationHistoryView.as_view(), name='device-history-detail'),
]

