'use strict';

angular.module('com.haizhi.tu').controller('testCtrl',['$scope','$timeout',
    function($scope,$timeout) {

        var option0 = {
            title : {text: '未来一周气温变化'},
            xAxis : [{type : 'category',data : ['周一','周二','周三','周四','周五','周六','周日']}],
            yAxis : [{type : 'value',splitArea : {show : true}}],
            series : [{name:'最低气温',type:'line',data:[1, -2, 2, 5, 3, 2, 0]}]
        };
        var option1 = {
            title : {text: '测试数据'},
            xAxis : [{type : 'category',data : ['周一','周二','周三','周四','周五','周六','周日']}],
            yAxis : [{type : 'value'}],
            series : [{name:'最低气温',type:'bar',data:[5, 6, 8, 12, 13, 22, 30]}]
        };

        var drawIndex = 0;
        var dash_charts = {},$dom_id;

        //设置表格的基本属性
        $scope.gridsterOpts = {
            margins: [20, 20],
            minRows:1,
            minColumns:2,
            columns:6,
            draggable: {
                enabled: true
            },
            resize: {
                enabled: true,
                handles:'se',
                start: function(e, ui) {
                },
                resize: function(e, ui) {

                    //when resize change the chart's size
                    var id = e.target.children[0].id;
                    dash_charts[id].resize();
                },
                stop: function(e, ui) {
                }
            }
        };

        //初始化dashboard
        $scope.standardItems = [
            {meta:{name:"zk1"},dom_id:'id0', sizeX: 2, sizeY: 1, row: 0, col: 0 },
            {meta:{name:"zk5"},dom_id:'id4', sizeX: 2, sizeY: 1, row: 1, col: 0 }
        ];

        $scope.setItem = function($event,$index){
            drawIndex = $index;
        };

        //拖动时添加一个图表
        $scope.addItem = function(){

            //添加echarts唯一ID
            var dom_id = "id"+$scope.standardItems.length;

            $scope.standardItems.push({
                meta:{name:"zk6"},dom_id:dom_id,
                sizeX:2,sizeY:2,row:0,col:0
            });

            $timeout(
                function(){
                    $dom_id = document.getElementById(dom_id);
                    dash_charts[dom_id] = echarts.init($dom_id);
                    dash_charts[dom_id].setOption(option0);
                },0
            );

        };

        //预览仪表盘，把HTML转化成Canvas
        $scope.previewDashboard = function(){
            var $prev = document.getElementById("previewWrap"),
                $prevbg = document.getElementById("previewBg");
            html2canvas(document.getElementById("savePage"), {
                onrendered: function(canvas) {
                    $prev.style.display = "block";
                    $prevbg.style.display = "block";
                    $prev.appendChild(canvas);
                },
                canvas_id: 'prevCanv'
            });

        };

        //保存仪表盘为图片,Canvas转化成图片
        $scope.saveToPic = function(){
            var canvas = document.getElementById("prevCanv"),
                url = canvas.toDataURL();

            var triggerDownload = $("<a>").attr("href", url).attr("download", "img.png").appendTo("body");

            triggerDownload[0].click();
            triggerDownload.remove();
        };
}]);