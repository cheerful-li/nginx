!function(o){function n(r){if(t[r])return t[r].exports;var e=t[r]={exports:{},id:r,loaded:!1};return o[r].call(e.exports,e,e.exports,n),e.loaded=!0,e.exports}var t={};return n.m=o,n.c=t,n.p="",n(0)}([function(o,n,t){"use strict";t(4),$(function(){function o(o){o?($(".pageTop").slideDown(300),$(".blogContainer").animate({top:54},300)):($(".pageTop").slideUp(300),$(".blogContainer").animate({top:0},300))}var n=!0,t=50;$(".blogContainer").on("scroll",function(){var r=$(this).scrollTop();r>t&&n?(n=!1,o(n)):t>r&&!n&&(n=!0,o(n))})})},,,,function(o,n){}]);