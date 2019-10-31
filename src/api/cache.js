const Keyv = require("keyv");

const Cache = {
  // Various cache namespaces.
  TRIGGER_PREMIUM: "triggerPremium",
  FLIGHT: "flight",
  POLICY: "policy",
  PAYMENT: "payment",

  // Initialize a client.
  // Each client is set with the given namespace.
  client: {},
  getClient: namespace => {
    if (
      Cache.client[namespace] === null ||
      Cache.client[namespace] === undefined
    ) {
      Cache.client[namespace] = new Keyv({namespace: namespace});
    }

    return Cache.client[namespace];
  },

  // Retrieve the cache contents, given cache key and namespace.
  get: async (key, namespace) => {
    return await Cache.getClient(namespace).get(key);
  },

  // Set cache content, given cache key, value and namespace.
  set: async (key, value, namespace, ttl = null) => {
    if (ttl) {
      await Cache.getClient(namespace).set(key, value, ttl);
    } else {
      await Cache.getClient(namespace).set(key, value);
    }
  },

  // delete a cached value, given cache key and namespace
  delete: async (key, namespace) => {
    return await Cache.getClient(namespace).delete(key);
  }
};

module.exports = Cache;
