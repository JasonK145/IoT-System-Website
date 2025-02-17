from django.db import models
from django.conf import settings

# Create your models here.
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    age = models.IntegerField(null=True)
    major = models.CharField(max_length=30,default='')
    phoneID = models.IntegerField(null=True)
    def __str__(self):
        return self.user.username

class DeviceData(models.Model):
    #user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    alert = models.IntegerField(default=0)
    clientId = models.CharField(max_length=255, unique=True)
    info = models.TextField()
    lat = models.FloatField(null=True)
    lng = models.FloatField(null=True)
    timestamp = models.BigIntegerField(null=True)
    value = models.IntegerField(null=True)
    clientName = models.TextField(null = True)
    clientType = models.TextField(null = True)

    def __str__(self):
        return f"{self.clientId}"
    
class LocationHistory(models.Model):
    device = models.ForeignKey(DeviceData, on_delete=models.CASCADE, related_name='location_history')
    lat = models.FloatField()
    lng = models.FloatField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if LocationHistory.objects.count() > 200:
            oldest_record = LocationHistory.objects.order_by('timestamp').first()
            if oldest_record:
                oldest_record.delete()

    def __str__(self):
        return f"{self.device.clientId} - {self.timestamp}"
    