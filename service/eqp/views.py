from django.shortcuts import *
from django.http import HttpResponse
from django.utils import simplejson
from models import *
from hashlib import md5
import time
from datetime import datetime
from random import randint

# Create your views here.
def GetInfoView(request):
    eqpInfo = Info.objects.get_all()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "eqpInfo": eqpInfo
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
