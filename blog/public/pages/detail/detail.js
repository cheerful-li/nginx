require('./style.scss');

$(function(){
	var show = true;
	var top = 50;
	$(".blogContainer").on("scroll",function(){
		var scrollTop = $(this).scrollTop();
		if(scrollTop > top && show){
			show  = false;
			dealScroll(show)
		}else if(scrollTop < top && !show){
			show = true;
			dealScroll(show);
		}
	});
	function dealScroll(show){
		if(show){
			$(".pageTop").slideDown(300);
			$(".blogContainer").animate({"top":54},300);
		}else{
			$(".pageTop").slideUp(300);
			$(".blogContainer").animate({"top":0},300);
		}
	}
});