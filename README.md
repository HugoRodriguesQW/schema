## mini-schema

[![CI](https://github.com/HugoRodriguesQW/schema/actions/workflows/main.yml/badge.svg)](https://github.com/HugoRodriguesQW/schema/actions/workflows/main.yml)
[![V](https://img.shields.io/npm/v/@hugorodriguesqw/mini-schema)](https://www.npmjs.com/package/@hugorodriguesqw/mini-schema)
[![A](https://img.shields.io/github/commit-activity/m/hugorodriguesqw/schema)](https://github.com/HugoRodriguesQW/schema/graphs/commit-activity)
[![P](https://img.shields.io/github/package-json/name/hugorodriguesqw/schema?label=npm&color=purple)](https://www.npmjs.com/package/@hugorodriguesqw/mini-schema)
[![L](https://img.shields.io/github/package-json/license/hugorodriguesqw/schema?color=purple)](https://github.com/HugoRodriguesQW/schema/blob/main/LICENSE)
[![C](https://img.shields.io/github/contributors/hugorodriguesqw/schema)](https://github.com/HugoRodriguesQW/schema/graphs/contributors)

A schematic data validator for simple and flexible javascript. With it, it is possible to validate and manage what happens when the fields do not meet the requirements of the schema. Available in npm.

#### #Instalation

- using npm:

```
npm install @hugorodriguesqw/mini-schema
```

- using yarn:

```
yarn install @hugorodriguesqw/mini-schema
```

- using unpkg:

```html
<script src="https://unpkg.com/@hugorodriguesqw/mini-schema@latest/schema.js"></script>
```

#### #Usage

```js
import {Schema, SchemaItem} from '@hugorodriguesqw/mini-schema'

const schema = new Schema({ ... SchemaItem ... })

schema.validate({ data }).then().catch()
```

#### #`Schema` Syntax

Each item within the schema must be wrapped with a `SchemaItem` and configured using the [parameters found here](#parameters) individually.

```js
const schema = new Schema({
  age: new SchemaItem({ type: Number }),
  weight: new SchemaItem({ type: Number }),
  name: new SchemaItem({ type: String }),
  address: new SchemaItem({ type: String }),
})

schema.validate({
  age: 21,
  weight: 64.3,
  name: 'Hugo Rodrigues',
  address: 'somewhere',
})
```

<a id='parameters'></a>

### #`SchemaItem` Configuration

Each schematic item has its own configuration. It is passed in the `SchemaItem` constructor to generate a valid schematic item. Follow the valid settings below:

| **parameter**  | **type** | **defaults** | **required** |                              **description** |
| :------------: | :------: | :----------: | :----------: | -------------------------------------------: |
|   **`type`**   |   Any    |      -       |    false     | Type of field (Number, Object, Classes, Etc) |
| **`required`** | Boolean  |     true     |    false     |                               required field |
| **`instance`** | Boolean  |    false     |    false     |                         validate as instance |
|  **`custom`**  | Function |      -       |    false     |          custom additional validate function |
| **`defaults`** |   Any    |      -       |    false     |                    default value (same type) |
| **`children`** |  Object  |      -       |    false     |          Children of field (object or array) |

#### #Item. Type

It defines the typing of the item in question. Generally, primitive constructors are used to validate them like Number, String, Symbol, Object, etc. Custom classes can also be used.

```js
const schema = new Schema({
  age: new SchemaItem({ type: Number }),
  person: new SchemaItem({ type: Person }),
})

schema.validate({
  age: 21,
  person: Person,
}) // valid! return {age: 21, person: Person}
```

#### #Item. Instance

This changes the behavior of the Schema to validate instances instead of the original constructor.

```js
const schema = new Schema({
  me: new SchemaItem({type: Person, instance: true})
})

schema.validate({
  me: new Person({....})
}) // valid! return {me: #person }
```

#### #Item. Required

By default this parameter is true. It defines whether the field is required or not.

```js
const schema = new Schema({
  age: new SchemaItem({ type: Number }),
  anything: new SchemaItem({ required: false }),
})

schema.validate({ age: 21 }) // valid! return {age: 21}
```

#### #Item. Defautls

If there is no value in the field, it will be replaced by `defaults`. It is important to note that it must match the `type` field. This parameter only applies to fields `required=false`

```js
const schema = new Schema({
  age: new SchemaItem({ type: Number }),
  name: new SchemaItem({ type: String, required: false, defaults: 'John Doe' }),
})

schema.validate({ age: 21 }) // valid! return {age: 21, name: 'John Doe'}
```

#### #Item. Custom

An additional function to check, in addition to the informed parameters, if the field is valid.

```js

function customValidation (age) {
  return age < 20 // boolean
}

const schema = new Schema({
  age: new SchemaItem({type: Number, custom: customValidation ),
})

schema.validate({ age: 21 }) // invalid!

// catch output:

{
   "validator": {
       "name": "age",
       "required": true,
       "instance": false,
       "type": Number,
       "custom": customValidation
   },
   "parameter": 21,
   "reason": "custom"
}
```

#### #Item. Children

If it is an object, the child elements must be declared inside the `children` key of `SchemaItem`. It must be declared as an object and a new schema must be generated to process it. This allows you to validate child properties, rather than just validating the parent as an Object.

```js
const schema = new Schema({
  address: new SchemaItem({
      type: Object,
      children: {
        number: new SchemaItem({type: Number}),
        street: new SchemaItem({type: String})
      }
  }),
})

schema.validate({
  address: {
    number: 138,
    street: 'Adelaide Street'
  }
}) // valid!

// then output:

{
   "address": {
       "number": 138,
       "street": 'Adelaide Street',
    }
}
```
