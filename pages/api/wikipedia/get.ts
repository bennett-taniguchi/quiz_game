import type { NextApiRequest, NextApiResponse } from 'next'
import wikipedia  from 'wikipedia'
type ResponseData = {
  message: string
}
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    try {
		const page = await wikipedia.page('Batman')
		 const html = await page.html()
        res.status(200).json({message: JSON.stringify(html)})
        return;
	} catch (error) {
        res.status(200).json({message: 'empty'})
		    console.log(error);
 
        return;
	}
    
  res.status(200).json({ message: 'Hello from Next.js!' })
}