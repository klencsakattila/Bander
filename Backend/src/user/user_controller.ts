import { Request, Response } from "express";
import data from "./user_data";

export function root(_req: Request, res: Response){
    res.send("A szerver fut")
}

export function getAllData(_req: Request, res: Response){
    res.status(200).send(data)
}

export function getDataById(req: Request, res: Response){
    const id = parseInt(req.params.id)
    if(isNaN(id)){
        res.status(400).send({error: 103, message: "Az id nem megfelelő"})
        return
    }
    const result = data.find(i => i.id === id)
    if(result){
        res.status(200).send(result)
        return
    }
    res.status(404).send("Az id nem található")
}