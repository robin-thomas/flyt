const Keyv = require("keyv");

const Cache = {
  client: {},

  getClient: namespace => {
    if (
      Cache.client[namespace] === null ||
      Cache.client[namespace] === undefined
    ) {
      Cache.client[namespace] = new Keyv({ namespace: namespace });
    }

    return Cache.client[namespace];
  },

  get: async (key, namespace) => {
    return await Cache.getClient(namespace).get(key);
  },

  set: async (key, value, namespace, ttl = null) => {
    if (ttl) {
      await Cache.getClient(namespace).set(key, value, ttl);
    } else {
      await Cache.getClient(namespace).set(key, value);
    }
  },

  delete: async (key, namespace) => {
    return await Cache.getClient(namespace).delete(key);
  }
};

module.exports = Cache;
