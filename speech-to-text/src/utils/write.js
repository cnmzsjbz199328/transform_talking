export const saveContentToLocalStorage = (data) => {
    // 从 localStorage 获取现有数据
    const existingData = localStorage.getItem('apiResponse');
    let dataArray = existingData ? JSON.parse(existingData) : [];
  
    // 确保 dataArray 是数组
    if (!Array.isArray(dataArray)) {
      dataArray = [];
    }
  
    // 将新数据解析为对象并追加到数组
    const parsedData = JSON.parse(data); // data 是 JSON 字符串
    dataArray.push(parsedData);
  
    // 保存更新后的数组
    localStorage.setItem('apiResponse', JSON.stringify(dataArray));
  };