function chage_header() {
  if ($(document).scrollTop() > 450) {
    $(".header-top").addClass("header-top-down");
    $(".back-top").show();
  } else if ($(document).scrollTop() > 0) {
    $(".header-top").removeClass("color header-top-down");
    $(".back-top").hide();
  } else {
    $(".header-top.home").addClass("color");
  }
}

function fixed_sidebar() {
  if ($(window).width() > 767 && $(".main-right").length > 0 && ($(".main-right").height() < $(".main-left").height())) {
    if ($(document).scrollTop() > fixed_top) {
      $(".main-right").addClass("fixed").css({
        'left': fixed_left,
        'width': fixed_width
      });
    } else {
      $(".main-right").removeClass("fixed").css({
        'left': '',
        'width': ''
      });
    }
  }
}

function playlist_height() {
  if ($(".min-play-list").length > 0) {
    if ($(window).width() > 767) {
      $(".min-play-list").css('maxHeight',$(".player-left").height() - $(".player-tips").outerHeight() - $(".details-play-nav").outerHeight() - 40);
    } else {
      $(".min-play-list").css('maxHeight',485);
    }
  }
}
var fixed_left, fixed_top, fixed_width;
var history_html = '';
var History = {
  'BoxShow': 0,
  'Limit': 10,
  'Days': 7,
  'Json': '',
  'Init': function () {
    if ($('.mac_history2').length == 0) {
      return;
    }
    var jsondata = [];
    if (this.Json) {
      jsondata = this.Json;
    } else {
      var jsonstr = MAC.Cookie.Get('mac_history2');
      if (jsonstr != undefined) {
        jsondata = eval(jsonstr);
      }
    }
    if (jsondata.length > 0) {
      for ($i = 0; $i < jsondata.length; $i++) {
        history_html += '<li><span class="hidden-xs hidden-sm">' + ($i + 1) + '.</span><h5><em class="hidden-xs hidden-sm"></em><a href="' + jsondata[$i].link + '">' + jsondata[$i].name + '</a><em>/</em><a href="' + jsondata[$i].playlink + '">' + jsondata[$i].playname + '</a></h5><a class="playlog-del" href="' + jsondata[$i].playlink + '" title="继续">继续</a></li>';
      }
    } else {
      history_html += '<strong class="text-color">暂无观看历史记录列表</strong>';
    }
    $('.mac_history_box').html(history_html);
    if ($(".mac_history_set").attr('data-name')) {
      var $that = $(".mac_history_set");
      History.Set($that.attr('data-id'), $that.attr('data-name'), $that.attr('data-playname'), $that.attr('data-link'), $that.attr('data-playlink'));
    }
  },
  'Set': function (id, name, playname, link, playlink) {
    if (!playlink) {
      playlink = document.URL;
    }
    var jsondata = MAC.Cookie.Get('mac_history2');
    if (jsondata != undefined) {
      this.Json = eval(jsondata);
      for ($i = 0; $i < this.Json.length; $i++) {
        if (this.Json[$i].playlink == playlink) {
          return false;
        }
      }
      jsonstr = '{log:[{"id":"' + id + '","name":"' + name + '","playname":"' + playname + '","link":"' + link + '","playlink":"' + playlink + '"},';
      for ($i = 0; $i < this.Json.length; $i++) {
        if ($i <= this.Limit && this.Json[$i]) {
          if (this.Json[$i].id != id) {
            jsonstr += '{"id":"' + this.Json[$i].id + '","name":"' + this.Json[$i].name + '","playname":"' + this.Json[$i].playname + '","link":"' + this.Json[$i].link + '","playlink":"' + this.Json[$i].playlink + '"},';
          } else {
            continue;
          }
        } else {
          break;
        }
      }
      jsonstr = jsonstr.substring(0, jsonstr.lastIndexOf(','));
      jsonstr += "]}";
    } else {
      jsonstr = '{log:[{"id":"' + id + '","name":"' + name + '","playname":"' + playname + '","link":"' + link + '","playlink":"' + playlink + '"}]}';
    }
    this.Json = eval(jsonstr);
    MAC.Cookie.Set('mac_history2', jsonstr, this.Days);
  },
  'Clear': function () {
    MAC.Cookie.Del('mac_history2');
    $('.mac_history_box').html('<strong class="text-color">暂无观看历史记录列表</strong>');
  },
}
var Comment = {
  'Login': 0,
  'Verify': 0,
  'Init': function () {
    $('body').on('click', '.comment_face_box img', function (e) {
      var obj = $(this).parent().parent().parent().find('.comment_content');
      MAC.AddEm(obj, $(this).attr('data-id'));
    });
    $('body').on('click', '.comment_face_panel', function (e) {
      // $('.comment_face_box').toggle();
      $(this).parent().find('.comment_face_box').toggle();
    });
    $('body').on('keyup', '.comment_content', function (e) {
      var obj = $(this).parent().parent().parent().parent().find('.comment_remaining');
      MAC.Remaining($(this), 200, obj)
    });
    $('body').on('focus', '.comment_content', function (e) {
      if (Comment.Login == 1 && MAC.User.IsLogin != 1) {
        MAC.User.Login();
      }
    });

    $('body').on('click', '.comment_report', function (e) {
      var $that = $(this);
      if ($(this).attr("data-id")) {
        MAC.Ajax(maccms.path + '/index.php/comment/report.html?id=' + $that.attr("data-id"), 'get', 'json', '', function (r) {
          $that.addClass('disabled');
          MAC.Pop.Msg(100, 20, r.msg, 1000);
          if (r.code == 1) {}
        });
      }
    });

    $('body').on('click', '.comment_reply2', function (e) {
      var $that = $(this);
      var $target = $("#comment-replay-" + $that.attr("data-id"))
      if ($that.attr("data-id")) {
        var str = $that.html();
        $('.comment_reply_form').remove();
        if (str == '取消回复') {
          $that.html('回复');
        }
        if (str == '回复') {
          $that.html('取消回复');
        }
        $(".comment_reply2").not($that).html("回复");
        $(".comment-replay").not($target).hide();
        $target.toggle().find("textarea").focus();
      }
    });

    $('body').on('click', '.comment_submit', function (e) {
      var $that = $(this);
      Comment.Submit($that);
    });

  },
  'Show': function ($page) {
    if ($(".mac_comment2").length > 0) {
      MAC.Ajax(maccms.path + '/index.php/comment/ajax.html?rid=' + $('.mac_comment2').attr('data-id') + '&mid=' + $('.mac_comment2').attr('data-mid') + '&page=' + $page, 'get', 'json', '', function (r) {
        $(".mac_comment2").html(r);
        fixed_sidebar();
      }, function () {
        $(".ui-comment").html('<li class="loading" href="javascript:void(0)" onclick="Comment.Show(' + $page + ')">评论加载失败，点击我刷新...</li>');
      });
    }
  },
  'Reply': function ($o) {

  },
  'Submit': function ($o) {
    var form = $o.parents('form');
    if ($(form).find(".comment_content").val() == '') {
      MAC.Pop.Msg(100, 20, '请输入您的评论！', 1000);
      return false;
    }
    if ($('.mac_comment2').attr('data-mid') == '') {
      MAC.Pop.Msg(100, 20, '模块mid错误！', 1000);
      return false;
    }
    if ($('.mac_comment2').attr('data-id') == '') {
      MAC.Pop.Msg(100, 20, '关联id错误！', 1000);
      return false;
    }
    MAC.Ajax(maccms.path + '/index.php/comment/saveData', 'post', 'json', $(form).serialize() + '&comment_mid=' + $('.mac_comment2').attr('data-mid') + '&comment_rid=' + $('.mac_comment2').attr('data-id'), function (r) {
      MAC.Pop.Msg(100, 20, r.msg, 1000);
      if (r.code == 1) {
        $(".comment-replay-cnt").hide();
        Comment.Show(1);
      } else {
        if (Comment.Verify == 1) {
          MAC.Verify.Refresh();
        }
      }
    });
  }
}
$(function () {
  if ($(".index-slide").length > 0) {
    var indexSlideThumb = new Swiper('.index-slide-txt', {
      spaceBetween: 0,
      watchSlidesVisibility: true,
      slidesPerView: 'auto',
      direction: 'vertical',
    });
    var indexSlide = new Swiper('.index-slide', {
      effect: 'fade',
      lazy: {
        loadPrevNext: true,
      },
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',

      },
      thumbs: {
        swiper: indexSlideThumb
      }
    });
    $(".index-slide-txt li").hover(function () {
      indexSlide.slideTo($(this).index());
    }, function () {});
  }
  if ($(".box-slide").length > 0) {
    var boxSlide = new Swiper('.box-slide', {
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      loop: true,
      lazy: {
        loadPrevNext: true,
      },
      autoplay: {
        delay: 3000,
        stopOnLastSlide: false,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    });
  }
  if ($(".auto-slide").length > 0) {
    var autoSlide = new Swiper('.auto-slide', {
      loop: true,
      lazy: {
        loadPrevNext: true,
        loadPrevNextAmount: 7,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      slidesPerView: 'auto',
    });
    $(".index-slide-txt li").hover(function () {
      indexSlide.slideTo($(this).index());
    }, function () {});
  }
  var navSlide = new Swiper('.header-nav-wrap', {
    slidesPerView: 'auto',
    freeMode: true,
    initialSlide: $(".header-nav-wrap").find(".active").index() - 1,
  });
  var subNavSlide = new Swiper('.nav-box', {
    slidesPerView: 'auto',
    freeMode: true,
    initialSlide: $(".nav-box").find(".active").index() - 1,
  });
  $(".type-select").each(function () {
    var filterSlide = new Swiper($(this), {
      initialSlide: $(this).find(".active").index() - 1,
      slidesPerView: 'auto',
      freeMode: true
    });
  });

  $(".lazyload").lazyload({
    effect: "fadeIn",
    threshold: 100,
  });
  $(".my-tab li").click(function () {
    if (!$(this).hasClass("active")) {
      $(this).addClass("active").siblings().removeClass("active");
      $($(this).attr("id")).removeClass("hide").siblings().addClass("hide");
      $($(this).attr("id")).find(".lazyload").lazyload({});
      if ($(this).find(".gico")) {
        var $that = $(this).find(".gico").eq(0);
        $("#min-more").removeClass().addClass($that.attr("class")).find("em.name").text($that.text());
      }
    }
  });
  $(".back-top").click(function () {
    $("html,body").animate({
      scrollTop: 0
    }, 300);
  });
  $(".slideDown-btn").click(function () {
    var $that = $(this);
    $(".slideDown-box").slideToggle("fast", function () {
      if (!$that.hasClass("active")) {
        $that.html('展开<i class="iconfont icon-down"></i>');
      } else {
        $that.html('收起<i class="iconfont icon-up"></i>');
      }
      $that.toggleClass("active");
    });
  });
  $(".detail-info-shrink").click(function () {
    $(this).find("p").toggleClass("txt-hidden");
    $(this).find(".iconfont").toggleClass("icon-down icon-up");
  });
  $("#min-more").click(function () {
    $(this).find(".iconfont").toggleClass("icon-down icon-up");
    $(".player-more-list").toggle();
  });
  $(".player-more-list a").click(function () {
    $($(this).attr("id")).removeClass("hide").siblings().addClass("hide");
    $(".details-play-nav li").eq($(this).parent().index()).addClass("active").siblings().removeClass("active");
    $("#min-more").removeClass().addClass($(this).attr("class")).find("em.name").text($(this).text()).siblings(".iconfont").removeClass("icon-up").addClass("icon-down");
    $(".player-more-list").hide();
  });
  $("#player-shrink").click(function () {
    $(this).toggleClass("icon-right icon-left");
    $(".vod-play-box").toggleClass("max")
  });
  $('body').on('click', '#cmt-input-tip', function () {
    $(this).hide();
    $("#cmt-input-bd").show().find("textarea").focus();
  });
  $('body').click(function (e) {
    if ($(e.target).closest(".zanpian-wd,#hot-search").length > 0) {
      $("#hot-search").show();
    } else {
      $("#hot-search").hide();
    }
  });
  if ($('.mac_star2').length > 0) {
    $('.mac_star2').raty({
      starType: 'li',
      number: 5,
      numberMax: 5,
      space: false,
      score: function () {
        $(".raty-score-num").text($(this).attr('score'));
        $(".raty-score-bar").animate({
          'width': $(this).attr('score') * 10 + '%'
        }, 300);
        return $(this).attr('data-star');
      },
      hints: ['很差', '较差', '还行', '推荐', '力荐'],
      starOff: '',
      starOn: 'active',
      target: '#ratewords',
      targetKeep: true,
      click: function (score, evt) {
        MAC.Ajax(maccms.path + '/index.php/ajax/score?mid=' + $('.mac_star2').attr('data-mid') + '&id=' + $('.mac_star2').attr('data-id') + '&score=' + (score * 2), 'get', 'json', '', function (r) {
          if (r.code == 1) {
            $(this).attr({
              'score': r.data.score,
              'data-star': Math.ceil(r.data.score / 2)
            });
            $(".raty-score-num").text($(this).attr('score'));
            $(".raty-score-bar").animate({
              'width': $(this).attr('score') * 10 + '%'
            }, 300);
            $('.mac_star2').raty('score', Math.ceil(r.data.score / 2));
            MAC.Pop.Msg(100, 20, '评分成功', 1000);
          } else {
            $('.mac_star2').raty('score', $(this).attr('data-star'));
            console.log($(this).attr('data-star'));
            MAC.Pop.Msg(100, 20, r.msg, 1000);
          }
        }, function () {
          $('.mac_star2').raty('score', $(this).attr('data-star'));
          MAC.Pop.Msg(100, 20, '网络异常', 1000);
        });

      }
    });
  }
  if ($(".main-right").length > 0) {
    $(".main-right .lazyload").lazyload({
      effect: "fadeIn",
      threshold: 200
    })
    fixed_left = $(".main-right").offset().left;
    fixed_top = $(".main-right").offset().top + $(".main-right").height() - $(window).height();
    fixed_width = $(".main-right").outerWidth();
  }
  History.Init();
  chage_header();
  fixed_sidebar();
  playlist_height();
  $(window).scroll(function () {
    chage_header();
    fixed_sidebar();
  });
  $(window).resize(function () {
    if ($(".main-right").length > 0) {
      $(".main-right").removeClass("fixed").css({
        'left': '',
        'width': ''
      });
      fixed_left = $(".main-right").offset().left;
      fixed_top = $(".main-right").offset().top + $(".main-right").height() - $(window).height();
      fixed_width = $(".main-right").outerWidth();
    }
    fixed_sidebar();
    playlist_height();
  });
});
