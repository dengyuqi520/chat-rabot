const BASE_URL = "https://study.duyiedu.com";
// 以对象的形式传递参数，默认为GET方法传输数据
const fetchFn = async ({ url, method = "GET", params = {} }) => {
  // get请求的参数拼接
  let result = null;
  const extendsObj = {};
  // 如果sessionStorage有值，就将指定格式的内容存到extendsObj中
  sessionStorage.token &&
    (extendsObj.Authorization = "Bearer" + " " + sessionStorage.token);
  if (method === "GET" && Object.keys(params).length) {
    // 拼接效果 key1=value1&key2=value2
    url +=
      "?" +
      Object.keys(params)
        .map((key) => "".concat(key, "=", params[key]))
        .join("&");
  }
  try {
    const response = await fetch(BASE_URL + url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...extendsObj,
      },
      body: method === "GET" ? null : JSON.stringify(params),
    });
    // 从相应头获取token
    const token = response.headers.get("Authorization");
    // 如果有token值，将token存储到sessionStorage里面
    token && (sessionStorage.token = token);
    result = await response.json();
    if (result.code === 0) {
      if (result.hasOwnProperty("chatTotal")) {
        result.data = { chatTotal: result.chatTotal, data: result.data };
      }
      return result.data;
    } else {
      if (result.status === 401) {
        window.alert("权限不正确");
        sessionStorage.removeItem("token");
        window.replace("./login.html");
        return;
      }
      window.alert(result.msg);
    }
  } catch (err) {
    console.log(err);
  }
};
