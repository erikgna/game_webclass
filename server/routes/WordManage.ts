import { Router } from "express"; // import Router from express
import { WordManage } from "../controllers/WordManage"; // import WordManage from controllers/WordManage

const wordManage = new WordManage(); // create a new instance of WordManage

const router = Router(); // create a new instance of Router
 
router.get("/", wordManage.getAll); // set the route GET / to the getAll method of WordManage
router.post("/", wordManage.create); // set the route POST / to the create method of WordManage
router.patch("/:id", wordManage.edit); // set the route PATCH / to the edit method of WordManage
router.delete("/:id", wordManage.delete); // set the route DELETE / to the delete method of WordManage

export default router; // export the router
