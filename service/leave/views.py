#-*- coding: UTF-8 -*-
from django.shortcuts import *
from django.http import HttpResponse
from django.utils import simplejson
from django.contrib.auth.models import User
from django.core import mail
from models import *
from user.models import Department 
from datetime import datetime,timedelta, date
import time
import copy

# Create your views here.
def GetTypeView(request):
    leaveType = Type.objects.get_all()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "leaveType":leaveType
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def SaveView(request):
    postData = simplejson.loads(request.body)
    if 'begin' not in postData:
        data = {
            "status":"10002",
            "errstr":"提交数据错误",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    if 'typeList' not in postData:
        data = {
            "status":"10002",
            "errstr":" 提交数据错误",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    leaderId = Department.objects.get(id=request.session['department']).leader
    leaderInfo = User.objects.get(id=leaderId)
    # mail
    myName = request.user.first_name + request.user.last_name
    connection = mail.get_connection()
    connection.open()
    mailData = {
        "Subject": "[休假]-新申请",
        "From": "qingjia@haizhi.com",
        "To": [leaderInfo.email],
        "Msg": myName.encode('utf-8') + '提交了一份请假申请单,请登录<a href="http://qingjia.haizhi.com">请假系统</a>审批,谢谢',
    }
    email = mail.EmailMessage(mailData['Subject'],
        mailData['Msg'], 
        mailData['From'],
        mailData['To'],
        connection=connection
    )
    email.content_subtype = "html"
    email.send()
    connection.close()

    postData['user_id'] = request.user.id
    postData['user_name'] = request.user.first_name + request.user.last_name
    orderId = Order.objects.insert(postData)
    if orderId:
        for item in postData['typeList']:
            item['order_id'] = orderId
            item['user_id'] = request.user.id 
            Order_type.objects.insert(item)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def RmView(request):
    if 'orderid' in request.GET:
        orderId = request.GET['orderid']
    else:
        data = {
            "status":"10002",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    order = Order.objects.get(id=orderId)
    if order.status == 1:
        data = {
            "status":"10004",
            "errstr":"status=1,无法删除",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    else:
        order.delete()
        Order_type.objects.filter(order_id=orderId).delete()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def GetOrderInfoView(request):
    if 'orderid' in request.GET:
        orderId = request.GET['orderid']
    else:
        data = {
            "status":"10002",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    leaderId = Department.objects.get(id=request.session['department']).leader
    leaderInfo = User.objects.get(id=leaderId)
    orderTypes = Order_type.objects.get_by_order(orderId)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "orderTypes": orderTypes,
            "leaderName": leaderInfo.first_name +leaderInfo.last_name,
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def GetLeaveInfoView(request):
    thisYear = datetime.now().strftime("%Y-01-01")
    thisMonth = datetime.now().strftime("%Y-%m-01")
    daysSum = Order_type.objects.daysSum(request.user.id,thisYear)
    myLeaveOrder = Order.objects.get_orders(request.user.id,thisMonth,datetime.now())
    allLeave = Order.objects.get_by_status(1,thisMonth,datetime.now())
    if request.session['isLeader']:
        dps = Department.objects.filter(leader=request.user.id)
        orderForMe = []
        for item in dps:
            orderForMe += Order.objects.get_orders_leader(item.id)
    else:
        orderForMe = ""
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "myLeaveOrder":myLeaveOrder,
            "allLeave":allLeave,
            "orderForMe":orderForMe,
            "daysSum": daysSum,
            "isLeader":request.session['isLeader']
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def GetLeaveAllView(request):
    if 'year' in request.GET:
        bgYear = request.GET['year'] + "-01-01"
        edYear = request.GET['year'] + "-12-31"
    else:
        data = {
            "status":"10002",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    #thisYear = datetime.now().strftime("%Y-01-01")
    myLeaveOrder = Order.objects.get_orders(request.user.id,bgYear,edYear)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "myLeaveOrder":myLeaveOrder,
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def OrderChangeView(request):
    if not request.user.is_authenticated() or not request.session['isLeader']:
        data = {
            "status":"10003",
            "errstr":"没有权限",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    if 'action' in request.GET and 'orderid' in request.GET:
        action = request.GET['action']
        orderId = request.GET['orderid']
        postData = simplejson.loads(request.body)
        try:
            leaderNote = postData['leaderNote']
        except:
            leaderNote = ''
    else:
        data = {
            "status":"10002",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    if action == "agree":
        orderInfo = Order.objects.update_status(orderId,1,leaderNote)
        Msg = '您的申请单已经通过,请登录<a href="http://qingjia.haizhi.com">请假系统</a>查看'
    elif action == "reject":
        orderInfo = Order.objects.update_status(orderId,2,leaderNote)
        Msg = '您的申请单已被驳回,请登录<a href="http://qingjia.haizhi.com">请假系统</a>查看'
    # mail
    ToMail = User.objects.get(id=orderInfo.user_id).email
    connection = mail.get_connection()
    connection.open()
    mailData = {
        "Subject": "[休假]-审批结果",
        "From": "qingjia@haizhi.com",
        "To": [ToMail],
        "Msg": Msg,
    }
    email = mail.EmailMessage(mailData['Subject'],
        mailData['Msg'], 
        mailData['From'],
        mailData['To'],
        connection=connection
    )
    email.content_subtype = "html"
    email.send()
    connection.close()

    data = {
        "status":"0",
        "errstr":"",
        "result":{
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def addTxView(request):
    if not request.user.is_authenticated() or not request.session['isLeader']:
        data = {
            "status":"10003",
            "errstr":"没有权限",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    postData = simplejson.loads(request.body)
    if len(postData) <= 0 or len(postData['selectUsers']) <=0:
        data = {
            "status":"10002",
            "errstr":"缺少数据",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    myName = request.user.first_name + request.user.last_name
    for item in postData['selectUsers']:
        o = Order(
            user_id = item['id'],
            user_name = item['display_name'],
            begin = datetime.now(),
            begin_half = "Null",
            end = datetime.now(),
            end_half = "Null",
            days = str(postData['txDays']),
            ctime = datetime.now(),
            note = myName,
            leader_note = "Null",
            status= 3,
        )
        o.save()
        typeTxId = Type.objects.get(key='tiaoxiu').id
        ot = Order_type(
            order_id = o.id,
            type_id = typeTxId,
            user_id = item['id'],
            days = "-"+str(postData['txDays'])
        )
        ot.save()
    data = {
        "status":"0",
        "errstr":"",
        "result":{
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
def statView(request):
    if not request.user.is_authenticated():
        data = {
            "status":"10003",
            "errstr":"没有权限",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    users = User.objects.all()
    types = Type.objects.get_all()
    leaveStat = []
    for user in users[1:]:
        dic = {}
        daysSum = 0
        res = Order_type.objects.leaveStat(user.id)
        for item in types:
            dic[item['id']] = 0
        for item in res:
            dic[item[0]] = float(item[1])
            daysSum += float(item[1])
        dic["name"] = user.first_name + user.last_name
        dic['userId'] = user.id
        dic['daysSum'] = daysSum
        leaveStat.append(dic)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "leaveStat": leaveStat,
            "types": types
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))

def UserStatView(request):
    if not request.user.is_authenticated() or not request.session['isLeader']:
        data = {
            "status":"10003",
            "errstr":"没有权限",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    if 'userid' in request.GET:
        userId = request.GET['userid']
    else:
        data = {
            "status":"10002",
            "errstr":"缺少参数",
            "result":{
            }
        }
        return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
    thisYear = datetime.now().strftime("%Y-01-01")
    daysSum = Order_type.objects.daysSum(userId,thisYear)
    data = {
        "status":"0",
        "errstr":"",
        "result":{
            "daysSum": daysSum,
        }
    }
    return HttpResponse(simplejson.dumps(data, ensure_ascii=False))
