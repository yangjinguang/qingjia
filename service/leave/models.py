#-*- coding: UTF-8 -*-
from django.db import connection,models
from datetime import datetime,timedelta, date
from user.models import Profile
import copy

# Create your models here.
class OrderManager(models.Manager):
    def insert(self,data):
        p = Order(
            user_id = data['user_id'],
            user_name = data['user_name'],
            begin = data['begin'],
            begin_half = data['beginHalf'],
            end = data['end'],
            end_half = data['endHalf'],
            days = str(data['days']),
            ctime = datetime.now(),
            note = data['note'],
            leader_note = "",
            status= 0,
        )
        p.save()
        return p.id
    def get_orders(self,userId,minTime,maxTime):
        orderRes = Order.objects.filter(user_id=userId,status__lte=2,ctime__gte=minTime,ctime__lte=maxTime).order_by("-ctime").values()
        data = []
        for item in orderRes:
            dic = {
                'id': str(item['id']),
                'begin': item['begin'].strftime('%Y-%m-%d'),
                'beginHalf': item['begin_half'],
                'end': item['end'].strftime('%Y-%m-%d'),
                'endHalf': item['end_half'],
                'ctime': item['ctime'].strftime('%Y-%m-%d %H:%M:%S'),
                'note': item['note'],
                'leaderNote': item['leader_note'],
                'status': str(item['status']),
                'days': float(item['days']),
            }
            data.append(dic)
        return data
    def get_orders_leader(self,dpId):
        sql = "select * from leave_order where user_id in (select user_id from user_profile where department=%s and status = 0)"
        cursor = connection.cursor()
        cursor.execute(sql,[dpId])
        res = cursor.fetchall()
        data = []
        for item in res:
            dic = {
                'id': str(item[0]),
                'name': item[2],
                'begin': item[3].strftime('%Y-%m-%d'),
                'beginHalf': item[4],
                'end': item[5].strftime('%Y-%m-%d'),
                'endHalf': item[6],
                'days': float(item[7]),
                'ctime': item[8].strftime('%Y-%m-%d %H:%M:%S'),
                'note': item[9],
                'leaderNote': item[10],
                'status': str(item[11]),
            }
            data.append(dic)
        return data
    def get_by_status(self,Status,minTime,maxTime):
        orderRes = Order.objects.filter(status=Status,ctime__gte=minTime,ctime__lte=maxTime).order_by('-ctime').values()
        data = []
        for item in orderRes:
            dic = {
                'id': str(item['id']),
                'name': item['user_name'],
                'begin': item['begin'].strftime('%Y-%m-%d'),
                'beginHalf': item['begin_half'],
                'end': item['end'].strftime('%Y-%m-%d'),
                'endHalf': item['end_half'],
                'ctime': item['ctime'].strftime('%Y-%m-%d %H:%M:%S'),
                'status': str(item['status']),
                'days': float(item['days']),
            }
            data.append(dic)
        return data
    def update_status(self,orderId,Status,leaderNote):
        p = Order.objects.get(id=orderId)
        p.status = Status
        p.leader_note = leaderNote
        p.save()
        return p

class Order(models.Model):
    '''
    请假申请列表
    字段含义:
        user_id -> 用户ID
        user_name -> 用户名
        begin -> 开始时间 
        end -> 结束时间 
        days -> 天数
        ctime -> 创建时间 
        note -> 请假理由
        leader_note -> 审批意见
        status -> 状态(0:未审核,1:通过,2:驳回)
    '''
    user_id = models.IntegerField(max_length=11)
    user_name = models.CharField(max_length=100)
    begin = models.DateTimeField()
    begin_half = models.CharField(max_length=100)
    end = models.DateTimeField()
    end_half = models.CharField(max_length=100)
    days = models.DecimalField(max_digits=4,decimal_places=1)
    ctime = models.DateTimeField()
    note = models.CharField(max_length=500)
    leader_note = models.CharField(max_length=500)
    status = models.IntegerField(max_length=1)
    objects = OrderManager()
    def __unicode__(self):
        return self.note

class Order_typeManager(models.Manager):
    def insert(self,data):
        p = Order_type(
            order_id = data['order_id'],
            type_id = data['type_id'],
            user_id = data['user_id'],
            days = str(data['days'])
        )
        p.save()
        return p.id
    def get_by_order(self,orderId):
        sql = "select lot.id,lot.order_id,lt.name,lot.days from leave_order_type as lot,leave_type as lt where order_id = %s and lot.type_id = lt.id"
        cursor = connection.cursor()
        cursor.execute(sql,[orderId])
        res = cursor.fetchall()
        data = []
        for item in res:
            print item
            dic = {
                "id": item[0],
                "order_id": item[1],
                "type": item[2],
                "days": float(item[3]),
            }
            data.append(dic)
        return data
    def annualSum(self,entryTime):
        thisTime = datetime.now()
        if entryTime <= date(thisTime.year,1,1):
            return 9.0
        else:
            entryTimeSum = thisTime.month - entryTime.month + 1
            a = ( 7.0 / 12.0 ) * entryTimeSum
            b = int(a)
            print a
            if a - b >= 0.5:
                return b + 0.5
            else:
                return b + 0.0
    def daysSum(self,userId,byTime):
        userProfile = Profile.objects.get(user_id=userId)
        sex = userProfile.sex
        age = (date.today() - userProfile.birthday).days/365
        leaveType = Type.objects.get_all()
        for item in leaveType:
            if sex == 0:
                if item['key'] == 'maternity':
                    removeItem = item
                if age > 23:
                    item['days'] += item['age_add']
            elif sex == 1: 
                if item['key'] == 'paternity':
                    removeItem = item
                if age > 21:
                    item['days'] += item['age_add']
            if item['key'] == 'annual':
                item['days'] = self.annualSum(userProfile.entry_time)
        leaveType.remove(removeItem)
        daysSp = copy.deepcopy(leaveType)
        daysAva = copy.deepcopy(leaveType)
        daysUse = copy.deepcopy(leaveType)
        for item in daysUse:
            item['days'] = 0
        sql = "select lot.type_id,lot.days,lo.status from leave_order_type as lot ,leave_order as lo where ctime > %s and lo.id = lot.order_id and lo.user_id=%s"
        cursor = connection.cursor()
        cursor.execute(sql,[byTime,userId])
        res = cursor.fetchall()
        daysUseSum = 0
        for item in res:
            type_id = item[0]
            days = float(item[1])
            status = item[2]
            for i in daysAva:
                if status in [0,1,3,4]:
                    if i['id'] == type_id:
                        i['days'] -= days
            for i in daysSp:
                if status in [1,3,4]:
                    if i['id'] == type_id:
                        i['days'] -= days
            for i in daysUse:
                if status in [1,4]:
                    if i['id'] == type_id:
                        i['days'] += days
            if status in [1,4]:
                daysUseSum += days
        return {
            'leaveType':leaveType,
            'daysAva':daysAva,
            'daysSp':daysSp,
            'daysUse':daysUse,
            'daysUseSum':daysUseSum
        }
    def leaveStat(self,userId):
        sql = "select lot.type_id,sum(lot.days) from leave_order_type as lot ,leave_order as lo where lo.user_id = %s and lo.id = lot.order_id and lo.status in (1,4)  group by lot.type_id"
        cursor = connection.cursor()
        cursor.execute(sql,userId)
        res = cursor.fetchall()
        return res
class Order_type(models.Model):
    '''
    请假申请表附属请假类型表
    字段含义:
        order_id -> 申请表ID
        type_id -> 请假类型ID
        user_id -> 用户ID
        days -> 天数
    '''
    order_id = models.IntegerField(max_length=11)
    type_id = models.IntegerField(max_length=11)
    user_id = models.IntegerField(max_length=11)
    days = models.DecimalField(max_digits=4,decimal_places=1)
    objects = Order_typeManager()

class TypeManager(models.Manager):
    def get_all(self):
        sql = "select * from leave_type order by id"
        cursor = connection.cursor()
        cursor.execute(sql)
        res = cursor.fetchall()
        data = []
        for i in res:
            dic = {
                "id":i[0],
                "key":i[1],
                "name":i[2],
                "days":float(i[3]),
                "age_add":i[4]
            }
            data.append(dic)
        return data
        
class Type(models.Model):
    '''
    假期类型表
    字段含义:
        key -> 类型值
        name -> 类型名
        days -> 基本天数
        age_add -> 晚婚/晚育加成 
    '''

    key = models.CharField(max_length=100)
    name = models.CharField(max_length=100)
    days = models.IntegerField(max_length=11)
    age_add = models.IntegerField(max_length=11)
    objects = TypeManager()
    def __unicode__(self):
        return self.name
