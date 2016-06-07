	var Container = React.createClass({displayName: "Container",
		getInitialState: function(){
			return {
				account:{},
				cost:{},
				labels:[]
			};
		},
		componentWillMount:function(){
			this.getPreData();
		},
		componentDidMount:function(){
			//针对响应式布局，非小屏时，暂开 记账表单页面
			window.li1 = this.refs.li1.getDOMNode();
			window.li2 = this.refs.li2.getDOMNode();
			if(window.getComputedStyle(this.refs.li1.getDOMNode()).display== "none"){
				this.refs.li2.getDOMNode().firstElementChild.click();
			}
		},
		getPreData:function(){
			this.cost = this.account =  undefined;
			$.get('/moneyDetail').done(this.cbGetPreData.bind(this,"cost"));
			$.get('/accountDetail').done(this.cbGetPreData.bind(this,"account"));
			$.get('/labels').done(this.cbGetPreData.bind(this,"labels"));
		},
		cbGetPreData:function(flag,data){
			if(flag=="cost"){
				this.cost = data.result;
			} else if(flag == "account") {
				this.account = data.result;
			} else if(flag == "labels"){
				this.state.labels = data.result;
				console.log(JSON.stringify(data.result));
			}
			if(this.cost && this.account){
				this.setState({cost:this.cost,account:this.account});
			}
		},
		onAddData: function(data){
			var date = new Date();
			date = date.toLocaleDateString().split("/").join("-");
			var d = $("#dateInput").val();
			data.date = d || date;
			console.log(JSON.stringify(data));
			if(this.account && this.account.userName){
				data.userName = this.account.userName;
				var that = this;
				$.ajax('/moneyDetail',{
					method:"put",
					type:"json",
					data:data
				}).done(function(data){
					that.getPreData();
				});
			}
		},
		render: function(){
			return (
				React.createElement("div", {className: "container-fluid", style: {maxWidth:700}}, 
					React.createElement("div", {className: "hidden-xs"}, 
						React.createElement(Head, {account: this.state.account})
					), 
					
					React.createElement("div", null, 
						React.createElement("ul", {className: "nav nav-tabs"}, 
							React.createElement("li", {className: "visible-xs active", ref: "li1"}, 
								React.createElement("a", {href: "#accountDetail", "data-toggle": "pill"}, "账户信息")
							), 
							React.createElement("li", {className: "", ref: "li2"}, 
								React.createElement("a", {href: "#addContainer", "data-toggle": "pill"}, "记一笔账")
							), 
							React.createElement("li", null, 
								React.createElement("a", {href: "#detailContainer", "data-toggle": "pill"}, "查看明细")
							)
						), 
						React.createElement("div", {className: "tab-content"}, 
							React.createElement("div", {className: "visible-xs tab-pane fade in active ", id: "accountDetail"}, 
								React.createElement(Head, {account: this.state.account})
							), 
							React.createElement("div", {className: "tab-pane fade ", id: "addContainer"}, 
								React.createElement(AddForm, {labels: this.state.labels, submit: this.onAddData.bind(this)})
							), 
							React.createElement("div", {className: "tab-pane fade ", id: "detailContainer"}, 
								React.createElement(AllDateList, {onfresh: this.getPreData.bind(this), data: this.state.cost})
							)
						)
					)
					
					
				)
				);
		}
	});
	var Item = React.createClass({displayName: "Item",
		onAddDetail: function(event){
			var target = event.target;
			event.stopPropagation(); this.refs.toAddDetailBtn.getDOMNode().click();
			var parent = $(target).closest(".panel");
			var label = parent.find("input[name='label']");
			var money = parent.find("input[name='money']");
			var labelValue = label.val();
			var moneyValue = money.val();
			var data = this.props.data;
			if(labelValue.trim() && moneyValue.trim()){
				data.detail = data.detail || [];
				data.detail.unshift({label:labelValue,money:moneyValue});
				data.detail = JSON.stringify(data.detail);

				//清空表单
				label.val("");
				money.val("");
			} else{
				return;
			};
			var that =this;
			console.log(JSON.stringify(data));
			$.post('/moneyDetail',data).done(function(){
				that.props.onfresh();
			});
		},
		onDeleteDetail:function(index,event){
			console.log(index);
			var target = event.target;
				event.stopPropagation();
			
			var data = this.props.data;
			var detail = data.detail || [];
			if(detail[index]){
				data.detail.splice(index,1);
			}
			var that =this;
			console.log(JSON.stringify(data));
			$.post('/moneyDetail',data).done(function(){
				that.props.onfresh();
			});
		},
		onDelete: function(id,event){
			event.stopPropagation();
			event.preventDefault();
			var that = this;
			$.ajax('/moneyDetail',{method:"delete",data:{id:id}}).done(function(){that.props.onfresh();});
			/*$.delete('/moneyDetail',{id:id}).done(function(){
				that.props.onfresh();
			})*/
		},
		onClickToAddDetail:function(event){
			this.refs.detailLabel.getDOMNode().focus();
		},
		render:function(){
			var data = this.props.data;
			var detail = data.detail || [];
			var arr=[];
			var parentId = this.props.parentId;
			for(var i = 0,obj;obj=detail[i]; i++){
				arr.push(
					React.createElement("li", {className: "list-group-item"}, 
						React.createElement("div", {className: "row"}, 
							React.createElement("div", {className: "col-xs-8 col-xs-offset-1"}, 
								React.createElement("span", {className: "label label-info"}, 
									obj.label
								), 
								React.createElement("span", {className: "badge pull-right"}, 
									obj.money, " 元"
								)
							), 
							React.createElement("div", {className: "col-xs-3"}, 
								React.createElement("a", {className: "pull-right", onClick: this.onDeleteDetail.bind(this,i)}, 
									React.createElement("span", {className: "glyphicon glyphicon-remove"})
								)
							)
						)
					)
				);
				
			}
			return (
					React.createElement("div", {className: "panel panel-info", style: {marginTop:"1px"}}, 
						React.createElement("div", {className: "panel-heading", style: {paddingTop:"3px",paddingBottom:"3px"}, "data-toggle": "collapse", "data-parent": "#accordion" + parentId, "data-target": "#collapse-" + ++id}, 
							React.createElement("div", {className: "row"}, 
								React.createElement("div", {className: "col-xs-9 col-sm-6"}, 
									React.createElement("span", {className: "label label-success"}, data.label), 
									React.createElement("span", {className: "badge pull-right"}, (data.isIncome?"收入 ":"支出 ") + data.money + " 元")
								), 
								React.createElement("div", {className: "col-sm-5 hidden-xs text-nowrap", style: {textOverflow:"ellipsis",
									overflow:"hidden",wordBreak:"keep-all"}}, 
									React.createElement("span", {"data-toggle": "tooltip", title: data.note}, data.note)
								), 
								React.createElement("div", {className: "col-xs-3 col-sm-1"}, 
									React.createElement("a", {className: "pull-right", onClick: this.onDelete.bind(this,data["_id"])}, 
									React.createElement("span", {className: "glyphicon glyphicon-remove hover"})
									)
								)
							)
						), 
						React.createElement("div", {className: "panel-body collapse", style: {paddingBottom:"0px"}, id: "collapse-" + id}, 
							React.createElement("div", {className: "collapse  " + "collapse-" + ++id}, 
								React.createElement("div", {className: "row"}, 
									React.createElement("div", {className: "col-xs-12 col-sm-5"}, 
										React.createElement("div", {className: "form-group form-group-sm"}, 
											React.createElement("div", {className: "input-group "}, 
												React.createElement("input", {name: "label", type: "text", ref: "detailLabel", className: "form-control detailLabel", placeholder: "输入明细标签~"}), 
												React.createElement("span", {className: "input-group-btn"}, 
													React.createElement("button", {className: "btn btn-success btn-sm dropdown-toggle", "data-toggle": "dropdown"}, 
														React.createElement("span", {className: "caret"})
													), 
													React.createElement("ul", {className: "dropdown-menu dropdown-menu-right"}, 
														React.createElement("li", null, React.createElement("a", null, "买菜")), 
														React.createElement("li", null, React.createElement("a", null, "冲话费")), 
														React.createElement("li", null, React.createElement("a", null, "买衣服"))
													)
												)
											)
										)
									), 
									React.createElement("div", {className: "col-xs-12 col-sm-5"}, 
										React.createElement("div", {className: "form-group form-group-sm"}, 
											React.createElement("div", {className: "input-group"}, 
												React.createElement("span", {className: "input-group-addon"}, React.createElement("span", {className: "glyphicon glyphicon-yen"})), 
												React.createElement("input", {type: "number", name: "money", className: "form-control", placeholder: "输入金额~"}), 
												React.createElement("span", {className: "input-group-addon"}, "元")
											)
										)
									), 
									React.createElement("div", {className: "col-xs-12 col-sm-2", "data-toggle": "collapse", "data-target": ".collapse-" + id}, 
										React.createElement("button", {className: "btn btn-info btn-block btn-sm", onClick: this.onAddDetail.bind(this)}, "添加")
									)
								)
							), 
							React.createElement("div", {className: " collapse in collapse-" + id}, 
								React.createElement("div", {className: "row"}, 
								React.createElement("div", {className: " col-xs-12 col-sm-2 col-sm-offset-10"}, 
									React.createElement("div", {className: "form-group "}, 
										React.createElement("button", {ref: "toAddDetailBtn", onClick: this.onClickToAddDetail, className: "btn btn-primary btn-block btn-sm", "data-toggle": "collapse", "data-target": ".collapse-" + id}, "添加明细")
									)
									
								)
								)
							), 
							React.createElement("ul", {className: "list-group list-group-sm "}, 
									arr
							)
						)
					)
				);
		}
	});
	var DateList = React.createClass({displayName: "DateList",
		render:function(){
			var listArray = this.props.data;
			var date = listArray[0].date;
			var allIn = 0;
			var allOut = 0;
			var arr = [];
			var parentId = ++id;
			for(var i = 0,item; item = listArray[i];i++){
				if(item.isIncome){
					allIn +=  parseInt(item.money);
				} else {
					allOut += parseInt(item.money);
				}
				arr.push(
						React.createElement(Item, {key: item["_id"], onfresh: this.props.onfresh, parentId: parentId, data: item})
					);
			};
			var pureAll = allIn - allOut;
			return (
					React.createElement("div", {className: "panel panel-success"}, 
						React.createElement("div", {className: "panel-heading", "data-toggle": "collapse", "data-target": "#collapse-" + ++id}, 
							React.createElement("h5", {className: "panel-title"}, 
								React.createElement("strong", null, date), 
								React.createElement("span", {className: "badge pull-right"}, allOut?"总支出 "+allOut+" 元":""), 
								React.createElement("span", {className: "badge pull-right"}, allIn?"总收入 "+allIn+" 元":"")
							)
						), 
						React.createElement("div", {className: "panel-body collapse in", id: "collapse-" + id}, 
							React.createElement("div", {className: "panel-group", id: "accordion" + parentId}, 
								arr
							)
						)
					)
				);
		}
	});
	var AllDateList = React.createClass({displayName: "AllDateList",
		render:function(){
			var data = this.props.data;
			var arr = [];
			for(var date in data){
				var item = data[date];
				arr.push(
						React.createElement(DateList, {onfresh: this.props.onfresh, data: item})
					);
			}
			return (
					React.createElement("div", {className: "panel-group", style: {paddingTop:"10px"}}, 
					arr
					)
				);
		}
	});
	var AddForm = React.createClass({displayName: "AddForm",
		onClickAdd:function(isIncome,event){
			event.stopPropagation();
			event.preventDefault();
			console.log(JSON.stringify(this.props));
			var cb = this.props.submit;
			console.log(this.props.submit);
			var data = {};
			var label = $("#addFormLabel");
			var money = $("#addFormMoney");
			var note = $("#addFormNote");
			flag = true;
			if(label.val().trim() == "" ){
				$(label).parents(".form-group").eq(0).addClass("has-error");
				flag =false;
			} else {
				$(label).parents(".form-group").eq(0).removeClass("has-error");

			}
			if(money.val().trim() == "" ){
				$(money).parents(".form-group").eq(0).addClass("has-error");
				flag = false;
			} else {
				$(money).parents(".form-group").eq(0).removeClass("has-error");
			}
			if(flag){
				data.label = label.val();
				data.money = money.val();
				data.note = note.val();
				data.detail = [];
				data.isIncome = isIncome;
				cb(data);
				label.val("");
				money.val("");
				note.val("");
				label[0].focus();
			}

		},
		componentDidMount: function(){

			$("#dateInput").datepicker({
				altField:"#dateInput",
				dateFormat:"yy-mm-dd",
				autoSize:true,
				defaultDate:0,
				maxDate:0,
				showOptions:{direction:"up"}
			});
			$("#dateInput").datepicker("setDate",0);
			$("#addFormLabel")[0].focus();
		},
		onClickLabel: function(event){

			event.stopPropagation();
			event.preventDefault();
			var target = event.target;
			console.log(target.tagName);
			$("#addFormLabel").val($(target).text());
		},
		render: function(){
		 	var today = $.datepicker.formatDate( "yy-mm-dd", new Date() );
		 	var labels  = this.props.labels;
		 	var arr = labels.map(function(_item,_index){
		 		return (
		 				React.createElement("li", null, React.createElement("a", null, _item.label))
		 			);
		 	})
			return (
					React.createElement("div", {className: "panel ", style: {marginBottom:"10px",paddingTop:"10px"}}, 
						
						React.createElement("div", {className: "panel-body collapse in", id: "collapse1"}, 
							React.createElement("form", {onsubmit: "return false;", id: "addForm"}, 
								React.createElement("div", {className: "row"}, 
									React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("div", {className: "input-group"}, 
												React.createElement("input", {name: "label", id: "addFormLabel", type: "text", className: "form-control", placeholder: "输入标签~"}), 
												React.createElement("span", {className: "input-group-btn"}, 
													React.createElement("button", {className: "btn btn-success dropdown-toggle", "data-toggle": "dropdown"}, 
														React.createElement("span", {className: "caret"})
													), 
													React.createElement("ul", {onClick: this.onClickLabel, className: "dropdown-menu dropdown-menu-right"}, 
														arr
													)
												)
											)
										)
									), 
									React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("div", {className: "input-group"}, 
												React.createElement("span", {className: "input-group-addon"}, React.createElement("span", {className: "glyphicon glyphicon-yen"})), 
												React.createElement("input", {type: "number", id: "addFormMoney", className: "form-control", placeholder: "输入金额~"}), 
												React.createElement("span", {className: "input-group-addon"}, "元")
											)
										)
									), 
									React.createElement("div", {className: "col-xs-12 hidden-xs col-sm-6"}, 
										React.createElement("div", {className: "form-group"}, 
												React.createElement("textarea", {rows: "1", id: "addFormNote", className: "form-control", placeholder: "备注~"})
										)
									), 
									React.createElement("div", {className: "col-xs-12 col-sm-6"}, 
										React.createElement("div", {className: "form-group"}, 
											React.createElement("div", {className: "input-group"}, 
											React.createElement("div", {className: "input-group-addon"}, "日期："), 
											React.createElement("input", {type: "text", id: "dateInput", value: today, className: "form-control"})
											)
											
										)
									), 
									React.createElement("div", {className: "clearfix"}), 
									React.createElement("div", {className: "col-xs-12 col-sm-6 hidden-xs"}, 
										React.createElement("button", {onClick: this.onClickAdd.bind(this,true), className: "btn btn-primary btn-block"}, 
										React.createElement("span", {className: "glyphicon glyphicon-plus"}), 
										"收入")
									), 
									React.createElement("div", {className: "col-xs-12 col-sm-6 hidden-xs"}, 
										React.createElement("button", {onClick: this.onClickAdd.bind(this,false), className: "btn btn-primary btn-block"}, 
										React.createElement("span", {className: "glyphicon glyphicon-minus"}), 
										"支出"
										)
									), 
									React.createElement("div", {className: "col-xs-12 visible-xs"}, 
									React.createElement("div", {className: "btn-group-vertical", style: {width:"100%"}}, 
										React.createElement("button", {onClick: this.onClickAdd.bind(this,true), className: "btn btn-primary btn-block", style: {marginBottom:"5px"}}, 
										React.createElement("span", {className: "glyphicon glyphicon-plus"}), 
										"收入"), 
										React.createElement("button", {onClick: this.onClickAdd.bind(this,false), className: "btn btn-primary btn-block"}, 
										React.createElement("span", {className: "glyphicon glyphicon-minus"}), 
										"支出"
										)
									)
									)
								)
								
							)
						)
					)
				);
		}
	});
	var Head = React.createClass({displayName: "Head",
		getInitialState:function(){
			return {monthPlan:0};
		},
		modifyPlan:function(event){
			var monthPlan = $(this.refs.monthPlan.getDOMNode()).val();
			if(monthPlan == ""){
				//输入框为空时，让它继续为空
				this.props.account.monthPlan = monthPlan;
				this.setState();
				return;
			}
				//转换为数字
			monthPlan = + monthPlan;
			if(isNaN(monthPlan)){
				this.props.account.monthPlan = 0;
				this.setState({monthPlan:0});
				 return ;
			}
			this.props.account.monthPlan = monthPlan;
			this.setState({monthPlan:monthPlan});
		},
		logout:function(){
			location.href="/logout";
		},
		clickPhoto:function(event){
			event.stopPropagation();
			event.preventDefault();
			/*var image = this.refs.photo.getDOMNode();
			if(image.src.indexOf("default") == -1 true) location.href = "upload.html";
			*/
			this.refs.choosePhoto.getDOMNode().click();
			/*var arr = ["",2,3,4];
			if(this.index == 4) location.href = "upload.html"; 
			var index = this.index = this.index || 0;
			this.refs.photo.getDOMNode().src = "photo_default" + arr[index] +  ".gif";
			this.index  = this.index + 1;*/
			
		},
		updatePhoto:function(event){
			var that  = this;
			//react 会把enctype搞丢，妈蛋
			var form = this.refs.photoForm.getDOMNode();
			form.enctype="multipart/form-data";
			that.refs.updatePhoto.getDOMNode().click();
			// console.log("hahah");
		},
		postPlan:function(event){
			var monthPlan = + $(this.refs.monthPlan.getDOMNode()).val();
			if(isNaN(monthPlan)) return;
			if(this.lastMonthPlan == monthPlan) return;  //值未改变时就不要发请求了
			var that = this;
			$.post('/monthPlan',{monthPlan:monthPlan},function(data){
				that.lastMonthPlan = monthPlan;
			});
		},
		componentWillMount:function(){
			this.setState({monthPlan:this.props.monthPlan});
		},
		render:function(){
			var today = new Date();
			//当月第几天
			var nowDate = today.getDate();
			var arr = [28,29,30,31];
			//本月总天数
			var monthDate;
			for(var i = 0,item; item=arr[i]; i++){
				var d = new Date();
				d.setDate(item);
				if(d.getDate() !== item && monthDate) break;
				monthDate = item;
			};
			//时间百分数
			var datePercent = parseInt(+nowDate/+monthDate*100) + "%";

			var account = this.props.account;
			//预算使用百分数
			var monthPlanPercent = (account.monthOut/account.monthPlan)*100;
			var isHundred = monthPlanPercent >100?true:false;
			monthPlanPercent += "%";
			if(account.monthPlan == 0){
				monthPlanPercent = "100%";
			}
			var photoName =  account.photoName;
			photoName = photoName?photoName:"";
			var  userName = account.userName;
			var isHu = userName == "humeimei";
			return (
					React.createElement("div", {className: "panel panel-info", style: {marginBottom:"20px"}}, 
						React.createElement("div", {className: "panel-body"}, 
							React.createElement("div", {className: "row"}, 
								React.createElement("div", {className: "col-xs-12 col-sm-3"}, 
									React.createElement("div", {className: "row"}, 
										React.createElement("div", {className: "col-xs-12"}, 
											React.createElement("a", {onClick: this.clickPhoto}, 
											React.createElement("img", {ref: "photo", className: "img-circle center-block", title: "头像", alt: "上传头像", src: isHu?"/img/1.jpg":photoName, style: {width: 140, height: 140}})
											), 
											React.createElement("form", {style: {display:"none"}, ref: "photoForm", method: "post", action: "/upload", enctype: "multipart/form-data"}, 
										    	React.createElement("input", {ref: "choosePhoto", onChange: this.updatePhoto, type: "file", name: "upfile"}), 
										    	React.createElement("input", {ref: "updatePhoto", type: "submit", value: "upload"})
											)
										), 
										React.createElement("div", {className: "col-sm-12 col-xs-12  text-center border-left-right-3"}, 
										React.createElement("span", {className: "userName h3 text-primary"},  userName), 
										React.createElement("a", {className: "logOut", style: {position:"absolute","right":"5px","bottom":"-1em","zIndex":"100"}, onClick: this.logout}, "退出")
										)
									)
									
									
								), 
								React.createElement("div", {className: "col-xs-12  col-sm-9"}, 
									
									React.createElement("ul", {className: "list-group list-group-sm"}, 
										React.createElement("li", {className: "list-group-item"}, 
											"我的资产：", React.createElement("strong", {className: "color-red"}, account.totalMoney), "元"
										), 
										React.createElement("li", {className: "list-group-item noborder"}, 
											"本月收入：", React.createElement("strong", {className: "text-success"}, account.monthIn), "元"
										), 
										React.createElement("li", {className: "list-group-item  noborder"}, 
											"本月支出：", React.createElement("strong", {className: "text-danger"}, account.monthOut), "元"
										), 
										React.createElement("li", {className: "list-group-item  noborder"}, 
											"本月预算：", React.createElement("strong", null, 
											React.createElement("input", {type: "text", id: "monthPlan", ref: "monthPlan", style: {border:0,display:"inline-block",maxWidth:"10em"}, onChange: this.modifyPlan.bind(this), onBlur: this.postPlan.bind(this), value: account.monthPlan})
											)
										), 
										React.createElement("li", {className: "list-group-item  noborder"}, 
											React.createElement("div", {className: "pull-left"}, "完成进度："), 
											React.createElement("div", {className: "progress", style: {marginBottom:0,textAlign:"center"}}, 
												React.createElement("div", {className: "progress-bar " +(isHundred?"progress-bar-danger":"progress-bar-primary"), 
												style: {width:isHundred?"100%":monthPlanPercent,minWidth:"2em"}}, parseInt(monthPlanPercent) + "%")
											)
										), 
										React.createElement("li", {className: "list-group-item", style: {borderTop:"none"}}, 
											React.createElement("div", {className: "pull-left"}, "Wheel of Time："), 
											React.createElement("div", {className: "progress"}, 
												React.createElement("div", {className: "progress-bar progress-bar-info", style: {width:datePercent}})
											)
										)
									)
								)
							)
						)
					)
				);
		}
	});
	React.render(React.createElement(Container, null),document.getElementById("content"));