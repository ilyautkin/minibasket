// minibasket.basket_html - Html-код корзинки
// minibasket.basket - Объект корзинки
// minibasket.css - Стили корзинки
// minibasket.init() - Инициация корзинки
$(function(){
	var minibasket = {
		selector: {
			item: '.mb-item',
			articul: '.art',
			price: '.mb-price .value',
			name: '.mb-name',
			count: '.mb-num',
			toBasketButton: '#tobasket span'
		},
		msg: {
			success: "Ваш заказ принят.<br>Мы свяжемся с вами в ближайшее время!",
			invalidTel: 'Некорректный номер телефона',
			re: 'Отправить повторно?',
			wrongOrder: 'Вы не выбрали ни одного товара или не ввели номер телефона.',
			empty: 'Пока пусто :('
		},		
		basket_html: function(){
			return '<div id="minibasket"><div class="mb-but">Корзинка<span class="recycle" title="Очистить корзину"></span></div><div class="sliding"><div class="tel"><input type="text" placeholder="Ваш телефон" class="mb-tel"></div><div class="inner"><div class="items">' + this.msg.empty + '</div><div class="itog">0<span class="rub">руб.</span></div><input type="submit" value="Заказать" /></div></div></div>';
		},
		css: '<link rel="stylesheet" href="/minibasket/minibasket.css" type="text/css" media="all" />',
		init: function(){
			document.body.innerHTML += minibasket.basket_html();
			document.body.innerHTML += minibasket.css;
			this.basket = $('#minibasket');
			this.sliding = $('.sliding', this.basket);
			this.items = $('.items',this.basket);
			this.items.css('max-height',window.innerHeight-200+'px');
			this.tel = $('.mb-tel', this.basket);
			this.but = $('.mb-but', this.basket);
			this.itog = $('.itog', this.basket);	
			if (localStorage['minibasket']) this.reset();					
			this.but.click(function(){
				minibasket.sliding.toggleClass('visible');
			});
			$('body').on('click',minibasket.selector.toBasketButton,function(){
				var articul = $(this).parents(minibasket.selector.item).find(minibasket.selector.articul).text();
				var price = parseInt($(this).parents(minibasket.selector.item).find(minibasket.selector.price).text().replace(' ',''));
				var name = $(this).parents(minibasket.selector.item).find(minibasket.selector.name).text();
				var num = $(this).parents(minibasket.selector.item).find(minibasket.selector.count).val();
				minibasket.add(articul,price,name,num);
			});
			this.submit = $('input[type=submit]', this.basket);
			this.submit.click(function(){
				minibasket.order();
			});
			$('#minibasket').on('click','.remove',function(){
				minibasket.remove($(this).parent());
			});
			this.recycle = $('.recycle', this.basket);
			this.recycle.click(function(){
				minibasket.clear();
			});
			this.tel.on("keyup", minibasket.save);
		},
		add: function(articul,price,name,num){
			var price = price*num;
			var articul = articul.replace(' ','');
			if ($('#'+articul, minibasket.items).length > 0){
				$exist = $('#'+articul, minibasket.items);
				$num = parseInt($exist.data('num')) + parseInt(num);
				$price = parseInt($exist.data('price')) + parseInt(price);
				$exist.data('num',$num);
				$exist.data('price',$price);
				$exist.find('.price').html($price+' руб.');
				$exist.find('.num').html($num+' шт.');
				minibasket.calc();
				localStorage['accept'] = '';
				minibasket.save();					
				return false;			
			};
			var $item = '<div class="item" id="' + articul + '" data-num="' + num + '" data-price="' + price + '"><span class="articul">' + articul + ' </span><span class="remove" title="Убрать из списка">x</span><span class="overname"> ' + name + ' </span><span class="price">' + price + ' руб.</span><span class="num">' + num + 'шт.</span></div>';
			if ($('.item', minibasket.items).length < 1) {
				minibasket.items.html($item);
				minibasket.sliding.slideDown('slow');
			}else{
				minibasket.items.append($item);
				if (minibasket.sliding.is(':hidden')){
					minibasket.but.addClass('signal').delay(1000).queue(function(){
						$(this).removeClass('signal');
						$(this).dequeue();
					});
				};	
			};
			minibasket.save();	
			minibasket.calc();
			localStorage['accept'] = '';
		},
		order: function(){
			var $phone = this.tel.val();
			if ($phone.length < 7){
				this.msgbox(this.msg.invalidTel);
				this.tel.addClass('err');
				return false;
			}else{
				this.tel.removeClass('err');
			}
			if (localStorage['accept']){
				this.accept(this.msg.re);
				return false;
			};
			var $msg = this.msg.success;
			var $order = minibasket.items.html();
			$.post('/minibasket/sendpost.php',{order:$order,phone:$phone},function(data){
				console.log('ajax request: '+data);
				if (data == 'null') {
					$msg = msgbox(this.msg.wrongOrder);
					return false;
				}
				minibasket.msgbox($msg+'<span class="imp">Номер вашего заказа: <b>'+data+'</b></span>');
			});
			localStorage['accept'] = true;
			return false;		
		},
		msgbox: function(msg){
			$('body').append('<div id="mb-msgbox"><div class="close">x</div>' + msg + '</div>');
			var msgbox_visible = setTimeout(function(){
				var $msgbox = $('#mb-msgbox');
				$msgbox.fadeIn('slow',function(){
					$(this).on("click",".close",function(){
						$msgbox.fadeOut('slow', function(){
							$msgbox.remove();
						});
					});
				});
				clearTimeout(msgbox_visible);	
			}, 0);
		},	 	
		accept: function(msg){
			$('body').append('<div id="mb-msgbox accept-box"><div class="close">x</div>' + msg + '<div class="accept">Подтвердить</div><div class="cancel">Отменить</div></div>');
				var $msgbox = $('.mb-msgbox');
				$msgbox.fadeIn('slow',function(){
					$msgbox.on("click",".close",function(){
						$msgbox.fadeOut('slow', function(){
							$msgbox.remove();
						});
					});
					$msgbox.on("click",".accept",function(){
						localStorage['accept'] = '';
						minibasket.order();
						$msgbox.fadeOut('slow', function(){
							$msgbox.remove();
						});
					});
					$msgbox.on("click",".cancel",function(){
						$msgbox.fadeOut('slow', function(){
							$msgbox.remove();
						});
					});
				});
		},
		remove: function(obj){
			obj.fadeOut('slow', function(){
				obj.remove();
				minibasket.calc();	
				if (!minibasket.items.html()) minibasket.items.html(minibasket.msg.empty);
				localStorage['accept'] = '';
				minibasket.save();
			});
		},	 
		calc: function(){
			console.log('reCalc');
			var $sum = 0;
			this.basket.find('.item').each(function(){
				$sum += parseInt($(this).find('.price').text());
			});
			this.itog.html($sum+'<span class="rub">руб.</span>');
		},				
		clear: function(){
			this.items.html(this.msg.empty);
			this.calc();	
			this.save();
		},	
		save: function(){
			var save = {
				tel: minibasket.tel.val(),
				items: minibasket.items.html()
			}
			localStorage['minibasket'] = JSON.stringify(save);
			console.log('minibasket saved');
		},		 			
		reset: function(){
			var reset = JSON.parse(localStorage['minibasket']);
			this.items.html(reset.items);
			this.tel.val(reset.tel);
			this.calc();
			console.log('minibasket resume');			
		}		
	}
	minibasket.init();
});
