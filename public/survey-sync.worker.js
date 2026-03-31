// Survey Sync Shared Worker

// 存储每个问卷的连接集合
const connections = new Map();

// 处理新连接
self.onconnect = (event) => {
  const port = event.ports[0];
  let surveyId = null;

  // 监听消息
  port.onmessage = (e) => {
    const { type, data } = e.data;

    switch (type) {
      case 'init':
        // 初始化连接，关联到特定问卷
        surveyId = data.surveyId;
        if (!connections.has(surveyId)) {
          connections.set(surveyId, new Set());
        }
        connections.get(surveyId).add(port);
        break;

      case 'update':
        // 广播数据更新到同一问卷的所有其他连接
        if (surveyId) {
          const surveyConnections = connections.get(surveyId);
          if (surveyConnections) {
            surveyConnections.forEach(conn => {
              if (conn !== port) {
                conn.postMessage({
                  type: 'sync',
                  data: data
                });
              }
            });
          }
        }
        break;

      case 'disconnect':
        // 移除连接
        if (surveyId) {
          const surveyConnections = connections.get(surveyId);
          if (surveyConnections) {
            surveyConnections.delete(port);
            // 如果该问卷没有连接了，清理资源
            if (surveyConnections.size === 0) {
              connections.delete(surveyId);
            }
          }
        }
        break;
    }
  };

  // 处理连接关闭
  port.onmessageerror = () => {
    if (surveyId) {
      const surveyConnections = connections.get(surveyId);
      if (surveyConnections) {
        surveyConnections.delete(port);
        if (surveyConnections.size === 0) {
          connections.delete(surveyId);
        }
      }
    }
  };
};
