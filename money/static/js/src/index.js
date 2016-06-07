	// var ReactHighcharts = require('react-highcharts/bundle/highcharts')

	var Container = React.createClass({
		getInitialState: function(){
			this.limit = 14;
			this.offset = 0;
			this.isListEnd = false;
			return {
				account:{},
				cost:{},
				labels:[]
			};
		},
		componentWillMount:function(){
			this.getPreData();
			//debounce
			$(window).on('scroll',$.debounce(400, this.pullData.bind(this)));

		},
		/**
		 * 拖数据
		 */
		pullData: function(){
			if($("li.active").text().trim() != "查看明细") return; //明细页面的滚动
			if(this.isListEnd) return; //页面数据全部返回了
			var body = document.body;
			var accurate = 50 ; //模糊度
			if(body.scrollTop + document.documentElement.clientHeight + 50 > body.scrollHeight){
				if(this.isPulling) return;   //防止重复触发
				this.offset = this.offset + this.limit;
				// console.log("bottom");
				this.isPulling = true;
				$.get(root_url + '/moneyDetail',{
					limit: this.limit,
					offset: this.offset
				}).done(this.cbPullData.bind(this));
				
			}
		},
		cbPullData: function(data){
			this.isPulling = false;
			this.setState({cost:this.state.cost.concat(data.result)});
			if(data.result.length < this.limit){ //列表全部请求完成
				this.isListEnd = true;
			}
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
			this.offset = 0;
			this.isListEnd = false;
			/*$.blockUI({
				message:"<div style='width:100px;height:30px;line-height:30px;'><img src='../img/loading.png'/>请求数据中...</div>",
				css:{
					backgroundColor: '#fff',
					"border-radius":'4px',
					"border-size":"0px",
					width:"100px",
					left:"48%"

				}
			});*/
			$.get(root_url + '/moneyDetail',{limit: this.limit,offset: this.offset}).done(this.cbGetPreData.bind(this,"cost"));
			$.get(root_url + '/accountDetail').done(this.cbGetPreData.bind(this,"account"));
			$.get(root_url + '/labels').done(this.cbGetPreData.bind(this,"labels"));
		},
		round:function(value){
			return Math.round(value*10)/10;
		},
		cbGetPreData:function(flag,data){
			if(flag=="cost"){
				this.cost = data.result;
			} else if(flag == "account") {
				this.account = data.result;
				var account = this.account;
				account.monthIn = this.round(account.monthIn);
				account.monthOut = this.round(account.monthOut);
				account.totalMoney = this.round(account.totalMoney);

			} else if(flag == "labels"){
				this.state.labels = data.result;
				// console.log(JSON.stringify(data.result));
			}
			if(this.cost && this.account){
				$.unblockUI();
				this.setState({cost:this.cost,account:this.account});
			}
		},
		onAddData: function(data){
			var date = new Date();
			date = date.toLocaleDateString().split("/").join("-");
			var d = $("#dateInput").val();
			data.date = d || date;
			// console.log(JSON.stringify(data));
			if(this.account && this.account.userName){
				data.userName = this.account.userName;
				var that = this;
				$.ajax(root_url + '/moneyDetail',{
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
				<div>
				<ul className="nav nav-tabs" id="nav">
							<li>
								<a href="#monitorContainer"  data-toggle="pill">图表</a>
							</li>
							<li>
								<a href="#detailContainer" data-toggle="pill">查看明细</a>
							</li>
							<li className="" ref="li2">
								<a href="#addContainer" data-toggle="pill">记一笔账</a>
							</li>
							
							<li className="active" ref="li1">
								<a href="#accountDetail" data-toggle="pill">账户信息</a>
							</li>
						</ul>
				<div style={{padding: '0px 1px'}} >
					<div>
						<div className="tab-content">
							<div className="tab-pane fade in active " id="accountDetail">
								<Head  account={this.state.account}/>
							</div>
							<div className="tab-pane fade " id="addContainer">
								<AddForm  labels={this.state.labels}  submit={this.onAddData.bind(this)}/>
							</div>
							<div className="tab-pane fade " id="detailContainer">
								<AllDateList onfresh={this.getPreData.bind(this)} data={this.state.cost}/>
							</div>
							<div className="tab-pane fade " style={{width:"100%",height:"100%"}} id="monitorContainer">
								<Monitor />
							</div>
						</div>
					</div>
					
					
				</div>
				</div>
				);
		}
	});
	var Item = React.createClass({
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
			// console.log(JSON.stringify(data));
			$.post(root_url + '/moneyDetail',data).done(function(){
				that.props.onfresh();
			});
		},
		onDeleteDetail:function(index,event){
			// console.log(index);
			var target = event.target;
				event.stopPropagation();
			
			var data = this.props.data;
			var detail = data.detail || [];
			if(detail[index]){
				data.detail.splice(index,1);
			}
			var that =this;
			// console.log(JSON.stringify(data));
			$.post(root_url + '/moneyDetail',data).done(function(){
				that.props.onfresh();
			});
		},
		onDelete: function(id,event){
			event.stopPropagation();
			event.preventDefault();
			var that = this;
			$.ajax(root_url + '/moneyDetail',{method:"delete",data:{id:id}}).done(function(){that.props.onfresh();});
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
					<li className="list-group-item">
						<div className="row">
							<div className="col-xs-8 col-xs-offset-1">
								<span className="label label-info">
									{obj.label}
								</span>
								<span className="badge pull-right">
									{obj.money} 元
								</span>
							</div>
							<div className="col-xs-3">
								<a  className="pull-right" onClick={this.onDeleteDetail.bind(this,i)}>
									<span className="glyphicon glyphicon-remove"></span>
								</a>
							</div>
						</div>
					</li>
				);
				
			}
			return (
					<div className="panel panel-info" style={{marginTop:"1px"}}>
						<div className="panel-heading" style={{paddingTop:"3px",paddingBottom:"3px"}} data-toggle="collapse" data-parent={"#accordion" + parentId} data-target={"#collapse-" + ++id}>
							<div className="row">
								<div className="col-xs-10 ">
									<span className="label label-success">{data.label}</span>
									<span className="badge pull-right">{(data.isIncome?"收入 ":"支出 ") + data.money + " 元"}</span>
								</div>
								<div className="col-xs-2 ">
									<a className="pull-right"  onClick={this.onDelete.bind(this,data["_id"])}>
									<span className="glyphicon glyphicon-remove hover"></span>
									</a>
								</div>
								<div className="col-xs-12  text-nowrap" style={{textOverflow:"ellipsis",
									overflow:"hidden",wordBreak:"keep-all"}}>
									<span data-toggle="tooltip" title={data.note} >{data.note}</span>
								</div>
							</div>
						</div>
						<div className="panel-body collapse" style={{paddingBottom:"0px",display:"none"}} id={"collapse-" + id}>
							<div className={"collapse  " + "collapse-" + ++id} >
								<div className="row">
									<div className="col-xs-12 ">
										<div className="form-group form-group-sm">
											<div className="input-group ">
												<input name="label" type="text" ref="detailLabel" className="form-control detailLabel" placeholder="输入明细标签~"/>
												<span className="input-group-btn">
													<button className="btn btn-success btn-sm dropdown-toggle" data-toggle="dropdown">
														<span className="caret"></span>
													</button>
													<ul className="dropdown-menu dropdown-menu-right">
														<li><a >买菜</a></li>
														<li><a >冲话费</a></li>
														<li><a >买衣服</a></li>
													</ul>
												</span>
											</div>
										</div>
									</div>
									<div className="col-xs-12 ">
										<div className="form-group form-group-sm">
											<div className="input-group">
												<span className="input-group-addon"><span className="glyphicon glyphicon-yen"></span></span>
												<input type="number" name="money" className="form-control" placeholder="输入金额~"/>
												<span className="input-group-addon">元</span>
											</div>
										</div>
									</div>
									<div className="col-xs-12 " data-toggle="collapse" data-target={".collapse-" + id}>
										<button className="btn btn-info btn-block btn-sm" onClick={this.onAddDetail.bind(this)}>添加</button>
									</div>
								</div>
							</div>
							<div className={" collapse in collapse-" + id}>
								<div className="row">
								<div className=" col-xs-12 ">
									<div className="form-group ">
										<button ref="toAddDetailBtn" onClick={this.onClickToAddDetail} className="btn btn-primary btn-block btn-sm" data-toggle="collapse" data-target={".collapse-" + id}>添加明细</button>
									</div>
									
								</div>
								</div>
							</div>
							<ul className="list-group list-group-sm " >
									{arr}
							</ul>
						</div>
					</div>
				);
		}
	});
	var DateList = React.createClass({
		render:function(){
			var listArray = this.props.data;
			var date = listArray[0].date;
			var allIn = 0;
			var allOut = 0;
			var arr = [];
			var parentId = ++id;
			for(var i = 0,item; item = listArray[i];i++){
				if(item.isIncome){
					allIn +=  item.money;
				} else {
					allOut += item.money;
				}
				arr.push(
						<Item key={item["_id"]} onfresh={this.props.onfresh} parentId={parentId} data={item}/>
					);
			};
			var pureAll = allIn - allOut;
			var allOutText = allOut.toFixed(1);
			var allInText = allIn.toFixed(1);
			if(allOutText&&allOutText.indexOf(".0")!== -1) allOutText = allOutText.slice(0,-2);
			if(allInText&&allInText.indexOf(".0")!== -1) allInText = allInText.slice(0,-2);
			return (
					<div className="panel panel-success">
						<div className="panel-heading" data-toggle="collapse" data-target={"#collapse-" + ++id}>
							<h5 className="panel-title">
								<strong>{date}</strong>
								<span className="badge pull-right">{allOut?"总支出 "+ allOutText+" 元":""}</span>
								<span className="badge pull-right">{allIn?"总收入 "+ allInText +" 元":""}</span>
							</h5>
						</div>
						<div className="panel-body collapse in" id={"collapse-" + id}>
							<div className="panel-group"  id={"accordion" + parentId}>
								{arr}
							</div>
						</div>
					</div>
				);
		}
	});
	var AllDateList = React.createClass({
		render:function(){
			var data = this.props.data;
			var arr = [];
			for(var i = 0,item; item = data[i]; i++){
				arr.push(
						<DateList onfresh={this.props.onfresh} data={item} />
					);
			}
			if(arr.length == 0){
				arr.push(
						<div className="panel panel-success">
							<div className="panel-heading">
								现在还没有记过帐哦，快去记一笔试试看吧！
							</div>
						</div>
					)
			}
			return (
					<div className="panel-group" style={{paddingTop:"10px"}}>
					{arr}
					</div>
				);
		}
	});
	var AddForm = React.createClass({
		onClickAdd:function(isIncome,event){
			event.stopPropagation();
			event.preventDefault();
			// console.log(JSON.stringify(this.props));
			var cb = this.props.submit;
			// console.log(this.props.submit);
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
			// console.log(target.tagName);
			$("#addFormLabel").val($(target).text());
		},
		render: function(){
		 	var today = $.datepicker.formatDate( "yy-mm-dd", new Date() );
		 	var labels  = this.props.labels;
		 	var arr = labels.map(function(_item,_index){
		 		return (
		 				<li ><a >{_item.label}</a></li>
		 			);
		 	})
			return (
					<div className="panel " style={{marginBottom:"10px",paddingTop:"10px"}} >
						
						<div className="panel-body collapse in" id="collapse1">
							<form  onsubmit="return false;" id="addForm">
								<div className="row">
									<div className="col-xs-12 ">
										<div className="form-group">
											<div className="input-group">
												<input name="label" id="addFormLabel" type="text" className="form-control" placeholder="输入标签~" tabindex="1"/>
												<span className="input-group-btn">
													<button className="btn btn-success dropdown-toggle" data-toggle="dropdown">
														<span className="caret"></span>
													</button>
													<ul onClick={this.onClickLabel} className="dropdown-menu dropdown-menu-right">
														{arr}
													</ul>
												</span>
											</div>
										</div>
									</div>
									<div className="col-xs-12 ">
										<div className="form-group">
											<div className="input-group">
												<span className="input-group-addon"><span className="glyphicon glyphicon-yen"></span></span>
												<input type="number" id="addFormMoney" className="form-control" placeholder="输入金额~" tabindex="2"/>
												<span className="input-group-addon">元</span>
											</div>
										</div>
									</div>
									<div className="col-xs-12  ">
										<div className="form-group">
												<textarea rows="1" id="addFormNote"  className="form-control" placeholder="备注~" tabindex="3"></textarea>
										</div>
									</div>
									<div className="col-xs-12 ">
										<div className="form-group">
											<div className="input-group">
											<div className="input-group-addon">日期：</div>
											<input  type="text" id="dateInput" value={today} className="form-control"/>
											</div>
											
										</div>
									</div>
									<div className="clearfix"></div>
									<div className="col-xs-12 ">
									<div className="btn-group-vertical" style={{width:"100%"}}>
										
										<button onClick ={this.onClickAdd.bind(this,false)} className="btn btn-primary btn-block" style={{marginBottom:"5px"}}>
										<span className="glyphicon glyphicon-minus"></span>
										支出
										</button>
										<button onClick ={this.onClickAdd.bind(this,true)} className="btn btn-primary btn-block" >
										<span className="glyphicon glyphicon-plus"></span>
										收入</button>
									</div>
									</div>
								</div>
								
							</form>
						</div>
					</div>
				);
		}
	});
	var Head = React.createClass({
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
			//location.href="/logout";
			delCookie("userName");
			history.go();
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
			$.post(root_url + '/monthPlan',{monthPlan:monthPlan},function(data){
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
			//to do 头像固定了
			photoName = "/money/img/bg.jpg"
			var  userName = account.userName;
			var isHu = userName == "humeimei";
			return (
					<div className="panel panel-info" style={{marginBottom:"20px"}}>
						<div className="panel-body">
							<div className="row">
								<div className="col-xs-12">
									<div className="row">
										<div className="col-xs-12">
											<a  onClick={this.clickPhoto}>
											<img ref="photo" className="img-circle center-block" title="头像" alt="上传头像" src={isHu?"/img/1.jpg":photoName} style={{width: 140, height: 140}} />
											</a>
											<form style={{display:"none"}} ref="photoForm" method="post" action="/upload"  enctype="multipart/form-data">
										    	<input ref="choosePhoto" onChange={this.updatePhoto} type="file" name="upfile" />
										    	<input ref="updatePhoto"type="submit" value="upload"/>
											</form>
										</div>
										<div className="col-xs-12  text-center border-left-right-3">
										<span className="userName h3 text-primary">{ userName}</span>
										<a className="logOut" style={{position:"absolute","right":"5px","bottom":"-1em","zIndex":"100"}} onClick={this.logout}>退出</a>
										</div>
									</div>
								</div>
								<div className="col-xs-12">
									
									<ul className="list-group list-group-sm">
										<li className="list-group-item">
											我的资产：<strong className="color-red">{account.totalMoney}</strong>元
										</li>
										<li className="list-group-item noborder">
											本月收入：<strong className="text-success">{account.monthIn}</strong>元
										</li>
										<li className="list-group-item  noborder">
											本月支出：<strong className="text-danger">{account.monthOut}</strong>元
										</li>
										<li className="list-group-item  noborder">
											本月预算：<strong >
											<input type="text" id="monthPlan" ref="monthPlan"  style={{border:0,display:"inline-block",maxWidth:"10em"}} onChange={this.modifyPlan.bind(this)} onBlur={this.postPlan.bind(this)} value={account.monthPlan}/>
											</strong>
										</li>
										<li className="list-group-item  noborder">
											<div className="pull-left">完成进度：</div>
											<div className="progress" style={{marginBottom:0,textAlign:"center"}}>
												<div className={"progress-bar " +(isHundred?"progress-bar-danger":"progress-bar-primary")} 
												style={{width:isHundred?"100%":monthPlanPercent,minWidth:"2em"}} >{parseInt(monthPlanPercent) + "%"}</div>
											</div>
										</li>
										<li className="list-group-item" style={{borderTop:"none"}}>
											<div className="pull-left">Wheel of Time：</div>
											<div className="progress">
												<div className="progress-bar progress-bar-info" style={{width:datePercent}} ></div>
											</div>
										</li>
									</ul>
								</div>
								<div className="col-xs-12">
									<MonthHistory></MonthHistory>
								</div>
							</div>
						</div>
					</div>
				);
		}
	});
	var MonthHistory = React.createClass({
		getInitialState:function(){
			return {monthHistory:[]};
		},
		componentWillMount:function(){
			var that = this;
			$.get(root_url + "/monthHistory").done(function(data){
				if(data.code == 200){
					var result = data.result;
					result.monthHistory = map2arr(result.monthHistory, 'month').sort( function(item1,item2){
						return item1.month < item2.month;
					});
					that.setState(data.result);
				}
			})
		},
		render:function(){
			var arr = [];
			// console.dir(this.state.monthHistory);
			for(var i = 0,obj; obj = this.state.monthHistory[i]; i++){
				arr.push(
					<li className="list-group-item" >
						<div className="row">
							<div className="col-xs-4"><span className="label label-info">{obj.month}</span></div>
							<div className="col-xs-4"><span className="badge">收入：{obj.monthIn}</span></div>
							<div className="col-xs-4"><span className="badge">支出：{obj.monthOut}</span></div>
						</div>
					</li>
					
				);
				
			}
			return (
						<ul className="list-group list-group-sm">
							{arr}

						</ul>
				);
		}
	});
	var Monitor = React.createClass({
		getInitialState:function(){
			var date = new Date();
			return {
				isLoading: true,
				year:'' + date.getFullYear(),
				month: date.getMonth() + 1 + '',
				chartType: 'line',
				dataType: 'date'
			};
		},
		componentDidMount:function(){
			this.refreshDateChart();
		},
		refreshDateChart: function(chartType){
			var month = this.state.month;
			var year = this.state.year;
			var period = this.getDatePeriod(year,month);
			this.getDatePeriodData(period.startDate,period.endDate , chartType || 'line');
		},
		getDatePeriod: function(year,month){
			if(month.length == 1) month = '0' + month;
			var startDate = this.state.year + '-' + month + '-01';
			var endDate ;
			if(month == '12'){
				endDate = +year + 1 +'-01-01';
			}else{
				var m = +month + 1 + '';
				m = m.length == 1? '0'+m:m;
				endDate = year + '-' + m + '-01';
			}
			return {startDate: startDate, endDate: endDate};
		},
		getDatePeriodData: function(startDate, endDate , chartType){
			var that = this;
			this.setState({isLoading: true});
			$.get(root_url + "/datePeriodData",{startDate: startDate, endDate: endDate}).done(function(data){
				if(data.code == 200){
					var result = data.result;
					result.monthHistory = map2arr(result.monthHistory, 'month').sort( function(item1,item2){
						return item1.month < item2.month;
					});
					that.setState({
						isLoading: false,
						datePeriodDate: data.result
					});
					that.renderDateChart(data.result, chartType || 'line');
				}
			});
		},
		getChartBaseOption: function(){
			return {
				chart: {
					type: 'line'
				},
				title: {
					text: '标题'
				},
				xAxis: {
					type: 'datetime',
					labels:{
						formatter: function(){
							return new Date(this.value).toLocaleDateString();
						},
						rotate: -45
					}
				},
				yAxis: {

				},
				series:[{
					name: '支出',
					data:[],
					dataLabels: {
				            enabled: true
				        }
				}],
				tooltip:{
				 	xDateFormat: '%Y-%m-%d'
				}

			}
		},
		renderDateChart: function(data, chartType){
			var d = [];
			for(var i =0,item; item=data[i]; i++){
				d.push([new Date(item.date).getTime(),item.out]);
			}
			var chartOption  = this.getChartBaseOption();
			chartOption.chart.type = chartType || 'line';
			chartOption.series[0].data = d;
			$("#monitorParent").highcharts(chartOption);
			window.mychart = $("#monitorParent").highcharts();
		},
		changeType: function(type){
			this.setState({chartType: type});
			if(this.state.dataType == 'date'){
				this.refreshDateChart(type);
			}else{

			}
		},
		render:function(){
			
			var loading = '';
			if(this.state.isLoading){
				loading = (
					<span>加载中</span>
				);
			} 
			return (	
						<div>
							<div style={{height:50,position: 'absolute'}}>
								<div className="btn-group btn-group-sm" data-toggle="buttons">
								  <label className="btn btn-primary active">
								    <input type="radio" name="type1" checked /> 按天
								  </label>
								  <label className="btn btn-primary">
								    <input type="radio" name="type1" /> 按月
								  </label>
								</div>
								<div onclick={this.changeType.bind(this, 'column')} className="btn-group btn-group-sm" data-toggle="buttons">
								  <label className="btn btn-info active" onclick={this.changeType.bind(this,'line')}>
								    <input type="radio" name="type2"  checked /> 折线图
								  </label>
								  <label className="btn btn-info" >
								    <input type="radio" name="type2"  /> 柱状图
								  </label>
								</div>
							</div>
							<div style={{width:'99%',height:'100%',paddingBottom:48,paddingTop:50}} className="center-block" id="monitorParent" ref="monitorParent">
								{loading}
							</div>
						</div>
						
				);
		}
	});



	$(function(){
		$(".login").on("click",submit.bind(this,"login"));
		$(".register").on("click",submit.bind(this,"register"));

		if(getCookie("userName")){
			$("#loginContainer").hide();
			$("#content").show();
			//刷新页面
			// history.go();
			React.render(<Container/>,document.getElementById("content"));
		} else{
			if(!isAndroid){
				$("#loginContainer").show();
				$("#login").click();
			} else{
				//移动端自动登录  不显示登录框，后台登录
				login("login");
			}
		}
		

	});
		
		function submit(_flag,event){
			event.stopPropagation();
			event.preventDefault();
			var url = root_url + "/register"
			if(_flag == "login") url=root_url + "/login";
			if(validateForm()){
				var obj = {};
				obj.userName = $("#userName").val();
				window.userName = obj.userName;
				obj.password = $("#password").val();
				$.post(url,obj).done(cbSbumit.bind(this,_flag));
			}
		}
		function login(_flag){
			$("#loginContainer").hide();
			$("#content").show();
			var obj = {};
			obj.userName = 'colour.hu';
			window.userName = obj.userName;
			obj.password = '201509';
			var url = root_url + "/register"
			if(_flag == "login") url=root_url + "/login";
			$.blockUI({
				message:"<div style='width:100px;height:30px;line-height:30px;'><img src='../img/loading.png'/>登录中...</div>",
				css:{
					backgroundColor: '#fff',
					"border-radius":'4px',
					"border-size":"0px",
					width:"100px",
					left:"48%"

				}
			});
			$.post(url,obj).done(cbSbumit.bind(this,"login"));
		}
		function cbSbumit(_flag,data){
			$.unblockUI();
			if(data.code == 200){
				// addCookie("userName",window.userName,60*60*24*30);
				$("#loginContainer").hide();
				$("#content").show();
				//刷新页面
				// history.go();
				React.render(<Container/>,document.getElementById("content"));
			} else {
				alert(data.message || "请求失败");
			}
		};
		function validateForm(){
			var flag = true;
				if($("#userName").val().trim() == ""){
					flag = false;
					$("#userName").parent().addClass("has-error");
				} else {
					$("#userName").parent().removeClass("has-error");
				}

				if($("#password").val().trim() == ""){
					flag = false;
					$("#password").parent().addClass("has-error");
				} else {
					$("#password").parent().removeClass("has-error");
				}
			return flag;
		};