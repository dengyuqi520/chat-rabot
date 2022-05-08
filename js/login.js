(async function () {
  const doms = {
    userName: document.getElementById("userName"),
    userPassword: document.getElementById("userPassword"),
    form: document.getElementById("formContainer"),
  };
  /**
   * 初始化函数
   */
  const init = function () {
    initEvents();
  };

  /**
   * 所有的时间都在这个函数里面进行绑定
   */
  const initEvents = () => {
    doms.form.addEventListener("submit", onFormSubmitclick);
    doms.toRegister.addEventListener("click", toRegister);
  };
  /**
   * 表单提交事件的函数
   */
  const onFormSubmitclick = (e) => {
    //阻止表单默认事件（提交事件发生后默认刷新）
    e.preventDefault();
    // 得到用户输入内容
    const loginId = doms.userName.value.trim();
    const loginPwd = doms.userPassword.value.trim();
    // 表单数据的发送
    if (!loginId || !loginPwd) {
      alert("用户名或密码不能为空");
    }
    sendData(loginId, loginPwd);
  };

  const sendData = async (loginId, loginPwd) => {
    const res = await fetchFn({
      url: "/api/user/login",
      method: "POST",
      params: {
        loginId,
        loginPwd,
      },
    });
    // 如果验证成功跳转到聊天页面
    if (!res) {
      doms.userPassword.value = "";
    }
    res && window.location.replace("./index.html");
  };

  init();
})();
