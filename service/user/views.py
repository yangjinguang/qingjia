#-*- coding: UTF-8 -*-
from django.shortcuts import *
from django.http import HttpResponse
from django.contrib.auth import authenticate,login,logout
from django.contrib.auth.models import User
from django.utils import simplejson
from models import *
from hashlib import md5
import time,ldap
from datetime import datetime,date
from random import randint

# Create your views here.
def LoginView(request):
    postData = simplejson.loads(request.body)
    if 'username' in postData:
        user = authenticate(username=postData['username'], password=postData['password'])
        if user is not None:
            access_token = md5("%s_%s_%s" % (time.time(), randint(0, 100000), postData["username"])).hexdigest()
            if len(user.groups.filter(name="hr")):
                isHr = 1
            else:
                isHr = 0
            userinfo = {
                "username":user.username,
                "display_name":user.first_name+user.last_name,
                "email":user.email,
                "isHr": isHr
            }
            login(request,user)
            userProfile = Profile.objects.filter(user_id=user.id)
            if userProfile:
                isUserFull = 0
                isLeader = userProfile[0].isleader
                department = userProfile[0].department
                age = date.today() - userProfile[0].birthday
                entryTimeSum = date.today() - userProfile[0].entry_time
                age = age.days/365
                request.session['isLeader'] = userProfile[0].isleader
                request.session['isHr'] = isHr
                request.session['department'] = userProfile[0].department
                request.session['age'] = age
                request.session['entryTimeSum'] = entryTimeSum.days
                request.session['sex'] = userProfile[0].sex
            else:
                isUserFull = 1
                isLeader = 0
                department = 0
            data = {
                "status":"0",
                "errstr":"",
                "result":{
                    "userinfo":userinfo,
                    "isUserFull":isUserFull,
                    "isLeader":isLeader,
                    "department": department,
                    "access_token":access_token,
                }
            }
        else:
            data = {
                "status":"6",
                "errstr":"用户名密码错误",
                "result":{
                }
            }
    else:
        data = {
            "status":"10002",
            "errstr":"未知错误",
            "result":{
            }
        }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def GetProfile(request):
    profile = Profile.objects.get_all(request.user.id)
    departments = Department.objects.get_all()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "profile":profile,
            "departments":departments
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def SaveProfile(request):
    saveData = simplejson.loads(request.body)
    if 'birthday' in saveData:
        if 'user_id' not in saveData:
            saveData['user_id'] = request.user.id
        saveData['birthday'] = datetime.fromtimestamp(time.mktime(time.strptime(saveData['birthday'],"%Y-%m-%d")))
        saveData['entry_time'] = datetime.fromtimestamp(time.mktime(time.strptime(saveData['entry_time'],"%Y-%m-%d")))
        if Profile.objects.filter(user_id=saveData['user_id']):
            Profile.objects.update(saveData)
        else:
            Profile.objects.insert(saveData)
        data = {
            "status":"0",
            "errstr":"",
            "result":{
            }
        }
    else:
        data = {
            "status":"10002",
            "errstr":"插入数据库失败",
            "result":{
            }
        }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def GetUsersView(request):
    if "dpid" in request.GET:
        dpId = request.GET['dpid']
    else:
        data = {
            "status":"10003",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    if dpId == '0':
        users = Profile.objects.get_users_all()
    else:
        users = Profile.objects.get_users(dpId)
    departments = Department.objects.get_all()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "users": users,
            "departments": departments
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def LogoutView(request):
    logout(request)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def init(request):
    con = ldap.initialize('ldap://mail.haizhi.com')
    dn = "UID=zimbra,CN=admins,CN=zimbra"
    pw = "tUb0l_MLcP"
    con.simple_bind_s( dn, pw )
    base_dn = "OU=people,DC=haizhi,DC=com"
    filter = "(objectClass=zimbraAccount)"
    attrs = ['uid','displayName','mail']
    all = con.search_s( base_dn, ldap.SCOPE_SUBTREE, filter, attrs )
    users = []
    exList = ['yangjinguang','admin','zabbix','fisheye','wiki','v.lvheng','wxzty','360','public','feedback','cxl','monitor','mailman','online','finexpenses','yuhao','wangruining','offer','weixin','dana','ask_bak','galsync','test1','server','git','v.yangyalong','v.yuyang','virus-quarantine.chrfjt4cvk','dnspod','oa','help','spam.awtyewnpww']
    for item in all:
        dic = {}
        dic['username'] = item[1]['uid'][0]
        dic['mail'] = item[1]['mail'][0]
        try:
            dic['name'] = item[1]['displayName'][0]
        except:
            dic['name'] = 'Null'
        if dic['username'] not in exList:
            user = User.objects.create_user(
                username=dic['username'],
                last_name=dic['name'],
                email=dic['mail']
            )
            pData = {
                "user_id" : user.id,
                "sex" : 0,
                "phone" : "1",
                'birthday' : "2014-06-01",
                'entry_time' : datetime.now(),
                'department' : 1,
                'isleader' : 0,
                'position' : "xxx"
            }
            Profile.objects.insert(pData)
            users.append(dic)
    data = {
        'all': users
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    
