export default {
  type: "object",
  properties: {
    products: {type: "array"}
  },
  required: ['name']
} as const;
