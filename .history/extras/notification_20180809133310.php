<?php
header("Access-Control-Allow-Origin: *");

define( 'API_ACCESS_KEY_ANDROID', "AIzaSyD3NFQ901P3eBXtMNn_BMLDNwZF7e2nCXc");
define( 'API_ACCESS_KEY_IOS',"AIzaSyArkqCp5pHrlDyNdEF9nH1-fSnEn_yqpZ4");
define( 'API_ACCESS_KEY_RN_ANDROID', "AIzaSyAaiBP2G5z4Ia-FPz4RCTg_BhDjkTjCBnU");

$id = $_REQUEST['topic'];
$mess = $_REQUEST['msg'];

if($id !== ''){
	$response['android_res'] = sendFcmAndroid($mess,$id);
	$response['ios_res']	 = sendFcmIos($mess,$id);
	
	echo json_encode($response);
}

function sendFcmAndroid($mess,$id) {
     $msg = array
          (
			'body' 	=> $mess,
			'title'	=> "GenioLite",
          );
          
     $data = array
          (
				"message" 	=> $mess,
          );
	$fields = array
			(
				'to'		=> "/topics/com.geniolite.".$id,
				'notification'	=> $msg,
				'data' => json_decode($data)
			);
	
	
	$headers = array
			(
				'Authorization: key=' . API_ACCESS_KEY_ANDROID,
				'Content-Type: application/json'
			);
		
		
		$ch = curl_init();
		curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
		curl_setopt( $ch,CURLOPT_POST, true );
		curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
		curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
		$result = curl_exec($ch );
		//$info = curl_getinfo($ch);
		curl_close( $ch );
		
	   return $result;
}

function sendFcmIos($mess,$id) {
     $msg = array
          (
			'body' 	=> $mess,
			'title'	=> "GenioLite",
			'sound' => "default",
          );
          
     $data = array
          (
				"message" 	=> $mess,
          );
	$fields = array
			(
				'to'		=> "/topics/com.geniolite.".$id,
				'notification'	=> $msg,
				'data' => $data
			);
	
	
	$headers = array
			(
				'Authorization: key=' . API_ACCESS_KEY_IOS,
				'Content-Type: application/json'
			);
		
		
		$ch = curl_init();
		curl_setopt( $ch,CURLOPT_URL, 'https://fcm.googleapis.com/fcm/send' );
		curl_setopt( $ch,CURLOPT_POST, true );
		curl_setopt( $ch,CURLOPT_HTTPHEADER, $headers );
		curl_setopt( $ch,CURLOPT_RETURNTRANSFER, true );
		curl_setopt( $ch,CURLOPT_SSL_VERIFYPEER, false );
		curl_setopt( $ch,CURLOPT_POSTFIELDS, json_encode( $fields ) );
		$result = curl_exec($ch );
		//$info = curl_getinfo($ch);
		curl_close( $ch );

		return  $result;
}

?>