//notation: js file can only use this kind of comments
//since comments will cause error when use in webview.loadurl,
//comments will be remove by java use regexp
(function() {
  if (window.LvUJsBridge) {
    return;
  }
  var messagingIframe;
  var sendMessageQueue = [];
  var receiveMessageQueue = [];
  var messageHandlers = {};

  var CUSTOM_PROTOCOL_SCHEME = "xxxx";
  var QUEUE_HAS_MESSAGE = "__QUEUE_MESSAGE__/";

  var responseCallbacks = {};
  var uniqueId = 1;

  function _createQueueReadyIframe(doc) {
    messagingIframe = doc.createElement("iframe");
    messagingIframe.style.display = "none";
    doc.documentElement.appendChild(messagingIframe);
  }

  function isAndroid() {
    var ua = navigator.userAgent.toLowerCase();
    var isA = ua.indexOf("android") > -1;
    if (isA) {
      return true;
    }
    return false;
  }

  function isIphone() {
    var ua = navigator.userAgent.toLowerCase();
    var isIph = ua.indexOf("iphone") > -1;
    if (isIph) {
      return true;
    }
    return false;
  }

  //set default messageHandler
  function init(messageHandler) {
    if (LvUJsBridge._messageHandler) {
      throw new Error("LvUJsBridge.init called twice");
    }
    LvUJsBridge._messageHandler = messageHandler;
    var receivedMessages = receiveMessageQueue;
    receiveMessageQueue = null;
    for (var i = 0; i < receivedMessages.length; i++) {
      _dispatchMessageFromNative(receivedMessages[i]);
    }
  }

  function send(data, responseCallback) {
    _doSend(
      {
        data: data
      },
      responseCallback
    );
  }

  function registerHandler(handlerName, handler) {
    messageHandlers[handlerName] = handler;
  }

  function callHandler(handlerName, data, responseCallback) {
    _doSend(
      {
        handlerName: handlerName,
        data: data
      },
      responseCallback
    );
  }

  //_dosend函数进行消息封装放入发送消息队列，在产生一个src（url scheme），供obj-c端shouldStartLoadWithRequest捕捉
  function _doSend(message, responseCallback) {
    if (responseCallback) {
      var callbackId = "cb_" + uniqueId++ + "_" + new Date().getTime();
      responseCallbacks[callbackId] = responseCallback;
      message.callbackId = callbackId;
    }

    sendMessageQueue.push(message);
    messagingIframe.src = CUSTOM_PROTOCOL_SCHEME + "://" + QUEUE_HAS_MESSAGE;
    if (isIphone()) {
      messagingIframe.src =
        CUSTOM_PROTOCOL_SCHEME + "://" + QUEUE_HAS_MESSAGE.slice(0, -1);
    }
  }

  // 提供给native调用,该函数作用:获取sendMessageQueue返回给native,由于android不能直接获取返回的内容,所以使用url shouldOverrideUrlLoading 的方式返回内容
  function _fetchQueue() {
    var messageQueueString = JSON.stringify(sendMessageQueue);
    sendMessageQueue = [];
    //add by hq
    if (isIphone()) {
      return messageQueueString;
      //android can't read directly the return data, so we can reload iframe src to communicate with java
    } else if (isAndroid()) {
      // messagingIframe.src =
      //   CUSTOM_PROTOCOL_SCHEME + "://return/_fetchQueue/" + messageQueueString;
      messagingIframe.contentWindow.location.replace(CUSTOM_PROTOCOL_SCHEME + "://return/_fetchQueue/" + messageQueueString);
    }
  }

  //提供给native使用,
  function _dispatchMessageFromNative(messageJSON) {
    setTimeout(function() {
      // console.log(messageJSON);
      var message = JSON.parse(messageJSON);
      var responseCallback;
      //java call finished, now need to call js callback function
      if (message.responseId) {
        responseCallback = responseCallbacks[message.responseId];
        if (!responseCallback) {
          return;
        }
        if (isIphone()) {
          responseCallback(message.responseData);
        } else {
          if (message.responseData) {
            responseCallback(eval("(" + message.responseData + ")"));
          } else {
            responseCallback(message.responseData);
          }
        }
        delete responseCallbacks[message.responseId];
      } else {
        //直接发送
        if (message.callbackId) {
          var callbackResponseId = message.callbackId;
          responseCallback = function(responseData) {
            _doSend({
              responseId: callbackResponseId,
              responseData: responseData
            });
          };
        }

        var handler = LvUJsBridge._messageHandler;
        if (message.handlerName) {
          handler = messageHandlers[message.handlerName];
        }
        //查找指定handler
        try {
          handler(message.data, responseCallback);
        } catch (exception) {
          if (typeof console != "undefined") {
            console.log(
              "LvUJsBridge: WARNING: javascript handler threw.",
              message,
              exception
            );
          }
        }
      }
    });
  }

  //提供给native调用,receiveMessageQueue 在会在页面加载完后赋值为null,所以
  function _handleMessageFromNative(messageJSON) {
    if (receiveMessageQueue) {
      receiveMessageQueue.push(messageJSON);
    } else {
      _dispatchMessageFromNative(messageJSON);
    }
  }

  var LvUJsBridge = (window.LvUJsBridge = {
    init: init,
    send: send,
    on: registerHandler,
    invoke: callHandler,
    _fetchQueue: _fetchQueue,
    _handleMessageFromNative: _handleMessageFromNative
  });

  var doc = document;
  _createQueueReadyIframe(doc);
  var readyEvent = doc.createEvent("Events");
  readyEvent.initEvent("LvUJsBridgeReady");
  readyEvent.bridge = LvUJsBridge;
  doc.dispatchEvent(readyEvent);
})();
