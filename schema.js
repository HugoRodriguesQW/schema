/**
 * Class to define a schema.
 */
class Schema {
  /**
   * @typedef {Object.<string, SchemaItem>} SchemaOptions
   */

  static primitive = [Symbol, Number, Array, String, Boolean, Object]

  /**
   * @param {SchemaOptions} schema - Schema to be validated.
   */
  constructor(schema) {
    if (typeof schema !== 'object') throw new Error('invalid schema: ' + schema)

    for (const item in schema) {
      if (!SchemaItem.prototype.isPrototypeOf(schema[item])) {
        throw new Error('invalid SchemaItem: ' + item)
      }

      this[item] = { name: item, ...schema[item] }
    }
  }

  /**
   * Validates the provided data against the schema.
   * @param {Object} data - Data to be validated.
   * @returns {Promise<Object>} - Returns a Promise with the validated data or rejects with information about the validation error.
   */
  validate(data) {
    if (typeof data !== 'object') throw new Error('invalid data: ' + data)

    return new Promise(async (resolve, reject) => {
      for (const t in { ...this }) {
        if (this.hasOwnProperty(t)) {
          const validator = this[t]
          const parameter = data[t]

          if (validator.children) {
            if (!SchemaItem.prototype.isPrototypeOf(validator.children)) {
              await new Schema(validator.children)
                .validate(parameter)
                .then((children) => {
                  Object.assign(parameter, children)
                })
                .catch((err) => {
                  reject(err)
                })
            }
          }

          // VALIDATION: CUSTOM
          if (validator.custom && !validator.custom(parameter)) {
            return reject({ validator, parameter, reason: 'custom' })
          }

          // VALIDATION: REQUIRED
          if (validator.required && parameter == null) {
            return reject({ validator, parameter, reason: 'required' })
          } else if (data[t] == null && parameter) {
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

/**
 * @typedef {Object} SchemaItemOptions
 * @property {boolean} [required=false] - Indicates if the field is required.
 * @property {boolean} [instance=false] - Indicates if the field should be validated as an instance of a class.
 * @property {function(any):boolean} [custom] - Custom validation function for the field.
 * @property {boolean} [defaults=false] - Default value for the field.
 * @property {Function} [type] - Expected type for the field.
 * @property {Object} [children] - Object defining properties of child fields.
 */

/**
 * Class to define an item in the schema.
 */
class SchemaItem {
  static required = { type: Boolean, required: false, defaults: true }
  static instance = { type: Boolean, required: false, defaults: false }
  static custom = { type: Function, required: false }
  static defaults = { required: false }
  static type = { required: false }
  static children = { type: Object, required: false }

  /**
   * @param {SchemaItemOptions} options - Options to configure the schema item.
   */
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

module.exports = {
  Schema,
  SchemaItem,
}
