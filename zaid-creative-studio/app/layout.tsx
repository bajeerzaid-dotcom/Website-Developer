import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Zaid Creative Studio | Graphic Designer',description:'Graphic design, posters, social media and branding by Zaid in Hyderabad, Sindh.',icons:{icon:'/favicon.svg'}};
const themeInit="try{var s=localStorage.getItem('zaid-theme');document.documentElement.dataset.theme=(s==='dark'||s==='light')?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}";
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeInit}}/></head><body>{children}</body></html>}
