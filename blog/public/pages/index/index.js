require("./../../common/common.scss");
require("./index.scss");

$(function() {
	$("#loginBtn").on("click", function() {
		window.loginWin = dialog({
			title: '登陆',
			content: '<form onsubmit="return false;"><input type="text" class="form-control" autofocus id="userName" style="width:500px;" placeholder="用户名" >' +
				'<input type="password" class="form-control" id="password" style="width:500px;margin-top:20px;" placeholder="密码" ></form>',
			ok: function() {
				var userName = $("#userName").val();
				var password = $("#password").val();
				if (!userName.trim() || !password.trim()) return;
				$.post('/xhr/login', {
					userName: userName,
					password: password
				}).then(function(res) {
					if (res.code == 200) {
						location.reload();
					}
				});
			},
			okValue: '确定',
			cancelValue: '取消',
			cancel: function() {}
		}).showModal();
	});
	$("#logoutBtn").on("click", function() {
		window.logoutWin = dialog({
			title: '退出',
			content: '确定退出登陆么？',
			width: 400,
			ok: function() {
				$.post('/xhr/logout').then(function(res) {
					if (res.code == 200) {
						location.reload();
					}
				});
			},
			okValue: '确定',
			cancelValue: '取消',
			cancel: function() {}
		}).showModal();
	})
});