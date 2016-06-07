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
	var rangeUtil = __webpack_require__(5);
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
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/postcss-loader/index.js!./../../../../node_modules/sass-loader/index.js!./style.scss", function() {
				var newContent = require("!!./../../../../node_modules/css-loader/index.js!./../../../../node_modules/postcss-loader/index.js!./../../../../node_modules/sass-loader/index.js!./style.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports


	// module
	exports.push([module.id, "html, body {\n  margin: 0;\n  padding: 0;\n  position: relative;\n  height: 100%;\n  font-family: 'Microsoft Yahei' !important;\n  background-size: cover;\n  background-position: center center;\n  background-repeat: no-repeat;\n  background-image: url(https://drscdn.500px.org/photo/118310777/m%3D2048/8488495b6153330b612e6bbd8194cc00); }\n\na {\n  cursor: pointer; }\n\n.blogContainer {\n  position: absolute;\n  top: 54px;\n  bottom: 10px;\n  left: 0;\n  right: 0;\n  overflow-y: auto;\n  box-sizing: border-box;\n  border: 1px solid #ddd;\n  border-bottom-left-radius: 2px;\n  border-bottom-right-radius: 2px;\n  padding: 10px 20px;\n  overflow: auto;\n  outline: none;\n  background-color: #fff; }\n  .blogContainer > p {\n    line-height: 1.8;\n    margin: 0 0 25px 0;\n    color: #333;\n    font-size: 16px; }\n  .blogContainer table {\n    border: 1px solid #ddd;\n    border-collapse: collapse; }\n  .blogContainer table td, .blogContainer table th {\n    border: 1px solid #ddd;\n    padding: 10px 20px;\n    text-align: center; }\n  .blogContainer img {\n    max-width: 100%; }\n\n.pageTop {\n  text-align: center;\n  padding-top: 10px;\n  padding-bottom: 10px;\n  background-color: #f5f5f5;\n  border: 1px solid #e5e5e5;\n  border-bottom: none;\n  position: absolute;\n  top: 0px;\n  width: 100%;\n  left: 0;\n  border-top-left-radius: 2px;\n  border-top-right-radius: 2px; }\n  .pageTop input.titleInput {\n    width: 400px;\n    display: inline-block;\n    text-align: center;\n    min-height: 26px;\n    padding-top: 0;\n    padding-bottom: 0;\n    background: transparent;\n    border: none;\n    border-radius: 3px;\n    box-shadow: none; }\n    .pageTop input.titleInput:focus {\n      border: 1px solid #ddd;\n      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075); }\n\n.center {\n  text-align: center; }\n\n::-webkit-scrollbar {\n  width: 7px;\n  height: 7px;\n  background-color: transparent;\n  border-radius: 5px; }\n\n::-webkit-scrollbar:hover {\n  background-color: transparent; }\n\n::-webkit-scrollbar-thumb {\n  background: #dbdbdb;\n  border-radius: 9px;\n  background-clip: content-box;\n  border: 5px solid transparent; }\n\n::-webkit-scrollbar-thumb:hover {\n  background: #c2c2c2;\n  background-clip: content-box; }\n\n.rightArea {\n  width: 200px;\n  overflow: auto; }\n\n.leftArea {\n  width: 200px;\n  color: #fff;\n  overflow-y: auto; }\n  .leftArea .leftTitleContainer {\n    text-align: left; }\n    .leftArea .leftTitleContainer .leftTitle:before {\n      content: \" \";\n      width: 4px;\n      vertical-align: bottom;\n      height: 1em;\n      background-color: #893434;\n      margin-right: 8px;\n      display: inline-block; }\n  .leftArea .introductionImgContainer img, .leftArea .imgPreviewContainer img {\n    max-width: 100%; }\n\n.pageContainer {\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0; }\n\n.pageContent {\n  position: absolute;\n  top: 10px;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch; }\n\n.leftArea, .rightArea, .centerArea {\n  position: relative;\n  padding: 20px;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 200px;\n          flex: 1 1 200px; }\n\n.centerArea {\n  -webkit-box-flex: 2;\n      -ms-flex: 2 1 800px;\n          flex: 2 1 800px;\n  margin: 0 20px;\n  position: relative; }\n", ""]);

	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function() {
		var list = [];

		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for(var i = 0; i < this.length; i++) {
				var item = this[i];
				if(item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};

		// import a list of modules into the list
		list.i = function(modules, mediaQuery) {
			if(typeof modules === "string")
				modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for(var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if(typeof id === "number")
					alreadyImportedModules[id] = true;
			}
			for(i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if(mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if(mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];

	module.exports = function(list, options) {
		if(false) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}

		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();

		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";

		var styles = listToStyles(list);
		addStylesToDom(styles, options);

		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}

	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}

	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}

	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}

	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}

	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}

	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}

	function addStyle(obj, options) {
		var styleElement, update, remove;

		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}

		update(obj);

		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}

	var replaceText = (function () {
		var textStore = [];

		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();

	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;

		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}

	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;

		if(media) {
			styleElement.setAttribute("media", media)
		}

		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}

	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;

		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}

		var blob = new Blob([css], { type: "text/css" });

		var oldSrc = linkElement.href;

		linkElement.href = URL.createObjectURL(blob);

		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
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