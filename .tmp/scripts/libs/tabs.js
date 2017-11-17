
;(function (window) {

	'use strict';

	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function TABS(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	TABS.prototype.options = {
		start: 0
	};

	TABS.prototype._init = function () {
		// tabs elemes
		this.tabs = [].slice.call(this.el.querySelectorAll('nav > ul > li'));
		// content items
		this.items = [].slice.call(this.el.querySelectorAll('.content > section'));
		// current index
		this.current = -1;
		// show current content item
		this._show();
		// init events
		this._initEvents();
	};

	TABS.prototype._initEvents = function () {
		var self = this;
		this.tabs.forEach(function (tab, idx) {
			tab.addEventListener('click', function (ev) {
				ev.preventDefault();
				self._show(idx);
			});
		});
	};

	TABS.prototype._show = function (idx) {
		if (this.current >= 0) {
			this.tabs[this.current].className = '';
			this.items[this.current].className = '';
		}
		// change current
		this.current = idx != undefined ? idx : this.options.start >= 0 && this.options.start < this.items.length ? this.options.start : 0;
		this.tabs[this.current].className = 'tab-current';
		this.items[this.current].className = 'content-current';
	};

	// add to global namespace
	window.TABS = TABS;
})(window);
//# sourceMappingURL=tabs.js.map
