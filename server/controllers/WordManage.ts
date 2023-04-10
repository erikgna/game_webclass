import { Request, Response } from "express";

import { Palavra } from "../models/Word";

export class WordManage {
  public async getAll(req: Request, res: Response) {
    try {
      res.status(200).json(await Palavra.find());
    } catch (error) {
      res.status(200).json("Não foi possível retornal as palavras.");
    }
  }

  public async create(req: Request, res: Response) {
    try {
      const newWord = new Palavra({
        palavra: req.body.palavra,
        dica: req.body.dica,
      });

      await newWord.save();

      res.status(200).json(newWord);
    } catch (error) {
      res.status(200).json("Ocorreu um erro ao criar a palavra.");
    }
  }

  public async edit(req: Request, res: Response) {
    try {
      const edited = await Palavra.findByIdAndUpdate(req.params.id, req.body);

      res.status(200).json(edited);
    } catch (error) {
      res.status(200).json("Ocorreu um erro ao editar a palavra.");
    }
  }
  public async delete(req: Request, res: Response) {
    try {
      const removed = await Palavra.findByIdAndRemove(req.params.id);

      res.status(200).json(removed);
    } catch (error) {
      res.status(200).json("Ocorreu um erro ao exlcuir a palavra.");
    }
  }
}
