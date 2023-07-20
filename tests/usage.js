const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { Schema, SchemaItem } = require('../schema.js')
const expect = chai.expect

chai.use(chaiAsPromised)

const schemas = {
  primitive: new Schema({
    number: new SchemaItem({ type: Number }),
    string: new SchemaItem({ type: String }),
    object: new SchemaItem({ type: Object }),
    array: new SchemaItem({ type: Array }),
    symbol: new SchemaItem({ type: Symbol }),
    boolean: new SchemaItem({ type: Boolean }),
  }),

  defaults: new Schema({
    default: new SchemaItem({ required: false, defaults: String() }),
    defaultRequired: new SchemaItem({ defaults: String() }),
    defaultType: new SchemaItem({
      required: false,
      type: Number,
      defaults: Number(),
    }),
    defaultWrong: new SchemaItem({
      required: false,
      type: Number,
      defaults: String(),
    }),
  }),

  missing: new Schema({
    optional: new SchemaItem({ required: false }),
    required: new SchemaItem({}),
    requiredDefault: new SchemaItem({ defaults: Number() }),
    optionalDefault: new SchemaItem({ required: false, defaults: Number() }),
  }),

  custom: new Schema({
    custom: new SchemaItem({ custom: (v) => v > 1000 }),
  }),

  children: new Schema({
    root: new SchemaItem({
      children: {
        child: new SchemaItem({ type: String }),
        child2: new SchemaItem({
          children: {
            childChild: new SchemaItem({ type: Number }),
            childChild2: new SchemaItem({ required: false }),
          },
        }),
      },
    }),
  }),

  array: new Schema([
    new SchemaItem({ type: Number }),
    new SchemaItem({ type: String }),
    new SchemaItem({ type: Boolean }),
  ]),
}

const dataset = {
  primitive: {
    valid: {
      number: Number(),
      string: String(),
      object: Object(),
      array: Array(),
      symbol: Symbol(),
      boolean: Boolean(),
    },
    invalid: {
      number: String(), // Change Later to Number()
      string: String(),
      object: Array(), // INVALID DETECTED: typeof Array === typeof Object
      array: Object(),
      symbol: Symbol(),
      boolean: Boolean(),
    },
  },

  defaults: {
    valid: {
      defaultRequired: String(),
      defaultType: Number(),
      defaultWrong: Number(),
    },
    invalid: {},
  },

  missing: {
    valid: {
      required: Number(),
      requiredDefault: Number(),
    },
    invalid: {
      optional: Number(),
      optionalDefault: Number(),
    },
  },

  custom: {
    valid: {
      custom: 1001,
    },
    invalid: {
      custom: 0,
    },
  },

  children: {
    valid: {
      root: {
        child: String(),
        child2: {
          childChild: Number(),
        },
      },
    },
    invalid: {
      root: {
        child: String(),
        child2: {
          childChild: Boolean(),
        },
      },
    },
  },

  array: {
    valid: [Number(), String(), Boolean()],
    invalid: [String(), Boolean(), Number()],
  },
}

describe('Missing Input Validation', () => {
  it('reject invalid schema input', () => {
    try {
      new Schema(Number())
      expect.fail()
    } catch (err) {
      expect(err).to.exist
    }
  })

  it('reject invalid schemaItem input', () => {
    try {
      new Schema({ item: Number() })
      expect.fail()
    } catch (err) {
      expect(err).to.exist
    }
  })

  it('reject invalid schema.validate input', async () => {
    try {
      await schemas.primitive.validate()
      expect.fail()
    } catch (err) {
      expect(err).to.exist
    }
  })
})

describe('Primitive Validation', () => {
  it('validate primitive fields', async () => {
    const data = await schemas.primitive.validate(dataset.primitive.valid)
    expect(data).to.deep.equal(dataset.primitive.valid)
  })

  it('reject invalid primitive fields', async () => {
    await expect(schemas.primitive.validate(dataset.primitive.invalid)).to.be
      .rejected
  })
})

describe('Defaults Validation', () => {
  it('validate defaults fields', async () => {
    const data = await schemas.defaults.validate(dataset.defaults.valid)
    expect(data).to.deep.equal(dataset.defaults.valid)
  })

  it('reject invalid defaults fields', async () => {
    await expect(schemas.defaults.validate(dataset.defaults.invalid)).to.be
      .rejected
  })
})

describe('Missing Validation', () => {
  it('validate non-required fields', async () => {
    const data = await schemas.missing.validate(dataset.missing.valid)
    expect(data).to.deep.equal(dataset.missing.valid)
  })

  it('reject missing required fields', async () => {
    await expect(schemas.missing.validate(dataset.missing.invalid)).to.be
      .rejected
  })
})

describe('Custom Validation', () => {
  it('validate custom fields', async () => {
    const data = await schemas.custom.validate(dataset.custom.valid)
    expect(data).to.deep.equal(dataset.custom.valid)
  })

  it('reject custom fields', async () => {
    await expect(schemas.custom.validate(dataset.custom.invalid)).to.be.rejected
  })
})

describe('Children Validation', () => {
  it('validate children fields', async () => {
    const data = await schemas.children.validate(dataset.children.valid)
    expect(data).to.deep.equal(dataset.children.valid)
  })

  it('reject children fields', async () => {
    await expect(schemas.children.validate(dataset.children.invalid)).to.be
      .rejected
  })
})

describe('Array Validation', () => {
  it('validate array fields', async () => {
    const data = await schemas.array.validate(dataset.array.valid)
    expect(data).to.deep.equal(dataset.array.valid)
  })

  it('reject array fields', async () => {
    await expect(schemas.array.validate(dataset.array.invalid)).to.be.rejected
  })
})
