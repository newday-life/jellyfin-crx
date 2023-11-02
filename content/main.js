class Home {
	static start() {
		this.refreshItem = true;
		this.cache = { items: undefined, item: new Map() };
		this.index = 1;
		this.transitionendFlag = false;
		this.itemQuery = { ImageTypes: "Banner", EnableImageTypes: "Backdrop,Banner,Logo", IncludeItemTypes: "Movie,Series", SortBy: "ProductionYear, PremiereDate, SortName", Recursive: true, ImageTypeLimit: 1, Limit: 10, Fields: "ProductionYear", SortOrder: "Descending", EnableUserData: false, EnableTotalRecordCount: false };
		this.coverOptions = { type: "Banner", maxWidth: 3000, adjustForPixelRatio: false };
		this.logoOptions = { type: "Logo", maxWidth: 3000, adjustForPixelRatio: false };
		this.coverType_L = "Backdrop";//横屏
		this.coverType_P = "Primary";//竖屏
		this.itemQuery.ImageTypes = this.coverType_L;

		/* 监控节点加载 */
		document.addEventListener("viewbeforeshow", function (e) {
			if (e.detail.type === "home") {
				//如果高度大于宽度，判断为竖屏
				if (innerWidth < innerHeight) {
					if (this.coverOptions.type != this.coverType_P) this.coverOptions.type = this.coverType_P;
				} else {//横屏
					if (this.coverOptions.type != this.coverType_L) this.coverOptions.type = this.coverType_L;
				}

				if (e.detail.isRestored == false && !e.target.querySelector('.misty-banner')) {
					this.initLoading();
					const mutation = new MutationObserver(function (mutationRecoards) {
						for (let mutationRecoard of mutationRecoards) {
							if (mutationRecoard.target.classList.contains("homeSectionsContainer")) {
								this.init();
								mutation.disconnect();
								break;
							}
						}
					}.bind(this));
					mutation.observe(document.body, {
						childList: true,
						characterData: true,
						subtree: true,
					});
				} else {
					this.startCarousel();
				}
			} else {
				clearInterval(this.bannerInterval);
			}
		}.bind(this));
		document.addEventListener("visibilitychange", function (e) {
			if (e.target.location.hash == "#!/home.html") {
				if (e.target.visibilityState == "hidden") {
					clearInterval(this.bannerInterval);
				} else {
					this.startCarousel();
				}
			}
		}.bind(this));
		const executeOnce = () => {
			//如果高度大于宽度，判断为竖屏
			if (innerWidth < innerHeight) {
				//如果横竖屏发生切换，变换cover类型
				if (this.coverOptions.type != this.coverType_P) {
					this.coverOptions.type = this.coverType_P;
					$(".misty-banner-item").each(async function (index, element) {
						let src = await this.getImageUrl($(element).attr('id'), this.coverOptions);
						$(element).children('img').attr('src', src);
					}.bind(this));
				}

			} else {
				// 横屏
				if (this.coverOptions.type != this.coverType_L) {
					this.coverOptions.type = this.coverType_L;
					$(".misty-banner-item").each(async function (index, element) {
						let src = await this.getImageUrl($(element).attr('id'), this.coverOptions);
						$(element).children('img').attr('src', src);
					}.bind(this));
				}

			}
		};
		const debounce = (fn, delay) => {
			let timer;
			return function () {
				if (timer) { clearTimeout(timer); }
				timer = setTimeout(() => { fn(); }, delay);
			}
		};
		const cancalDebounce = debounce(executeOnce, 100);
		window.addEventListener('resize', cancalDebounce);

	}
	static async init() {
		$(".homePage:not(.hide)").attr("data-type", "home");
		const serverName = await this.injectCall("serverName", "");
		$(".misty-loading h1").text(serverName).attr("title", serverName).addClass("active");
		await this.initBanner();
		this.initEvent();
	}

	/* 插入Loading */
	static initLoading() {
		const load = `
		<div class="misty-loading">
			<h1></h1>
			<div class="docspinner mdl-spinner-misty"><div class="mdl-spinner__layer mdl-spinner__layer-1 mdl-spinner__layer-1-active"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle mdl-spinner__circleLeft"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle mdl-spinner__circleRight"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-2 mdl-spinner__layer-2-active"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle mdl-spinner__circleLeft"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle mdl-spinner__circleRight"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-3 mdl-spinner__layer-3-active"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle mdl-spinner__circleLeft"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle mdl-spinner__circleRight"></div></div></div><div class="mdl-spinner__layer mdl-spinner__layer-4 mdl-spinner__layer-4-active"><div class="mdl-spinner__circle-clipper mdl-spinner__left"><div class="mdl-spinner__circle mdl-spinner__circleLeft"></div></div><div class="mdl-spinner__circle-clipper mdl-spinner__right"><div class="mdl-spinner__circle mdl-spinner__circleRight"></div></div></div></div>		</div>
		`;
		$("body").append(load);
	}
	static injectCode(code) {
		let hash = md5(code + Math.random().toString());
		return new Promise((resolve, reject) => {
			if ("BroadcastChannel" in window) {
				const channel = new BroadcastChannel(hash);
				channel.addEventListener("message", (event) => resolve(event.data));
			} else if ("postMessage" in window) {
				window.addEventListener("message", (event) => {
					if (event.data.channel === hash) {
						resolve(event.data.message);
					}
				});
			}
			const script = `
			<script class="I${hash}">
				setTimeout(async ()=> {
					async function R${hash}(){${code}};
					if ("BroadcastChannel" in window) {
						const channel = new BroadcastChannel("${hash}");
						channel.postMessage(await R${hash}());
					} else if ('postMessage' in window) {
						window.parent.postMessage({channel:"${hash}",message:await R${hash}()}, "*");
					}
					document.querySelector("script.I${hash}").remove()
				}, 16)
			</script>
			`;
			$(document.head || document.documentElement).append(script);
		});
	}

	static injectCall(func, arg) {
		const script = `
		const client = await new Promise((resolve, reject) => {
			setInterval(() => {
				if (window.ApiClient != undefined) resolve(window.ApiClient);
			}, 16);
		});
		return await client.${func}(${arg})
		`;
		return this.injectCode(script);
	}

	static getItems(query) {
		if (this.cache.items == undefined) {
			this.cache.items = this.injectCall("getItems", "client.getCurrentUserId(), " + JSON.stringify(query));
		}
		return this.cache.items;
	}

	static async getItem(itemId) {
		// 双缓存 优先使用 WebStorage
		if (typeof Storage !== "undefined" && !localStorage.getItem("CACHE|" + itemId) && !this.cache.item.has(itemId)) {
			const data = JSON.stringify(await this.injectCall("getItem", `client.getCurrentUserId(), "${itemId}"`));
			if (typeof Storage !== "undefined") localStorage.setItem("CACHE|" + itemId, data);
			else this.cache.item.set(itemId, data);
		}
		return JSON.parse(typeof Storage !== "undefined" ? localStorage.getItem("CACHE|" + itemId) : this.cache.item.get(itemId));
	}

	static getImageUrl(itemId, options) {
		return this.injectCall("getImageUrl", "'" + itemId + "'" + ", " + JSON.stringify(options));
	}
	static dynamicSwitchCss() {
		// 背景切换
		$(".homePage:not(.hide) .misty-banner-body").css({ "left": -(this.index * 100).toString() + "%", transition: "all 1.5s cubic-bezier(0.15, 0.07, 0, 1) 0s" });
		// 信息切换
		$(".homePage:not(.hide) .misty-banner-info > *").css({ "cssText": "opacity: 0 !important" });
		$(".homePage:not(.hide) .misty-banner-info > *").css({
			transition: "all 2.5s cubic-bezier(0, 1.41, 0.36, 0.93) .4s",
			transform: "translateY(150%)"
		});
		$(".homePage:not(.hide) .misty-banner-item.active .misty-banner-info > *").css({ "cssText": "opacity: 1 !important" });
		$(".homePage:not(.hide) .misty-banner-item.active .misty-banner-info > *").css({ transform: "translateY(0)" });
		$(".homePage:not(.hide) .misty-banner-item.active").removeClass("active");
		$(".homePage:not(.hide) .misty-banner-info > *").css({ "cssText": "opacity: 0 !important" });
		$(".homePage:not(.hide) .misty-banner-info > *").css({
			transition: "all 2.5s cubic-bezier(0, 1.41, 0.36, 0.93) .4s",
			transform: "translateY(150%)"
		});
		let id = $(".homePage:not(.hide) .misty-banner-item").eq(this.index).addClass("active").attr("id");
		$(".homePage:not(.hide) .misty-banner-item.active .misty-banner-info > *").css({ "cssText": "opacity: 1 !important" });
		$(".homePage:not(.hide) .misty-banner-item.active .misty-banner-info > *").css({ transform: "translateY(0)" });
		// LOGO切换
		$(".homePage:not(.hide) .misty-banner-logo.active").removeClass("active");
		$(`.homePage:not(.hide) .misty-banner-logo[id=${id}]`).addClass("active");
	}
	static staticSwitchCss() {
		$(".homePage:not(.hide) .misty-banner-body").css({ "left": -(this.index * 100).toString() + "%", transition: "none" });
		$(".homePage:not(.hide) .misty-banner-info > *").css({ "cssText": "opacity: 1 !important" });
		$(".homePage:not(.hide) .misty-banner-info > *").css({
			transition: "none",
			transform: "none",
		});
		$(".homePage:not(.hide) .misty-banner-item.active").removeClass("active");
		let id = $(".homePage:not(.hide) .misty-banner-item").eq(this.index).addClass("active").attr("id");
		$(".homePage:not(.hide) .misty-banner-item:not(.active) .misty-banner-info > *").css({ "cssText": "opacity: 0 !important" });
		// LOGO切换
		$(".homePage:not(.hide) .misty-banner-logo.active").removeClass("active");
		$(`.homePage:not(.hide) .misty-banner-logo[id=${id}]`).addClass("active");
	}
	static backwards() {
		this.index -= this.index - 1 == -1 ? -($(".homePage:not(.hide) .misty-banner-item").length - 1) : 1;
		this.dynamicSwitchCss();
	}
	static forwards() {
		this.index += this.index + 1 == $(".homePage:not(.hide) .misty-banner-item").length ? -this.index : 1;
		this.dynamicSwitchCss();
	}

	static transitionListener() {
		const runningTransitions = new Set();
		$(".homePage:not(.hide) .misty-banner-body").on('transitionstart', function (e) {
			runningTransitions.add(e.target);
			this.transitionendFlag = false;
		}.bind(this));
		$(".homePage:not(.hide) .misty-banner-body").on('transitionend', function (e) {
			runningTransitions.delete(e.target);
			if (runningTransitions.size == 0) {
				if (this.transitionendFlag) {
					// console.log("位置：", this.index);
					if (this.index >= $(".homePage:not(.hide) .misty-banner-item").length - 1) {
						this.index = 1;
						this.staticSwitchCss();
					}
					if (this.index <= 0) {
						this.index = $(".homePage:not(.hide) .misty-banner-item").length - 2;
						this.staticSwitchCss();
					}
				}
				this.transitionendFlag = true;
			}

		}.bind(this));
	}
	static alertDialog() {
		const script = `
		Dashboard.alert("太快了，等待动画结束，再切换！");
		`;
		this.injectCode(script);
		
	}
	static onclickListener(){
		$(".homePage:not(.hide) .scrollbuttoncontainer-misty.scrollbuttoncontainer-backwards").on('click', function (e) {
			if (this.index != 0 && this.index != $(".homePage:not(.hide) .misty-banner-item").length - 1) {
				clearInterval(this.bannerInterval);
				this.backwards();
				this.startCarousel();
			} else {
				this.alertDialog();
			}
		}.bind(this));
		$(".homePage:not(.hide) .scrollbuttoncontainer-misty.scrollbuttoncontainer-forwards").on('click', function (e) {
			if (this.index != 0 && this.index != $(".homePage:not(.hide) .misty-banner-item").length - 1) {
				clearInterval(this.bannerInterval);
				this.forwards();
				this.startCarousel();
			} else {
				this.alertDialog();
			}
		}.bind(this));
	}
	static touchListener() {
		//手指触摸
		$(".homePage:not(.hide) .misty-banner-body").on('touchstart', function (e) {
			if (this.index != 0 && this.index != $(".homePage:not(.hide) .misty-banner-item").length - 1) {
				clearInterval(this.bannerInterval);
				this.moveX = 0;
				this.startX = e.targetTouches[0].pageX;
				this.flag = false;
			} else {
				this.alertDialog();
			}
		}.bind(this));
		//手指移动
		$(".homePage:not(.hide) .misty-banner-body").on('touchmove', function (e) {
			if (this.index != 0 && this.index != $(".homePage:not(.hide) .misty-banner-item").length - 1) {
				this.moveX = e.targetTouches[0].pageX - this.startX;
				this.flag = true;
				$(".homePage:not(.hide) .misty-banner-body").css({ left: -this.index * innerWidth + this.moveX, transition: "none" });
			}
			else {
				// this.alertDialog();
			}
		}.bind(this));
		//手指离开
		$(".homePage:not(.hide) .misty-banner-body").on('touchend', function (e) {
			if (this.index != 0 && this.index != $(".homePage:not(.hide) .misty-banner-item").length - 1) {
				if (this.flag) {
					if (Math.abs(this.moveX) > 50) {
						if (this.moveX > 0) {
							this.backwards();
						} else if (this.moveX < 0) {
							this.forwards();
						}
					} else {  //回弹效果
						$(".homePage:not(.hide) .misty-banner-body").css({ left: -(this.index * 100).toString() + "%", transition: "none" });
					}
				}
			} else {
				// this.alertDialog();
			}
			this.startCarousel();
		}.bind(this));
	}
	static startCarousel() {
		clearInterval(this.bannerInterval);
		this.bannerInterval = setInterval(() => {
			this.forwards();
		}, 8000);
	}
	static getRandomArrayElements(arr, count) {
		var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
		while (i-- > min) {
			index = Math.floor((i + 1) * Math.random());
			temp = shuffled[index];
			shuffled[index] = shuffled[i];
			shuffled[i] = temp;
		}
		return shuffled.slice(min);
	}

	/* 插入Banner */
	static async initBanner() {
		const banner = `
		<div class="misty-banner">
			<div class="emby-scrollbuttons emby-scrollbuttons-misty" title="">
				<div class="scrollbuttoncontainer-misty scrollbuttoncontainer-backwards">
					<button type="button" class="emby-scrollbuttons-scrollbutton paper-icon-button-light">
						<i class="md-icon autortl material-icons chevron_left"></i>
					</button>
				</div>
				<div class="scrollbuttoncontainer-misty scrollbuttoncontainer-forwards" >
					<button type="button"  class="emby-scrollbuttons-scrollbutton paper-icon-button-light">
						<i class="md-icon autortl material-icons chevron_right"></i>
					</button>
				</div>
			</div>
			<div class="misty-banner-body">
			</div>
			<div class="misty-banner-mask"></div>
			<div class="misty-banner-library">
				<div class="misty-banner-logos"></div>
			</div>
		</div>
		`;
		$(".homePage:not(.hide) .homeSectionsContainer").prepend(banner);

		// 插入数据
		this.data = await this.getItems(this.itemQuery);
		if (this.data.Items.length == 0) {
			$(".misty-loading").fadeOut(500, () => $(".misty-loading").remove()); 
			return;
		}
		if (this.randomtop100) this.data.Items = this.getRandomArrayElements(this.data.Items, 10);
		await this.data.Items.forEach(async (item) => {
			const detail = await this.getItem(item.Id),
				itemHtml = `
			<div class="misty-banner-item" id="${detail.Id}">
				<img draggable="false" loading="eager" decoding="sync" class="misty-banner-cover" src="${await this.getImageUrl(detail.Id, this.coverOptions)}" alt="Backdrop" style="">
				<div class="misty-banner-info padded-left padded-right">
					<h1>${detail.Name}</h1>
					<div><p>${detail.Overview}</p></div>
					<div><button onclick="Emby.Page.showItem('${detail.Id}')">MORE</button></div>
				</div>
			</div>
			`,
				logoHtml = `
			<img id="${detail.Id}" draggable="false" loading="eager" decoding="sync" class="misty-banner-logo" data-banner="img-title" alt="Logo" src="${await this.getImageUrl(detail.Id, this.logoOptions)}">
			`;
			if (detail.ImageTags && detail.ImageTags.Logo) {
				$(".homePage:not(.hide) .misty-banner-logos").append(logoHtml);
			}
			$(".homePage:not(.hide) .misty-banner-body").append(itemHtml);
		});
		// 只判断第一张海报加载完毕, 优化加载速度
		await new Promise((resolve, reject) => {
			let waitLoading = setInterval(() => {
				if (document.querySelector(".homePage:not(.hide) .misty-banner-cover")?.complete) {
					clearInterval(waitLoading);
					resolve();
				}
			}, 16);
		});

		let firstitem = $(".homePage:not(.hide) .misty-banner-item").first().clone();
		let lastitem = $(".homePage:not(.hide) .misty-banner-item").last().clone();
		$(".homePage:not(.hide) .misty-banner-body").append(firstitem);
		$(".homePage:not(.hide) .misty-banner-body").prepend(lastitem);
		// 判断媒体库section0已经加载完
		await new Promise((resolve, reject) => {
			let waitsection0 = setInterval(() => {
				if (document.querySelector(".layout-mobile") || document.querySelector(".layout-tv") || document.querySelector(".homePage:not(.hide) .section0 .emby-scrollbuttons")) {
					clearInterval(waitsection0);
					resolve();
				}
			}, 16);
		});
		// 分离section0元素移动到misty-banner-library内
		$('.homePage:not(.hide) .section0 .emby-scrollbuttons').remove();
		$(".homePage:not(.hide) .section0").detach().appendTo(".homePage:not(.hide) .misty-banner-library");

		$(".misty-loading").fadeOut(500, () => $(".misty-loading").remove());
		await CommonUtils.sleep(150);
		// 置入场动画
		this.transitionListener();
		let delay = 80; // 动媒体库画间隔
		let id = $(".homePage:not(.hide) .misty-banner-item").eq(1).addClass("active").attr("id"); // 初次信息动画
		$(`.homePage:not(.hide) .misty-banner-logo[id=${id}]`).addClass("active");

		await CommonUtils.sleep(200); // 间隔动画
		$(".homePage:not(.hide) .section0 > div").addClass("misty-banner-library-overflow"); // 关闭overflow 防止媒体库动画溢出
		$(".homePage:not(.hide) .section0 .card").each((i, dom) => setTimeout(() => $(dom).addClass("misty-banner-library-show"), i * delay)); // 媒体库动画
		await CommonUtils.sleep(delay * 8 + 1000); // 等待媒体库动画完毕
		$(".homePage:not(.hide) .section0 > div").removeClass("misty-banner-library-overflow"); // 开启overflow 防止无法滚动
		// 滚屏逻辑
		this.index = 1;
		this.startCarousel();
	}

	/* 初始事件 */
	static async initEvent() {
		this.touchListener();
		this.onclickListener();
	}
}

// 运行
if ("BroadcastChannel" in window || "postMessage" in window) {
	if ($("meta[name=application-name]").attr("content") == "Jellyfin") {
		Home.start();
	}
}
