(function f() {
  // pp列表
  var ppList = [];

  // 账号数据分布
  var accountNumberData = []

  // pp处理情况数据
  var handleData = []

  // 争议原因占比数据
  var controversyData = [];
  // top数据
  var topData = []

  // 获取当天0点的时间戳
  var getTodayTime = function () {
    return new Date(new Date().toLocaleDateString()).getTime();
  }

  // 返回时间间隔时间戳(秒)
  // var queryTypeMap = {
  //   'today': function () {
  //     return ((new Date(new Date().toLocaleDateString()).getTime()) / 1000).toFixed(0);
  //   },
  //   'week': function () {
  //     return ((getTodayTime() - 7 * 24 * 60 * 60 * 1000) / 1000).toFixed(0);
  //   },
  //   'month': function () {
  //     return ((getTodayTime() - 30 * 24 * 60 * 60 * 1000) / 1000).toFixed(0);
  //   },
  //   'threeMonth': function () {
  //     return ((getTodayTime() - 90 * 24 * 60 * 60 * 1000) / 1000).toFixed(0);
  //   },
  //   'sixMonth': function () {
  //     return ((getTodayTime() - 182 * 24 * 60 * 60 * 1000) / 1000).toFixed(0);
  //   },
  // }
  var queryTypeMap = {
    'today': 'TODAY',
    'week': 'THIS_WEEK',
    'month': 'THIS_MONTH',
    'threeMonth': 'LAST_THREE_MONTH',
    'sixMonth': 'LAST_HALF_YEAR',
  }

  // 显示暂无数据
  var showNoData = function (className) {
    $(`#${className}-chart`).hide();
    $(`.${className}-no-data`).show();
  }

  // 隐藏暂无数据
  var hideNoData = function (className) {
    $(`#${className}-chart`).show();
    $(`.${className}-no-data`).hide();
  }

  // 刷新模块方法
  var reloadModule = function (type, ids = '', queryType = '') {
    switch (type) {
      case '0':
        getAccountNumberData(ids, queryType);
        break;
      case '1':
        getHandleData(ids, queryType);
        break;
      case '2':
        getControversyData(ids, queryType);
        break;
      default:
        getAccountNumberData(ids, queryType);
        getHandleData(ids, queryType);
        getControversyData(ids, queryType);
        break;
    }
  }

  // 获取pp列表数据
  var getPPList = function () {
    $.ajax({
      type: "GET",
      url: '/api/dashboard/get/paypalAccountList',
      dataType: "json",
      success: function (data) {
        ppList = data.item.businessUnit;

        // 请求模块数据
        getAccountNumberData();
        getHandleData();
        getControversyData();
        getTopData();
        // 渲染pp列表
        renderSelectPP();
      },
      error: function (jqXHR) {


        // ppList = [
        //   {
        //     id: 1,
        //     name: 'sw1@pp.com'
        //   },
        //   {
        //     id: 2,
        //     name: 'sw2@pp.com'
        //   },
        //   {
        //     id: 3,
        //     name: 'sw3@pp.com'
        //   },
        //   {
        //     id: 4,
        //     name: 'sw4@pp.com'
        //   },
        //   {
        //     id: 5,
        //     name: 'sw5@pp.com'
        //   },
        //   {
        //     id: 6,
        //     name: 'sw6@pp.com'
        //   },
        //   {
        //     id: 1,
        //     name: 'sw1@pp.com'
        //   },
        //   {
        //     id: 2,
        //     name: 'sw2@pp.com'
        //   },
        //   {
        //     id: 3,
        //     name: 'sw3@pp.com'
        //   },
        //   {
        //     id: 4,
        //     name: 'sw4@pp.com'
        //   },
        //   {
        //     id: 5,
        //     name: 'sw5@pp.com'
        //   },
        //   {
        //     id: 6,
        //     name: 'sw6@pp.com'
        //   }
        // ];
        //
        // renderSelectPP();
        //
        // getAccountNumberData();
        // getHandleData();
        // getControversyData();
        // getTopData();
      }
    });
  };

  // 获取账号数据分布情况
  var getAccountNumberData = function (ids = '', queryType) {
    queryType = queryType ? queryType : 'DP';
    $.ajax({
      type: "GET",
      url: `/api/dashboard/get/paypalAccountdaDataDistribution?type=${ queryType }&accountIds=${ ids }`,
      dataType: "json",
      success: function (data) {
        lineData = data.item.lineData;
        if (lineData.length > 0) {
          hideNoData('account-number');
          renderAccountNumberData();
        } else {
          showNoData('account-number');
        }
      },
      error: function (jqXHR) {
        showNoData('account-number');
      }
    });
  }

  // 获取争议占比数据
  var getControversyData = function (ids = '', queryType) {
    queryType = queryType ? queryType : 'today';

    time = queryTypeMap[ queryType ];
    $.ajax({
      type: "GET",
      url: `/api/dashboard/get/paypalDisputeReasonData?time=${ time }&accountIds=${ ids }`,
      dataType: "json",
      success: function (data) {
        lineData = data.item.lineData;
        if (lineData.length > 0) {
          hideNoData('controversy');
        } else {
          showNoData('controversy');
        }
      },
      error: function (jqXHR) {
        showNoData('controversy');
      }
    });
  }

  var getHandleData = function (ids = '', queryType) {
    queryType = queryType ? queryType : 'today';
    // 获取PP处理数据
    time = queryTypeMap[ queryType ];

    $.ajax({
      type: "GET",
      url: `/api/dashboard/get/paypalDisputeDealData?accountIds=${ ids }&time=${ time }`,
      dataType: "json",
      success: function (data) {
        barData = data.item.barData;

        if (barData.length > 0) {
          hideNoData('handle');
          renderHandleChart();
        } else {
          showNoData('handle');
        }
      },
      error: function (jqXHR) {
        showNoData('handle');
      }
    });
  }

  // 获取top数据
  var getTopData = function (ids = '') {
    $.ajax({
      type: "GET",
      url: `/api/dashboard/get/paypalDisputeDealRankList?accountIds=${ ids }`,
      dataType: "json",
      success: function (data) {
        lineData = data.item.lineData;
        if (lineData.length > 0) {
          hideNoData('top10');
          renderTopData();
        } else {
          showNoData('top10');
        }
      },
      error: function (jqXHR) {
        showNoData('top10');
      }
    })
  }

  // 渲染pp复选框列表
  var renderSelectPP = function () {
    var strHtml = `<label><input type="checkbox" data-id='all' class='checkbox-all checkbox' checked>全部</label>`;

    strHtml += $.map(ppList, function (item) {
      return `<label><input type="checkbox" data-id=${ item.id } class='checkbox-item checkbox' checked>${ item.name }</label>`;
    }).join('');

    $('.pp-checkboxs').html(strHtml);
  }

  // 渲染PP处理情况
  var renderHandleChart = function () {
    var categories = $.map(handleData[ 0 ][ 'data' ], function (item) {
      return item.name;
    })
    var stackMap = {
      '0': 'DP未处理',
      '1': 'DP未处理',
      '2': 'BC未处理',
      '3': 'BC未处理',
      '4': 'CC未处理',
      '5': 'CC未处理',
    };
    var series = $.map(handleData, function (item, index) {
      return {
        name: item.name,
        type: 'bar',
        stack: stackMap[ index ],
        data: $.map(item.data, function (itemVal) {
          return itemVal.value
        }),
      }
    })

    var option = {
      color: [ '#7f85e9', '#f15c80', '#90ed7e', '#f7a35d', '#7db5ec', '#444449' ],
      padding: [ 0, 0, 0, 0 ],  // 位置
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        top: 10,
        symbol: 'circle',
        data: $.map(handleData, function (item) {
          return { name: item.name, icon: 'circle' };
        })
      },
      toolbox: {
        show: true,
        orient: 'vertical',
        left: 'right',
        top: 'center',
        feature: {
          mark: { show: false },
          dataView: { show: false, readOnly: false },
          magicType: { show: false, type: [ 'bar' ] },
          restore: { show: false },
          saveAsImage: { show: false }
        }
      },
      calculable: true,
      dataZoom: [
        {
          show: true,
          realtime: true,
          start: 0,
          end: 30
        },
        {
          type: 'inside',
          realtime: true,
          start: 0,
          end: 30
        }
      ],
      xAxis: [
        {
          type: 'category',
          axisTick: { show: false },
          data: categories
        }
      ],
      yAxis: [
        {
          type: 'value',
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          }
        }
      ],
      series: series,
    };

    handleChart = echarts.init(document.getElementById('handle-chart'));
    handleChart.showLoading({
      text: 'loading',
      color: '#f2b047',
      textColor: '#000',
    });
    handleChart.setOption(option);
    setTimeout(function () {
      handleChart.hideLoading();
    }, 500)
  }

  // 渲染争议原因占比
  var renderControversyData = function () {
    var option = {
      tooltip: {
        trigger: 'item',
        formatter: "{a} <br/>{b} : {c} ({d}%)"
      },
      color: [ '#37a2da', '#9fe6b8', '#ffdb5c', '#ed86b2', '#e7bcf3', '#9d96f5' ],
      label: {
        show: true,
        formatter: '{b} : {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'vertical',
        left: 'left',
        data: $.map(controversyData, function (item) {
          return item.name;
        })
      },
      series: [
        {
          type: 'pie',
          radius: '40%',
          center: [ '50%', '50%' ],
          selectedMode: 'single',
          data: controversyData,
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ],
    };
    controversyChart = echarts.init(document.getElementById('controversy-chart'));
    controversyChart.showLoading({
      text: 'loading',
      color: '#f2b047',
      textColor: '#000',
    });
    controversyChart.setOption(option);
    setTimeout(function () {
      controversyChart.hideLoading();
    }, 500)
  }

  // 渲染账号数据分布情况
  var renderAccountNumberData = function () {
    var symbolArr = [ 'circle', 'rect', 'roundRect', 'triangle', 'diamond', 'pin', 'arrow', 'none' ];
    var colors = [ '#f15b80', '#7cb5ec', '#90ed7d', '#f7a35c', '#434348', '#7f85e9' ];
    var series = $.map(accountNumberData, function (item, index) {
      return {
        type: 'line',
        symbol: symbolArr[ index % 8 ],
        symbolSize: 12,
        lineStyle: {
          normal: {
            color: colors[ index % 7 ],
            width: 2,
            type: 'solid'
          }
        },
        label: {
          normal: {
            show: true,
            position: 'top',
            color: 'black',
            fontSize: '18'
          }
        },
        itemStyle: {
          normal: {
            borderWidth: 3,
            color: colors[ index % 7 ]
          }
        },
        data: $.map(item.data, function (itemVal) {
          return itemVal.value
        }),
        name: accountNumberData[ index ].name
      }
    })

    var option = {
      legend: {
        top: 10,
        data: $.map(accountNumberData, function (item) {
          return item.name;
        })
      },
      xAxis: {
        type: 'category',
        axisLabel:{
          rotate: 30
        },
        data: $.map(accountNumberData, function (item) {
          return item.name;
        })
      },
      yAxis: {
        type: 'value',
        axisTick: {
          show: false,
        },
        axisLine: {
          show: false,
        }
      },
      series: series
    };

    accountNumberChart = echarts.init(document.getElementById('account-number-chart'));
    accountNumberChart.showLoading({
      text: 'loading',
      color: '#f2b047',
      textColor: '#000',
    });
    accountNumberChart.setOption(option);
    setTimeout(function () {
      accountNumberChart.hideLoading();
    }, 500)
  }

  // 渲染top10
  var renderTopData = function () {
    var icon = `<svg t="1568790056002" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1990" width="200" height="200"><path d="M512 0C229.216 0 0 229.216 0 512c0 282.768 229.216 512 512 512 282.752 0 512-229.232 512-512C1024 229.216 794.752 0 512 0zM512 992C246.896 992 32 777.088 32 512 32 246.896 246.896 32 512 32c265.056 0 480 214.896 480 480C992 777.088 777.056 992 512 992z" p-id="1991"></path><path d="M624.064 520.032C663.104 487.76 688 438.96 688 384.336c0-97.2-78.8-176-176-176s-176 78.8-176 176c0 54.624 24.88 103.424 63.936 135.696C305.68 562.768 240 657.456 240 767.664c0 8.848 7.168 16 16 16s16-7.152 16-16c0-104.752 67.232-193.568 160.8-226.336 23.824 12.048 50.672 18.992 79.2 18.992 28.512 0 55.376-6.944 79.2-18.992C684.768 574.112 752 662.928 752 767.664c0 8.848 7.152 16 16 16s16-7.152 16-16C784 657.456 718.32 562.768 624.064 520.032zM368 384.336c0-79.536 64.464-144 144-144s144 64.464 144 144c0 77.184-60.768 139.984-137.04 143.648-2.336-0.064-4.624-0.304-6.96-0.304s-4.64 0.24-6.96 0.304C428.768 524.32 368 461.504 368 384.336z" p-id="1992"></path></svg>`
    var strHtml = $.map(topData, function (item, index) {
      return `<li>${ icon }${ item.username }: DP已处理${ item.DPFinish }, BC已处理${ item.BCFinish }, CC已处理${ item.CCFinish }</li>  `
    }).join('');
    $('#top10-chart').html(strHtml);
  }

  // 时间段点击事件
  $('.right-operate').on('click', 'span', function (event) {
    var target = $(event.currentTarget);

    // 如果当前元素是被点击的, 不做任何操作
    if (target.hasClass('active')) return false;

    var type = target.attr('data-type');
    var queryType = target.attr('data-query-type');

    // 切换active类名
    $(`.right-operate[data-type=${ type }] span`).removeClass('active');
    target.addClass('active');

    // 获取本模块的多选框
    var checkboxs = $(`.pp-checkboxs input.checkbox-item:checkbox:checked`)

    var ids = $.map(checkboxs, function (item) {
      return $(item).attr('data-id');
    }).join(',')

    // 更新模块数据
    reloadModule(type, ids, queryType)
  });

  // 点击查询事件
  $('.query-btn').click(function (event) {
    var target = $(event.currentTarget);
    // 获取本模块的多选框
    var checkboxs = $(`.pp-checkboxs input.checkbox-item:checkbox:checked`) || [];

    var ids = $.map(checkboxs, function (item) {
      return $(item).attr('data-id');
    }).join(',')

    // 更新模块数据
    reloadModule('', ids);
  })

  // 全选/反选事件
  $(".pp-dashboard-wrapper").on("change", '.checkbox-all', function (event) {
    var target = $(event.currentTarget);
    var $parents = target.parents('.pp-checkboxs');
    // checkout勾选状态
    var checkedStatus = target.is(':checked');
    var checkboxs = $parents.find('.checkbox-item');

    for (var i = 0; i < checkboxs.length; i++) {
      if (checkboxs[ i ].type == "checkbox")
        checkboxs[ i ].checked = checkedStatus;
    }
  })

  // 单个勾选事件
  $(".pp-dashboard-wrapper").on("change", '.checkbox-item', function (event) {
    var target = $(event.currentTarget);
    var $parents = target.parents('.pp-checkboxs');

    // 获取没选中的checkbox-item
    var unCheckedBoxs = $parents.find(".checkbox-item").not("input:checked");

    // 切换全选勾选框的勾选状态
    if (unCheckedBoxs.length > 0) {
      $parents.find('.checkbox-all')[ 0 ].checked = false;
    } else {
      $parents.find('.checkbox-all')[ 0 ].checked = true;
    }
  })

  // 初始调用
  getPPList();
})()