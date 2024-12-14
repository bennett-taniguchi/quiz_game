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
		const summary = await wikipedia.summary(req.query.keyword+"")
	 
        res.status(200).json({message: JSON.stringify(summary)})
        return;
	} catch (error) {
        res.status(200).json({message: 'empty'})
		    console.log(error);
 
        return;
	}
    
  res.status(200).json({ message: 'Hello from Next.js!' })
}