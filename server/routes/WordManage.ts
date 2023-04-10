import { Router } from "express";
import { WordManage } from "../controllers/WordManage";

const wordManage = new WordManage();

const router = Router();

router.get("/", wordManage.getAll);
router.post("/", wordManage.create);
router.patch("/:id", wordManage.edit);
router.delete("/:id", wordManage.delete);

export default router;
