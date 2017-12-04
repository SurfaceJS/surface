import { Router } from '@surface/router';

export function execute()
{

    let router = new Router()
        .mapRoute('first',  '/{controller}/{action}/{id?}')
        .mapRoute('second', '/{controller}/{language}-{country}/{action}/{id?}')
        .mapRoute('third',  '/{controller=home}/{action=index}/{id?}')
        .mapRoute('fourth', '/adm/{controller=home}/{action=index}/{id?}');

    console.log('case 1: ', router.match('/home'));
    console.log('case 2: ', router.match('/home/about'));
    console.log('case 2: ', router.match('/home/en-us/about/1'));
    console.log('case 3: ', router.match('/home/about/2'));
    console.log('case 4: ', router.match('/adm/home/about/1'));
}