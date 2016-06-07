var rangeUtil = {
	focusNode: function(node) {
		var range = document.createRange();
		range.selectNode(node.childNodes[0]);
		range.collapse();
		var selection = document.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},
	selectNode: function(node) {
		var range = document.createRange();
		range.selectNode(node.childNodes[0]);
		var selection = document.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
	},
	getRange: function() {
		var selection = window.getSelection();
		var sRange = selection.getRangeAt(0);
		return sRange;
	},
	getRangeNode: function() {
		var sRange = rangeUtil.getRange();
		var blogContainer = sRange.commonAncestorContainer;
		if (blogContainer.nodeType == 3) { //文本节点
			blogContainer = blogContainer.parentNode;
		}
		return blogContainer;
	}
};
module.exports = rangeUtil;
