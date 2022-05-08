(() => {
  const doms = {
    nickname: document.querySelector(".user-info .nick-name"),
    accountName: document.querySelector(".user-description .account-name"),
    time: document.querySelector(".level-container .login-time"),
    contentBody: document.querySelector(".content-body"),
    toLogin: document.querySelector(".right-wrapper .close"),
    sendBtn: document.querySelector(".handle-container .send-btn"),
    content: document.querySelector(".left-footer textarea"),
    arrowBtn: document.querySelector(".arrow-container"),
    selectBtn: document.querySelector(".select-container"),
    waysBtns: document.querySelectorAll(".select-container .select-item"),
  };
  let page = 0;
  let size = 10;
  let chatTotal = null;
  //默认按enter发送消息
  let sendType = "enter";
  /**
   * 初始化函数
   */
  const init = () => {
    getUserInfo();
    initChatList("bottom");
    initEvent();
  };
  /**
   * 定义页面交互函数
   */
  const initEvent = () => {
    doms.toLogin.addEventListener("click", toLogin);
    doms.sendBtn.addEventListener("click", sendMsg);
    doms.contentBody.addEventListener("scroll", onContentScroll);
    doms.arrowBtn.addEventListener("click", onArrowClick);
    doms.waysBtns.forEach((node) =>
      node.addEventListener("click", onSelectClick)
    );
    doms.content.addEventListener("keyup", onContentKeyup);
  };

  /**
   * 获取用户信息函数
   */
  const getUserInfo = async () => {
    const response = await fetchFn({ url: "/api/user/profile" });
    doms.nickname.innerText = response.nickname;
    doms.accountName.innerText = response.loginId;
    doms.time.innerText = formaDate(response.lastLoginTime);
  };

  /**
   * 获取历史聊天记录
   */
  const initChatList = async (direction) => {
    const response = await fetchFn({
      url: "/api/chat/history",
      params: { page, size },
    });
    chatTotal = response.chatTotal;
    // 调用渲染聊天页面的函数
    renderChatForm(response.data, direction);
  };

  /**
   * 渲染聊天页面
   * @param {Array} list
   */
  const renderChatForm = (list, direction) => {
    //因为后端获取到的数据是没有经过排序的，将后端获取到的数据排序
    list.reverse();
    //  没有历史聊天记录展示默认情况，不需要进行渲染
    if (!list.length) {
      doms.contentBody.innerHTML = `<div class="chat-container robot-container">
      <img
        src="https://img2.baidu.com/it/u=1006592210,3539228340&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
        alt=""
      />
      <div class="chat-txt">
        你好哇！我是柒柒的智能机器人，非常欢迎你的到来，有什么想和我聊聊的吗？
      </div>
    </div>`;
      return;
    }
    const chatData = list.map((item) => {
      return item.from === "user"
        ? `<div class="chat-container avatar-container">
            <img
            src="https://img2.baidu.com/it/u=4060718266,4183768896&fm=253&fmt=auto&app=138&f=JPEG?w=400&h=400"
            alt=""
            />
            <div class="chat-txt">${item.content}</div>
        </div>`
        : `<div class="chat-container robot-container">
            <img
            src="https://img2.baidu.com/it/u=1006592210,3539228340&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500"
            alt=""
            />
            <div class="chat-txt">
            ${item.content}
            </div>
        </div>`;
    });
    if (direction === "bottom") {
      // 当direction为bottom时，表示聊天记录从底部进行添加
      doms.contentBody.innerHTML += chatData.join("");
      // 找到最后一条聊天记录，得到其高度，将滚动条设置到最底部
      const allText = document.querySelectorAll(".chat-container");
      const lastTextDistance = allText[allText.length - 1].offsetTop;
      doms.contentBody.scrollTo(0, lastTextDistance);
    } else {
      // 查看之前的聊天记录，数据从顶部进行添加（在当前聊天记录前面进行添加）
      doms.contentBody.innerHTML =
        chatData.join("") + doms.contentBody.innerHTML;
    }
  };

  /**
   * 对发送消息进行渲染
   */
  const sendMsg = async () => {
    const content = doms.content.value.trim();
    if (!content) {
      window.alert("发送的消息不能为空哦！");
      return;
    }
    renderChatForm([{ from: "user", content }], "bottom");
    doms.content.value = "";
    // 发送数据到后端
    const response = await fetchFn({
      url: "/api/chat",
      method: "POST",
      params: { content },
    });
    renderChatForm([{ from: "robot", content: response.content }], "bottom");
  };

  /**
   * 按动按钮，展示发送方式
   */
  const onArrowClick = () => {
    doms.selectBtn.style.display = "block";
  };

  /**
   * 按动按钮，选择发送方式
   */
  const onSelectClick = function () {
    // 点击设置高亮状态
    doms.waysBtns.forEach((node) => node.classList.remove("on"));
    this.classList.add("on");
    // 将全局变量 sendType 的值赋给被点击的div 的属性type
    sendType = this.getAttribute("type");
    setTimeout(() => {
      doms.selectBtn.style.display = "none";
    }, 120);
  };

  /**
   * 滑动contentBody 获取更多聊天信息
   */
  const onContentScroll = function () {
    // 滚动到顶部的时候进行第二页数据的加载
    if (this.scrollTop === 0) {
      // 当加载完聊天记录后，不再运行进行滚动
      if (chatTotal <= (page + 1) * size) return;
      page++;
      initChatList("top");
    }
  };

  /**
   * 在文字输入框按下指定按键，发送文字
   */
  const onContentKeyup = (e) => {
    //第一种情况，当按下了enter（enter键的keycode===13）并且，选择的type是enter，并且，不是同时按的ctrl 加enter的组合
    //第二种情况，当同时按下了enter和ctrl（enter键的keycode===13）并且，选择的type是ctrlenter
    if (
      (e.keyCode === 13 && sendType === "enter" && !e.ctrlKey) ||
      (e.keyCode === 13 && sendType === "ctrlEnter" && e.ctrlKey)
    ) {
      // 与按动“发送”按钮做一样的处理 触发发送事件
      doms.sendBtn.click();
    }
  };
  /**
   * 将获得的时间调整为常规时间
   * @param {*} time
   * @returns
   */
  const formaDate = (time) => {
    const date = new Date(time);
    return `${date.getFullYear()}-${fill0(date.getMonth() + 1)}-${fill0(
      date.getDate()
    )} ${fill0(date.getHours())}:${fill0(date.getMinutes())}:${fill0(
      date.getSeconds()
    )}`;
  };

  const fill0 = (num) => {
    return num < 10 ? "0" + num : num;
  };
  /**
   * 回到登录页面
   */
  const toLogin = () => {
    // 清空sessionStorage
    sessionStorage.removeItem("token");
    // 跳转到登录页面
    window.location.replace("./login.html");
  };

  init();
})();
