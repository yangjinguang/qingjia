from django.conf.urls import *
from models import *
from views import *

urlpatterns = patterns('',
    url(r'^login$',LoginView),
    url(r'^logout$',LogoutView),
    url(r'^getprofile$',GetProfile),
    url(r'^getusers$',GetUsersView),
    url(r'^saveprofile$',SaveProfile),
    #url(r'^init$',init),
)
