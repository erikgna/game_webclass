import { Request, Response } from "express"; // import Request and Response from express

import { Palavra } from "../models/Word"; // import Palavra from models/Word

export class WordManage { // create a new class called WordManage
  public async getAll(req: Request, res: Response) { // create a new method called getAll
    try { // try to execute the code
      res.status(200).json(await Palavra.find()); // return all the words
    } catch (error) { // if an error occurs
      res.status(500).json({ error: "Não foi possível retornal as palavras." }); // return an error
    }
  }

  public async create(req: Request, res: Response) { // create a new method called create
    try { // try to execute the code
      if (!req.body.palavra || !req.body.dica) { // if the body doesn't have the fields palavra or dica
        return res.status(400).json({ error: "Preencha todos os campos." }); // return an error
      }
      const newWord = new Palavra({ // create a new instance of Palavra
        palavra: req.body.palavra.toLocaleUpperCase(), // set the field palavra to the value of the body field palavra
        dica: req.body.dica, // set the field dica to the value of the body field dica
      });

      await newWord.save(); // save the new word
 
      res.status(201).json(newWord); // return the new word
    } catch (error) { // if an error occurs
      res.status(500).json({ error: "Ocorreu um erro ao criar a palavra." });   // return an error
    }
  }

  public async edit(req: Request, res: Response) { // create a new method called edit
    try { // try to execute the code
      if (!req.body.palavra) {  // if the body doesn't have the field palavra
        return res // return an error
          .status(400) // set the status to 400
          .json({ error: "O campo Palavra está faltando." }); // return an error
      }
      const edited = await Palavra.findByIdAndUpdate(req.params.id, { // find the word by id and update it
        ...req.body, // set the fields to the values of the body
        palavra: req.body?.palavra.toLocaleUpperCase(), // set the field palavra to the value of the body field palavra
      });

      if (!edited) { // if the word wasn't found
        return res.status(404).json({ error: "Palavra não encontrada." }); // return an error
      }

      res.status(200).json(edited); // return the edited word
    } catch (error) { // if an error occurs
      res.status(500).json({ error: "Ocorreu um erro ao editar a palavra." }); // return an error
    }
  }
  public async delete(req: Request, res: Response) { // create a new method called delete
    try { // try to execute the code
      const removed = await Palavra.findByIdAndRemove(req.params.id); // find the word by id and remove it
      if (!removed) { // if the word wasn't found
        return res.status(404).json({ error: "Palavra não encontrada." }); // return an error
      }
      res.status(200).json(removed); // return the removed word
    } catch (error) { // if an error occurs
      res.status(500).json({ error: "Ocorreu um erro ao exlcuir a palavra." }); // return an error
    }
  }
}
