/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	__webpack_require__(4);
	$(function () {
		var show = true;
		var top = 50;
		$(".blogContainer").on("scroll", function () {
			var scrollTop = $(this).scrollTop();
			if (scrollTop > top && show) {
				show = false;
				dealScroll(show);
			} else if (scrollTop < top && !show) {
				show = true;
				dealScroll(show);
			}
		});

		function dealScroll(show) {
			if (show) {
				$(".pageTop").slideDown(300);
				$(".blogContainer").animate({
					"top": 54
				}, 300);
			} else {
				$(".pageTop").slideUp(300);
				$(".blogContainer").animate({
					"top": 0
				}, 300);
			}
		}
		if (localStorage.commentName) {
			$("#commentName").prop('disabled', true).val(localStorage.commentName);
		}

		//评论表单
		var commentDisabled = false;
		var blogId = $("#blogId").val();
		var replyName = "";
		$(".js-submitCommentBtn").on("click", function () {
			var name = $("#commentName").val().trim();
			var content = $("#commentContent").val().trim();
			if (!name || !content || commentDisabled) return;
			commentDisabled = true;
			$(".js-submitCommentBtn").prop("disabled", true);
			//五秒内不可再次提交
			setTimeout(function () {
				$(".js-submitCommentBtn").prop("disabled", false);
				commentDisabled = false;
			}, 5000);
			var data = {
				name: name,
				content: content,
				replyName: replyName
			};
			$.ajax('/blog/xhr/comments/' + blogId, {
				type: 'PUT',
				data: data
			}).then(function (data) {
				localStorage.commentName = name;
				$("#commentName").prop('disabled', true);
				$("#commentContent").val("");
				refreshCommentsList();
			});
			return false;
		});

		function refreshCommentsList() {
			$.get('/blog/xhr/comments/' + blogId).then(function (data) {
				var container = $(".commentsList").html('');
				$(data.list).each(function (index, item) {
					var html = "<div class=\"commentItem\">\n\t\t\t\t<div class=\"commentHead\">\n\t\t\t\t\t<span class=\"commentName\">" + item.name + "</span>\n\t\t\t\t\t <span class=\"js-insert\"></span>\n\t\t\t\t\t<span class=\"commentTime\">\n\t\t\t\t\t" + item.createTime + "\n\t\t\t\t\t</span>\n\t\t\t\t\t<a href=\"javascript:void(0)\" data-reply-name=\"" + item.name + "\" class=\"toCommentReply\">回复</a>\n\t\t\t\t</div>\n\t\t\t\t<div class=\"commentContent\">" + item.content + "</div>\n\t\t\t\t</div>";
					var $elem = $(html);
					if (item.replyName) {
						$elem.find(".js-insert").html("回复 <span class=\"commentName\">" + item.replyName + "</span>");
					}
					$elem.appendTo(container);
				});
			});
		}

		$(".replyTo .delete").on('click', function () {
			$('.replyTo').css('visibility', 'hidden');
			replyName = "";
		});
		$("body").on('click', 'a[data-reply-name]', function () {
			var $elem = $(this);
			replyName = $elem.data("replyName");
			if (replyName) {
				$('.replyTo').css('visibility', 'visible').find('.js-replyName').text(replyName);
			}
		});
	});

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);