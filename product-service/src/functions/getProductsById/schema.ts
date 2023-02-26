export default {
  type: "object",
  properties: {
    id: {type: "number"},
    name: {type: "string"},
    image: {type: "string"},
    price: {type: "number"}
  },
  required: ['name']
} as const;
