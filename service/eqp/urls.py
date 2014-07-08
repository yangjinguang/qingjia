from django.conf.urls import *
from models import *
from views import *

urlpatterns = patterns('',
    url(r'^getinfo$',GetInfoView),
)
