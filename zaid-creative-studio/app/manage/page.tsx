import { requireChatGPTUser } from '../chatgpt-auth';
import Portfolio from '../portfolio';
export const dynamic='force-dynamic';
export default async function Manage(){const user=await requireChatGPTUser('/manage');if(user.email.toLowerCase()!=='bajeerzaid@gmail.com')return <main className="denied"><h1>Owner access only</h1><p>Please sign in with the portfolio owner’s account.</p><a href="/">Back to portfolio</a></main>;return <Portfolio manage/>}
