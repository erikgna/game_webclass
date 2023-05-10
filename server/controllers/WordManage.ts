import { Request, Response } from "express";

import { Palavra } from "../models/Word";

export class WordManage {
  public async getAll(req: Request, res: Response) {
    try {
      res.status(200).json(await Palavra.find());
    } catch (error) {
      res.status(500).json({ error: "Não foi possível retornal as palavras." });
    }
  }

  public async create(req: Request, res: Response) {
    try {
      if (!req.body.palavra || !req.body.dica) {
        return res.status(400).json({ error: "Preencha todos os campos." });
      }
      const newWord = new Palavra({
        palavra: req.body.palavra.toLocaleUpperCase().trim(),
        dica: req.body.dica,
      });

      await newWord.save();

      res.status(201).json(newWord);
    } catch (error) {
      res.status(500).json({ error: "Ocorreu um erro ao criar a palavra." });
    }
  }

  public async edit(req: Request, res: Response) {
    try {
      if (!req.body.palavra) {
        return res
          .status(400)
          .json({ error: "O campo Palavra está faltando." });
      }
      const edited = await Palavra.findByIdAndUpdate(req.params.id, {
        ...req.body,
        palavra: req.body?.palavra.toLocaleUpperCase().trim(),
      });

      if (!edited) {
        return res.status(404).json({ error: "Palavra não encontrada." });
      }

      res.status(200).json(edited);
    } catch (error) {
      res.status(500).json({ error: "Ocorreu um erro ao editar a palavra." });
    }
  }
  public async delete(req: Request, res: Response) {
    try {
      const removed = await Palavra.findByIdAndRemove(req.params.id);
      if (!removed) {
        return res.status(404).json({ error: "Palavra não encontrada." });
      }
      res.status(200).json(removed);
    } catch (error) {
      res.status(500).json({ error: "Ocorreu um erro ao exlcuir a palavra." });
    }
  }
}
