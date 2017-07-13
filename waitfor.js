
exports = (typeof exports === 'undefined' ? {} : exports);

var poll = function(check,callback,interval,timeout,onTimeout)
{
	timeout = (typeof timeout === 'undefined' ? 0 : timeout);
	var kill = false;
	
	var handle = {
		check:function(){return check},
		callback:function(){return callback},
		interval:function(){return interval},
		timeout:function(){return timeout},
		onTimeout:onTimeout,
		kill:function(){kill=true;},
		startTime:new Date().getTime(),
		params:undefined,
		result:undefined
	};
	(function rec()
	{
		if (kill)
			return;
		if (check(handle)) {
			handle.result = (handle.params
				? callback.apply(null,handle.params)
				: callback());
		}
		// NOTE: Should this timeout be a check here, or launched separately for
		//   precise timeout callback... calling?
		else if (timeout > 0 && (new Date().getTime())-handle.startTime >= timeout)
			onTimeout();
		else
			setTimeout(rec,interval);
	})();
	return handle;
};
exports.poll = poll;

var evaluate = function(page,evalCheck,callback,interval,
                        timeout,onTimeout,param)
{
	return exports.poll(
		(function(param) {
			var json = (typeof param == 'string' ? param : JSON.stringify(param));
			return function(handle) {
				var res = JSON.parse(page.evaluate(evalCheck,json));
				// handle.params goes unused until success, so this is fine.
				handle.params = [res];
				return res;
			};
		})(param),
		callback,
		interval,
		timeout,
		onTimeout);
};
exports.evaluate = evaluate;

