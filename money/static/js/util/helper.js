array2map = function(arr , id){
	var obj = {};
	for(var i = 0,item; item = arr[i]; i++){
		obj[item[id]] = item;
	}
	return obj;
};
map2arr = function(obj, id){
	var arr = [];
	for(var key in obj){
		if(id) obj[key][id] = key;
		arr.push(obj[key]);
	}
	return arr;
}