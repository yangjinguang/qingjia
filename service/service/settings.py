"""
Django settings for service project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
import os
BASE_DIR = os.path.dirname(os.path.dirname(__file__))

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '^qf$k$o&h0epdi&@61j&+&1m13e-fn_5y0r%pu&g8$ue12%wn9'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = []


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'user',
    'leave',
    'eqp',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    #'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'service.urls'

WSGI_APPLICATION = 'service.wsgi.application'


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'oadb',
        'USER': 'oa',
        'PASSWORD': 'oa1234',
        'HOST': '127.0.0.1',
        'PORT': '3306',
    }
}

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'zh-cn'

TIME_ZONE = 'Asia/Shanghai'

USE_I18N = True

USE_L10N = True

USE_TZ = False

DEFAULT_CHARSET = "utf-8"


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

# LDAP
import ldap
from django_auth_ldap.config import LDAPSearch, LDAPSearchUnion, GroupOfNamesType
AUTHENTICATION_BACKENDS = (
    'django_auth_ldap.backend.LDAPBackend',
    'django.contrib.auth.backends.ModelBackend',
)

AUTH_LDAP_SERVER_URI = 'ldap://mail.haizhi.com:389'
AUTH_LDAP_BIND_DN = 'UID=zimbra,CN=admins,CN=zimbra'
AUTH_LDAP_BIND_PASSWORD = "tUb0l_MLcP"
AUTH_LDAP_USER_SEARCH = LDAPSearch("OU=people,DC=haizhi,DC=com", ldap.SCOPE_SUBTREE, "(&(objectClass=zimbraAccount)(uid=%(user)s))")

AUTH_LDAP_USER_ATTR_MAP = {
     "username":"uid",
     "password":"userPassword",
     "first_name": "givenName",
     "last_name": "displayName",
     "email": "mail"
}
import logging
logger = logging.getLogger('django_auth_ldap')
logger.addHandler(logging.StreamHandler())
logger.setLevel(logging.DEBUG)

# mail
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST =  'mail.haizhi.com'
EMAIL_PORT = '25'
EMAIL_HOST_USER = 'qingjia'
EMAIL_HOST_PASSWORD = 'haizhi1234'
