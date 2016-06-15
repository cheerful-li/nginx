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

	'use strict';

	__webpack_require__(1);
	var rangeUtil = __webpack_require__(3);
	var uploadedImg = [];
	var introductionImg = "";

	function showImgPreview() {
		var $blogContainer = $(".imgPreviewContainer");
		$blogContainer.html("");
		uploadedImg.forEach(function (url) {
			var img = document.createElement("img");
			img.src = url;
			$blogContainer.append(img);
		});
	}

	function isFirstLevelNode() {
		var selection = window.getSelection();
		var range = selection.getRangeAt(0);
		if (range.commonAncestorContainer == $(".blogContainer")[0]) {
			return range.commonAncestorContainer;
		}
		if (range.commonAncestorContainer.parentNode == $(".blogContainer")[0]) {
			return range.commonAncestorContainer.parentNode;
		}
		return range.commonAncestorContainer.parentNode.parentNode == $(".blogContainer")[0] ? range.commonAncestorContainer.parentNode : false;
	}

	function isFirstLevelP() {
		return isFirstLevelNode() && isFirstLevelNode().tagName == "P";
	}
	/**
	 * 在第一级p元素中，enter换行时，正确创建新的p
	 */
	function createP() {
		if (!isFirstLevelNode()) return;
		var selection = window.getSelection();
		var sRange = selection.getRangeAt(0);
		var blogContainer = sRange.commonAncestorContainer;
		if (blogContainer.nodeType == 3) blogContainer = blogContainer.parentNode;
		if (blogContainer != $(".blogContainer")[0]) {
			var startIndex = sRange.startOffset;
			var endIndex = sRange.endOffset;
			var startText = blogContainer.innerText.slice(0, startIndex);
			var endText = blogContainer.innerText.slice(endIndex);

			blogContainer.innerText = startText;
			if (startText.trim() === "") blogContainer.innerHTML = "<br/>";
			var afterNode = $("<p/>")[0];
			$(afterNode).text(endText);
			if (endText.trim() === "") afterNode.innerHTML = "<br/>";
			$(blogContainer).after(afterNode);
			var range = document.createRange();
			range.selectNode(afterNode.childNodes[0]);
			range.collapse(true);
			selection.removeAllRanges();
			selection.addRange(range);
		} else {
			var id = "rand_id" + new Date().getTime();
			document.execCommand("insertHTML", false, "<p id=\"" + id + "\"><br/></p>");
			rangeUtil.focusNode($("#" + id).removeAttr("id")[0]);
		}
	}
	var tabUtil = {
		data: {},
		register: function register(tag, dealFun) {
			tabUtil.data[tag] = dealFun || function () {};
		},
		//tag.class@param
		deal: function deal(tag) {
			var matchs = tag.match(/@[^\.]*|\.[^@]*/g);
			var _class = "";
			var _param = "";
			var _tag = "";
			//分离tag class param
			if (matchs) {
				matchs.forEach(function (str) {
					if (str.indexOf("@") === 0) {
						_param = str.slice(1);
					} else {
						_class = str.slice(1);
					}
				});
			}
			_tag = tag.split(/\.|@/)[0];
			if (tabUtil.data[_tag]) {
				tabUtil.data[_tag](_tag, _class, _param);
			}
		}
	};

	function uploadImg(cb) {
		var $upfile = $("#upfile");
		$upfile.on('change', function () {
			var formData = new FormData();
			formData.append('file', $upfile[0].files[0]);
			$.ajax({
				url: '/blog/xhr/uploadImg',
				type: 'POST',
				cache: false,
				data: formData,
				processData: false,
				contentType: false
			}).done(cb).fail(function () {
				console.log('img upload fail');
			}).always(function () {
				$upfile.off("change");
			});
		});
		$upfile[0].click();
	}
	//img标签
	function dealImg(needInsert) {
		uploadImg(function (res) {
			var url = res.result;
			uploadedImg.push(url);
			showImgPreview();
			//插入到编辑区域
			if (needInsert) {
				var blogContainer = rangeUtil.getRangeNode();
				if (blogContainer != $(".blogContainer")[0]) {
					$(blogContainer).replaceWith($("<img src=\"" + url + "\"/>"));
				} else {
					document.execCommand("insertImage", false, url);
				}
			}
		});
	}
	tabUtil.register("img", dealImg.bind(undefined, true));
	//code标签
	function dealCode(tag, clazz) {
		if (clazz && clazz.indexOf('js') !== -1) clazz += " language-javascript";
		if (clazz && clazz.indexOf('css') !== -1) clazz += " language-css";
		if (!clazz || clazz.indexOf('language') == -1) clazz = clazz ? clazz + ' language-html' : 'language-html';

		var blogContainer = rangeUtil.getRangeNode();
		/* globals dialog */
		dialog({
			title: '插入代码',
			content: '<textarea autofocus id="codeTextarea" style="width:500px;height:300px;"></textarea>',
			ok: function ok() {
				var text = $("#codeTextarea").val();

				var pre = $("<pre><code></code></pre>").addClass(clazz)[0];
				var code = $("code", pre)[0];
				$(code).text(text);
				$(blogContainer).replaceWith(pre);
				$(pre).after("<p><br/></p>");

				rangeUtil.focusNode($(pre).next()[0]);
				/* globals Prism */
				Prism.highlightElement(code, true, function () {
					console.log('set code callback');
				});
				// rangeUtil.focusNode(code);
			},
			okValue: '确定',
			cancelValue: '取消',
			cancel: function cancel() {}
		}).showModal();
	}
	//注册code标签
	tabUtil.register('code', dealCode);
	// h1~h6
	function dealHeading(tag, clazz) {

		var blogContainer = rangeUtil.getRangeNode();
		var newElem = $("<" + tag + "/>").addClass(clazz)[0];
		newElem.innerHTML = tag + " title here";
		$(blogContainer).replaceWith(newElem);
		rangeUtil.selectNode(newElem);
	}
	//注册h1~h6
	for (var i = 1; i <= 6; i++) {
		tabUtil.register("h" + i, dealHeading);
	}

	function dealTable(tag, clazz, param) {
		var blogContainer = rangeUtil.getRangeNode();
		if (!param) return console.log("table should set param colom and row");
		var _row = +param.split("*")[0];
		var _col = +param.split("*")[1];
		var _strArr = ['<table>'];
		//添加thead
		_strArr.push("<thead><tr>");
		for (var i = 0; i < _col; i++) {
			_strArr.push("<th><br/></th>");
		}
		_strArr.push("</tr></thead>");
		//添加tbody
		_strArr.push("<tbody>");
		for (i = 1; i < _row; i++) {
			_strArr.push('<tr>');
			for (var j = 0; j < _col; j++) {
				_strArr.push('<td><br/></td>');
			}
			_strArr.push('</tr>');
		}
		_strArr.push("</tbody>");
		_strArr.push('</table>');

		var table = $(_strArr.join("")).addClass(clazz)[0];
		$(blogContainer).replaceWith(table);
		rangeUtil.focusNode($("th,td", table)[0]);
	}
	//注册table
	tabUtil.register('table', dealTable);

	function onPressTab() {
		//处理常见标签的tab
		if (isFirstLevelP()) {
			var sRange = rangeUtil.getRange();
			var startIndex = sRange.startOffset;
			var blogContainer = sRange.commonAncestorContainer.parentNode;
			var tag = blogContainer.innerText.slice(0, startIndex);
			tabUtil.deal(tag);
		} else {
			//处理深沉次标签中其它tab

			dealTableTab();
		}
	}

	//表格项中tab切换到下一项
	function dealTableTab() {

		var node = rangeUtil.getRangeNode();
		if (node.tagName == "TD" || node.tagName == "TH") {
			var $table = $(node).closest("table");
			var $nodes = $("td,th", $table);
			var nextNode;
			for (var i = 0; i < $nodes.length; i++) {
				var curNode = $nodes[i];
				if (curNode == node) {
					nextNode = $nodes[i + 1];
					break;
				}
			}
			if (nextNode) {
				rangeUtil.focusNode(nextNode);
			}
		}
	}

	$(function () {
		var $blogContainer = $(".blogContainer");
		$blogContainer.on("focus", function () {
			if ($(this).html() === "") {
				$(this).html("<p><br/></p>");
				rangeUtil.focusNode(this.firstChild);
			}
		}).on("keydown", function (e) {
			//一级p标签中的换行，阻止掉浏览器默认的添加<div><br/></div>
			if (e.which == 13 && isFirstLevelNode()) {
				window.enterPrevented = true;
				return false;
			} else if (e.which == 13) {
				window.enterPrevented = false;
			}
		}).on("keyup", function (e) {
			if (e.which == 13 && window.enterPrevented) {
				//enter
				createP();
			}
		})
		//tab 处理
		.on("keydown", function (e) {
			if (e.which == 9) {
				console.log("tab");
				onPressTab();
				return false;
			}
		});
		$("#uploadArticleImg").on('click', dealImg);
		$("#uploadIntroductionImg").on('click', function () {
			uploadImg(function (res) {
				var url = introductionImg = res.result;
				var img = document.createElement('img');
				img.src = url;
				$(".introductionImgContainer").html("").append(img);
			});
		});

		//编辑文章
		var blogId = location.search ? location.search.match(/id=(\w*)/)[1] : false;
		if (blogId) {
			$.get('/blog/xhr/detail/' + blogId).then(function (res) {
				if (res.code == 401) location.href = "/blog/"; //需要登录
				var result = res.blog;
				if (result && result["_id"]) {
					window.__blogId = result["_id"];
					$("[name=title]").val(result.title);
					$("[name=introductionContent]").val(result.introductionContent);
					$(".blogContainer").html(result.content);
					introductionImg = result.introductionImg;
					var img = document.createElement('img');
					img.src = result.introductionImg;
					$(".introductionImgContainer").html("").append(img);
				} else {
					window.__blogId = '';
				}
			});
		}
	});

	$(".submit").on('click', function () {
		var title = $("[name=title]").val();
		var content = $(".blogContainer").html();
		//引言  不填写时取内容的前一百二十个字
		var introductionContent = $("#introductionContent").val().trim() ? $("#introductionContent").val().trim() : $(".blogContainer")[0].innerText.slice(0, 120);
		var data = {
			title: title,
			content: content,
			introductionImg: introductionImg,
			introductionContent: introductionContent,
			id: window.__blogId || undefined
		};
		if (title.trim() && content.trim()) {
			$.ajax({
				url: '/blog/xhr/blog',
				method: window.__blogId ? 'POST' : 'PUT',
				data: JSON.stringify(data),
				contentType: 'application/json;charset=UTF-8'
			}).done(function (res) {
				location.href = "/blog/index.html";
			}).fail(function (err) {
				console.log(err);
			});
		}
	});

	$("#op_createLink").on('click', function () {
		var selectText = window.getSelection().toString();
		var range = rangeUtil.getRange();
		dialog({
			title: '插入链接',
			content: '<input id="linkText" style="width:500px;" placeholder="文本" value="' + selectText + '"></input></br><input autofocus id="linkSrc" style="width:500px;margin-top:20px;" placeholder="src"></input>',
			ok: function ok() {
				var text = $("#linkText").val();
				var src = $("#linkSrc").val();
				if (!text || !src) return false;
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				document.execCommand("insertHTML", false, "<a href=\"" + src + "\">" + text + "</a>");
				// rangeUtil.focusNode(code);
			},
			okValue: '确定',
			cancelValue: '取消',
			cancel: function cancel() {}
		}).showModal();
	});
	$("#op_backColor").on('click', function () {
		var range = rangeUtil.getRange();
		dialog({
			title: '设置背景色',
			content: '<input class="form-control" id="input_backColor" style="width:500px;" placeholder="color" ></input>',
			ok: function ok() {
				var color = $("#input_backColor").val();
				if (!color) return false;
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(range);
				document.execCommand("backColor", false, color);
			},
			okValue: '确定',
			cancelValue: '取消',
			cancel: function cancel() {}
		}).showModal();
	});
	var lastBackup = "";
	var backupId = 0;
	//十秒备份一次
	setInterval(function () {
		var html = $(".blogContainer").html();
		if (!$(".blogContainer").text().trim()) return;
		if (html == lastBackup) return;
		lastBackup = html;
		backupId = backupId % 10;
		localStorage.setItem("backup_" + backupId, html);
		localStorage.setItem("backupId", backupId);
		backupId++;
	}, 10000);

/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	"use strict";

	var rangeUtil = {
		focusNode: function focusNode(node) {
			var range = document.createRange();
			range.selectNode(node.childNodes[0]);
			range.collapse();
			var selection = document.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		},
		selectNode: function selectNode(node) {
			var range = document.createRange();
			range.selectNode(node.childNodes[0]);
			var selection = document.getSelection();
			selection.removeAllRanges();
			selection.addRange(range);
		},
		getRange: function getRange() {
			var selection = window.getSelection();
			var sRange = selection.getRangeAt(0);
			return sRange;
		},
		getRangeNode: function getRangeNode() {
			var sRange = rangeUtil.getRange();
			var blogContainer = sRange.commonAncestorContainer;
			if (blogContainer.nodeType == 3) {
				//文本节点
				blogContainer = blogContainer.parentNode;
			}
			return blogContainer;
		}
	};
	module.exports = rangeUtil;

/***/ }
/******/ ]);