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

	__webpack_require__(5);
	__webpack_require__(6);

	$(function () {
		$("#loginBtn").on("click", function () {
			window.loginWin = dialog({
				title: '登陆',
				content: '<form onsubmit="return false;"><input class="form-control" autofocus id="userName" style="width:500px;" placeholder="用户名" >' + '<input class="form-control" id="password" style="width:500px;margin-top:20px;" placeholder="密码" ></form>',
				ok: function ok() {
					var userName = $("#userName").val();
					var password = $("#password").val();
					if (!userName.trim() || !password.trim()) return;
					$.post('/xhr/login', {
						userName: userName,
						password: password
					}).then(function (res) {
						if (res.code == 200) {
							location.reload();
						}
					});
				},
				okValue: '确定',
				cancelValue: '取消',
				cancel: function cancel() {}
			}).showModal();
		});
		$("#logoutBtn").on("click", function () {
			window.logoutWin = dialog({
				title: '退出',
				content: '确定退出登陆么？',
				width: 400,
				ok: function ok() {
					$.post('/xhr/logout').then(function (res) {
						if (res.code == 200) {
							location.reload();
						}
					});
				},
				okValue: '确定',
				cancelValue: '取消',
				cancel: function cancel() {}
			}).showModal();
		});
	});

/***/ },
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 6 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ }
/******/ ]);