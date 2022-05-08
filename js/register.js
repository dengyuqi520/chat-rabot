(async () => {
  const doms = {
    userName: document.getElementById("userName"),
    userNickname: document.getElementById("userNickname"),
    userPassword: document.getElementById("userPassword"),
    userConfirmPassword: document.getElementById("userConfirmPassword"),
    formContainer: document.getElementById("formContainer"),
  };

  let isRepeat = false;
  /**
   * 初始化函数
   */
  const init = () => {
    initEvent();
  };
  /**
   * 定义页面交互函数
   */
  const initEvent = () => {
    doms.userName.addEventListener("blur", onUserBlur);
    doms.formContainer.addEventListener("submit", onFormSubmit);
  };

  /**
   * 账户名失去焦点的事件函数
   */
  const onUserBlur = async () => {
    //   获得用户输入的值
    const loginId = doms.userName.value.trim();
    // 如果信息是空，则返回
    if (!loginId) {
      return;
    }
    // 验证账号（可以验证账号之前是否存在）
    const res = await fetchFn({
      url: "/api/user/exists",
      method: "GET",
      params: { loginId },
    });
  };

  /**
   * 提交表单事件函数
   */
  const onFormSubmit = async (e) => {
    e.preventDefault();
    // 表单信息的收集
    const loginId = doms.userName.value.trim();
    const loginPwd = doms.userPassword.value.trim();
    const nickname = doms.userNickname.value.trim();
    const confrimPwd = doms.userConfirmPassword.value.trim();
    // 表单信息的验证
    if (!checkForm(loginId, loginPwd, nickname, confrimPwd)) return;
    // 请求数据
    sendData(loginId, loginPwd, nickname);
  };

  /**
   * 表单验证函数
   */
  const checkForm = (loginId, loginPwd, nickname, confrimPwd) => {
    switch (true) {
      case !loginId:
        window.alert("小马虎！用户名不能为空哦！");
        return;
      case !loginPwd:
        window.alert("小马虎！密码不能为空哦！");
        return;
      case !nickname:
        window.alert("小马虎！昵称不能为空哦！");
        return;
      case !confrimPwd:
        window.alert("小马虎！确认密码不能为空哦！");
        return;
      case loginPwd !== confrimPwd:
        window.alert("小马虎！两次密码不一样哎！");
        return;
      case isRepeat:
        window.alert("这个账号已经有主人啦！换一个吧！");
        return;
      // 如果以上情况都没有发生，则返回true
      default:
        return true;
    }
  };

  const sendData = async (loginId, loginPwd, nickname) => {
    const res = await fetchFn({
      url: "/api/user/reg",
      method: "POST",
      params: { loginId, loginPwd, nickname },
    });
    // 要保障fetchFn函数返回结果 （此处res保存返回结果）有值，再进行跳转
    res && window.location.replace("./login.html");
  };

  init();
})();
