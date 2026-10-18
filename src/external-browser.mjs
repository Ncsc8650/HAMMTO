export function externalBrowserPolicy(userAgent,href){
 const url=new URL(href);const blocked=/\bLine\/[\d.]+/i.test(userAgent);
 const attempted=url.searchParams.get('openExternalBrowser')==='1';url.searchParams.set('openExternalBrowser','1');
 return {blocked,redirect:blocked&&!attempted,externalUrl:url.href};
}
