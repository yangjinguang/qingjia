#-*- coding: UTF-8 -*-
from django.conf.urls import *
from models import *
from views import *

urlpatterns = patterns('',
    url(r'^getleaveinfo$',GetLeaveInfoView),
    url(r'^getleaveall$',GetLeaveAllView),
    url(r'^gettype$',GetTypeView),
    url(r'^userstat$',UserStatView),
    url(r'^getorderinfo$',GetOrderInfoView),
    url(r'^orderchange$',OrderChangeView),
    url(r'^save$',SaveView),
    url(r'^rm$',RmView),
    url(r'^addtx$',addTxView),
    url(r'^stat$',statView),
)
