#-*- coding: UTF-8 -*-
from django.conf.urls import patterns, include, url
from django.conf import settings
from user import *

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'service.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/user/', include('user.urls')),
    url(r'^api/leave/', include('leave.urls')),
    url(r'^api/eqp/', include('eqp.urls')),
)

