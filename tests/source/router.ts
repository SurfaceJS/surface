import { Router, RoutingType } from '@surface/router';

export function execute()
{
    let routes =
    [
        '/{controller}/{action}/{id?}',
        '/{controller}/{language}-{country}/{action}/{id?}',
        '/{controller=home}/{action=index}/{id?}',
        '/adm/{controller=home}/{action=index}/{id?}',
    ];

    let router = Router.create(RoutingType.Abstract, routes);

    console.log('case 1: ', router.match('/home'));
    console.log('case 2: ', router.match('/home/about'));
    console.log('case 2: ', router.match('/home/en-us/about/1'));
    console.log('case 3: ', router.match('/home/about/2'));
    console.log('case 4: ', router.match('/adm/home/about/1'));
}