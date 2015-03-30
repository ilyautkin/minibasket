@@ -0,0 +1,36 @@
<?php
header('Content-type: text/html; charset=utf-8');
if(!empty($_POST['order']) && !empty($_POST['phone'])){
	include("../config.php");
	mysql_connect($config['db_hostname'],$config['db_username'],$config['db_password']);
	mysql_select_db($config['db_name']);
	mysql_query('SET NAMES utf8');

	$sql = "SELECT ordernum FROM minibasket";
	$result = mysql_query($sql);
	$res = mysql_fetch_assoc($result);
	$order_num = ++$res['ordernum'];

	$sql = "UPDATE minibasket SET ordernum=".$order_num;
	$result = mysql_query($sql);
	$order_num .= "/".date("dmY");
	$mailtext ='<h2>Заявка с сайта CargoCrane.ru</h2>';
	$mailtext .='<b>№ заказа:</b> '.$order_num.'<br/>';
	if (isset($_POST['order']))	$mailtext .='<b>Заказ:</b> '.$_POST['order'].'<br/>';
	if (isset($_POST['phone']))	$mailtext .='<b>Телефон:</b> '.$_POST['phone'].'<br/>';
	print mailto($mailtext) ? $order_num : 'err';
}else{
	print 'null';
}
function mailto($txt){
	$mail_to = "seokirillstarsnab@gmail.com, cargotoys@mail.ru, 9096668899@mail.ru";
	$message = $txt;
	$subject  =  '=?utf-8?B?'.base64_encode('Заявка с сайта CargoCrane.ru').'?=';
	$headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
	$headers .= 'Content-Transfer-Encoding: 8bit' . "\r\n";
	$headers .= 'From: CargoCrane.ru Minibasket <noreply@CargoCrane.ru>' . "\r\n";
	$headers .= 'Bcc: noreply@CargoCrane.ru' . "\r\n";
	return @mail($mail_to, $subject, $message, $headers);
}
?> 
