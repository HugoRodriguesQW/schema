## schema.js
A proof of concept schema validator for javascript. It's quite usual, so much so that I'm using it as a validator for my neural network setup.

<a id='usage'></a>
#### #Usage
```js
const schema = new Schema({schema})

schema.validate({data}).then().catch()
```

#### #```Schema``` Syntax
Each item within the schema must be wrapped with a ```SchemaItem``` and configured using the [parameters found here](#usage) individually.

```js
const schema = new Schema({
  age: new SchemaItem({type: Number}),
  weight: new SchemaItem({type: Number}),
  name: new SchemaItem({type: String}),
  address: new SchemaItem({type: String})
})

schema.validate({
  age: 21,
  weight: 64.3,
  name: 'Hugo Rodrigues',
  address: 'somewhere'
})
```


### #```SchemaItem``` Configuration
Each schematic item has its own configuration. It is passed in the ```SchemaItem``` constructor to generate a valid schematic item. Follow the valid settings below:


|    **parameter**   	|                 **type**                 	|             **defaults**            	|             **required**            	|                              **description** 	|
|:------------------:	|:----------------------------------------:	|:-----------------------------------:	|:-----------------------------------:	|---------------------------------------------:	|
|   **```type```**   	|     $\textcolor{aqua}{\textsf{Any}}$     	|                  -                  	| $\textcolor{coral}{\textsf{false}}$ 	| Type of field (Number, Object, Classes, Etc) 	|
| **```required```** 	|   $\textcolor{blue}{\textsf{Boolean}}$   	|  $\textcolor{coral}{\textsf{true}}$ 	| $\textcolor{coral}{\textsf{false}}$ 	|                               required field 	|
| **```instance```** 	|   $\textcolor{blue}{\textsf{Boolean}}$   	| $\textcolor{coral}{\textsf{false}}$ 	| $\textcolor{coral}{\textsf{false}}$ 	|                         validate as instance 	|
|  **```custom```**  	| $\textcolor{magenta}{\textsf{Function}}$ 	|                  -                  	| $\textcolor{coral}{\textsf{false}}$ 	|          custom additional validate function 	|
| **```defaults```** 	|     $\textcolor{aqua}{\textsf{Any}}$     	|                  -                  	| $\textcolor{coral}{\textsf{false}}$ 	|                    default value (same type) 	|
| **```children```** 	|    $\textcolor{blue}{\textsf{Object}}$   	|                  -                  	| $\textcolor{coral}{\textsf{false}}$ 	|     **Children of field (object or array) ** 	|

#### #Item. Type
It defines the typing of the item in question. Generally, primitive constructors are used to validate them like Number, String, Symbol, Object, etc. Custom classes can also be used as per this example.
```js
const schema = new Schema({
  age: new SchemaItem({type: Number}),
  person: new SchemaItem({type: Person})
})

schema.validate({
  age: 21,
  person: Person
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
  age: new SchemaItem({type: Number}),
  anything: new SchemaItem({required: false}),
})

schema.validate({ age: 21 }) // valid! return {age: 21}
```

#### #Item. Defautls
If there is no value in the field, it will be replaced by ```defaults```. It is important to note that it must match the ```type``` field. This parameter only applies to fields ```required=false```
```js
const schema = new Schema({
  age: new SchemaItem({type: Number}),
  name: new SchemaItem({type: String, required: false, defaults: 'John Doe'}),
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
If it is an object, the child elements must be declared inside the ```children``` key of ```SchemaItem```. It must be declared as an object and a new schema must be generated to process it. This allows you to validate child properties, rather than just validating the parent as an Object.

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
