<?php
/**
 * @brief 转发ajax的请求，用于跨域API访问
 * @author duanmiao
 * 比如说我们访问api /view/list?id=3000，那么通过该proxy访问的方法为 http://myhost/proxy.php?api=%2Fview%2Flist%3Fid%3D3000
 * 经过proxy以后，实际访问的url为: $api_host . /view/list?id=3000, post数据会原样转发
 * */
class api_proxy 
{
    private $api_host = '';

    function __construct($api_host) {

        if (empty($_GET['api'])){
            header('HTTP/1.1 400 Bad Request');
            return;
        }

        $this->api_host = $api_host;    
        $post_data = $this->get_post_data();
        $header_data = $this->get_header();
        $forward_url = 'http://' . $this->api_host . $_GET['api'];
	

        echo $this->proxy_get_contents($forward_url, $header_data, $post_data);
    }

    function get_header()
    {
	$origin_header = headers_list();
        //$origin_header = getallheaders();
        $origin_header['Connection'] = 'close';
        $origin_header['Host'] = $this->api_host;

        $headers = array();
        foreach($origin_header as $key => $value){
            array_push($headers, $key . ": " . $value);
        }
        return $headers;
    }
    

    private function get_post_data()
    {
        $handle = @fopen('php://input', 'r');
        $post_data = array();
        $data = '';
        do
        {
            $data = @fread($handle, 1024);
            if (strlen($data) == 0)
                break;
            else
                $post_data[] = $data;
        }while(true);
        fclose($handle);
        unset($data, $handle);
        return $post_data;
    }

    private function proxy_get_contents($url, $headers = array(), $post_data = array())
    {
        /*
        $fp = fsockopen("113.11.199.61", 8080, $errno, $errstr, 30);
        if (!$fp){
            return "$errstr ($errno)";
        }

        $out = $_SERVER['REQUEST_METHOD'] . " /bithj/servlet HTTP/1.1\r\n";
        $out .= "Host: 113.11.199.61:8080\r\n";
        foreach($this->headers as $k => $v){
            $out .= "$v\r\n";
        }
        $out .= "\r\n";
        if (count($this->maGetPostData) > 0){
            $out .= implode('', $this->maGetPostData);
        }
        fwrite($fp, $out);
        $response = '';
        while(!feof($fp)){
            $response .= fgets($fp, 128);
        }
        fclose($fp);
        
        $body_pos = strpos($response, "\r\n\r\n");
        if ($body_pos != -1){
            $body_str = substr($response, $body_pos + 4);
            if (strpos($response, "Transfer-Encoding: chunked") == -1){
                return $body_str;
            }
            $real_body_str = "";
            foreach(split("\r\n", $body_str) as $k => $v){
                if ($k % 2 == 1){
                    $real_body_str .= $v;
                }
            }
            return $real_body_str;
        }
        return "";
        */
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 10);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_DNS_CACHE_TIMEOUT, 1800);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        if (isset($headers) && count($headers) > 0){
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        if (isset($post_data) && count($post_data) > 0)
        {
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, implode('', $post_data));//提交POST数据
        }
        $sData = curl_exec($ch);
        curl_close($ch);
        unset($ch);
        return $sData;
    }
}

$o = new api_proxy('172.16.34.115:9988');
#$o = new api_proxy('172.16.34.120:9988');
//http://123.126.105.15:9988/db/import
//http://localip/proxy.php?api=/db/import
?>
