Provides many methods to iterate through of collections.

## Basic usage
```js
import Enumerable from "@surface/enumerable";

const enumerable = Enumerable.from([1, 2, 3, 4, 5]);

const value = enumerable
    .where(x => x % 2 == 0)
    .select(x => `${x} is even`)
    .toArray();

console.log(value); // ['2 is even', '4 is even']
```