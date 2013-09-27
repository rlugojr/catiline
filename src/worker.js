'use strict';

const _db = $$fObj$$;
const listeners = {};
const __iFrame__ = typeof document!=="undefined";
const __self__={onmessage:function(e){
	_fire("messege",e.data[1]);
	if(e.data[0][0]===_db.__codeWord__){
		return regMsg(e);
	}else{
		_fire(e.data[0][0],e.data[1]);
	}
}};
if(__iFrame__){
	window.onmessage=function(e){
		if(typeof e.data === "string"){
			e ={data: JSON.parse(e.data)};
		}
		__self__.onmessage(e);
	};
}else{
	self.onmessage=__self__.onmessage;
}
__self__.postMessage=function(rawData, transfer){
	if(!self._noTransferable&&!__iFrame__){
		self.postMessage(rawData, transfer);
	}else if(__iFrame__){
		let data = _db.__codeWord__+JSON.stringify(rawData);
		window.parent.postMessage(data,"*");
	}else if(self._noTransferable){
		self.postMessage(rawData);
	}
};
_db.on = function (eventName, func, scope) {
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.on(v,func,scope);
		},_db);
	}
	scope = scope || _db;
	if (!(eventName in listeners)) {
		listeners[eventName] = [];
	}
	listeners[eventName].push(function (a) {
		func.call(scope, a, _db);
	});
	_db;
};
_db.one = function (eventName, func, scope) {
	scope = scope || _db;
	return _db.on(eventName,function(a){
		_db.off(eventName);
		func.call(scope, a, _db);
	});
}
function _fire(eventName,data){
	if(eventName.indexOf(" ")>0){
		eventName.split(" ").forEach(function(v){
			_fire(v,data);
		});
		return;
	}
	if (!(eventName in listeners)) {
		return;
	}
	listeners[eventName].forEach(function (v) {
		v(data);
	});
}

_db.fire = function (eventName, data, transfer) {
	__self__.postMessage([[eventName], data], transfer);
	return _db;
};
_db.off=function(eventName){
	if(eventName.indexOf(" ")>0){
		return eventName.split(" ").map(function(v){
			return _db.off(v);
		});
	}
	if(!(eventName in listeners)){
		return;
	}else{
		delete listeners[eventName];
	}
	return _db;
};
const console={};
function makeConsole(method){
	return function(){
		const len = arguments.length;
		const out =[];
		let i = 0;
		while (i<len){
			out.push(arguments[i]);
			i++;
		}
		_db.fire("console",[method,out]);
	};
}
["log", "debug", "error", "info", "warn", "time", "timeEnd"].forEach(function(v){
	console[v]=makeConsole(v);
});
const regMsg = function(e){
	const cb=function(data,transfer){
		__self__.postMessage([e.data[0],data],transfer);
	};
	let result;
	if(__iFrame__){
		try{
			result = _db[e.data[1]](e.data[2],cb,_db);
		}catch(e){
			_db.fire("error",JSON.stringify(e));
		}
	}else{
		result = _db[e.data[1]](e.data[2],cb,_db);
	}
	if(typeof result !== "undefined"){
		cb(result);
	}
};
_db.initialize(_db);
