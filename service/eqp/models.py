from django.db import connection,models

# Create your models here.

class InfoManager(models.Manager):
    def get_all(self):
        sql = "select * from eqp_info"
        cursor = connection.cursor()
        cursor.execute(sql)
        res = cursor.fetchall()
        data = []
        for i in res:
            dic = {
                'id':i[0],
                'sn':i[1],
                "type":i[2],
                "name":i[3],
                "size":i[4],
                "user":i[5],
            }
            data.append(dic)
        return data

class Info(models.Model):
    sn = models.CharField(max_length=255)
    type = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    size = models.CharField(max_length=255)
    user = models.CharField(max_length=255)
    objects = InfoManager()
    def __unicode__(self):
        return self.name
