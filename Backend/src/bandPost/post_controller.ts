import { Request, Response } from "express"
import data from "./post_data"

export function getGiveNumberOfLatestPosts(req: Request, res: Response){
    const numberOfPosts = parseInt(req.params.numberOfPosts)
    if(isNaN(numberOfPosts)){
        res.status(400).send({error: 103, message: "The given parameter is not valid"})
        return
    }
    const result = data.slice(0, numberOfPosts)
    if(result){
        res.status(200).send(result)
        return
    }
    res.status(404).send("There arent this many posts")
}