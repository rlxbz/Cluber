/**
 * 存储工具类，支持localStorage、cookie和sessionStorage
 */
export const Storage = {
  // localStorage操作
  local: {
    set(key, value) {
      if (!key) return;
      localStorage.setItem(key, typeof value === 'object' 
        ? JSON.stringify(value) 
        : value);
    },
    get(key) {
      if (!key) return null;
      const value = localStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    remove(key) {
      if (!key) return;
      localStorage.removeItem(key);
    }
  },

  // Cookie操作
  cookie: {
    set(key, value, days = 7) {
      if (!key) return;
      let expires = '';
      if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = `; expires=${date.toUTCString()}`;
      }
      const valueToStore = typeof value === 'object' 
        ? JSON.stringify(value) 
        : value;
      document.cookie = `${key}=${encodeURIComponent(valueToStore)}${expires}; path=/`;
    },
    get(key) {
      if (!key) return null;
      const nameEQ = `${key}=`;
      const ca = document.cookie.split(';');
      for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
          const value = decodeURIComponent(c.substring(nameEQ.length, c.length));
          try {
            return JSON.parse(value);
          } catch (e) {
            return value;
          }
        }
      }
      return null;
    },
    remove(key) {
      this.set(key, '', -1);
    }
  },

  // sessionStorage操作
  session: {
    set(key, value) {
      if (!key) return;
      sessionStorage.setItem(key, typeof value === 'object' 
        ? JSON.stringify(value) 
        : value);
    },
    get(key) {
      if (!key) return null;
      const value = sessionStorage.getItem(key);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    },
    remove(key) {
      if (!key) return;
      sessionStorage.removeItem(key);
    }
  }
};

// 存储配置 - 可以根据需求修改各类型数据的存储方式
export const StorageConfig = {
  // 用户相关信息使用sessionStorage，会话结束后失效
  user: {
    token: 'session',
    userInfo: 'session',
    role: 'session'
  },
  // 系统设置使用localStorage，长期保存
  settings: 'local',
  // 临时数据使用sessionStorage
  temp: 'session'
};