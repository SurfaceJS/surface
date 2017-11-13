import { Dictionary } from '@surface/collection';

export function execute()
{
    let dictionary = new Dictionary({ foo: 1, bar: 2});
    
    dictionary.forEach(x => console.log(x.key));
}
