#-*- coding: UTF-8 -*-
from django.db import connection, models
from django.contrib.auth.models import User
from datetime import datetime
import time

# Create your models here.
class ProfileManager(models.Manager):
    def get_all(self,userId):
        sql = "select * from user_profile where user_id = %s"
        cursor = connection.cursor()
        cursor.execute(sql,userId)
        res = cursor.fetchone()
        if res: 
            data = {
                "id":res[0],
                "user_id":res[1],
                "sex":res[2],
                "phone":res[3],
                "birthday":res[4].strftime('%Y-%m-%d'),
                "entry_time":res[5].strftime('%Y-%m-%d'),
                "department":res[6],
                "isleader":res[7],
                "position":res[8],
            }
        else:
            data = {
                "id":'',
                "user_id":userId,
                "sex":0,
                "birthday":'',
                "entry_time":'',
                "department":'',
                "isleader":'',
                "position":'',
            }
        return data
    def get_users(self,dpId):
        sql="select au.id,au.email,au.first_name,au.last_name,up.sex,up.phone,up.entry_time,up.birthday,up.position,ud.name,ud.id from user_profile as up join auth_user as au on up.user_id = au.id join user_department as ud on up.department = ud.id where up.department = %s order by up.entry_time"
        cursor = connection.cursor()
        cursor.execute(sql,dpId)
        res = cursor.fetchall()
        data = []
        if res:
            for item in res:
                dic = {
                    "user_id": item[0],
                    "email": item[1],
                    "display_name": item[2] + item[3],
                    "sex": item[4],
                    "phone": item[5],
                    "entry_time": item[6].strftime('%Y-%m-%d'),
                    "birthday": item[7].strftime('%Y-%m-%d'),
                    "position": item[8],
                    "dp_name": item[9],
                    "department": item[10],
                }
                data.append(dic)
        else:
            data = ""
        return data
    def get_users_all(self):
        sql="select au.id,au.email,au.first_name,au.last_name,up.sex,up.phone,up.entry_time,up.birthday,up.position,ud.name,ud.id from user_profile as up join auth_user as au on up.user_id = au.id join user_department as ud on up.department = ud.id order by up.entry_time"
        cursor = connection.cursor()
        cursor.execute(sql)
        res = cursor.fetchall()
        data = []
        if res:
            for item in res:
                dic = {
                    "user_id": item[0],
                    "email": item[1],
                    "display_name": item[2] + item[3],
                    "sex": item[4],
                    "phone": item[5],
                    "entry_time": item[6].strftime('%Y-%m-%d'),
                    "birthday": item[7].strftime('%Y-%m-%d'),
                    "position": item[8],
                    "dp_name": item[9],
                    "department": item[10],
                }
                data.append(dic)
        else:
            data = ""
        return data
    def insert(self,data):
        p = Profile(
            user_id=data['user_id'],
            sex=data['sex'],
            phone=data['phone'],
            birthday=data['birthday'],
            entry_time=data['entry_time'],
            department=data['department'],
            isleader=0,
            position=data['position']
        )
        p.save()
        return p.id
    def update(self,data):
        p = Profile.objects.get(user_id=data['user_id'])
        p.sex = data['sex']
        p.phone = data['phone']
        p.birthday = data['birthday']
        p.entry_time = data['entry_time']
        p.department = data['department']
        p.position = data['position']
        p.save()
        return p.id
        
class Profile(models.Model):
    '''
    用户详细表
        user_id -> 用户id，与auth_user里的id相对应
        sex -> 性别(0:男,1:女)
        phone -> 手机号
        birthday -> 生日 
        entry_time -> 入职时间
        department -> 部门
        position -> 职位
    '''
    user_id = models.IntegerField(max_length=11)
    sex = models.IntegerField(max_length=1)
    phone = models.CharField(max_length=11)
    birthday = models.DateField()
    entry_time = models.DateField()
    department = models.CharField(max_length=255)
    isleader = models.IntegerField(max_length=1)
    position = models.CharField(max_length=255)
    objects = ProfileManager()

class DepartmentManager(models.Manager):
    def get_all(self):
        sql = "select * from user_department order by id"
        cursor = connection.cursor()
        cursor.execute(sql)
        res = cursor.fetchall()
        data = []
        for i in res:
            dic = {"id":i[0],"name":i[1]}
            data.append(dic)
        return data
        
class Department(models.Model):
    '''
        部门列表
            name -> 部门名称
            leader -> 部门leader
    '''
    name = models.CharField(max_length=255)
    leader = models.IntegerField(max_length=11)
    objects = DepartmentManager()
    def __unicode__(self):
        return self.name
