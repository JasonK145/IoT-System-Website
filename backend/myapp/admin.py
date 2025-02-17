from django.contrib import admin
from .models import UserProfile, DeviceData, LocationHistory


# Register your models here.
admin.site.register(UserProfile)
admin.site.register(DeviceData)
admin.site.register(LocationHistory)