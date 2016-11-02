'use strict';

var _ = require("lodash");


var userAgents = [

    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/36.0.1985.125 Chrome/36.0.1985.125 Safari/537.36'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2049.0 Safari/537.36'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (Windows NT 5.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/35.0.3319.102 Safari/537.36'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (compatible, MSIE 11, Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko'},
    {storage : true, timing : 'resource', agent : 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/5.0)'},
    {storage : true, timing : 'nav', agent : 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_2_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13D15 Safari/601.1'},
    {storage : true, timing : 'nav', agent : 'Mozilla/5.0 (Windows; U; MSIE 9.0; WIndows NT 9.0; en-US))'},

    {storage : true, timing : 'none', agent : 'Mozilla/5.0 (compatible; MSIE 8.0; Windows NT 6.0; Trident/4.0; InfoPath.1; SV1; .NET CLR 3.8.36217; WOW64; en-US)'},
    {storage : false, timing : 'none', agent : 'Mozilla/4.0 (compatible; MSIE 6.1; Windows XP)'},

    {storage : false, timing : 'none', agent : 'Mozilla/5.0(iPad; U; CPU iPhone OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B314 Safari/531.21.10'},
    {storage : false, timing : 'none', agent : 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25'}

];

 var browserAgent = {};
 browserAgent.getRandomBrowser = function() {
    return userAgents[_.random(0, (userAgents.length - 1))];
}

module.exports = browserAgent;
