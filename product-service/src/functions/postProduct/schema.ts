export default {
  type: "object",
  properties: {
    id: {type: "string"},
    title: {type: "string"},
    description: {type: "string"},
    price: {type: "Number"},
    count: {type: "Number"}
  }
} as const;
