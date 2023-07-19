class Schema {
  static primitive = [Symbol, Number, Array, String, Boolean, Object]

  constructor(schema) {
    for (const item in schema) {
      if (!SchemaItem.prototype.isPrototypeOf(schema[item])) {
        throw new Error('invalid SchemaItem: ' + item)
      }

      this[item] = { name: item, ...schema[item] }
    }
  }

  validate(data) {
    return new Promise(async (resolve, reject) => {
      for (const t in { ...this }) {
        if (this.hasOwnProperty(t)) {
          const validator = this[t]
          const parameter =
            data[t] ?? (!validator.required && validator.defaults)

          if (validator.children) {
            if (!SchemaItem.prototype.isPrototypeOf(validator.children)) {
              await new Schema(validator.children).validate(parameter)
            }
          }

          // VALIDATION: CUSTOM
          if (validator.custom && !validator.custom(parameter)) {
            return reject({ validator, parameter, reason: 'custom' })
          }

          // VALIDATION: REQUIRED
          if (validator.required && !parameter) {
            return reject({ validator, parameter, reason: 'required' })
          } else if (!data[t] && parameter) {
            data[t] = parameter
          }

          // VALIDATION: INSTANCES
          if (
            validator.instance &&
            !validator.type.prototype.isPrototypeOf(parameter)
          ) {
            return reject({ validator, parameter, reason: 'instance' })
          }

          // VALIDATION: PRIMITIVES
          const primitive = Schema.primitive.find(
            (item) => item === validator.type,
          )
          if (primitive && typeof parameter === typeof primitive()) {
            continue
          }

          // VALIDATION: TYPES
          if (validator.type && typeof parameter !== typeof validator.type) {
            if (!validator.required && !parameter) {
              continue
            }

            if (!validator.instance) {
              return reject({ validator, parameter, reason: 'type' })
            }
          }
        }
      }

      resolve(data)
    })
  }
}

class SchemaItem {
  static required = { type: Boolean, required: false, defaults: true } // campo obrigatório?
  static instance = { type: Boolean, required: false, defaults: false } // validar como instancia?
  static custom = { type: Function, required: false } // usar validator personalizado?
  static defaults = { required: false } // valor padrão?
  static type = { required: false } // qual o tipo desse campo? (String, Schema, Object, Etc)
  static children = { type: Object, required: false } // objeto filho ou array filha

  constructor({ required, instance, custom, defaults, type, children }) {
    this.required = required ?? SchemaItem.required.defaults
    this.instance = instance ?? SchemaItem.instance.defaults
    this.custom = custom ?? SchemaItem.custom.defaults
    this.defaults = defaults ?? SchemaItem.defaults.defaults
    this.type = type ?? SchemaItem.type.defaults
    this.children = children ?? SchemaItem.children.defaults
  }
}

const a = new Schema({
  absolute: new SchemaItem({
    type: Schema,
    required: false,
    defaults: Schema,
  }), //
  instance: new SchemaItem({ type: Schema, instance: true }),
  function: new SchemaItem({ type: Function }),
  anything_example: new SchemaItem({ required: true }),
  with_custom: new SchemaItem({
    type: Number,
    custom: (value) => value > 1000,
  }),
  object: new SchemaItem({
    type: Object,
    children: {
      value: new SchemaItem({ type: Number }),
    },
  }),
})

export default {
  Schema,
  SchemaItem,
}
